# 🔒 Guía de Seguridad: Validación de Tokens en el Backend

## 📋 Resumen

Tu app ahora envía el **token de Firebase JWT** en cada petición al backend mediante el header `Authorization: Bearer <token>`. Este token debe ser **validado en el backend** para asegurar que solo usuarios autenticados puedan acceder a los endpoints.

---

## 🎯 Flujo de Seguridad

```
┌─────────────┐                  ┌──────────────┐                ┌─────────────┐
│   React     │                  │   Backend    │                │  Firebase   │
│   Native    │                  │   (Node.js)  │                │   Auth      │
│   App       │                  │              │                │             │
└──────┬──────┘                  └──────┬───────┘                └──────┬──────┘
       │                                │                               │
       │  1. Login (email/password)    │                               │
       ├───────────────────────────────┼──────────────────────────────>│
       │                                │        Validate credentials   │
       │                                │                               │
       │  2. Return JWT Token           │                               │
       │<───────────────────────────────┼───────────────────────────────┤
       │                                │                               │
       │  3. API Request + Token        │                               │
       │         (Authorization:        │                               │
       │          Bearer <token>)       │                               │
       ├───────────────────────────────>│                               │
       │                                │  4. Verify Token              │
       │                                ├──────────────────────────────>│
       │                                │                               │
       │                                │  5. Token Valid + User Info   │
       │                                │<──────────────────────────────┤
       │                                │                               │
       │  6. Protected Data             │                               │
       │<───────────────────────────────┤                               │
       │                                │                               │
```

---

## 🔧 Implementación en Backend (Node.js + Express)

### 1️⃣ Instalar Firebase Admin SDK

```bash
npm install firebase-admin
```

### 2️⃣ Inicializar Firebase Admin

Crea un archivo `src/config/firebaseAdmin.js`:

```javascript
const admin = require('firebase-admin');

// Opción A: Usar archivo de credenciales (más seguro)
// Descarga el archivo desde Firebase Console → Project Settings → Service Accounts
const serviceAccount = require('../../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tu-proyecto.firebaseio.com" // Tu Firebase Realtime Database
});

module.exports = admin;
```

**IMPORTANTE**: Agrega `serviceAccountKey.json` a `.gitignore` para NO subirlo a Git.

### 3️⃣ Crear Middleware de Autenticación

Crea `src/middleware/authMiddleware.js`:

```javascript
const admin = require('../config/firebaseAdmin');

/**
 * 🔒 Middleware de Autenticación con Firebase JWT
 * 
 * Valida el token de Firebase en cada petición.
 * Si es válido, agrega req.user con la información del usuario.
 * Si no es válido, responde con 401 Unauthorized.
 */
const authenticateUser = async (req, res, next) => {
  try {
    // 1. Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No se proporcionó token de autenticación'
      });
    }
    
    // 2. Extraer el token (remover "Bearer ")
    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    // 3. Verificar el token con Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // 4. El token es válido - agregar información del usuario a req
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      // Otros datos del token:
      // - decodedToken.name
      // - decodedToken.picture
      // - decodedToken.firebase.sign_in_provider
    };
    
    // 5. Continuar con la siguiente función (controlador)
    next();
    
  } catch (error) {
    console.error('Error verificando token:', error);
    
    // Manejo de errores específicos
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado. Por favor, vuelve a iniciar sesión.'
      });
    }
    
    if (error.code === 'auth/argument-error') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o mal formado.'
      });
    }
    
    // Error genérico
    return res.status(401).json({
      success: false,
      message: 'Error de autenticación',
      error: error.message
    });
  }
};

module.exports = authenticateUser;
```

### 4️⃣ Proteger tus Endpoints

#### Ejemplo: Proteger endpoint de recordatorios

**Antes** (SIN protección):
```javascript
// ❌ INSEGURO: Cualquiera puede acceder
router.get('/recordatorios', async (req, res) => {
  const recordatorios = await Recordatorio.find();
  res.json(recordatorios);
});
```

