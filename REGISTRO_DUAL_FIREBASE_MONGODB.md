# 🔄 Registro Dual: Firebase + MongoDB

## 📋 Flujo de Registro de Usuarios

Cuando un nuevo usuario se registra en la app, ahora se guarda en **dos bases de datos**:

### 1️⃣ Firebase (Autenticación + Realtime Database)
- **Propósito**: Autenticación, tokens JWT, perfil básico
- **Ubicación**: Firebase Realtime Database
- **Estructura**:
```json
{
  "usuarios": {
    "-abc123": {
      "idAuth": "firebase-uid-123",
      "email": "usuario@ejemplo.com",
      "nombre": "Juan",
      "apellido": "Pérez",
      "altura": 175,
      "peso": 70,
      "edad": 25,
      "sexo": "Masculino",
      "idRol": 1,
      "fechaRegistro": "2025/11/11"
    }
  }
}
```

### 2️⃣ MongoDB (Tu Backend)
- **Propósito**: Gestión de datos del usuario, historial, etc.
- **Endpoint**: `POST /api/usuarios/`
- **Estructura**:
```json
{
  "uid": "firebase-uid-123",
  "email": "usuario@ejemplo.com",
  "token": "eyJhbGciOiJSUzI1NiIs...",
  "peso_actual": 70,
  "unidad_peso": "kg",
  "altura": 175,
  "edad": 25,
  "genero": "Masculino",
  "active": true,
  "historial_peso": null
}
```

---

## 🔄 Secuencia de Registro

```
Usuario registra en app
        ↓
1. Crear usuario en Firebase Auth
        ↓
2. Obtener JWT Token
        ↓
3. Guardar perfil en Firebase Realtime DB
        ↓
4. Enviar datos a MongoDB (POST /api/usuarios/)
        ↓
5. Usuario registrado en ambos sistemas
```

---

## 📝 Mapeo de Campos

| Campo App (Firebase) | Campo MongoDB | Notas |
|---------------------|---------------|-------|
| `uid` (Firebase UID) | `uid` | Identificador único del usuario |
| `email` | `email` | Correo electrónico |
| `token` | `token` | JWT de Firebase |
| `peso` | `peso_actual` | Peso en kg |
| - | `unidad_peso` | Siempre "kg" (hardcoded) |
| `altura` | `altura` | Altura en cm |
| `edad` | `edad` | Edad del usuario |
| `sexo` | `genero` | "Masculino" o "Femenino" |
| - | `active` | Siempre `true` al registrar |
| - | `historial_peso` | `null` al inicio |

---

## ✅ Implementación Actual

### Archivo Modificado: `src/firebaseAuth.js`

```javascript
// Después del registro en Firebase:
const mongoUserData = {
  uid: user.uid,
  email: user.email,
  token: token,
  peso_actual: profileObj.peso || null,
  unidad_peso: "kg",
  altura: profileObj.altura || null,
  edad: profileObj.edad || null,
  genero: profileObj.sexo || null,
  active: true,
  historial_peso: null
};

await fetch(`${SERVER_URI}/api/usuarios/`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(mongoUserData)
});
```

---

## 🔒 Seguridad

### ✅ Token Incluido
El token de Firebase se envía en:
1. **Header `Authorization`**: Para autenticación del request
2. **Body `token`**: Para que tu backend lo guarde y valide después

### ✅ Manejo de Errores
Si MongoDB falla, **el registro NO se cancela**:
- ✅ Usuario ya está en Firebase Auth (puede iniciar sesión)
- ✅ Perfil guardado en Firebase Realtime Database
- ⚠️ Solo se registra un warning en consola

**Esto es importante** porque:
- Firebase es la fuente de verdad para autenticación
- MongoDB es opcional/complementario
- No queremos bloquear usuarios si MongoDB está caído

---

## 🧪 Pruebas

### Test de Registro Exitoso

1. **Registrar un nuevo usuario**:
   - Nombre: Juan
   - Apellido: Pérez
   - Email: juan@test.com
   - Password: Test123!
   - Altura: 175
   - Peso: 70
   - Edad: 25
   - Sexo: Masculino

