# 🔐 Guía de Autenticación con Tokens en Firebase

## ¿Cómo funcionan los tokens en Firebase?

Firebase Authentication usa **JSON Web Tokens (JWT)** automáticamente. Cuando un usuario inicia sesión:

1. Firebase genera un **ID Token** (JWT) firmado digitalmente
2. El token tiene una duración de **1 hora**
3. Firebase **renueva automáticamente** el token cuando es necesario
4. El token contiene información del usuario (uid, email, etc.)
5. Está **criptográficamente firmado** por Firebase (no puede ser falsificado)

## 📦 Estructura del Token JWT

Un token JWT de Firebase tiene 3 partes separadas por puntos:

```
header.payload.signature
```

### Ejemplo de payload decodificado:
```json
{
  "iss": "https://securetoken.google.com/tu-proyecto-id",
  "aud": "tu-proyecto-id",
  "auth_time": 1699000000,
  "user_id": "abc123xyz",
  "sub": "abc123xyz",
  "iat": 1699000000,
  "exp": 1699003600,
  "email": "usuario@ejemplo.com",
  "email_verified": true,
  "firebase": {
    "identities": {
      "email": ["usuario@ejemplo.com"]
    },
    "sign_in_provider": "password"
  }
}
```

- **iss**: Emisor del token (Firebase)
- **aud**: Audiencia (tu proyecto)
- **iat**: Emitido en (timestamp)
- **exp**: Expira en (timestamp)
- **user_id**: ID del usuario
- **email**: Email del usuario

## 🚀 Cómo usar los tokens en tu app

### 1. Obtener el token actual

```javascript
import tokenManager from './src/utils/tokenManager';

// Obtener token (se renueva automáticamente si es necesario)
const token = await tokenManager.getToken();
console.log('Token:', token);
```

### 2. Verificar si el token es válido

```javascript
const isValid = await tokenManager.isTokenValid();
if (isValid) {
  console.log('Token válido');
} else {
  console.log('Token expirado o inválido');
}
```

### 3. Decodificar el token para ver su contenido

```javascript
const token = await tokenManager.getToken();
const decoded = tokenManager.decodeToken(token);
console.log('Información del usuario:', decoded);
console.log('UID:', decoded.user_id);
console.log('Email:', decoded.email);
console.log('Expira en:', new Date(decoded.exp * 1000));
```

### 4. Renovar el token manualmente

```javascript
const newToken = await tokenManager.refreshToken();
console.log('Token renovado:', newToken);
```

### 5. Hacer peticiones HTTP con el token

```javascript
import { authenticatedAPI } from './src/api/authenticatedClient';

// El token se agrega automáticamente a la petición
const profile = await authenticatedAPI.getUserProfile('user-uid-123');
console.log('Perfil:', profile);
```

## 📱 Ejemplo completo en un componente

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import tokenManager from '../utils/tokenManager';
import { authenticatedAPI } from '../api/authenticatedClient';

export default function ProfileScreen() {
  const [tokenInfo, setTokenInfo] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    loadTokenInfo();
    loadProfile();
  }, []);

  const loadTokenInfo = async () => {
    const token = await tokenManager.getToken();
    const decoded = tokenManager.decodeToken(token);
    setTokenInfo(decoded);
  };

  const loadProfile = async () => {
    try {
      const data = await authenticatedAPI.getUserProfile('uid-del-usuario');
      setProfile(data);
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    }
  };

  const handleRefreshToken = async () => {
    const newToken = await tokenManager.refreshToken();
    console.log('Token renovado:', newToken);
    await loadTokenInfo();
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
        Información del Token
      </Text>
      
      {tokenInfo && (
        <>
          <Text>UID: {tokenInfo.user_id}</Text>
          <Text>Email: {tokenInfo.email}</Text>
          <Text>
            Expira: {new Date(tokenInfo.exp * 1000).toLocaleString()}
          </Text>
        </>
      )}

      <Button title="Renovar Token" onPress={handleRefreshToken} />
    </View>
  );
}
```

## 🔒 Seguridad del Token

### ✅ Ventajas de usar Firebase Authentication:

1. **No necesitas implementar JWT manualmente** - Firebase lo hace por ti
2. **Renovación automática** - El SDK renueva el token antes de que expire
3. **Firmado digitalmente** - Nadie puede falsificar un token
4. **Verificación en el servidor** - Firebase verifica cada token automáticamente
5. **Caducidad automática** - Los tokens expiran en 1 hora por seguridad

### ⚠️ Mejores prácticas:

1. **Nunca expongas el token en logs públicos**
2. **No guardes el token en variables globales**
3. **Usa HTTPS siempre** para enviar tokens
4. **No compartas tokens entre usuarios**
5. **Limpia el token al cerrar sesión**

## 🌐 Usar tokens con tu propio backend

Si tienes un backend propio (Node.js, Python, etc.), puedes verificar los tokens de Firebase:

### Ejemplo en Node.js:

```javascript
const admin = require('firebase-admin');

// Inicializar Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Verificar token en una ruta protegida
app.post('/api/protected', async (req, res) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    
    // Token válido, continuar con la operación
    res.json({ success: true, uid });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});
```

## 🆚 Comparación con jsonwebtoken

| Característica | Firebase Tokens | jsonwebtoken manual |
|---------------|-----------------|---------------------|
| Generación | ✅ Automática | ❌ Manual |
| Renovación | ✅ Automática | ❌ Manual |
| Verificación | ✅ Automática | ❌ Manual |
| Firma digital | ✅ Por Firebase | ⚙️ Configuras tú |
| Seguridad | ✅ Alta (Google) | ⚙️ Depende de ti |
| Complejidad | ✅ Baja | ⚠️ Alta |

## 📚 Recursos adicionales

- [Documentación oficial de Firebase Auth](https://firebase.google.com/docs/auth/web/manage-users)
- [Verificar tokens ID](https://firebase.google.com/docs/auth/admin/verify-id-tokens)
- [Seguridad de Firebase](https://firebase.google.com/docs/rules)

---

**Conclusión:** Con Firebase no necesitas instalar `jsonwebtoken` porque Firebase ya maneja todo el sistema de tokens JWT de forma automática, segura y eficiente. Solo necesitas usar `user.getIdToken()` para obtener el token y enviarlo en tus peticiones HTTP.