**Después** (CON protección):
```javascript
const authenticateUser = require('../middleware/authMiddleware');

// ✅ SEGURO: Solo usuarios autenticados
router.get('/recordatorios', authenticateUser, async (req, res) => {
  try {
    // req.user contiene { uid, email, emailVerified }
    const userId = req.user.uid;
    
    // Solo mostrar recordatorios del usuario autenticado
    const recordatorios = await Recordatorio.find({ userId });
    
    res.json({
      success: true,
      data: recordatorios
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo recordatorios',
      error: error.message
    });
  }
});

// POST crear recordatorio (protegido)
router.post('/recordatorios', authenticateUser, async (req, res) => {
  try {
    const { medicamento, hora, frecuencia } = req.body;
    
    // Asegurar que el recordatorio se crea para el usuario autenticado
    const nuevoRecordatorio = new Recordatorio({
      userId: req.user.uid, // ← userId del token
      medicamento,
      hora,
      frecuencia
    });
    
    await nuevoRecordatorio.save();
    
    res.status(201).json({
      success: true,
      data: nuevoRecordatorio
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creando recordatorio',
      error: error.message
    });
  }
});

// DELETE eliminar recordatorio (protegido)
router.delete('/recordatorios/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    
    // Solo permitir eliminar recordatorios propios
    const recordatorio = await Recordatorio.findOne({ _id: id, userId });
    
    if (!recordatorio) {
      return res.status(404).json({
        success: false,
        message: 'Recordatorio no encontrado o no tienes permiso para eliminarlo'
      });
    }
    
    await recordatorio.deleteOne();
    
    res.json({
      success: true,
      message: 'Recordatorio eliminado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error eliminando recordatorio',
      error: error.message
    });
  }
});
```

### 5️⃣ Proteger TODOS los Endpoints de Actividad Física

```javascript
const authenticateUser = require('../middleware/authMiddleware');

// Proteger todos los endpoints de actividad física
router.get('/actividad/sesion/hoy/:pacienteId', authenticateUser, async (req, res) => {
  // Verificar que el pacienteId coincida con req.user.uid
  if (req.params.pacienteId !== req.user.uid) {
    return res.status(403).json({
      success: false,
      message: 'No tienes permiso para acceder a esta sesión'
    });
  }
  // ... resto del código
});

router.post('/actividad/sesion', authenticateUser, async (req, res) => {
  // Asegurar que idUsuario sea el del token
  req.body.idUsuario = req.user.uid;
  // ... resto del código
});

router.put('/actividad/sesion/:sesionId', authenticateUser, async (req, res) => {
  // Verificar que la sesión pertenezca al usuario
  const sesion = await Sesion.findOne({ _id: req.params.sesionId, idUsuario: req.user.uid });
  if (!sesion) {
    return res.status(403).json({ success: false, message: 'No autorizado' });
  }
  // ... resto del código
});
```

---

## 🧪 Probar la Seguridad

### ✅ Test 1: Sin Token (debe fallar)
```bash
curl -X GET http://localhost:5000/api/recordatorios
# Respuesta esperada: 401 Unauthorized
```

### ✅ Test 2: Token Inválido (debe fallar)
```bash
curl -X GET http://localhost:5000/api/recordatorios \
  -H "Authorization: Bearer token-falso-123"
# Respuesta esperada: 401 Unauthorized
```

### ✅ Test 3: Token Válido (debe funcionar)
```bash
# Obtener token desde la app (console.log después del login)
curl -X GET http://localhost:5000/api/recordatorios \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6..."
# Respuesta esperada: 200 OK con datos
```

### ✅ Test 4: Intentar acceder a datos de otro usuario (debe fallar)
```bash
# Con token de usuario A intentar acceder a datos de usuario B
curl -X GET http://localhost:5000/api/recordatorios/usuario-b-id \
  -H "Authorization: Bearer <token-usuario-a>"
# Respuesta esperada: 403 Forbidden
```