2. **Verificar en Firebase Console**:
   - Auth → Users → Debe aparecer juan@test.com
   - Realtime Database → usuarios → Debe tener los datos

3. **Verificar en MongoDB**:
   ```bash
   # En tu backend
   GET /api/usuarios/
   # Debe aparecer el usuario con uid de Firebase
   ```

4. **Logs en Expo**:
   ```
   🔄 Registrando usuario en MongoDB...
   ✅ Usuario registrado en MongoDB: { _id: "...", uid: "...", email: "..." }
   ```

---

## 🆘 Troubleshooting

### Error: "Network request failed"
**Causa**: Backend no está corriendo o URL incorrecta
**Solución**:
1. Verifica que tu backend esté corriendo en el puerto correcto
2. Verifica `SERVER_URI` en tu `.env`
3. Para dispositivo físico, usa tu IP local (no localhost)

### Error: 400 Bad Request
**Causa**: Campos requeridos faltantes en MongoDB
**Solución**:
1. Verifica que tu modelo de MongoDB acepte los campos enviados
2. Verifica que no haya campos requeridos faltantes
3. Revisa los logs de tu backend para ver qué campo falta

### Error: 401 Unauthorized
**Causa**: Tu endpoint requiere autenticación
**Solución**:
El token ya se está enviando en el header `Authorization: Bearer <token>`
Verifica que tu middleware de autenticación esté configurado correctamente.

### Usuario en Firebase pero NO en MongoDB
**Causa**: MongoDB falló pero Firebase tuvo éxito
**Solución**:
Puedes crear un endpoint para sincronizar usuarios:
```javascript
// POST /api/usuarios/sync
// Recibe uid y busca los datos en Firebase para crear en MongoDB
```

---

## 🔄 Sincronización Manual (Opcional)

Si necesitas sincronizar usuarios existentes de Firebase a MongoDB:

```javascript
// Crear endpoint en tu backend
// POST /api/usuarios/sync-from-firebase
router.post('/sync-from-firebase', async (req, res) => {
  const { uid, email, token } = req.body;
  
  // Verificar token con Firebase Admin
  const decodedToken = await admin.auth().verifyIdToken(token);
  
  if (decodedToken.uid !== uid) {
    return res.status(403).json({ error: 'Token inválido' });
  }
  
  // Crear usuario en MongoDB
  const usuario = new Usuario({
    uid,
    email,
    token,
    // ... otros campos con valores por defecto
    active: true
  });
  
  await usuario.save();
  res.json(usuario);
});
```

---

## 📊 Ventajas de Este Enfoque

| Ventaja | Descripción |
|---------|-------------|
| ✅ **Separación de responsabilidades** | Firebase maneja auth, MongoDB maneja datos de negocio |
| ✅ **Resiliente a fallos** | Si MongoDB falla, el usuario igual puede usar la app |
| ✅ **Token compartido** | Un solo token sirve para ambos sistemas |
| ✅ **Escalable** | Puedes agregar más sistemas sin afectar el registro |
| ✅ **Auditable** | Logs claros de qué sistema tuvo éxito/fallo |

---

## 📝 Checklist Backend

Para que esto funcione correctamente, tu backend debe:

- [ ] Tener el endpoint `POST /api/usuarios/` funcionando
- [ ] Aceptar JSON en el body
- [ ] Tener el modelo de Usuario con los campos correctos
- [ ] (Opcional) Validar el token de Firebase
- [ ] Retornar el usuario creado en formato JSON
- [ ] Manejar duplicados (verificar si uid ya existe)

---

## 🎯 Resultado

Ahora cada nuevo usuario:
1. ✅ Puede iniciar sesión con Firebase Auth
2. ✅ Tiene su perfil en Firebase Realtime Database
3. ✅ Está registrado en tu base de datos MongoDB
4. ✅ El token funciona para ambos sistemas

**¡Registro dual completado!** 🎉