---

## 📊 Modelo de Datos Actualizado

Asegúrate de que tus modelos incluyan el `userId` para relacionar datos con usuarios:

```javascript
// models/Recordatorio.js
const recordatorioSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true // Índice para búsquedas rápidas
  },
  medicamento: {
    type: String,
    required: true
  },
  hora: String,
  frecuencia: String,
  activo: {
    type: Boolean,
    default: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
});

// models/SesionActividad.js
const sesionSchema = new mongoose.Schema({
  idUsuario: {
    type: String,
    required: true,
    index: true
  },
  fecha: Date,
  actividades: [actividadSchema],
  // ...
});
```

---

## 🔐 Mejores Prácticas

### ✅ DO (Hacer)
1. **Siempre valida el token** en endpoints protegidos
2. **Verifica la propiedad** (que el userId del recurso coincida con req.user.uid)
3. **Registra intentos fallidos** para detectar ataques
4. **Usa HTTPS** en producción
5. **Guarda serviceAccountKey.json en .gitignore**
6. **Usa variables de entorno** para configuración sensible

### ❌ DON'T (No hacer)
1. **Nunca confíes en el userId del body** sin validar
2. **No expongas datos de otros usuarios**
3. **No registres tokens en logs** (sensible)
4. **No uses el mismo token para diferentes propósitos**
5. **No ignores errores de validación**

---

## 🚀 Ejemplo Completo de Router Seguro

```javascript
// routes/recordatorios.js
const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authMiddleware');
const Recordatorio = require('../models/Recordatorio');

// 🔒 TODOS los endpoints están protegidos
router.use(authenticateUser);

// GET todos los recordatorios del usuario
router.get('/', async (req, res) => {
  try {
    const recordatorios = await Recordatorio.find({ userId: req.user.uid });
    res.json({ success: true, data: recordatorios });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST crear recordatorio
router.post('/', async (req, res) => {
  try {
    const nuevo = new Recordatorio({
      ...req.body,
      userId: req.user.uid // Forzar userId del token
    });
    await nuevo.save();
    res.status(201).json({ success: true, data: nuevo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE eliminar recordatorio
router.delete('/:id', async (req, res) => {
  try {
    const result = await Recordatorio.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.uid // Solo eliminar si es del usuario
    });
    
    if (!result) {
      return res.status(404).json({ success: false, message: 'No encontrado' });
    }
    
    res.json({ success: true, message: 'Eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

---

## 📚 Recursos Adicionales

- [Firebase Admin SDK - Verify ID Tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)

---

## 🎯 Resumen

**Antes** ❌:
```
Usuario → API → Base de Datos
         (SIN VALIDACIÓN)
```

**Ahora** ✅:
```
Usuario → Token → API → Valida Token → Base de Datos
                         ↓ Firebase
                     Verifica identidad
```

**Resultado**: Solo usuarios autenticados pueden acceder a sus propios datos. 🔒

---

## 🆘 Troubleshooting

### Error: "auth/id-token-expired"
- **Causa**: El token expiró (1 hora de validez)
- **Solución**: La app renueva automáticamente el token con `tokenManager.refreshToken()`

### Error: "auth/argument-error"
- **Causa**: Token mal formado o vacío
- **Solución**: Verificar que el token se esté enviando correctamente en el header

### Error: "Error: Credential implementation provided to initializeApp() via the "credential" property failed to fetch a valid Google OAuth2 access token"
- **Causa**: serviceAccountKey.json inválido o no encontrado
- **Solución**: Descargar nuevamente desde Firebase Console

### Error 403 en operaciones propias
- **Causa**: El userId en la base de datos no coincide con el uid del token
- **Solución**: Migrar datos existentes para usar el uid de Firebase Auth

---

¡Tu API ahora está protegida! 🎉🔒
