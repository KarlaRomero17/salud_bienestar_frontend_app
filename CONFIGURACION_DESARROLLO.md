# 🛠️ Configuración para Desarrollo en Equipo

Este documento explica cómo configurar tu entorno de desarrollo local para trabajar con el backend en diferentes dispositivos.

---

## 📋 Configuración Rápida

### 1️⃣ Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd salud_bienestar_frontend_app
```

### 2️⃣ Instalar Dependencias
```bash
npm install
```

### 3️⃣ Configurar Variables de Entorno

**🚨 IMPORTANTE**: Cada desarrollador debe configurar su propio archivo `.env`

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tu IP local (ver sección siguiente)
```

---

## 🌐 Configurar tu IP Local (SERVER_URI)

El archivo `.env` **NO se sube a Git** (está en `.gitignore`), por lo que cada desarrollador debe configurarlo según su entorno.

### Paso 1: Encontrar tu IP Local

#### En Windows:
```powershell
ipconfig
```
Busca la sección de tu adaptador de red activo (Wi-Fi o Ethernet):
```
Adaptador de LAN inalámbrica Wi-Fi:
   Dirección IPv4. . . . . . . . . : 192.168.1.100  ← Esta es tu IP
```

#### En Mac/Linux:
```bash
ifconfig
# o
ip addr
```
Busca `inet` en tu adaptador activo:
```
en0: flags=8863<UP,BROADCAST,SMART,RUNNING>
    inet 192.168.1.100  ← Esta es tu IP
```

### Paso 2: Configurar SERVER_URI en .env

Edita tu archivo `.env` y reemplaza la IP según tu caso:

#### Opción A: Dispositivo Físico (Teléfono/Tablet conectado a la misma red Wi-Fi)
```properties
SERVER_URI=http://192.168.1.100:5000
```
✅ Reemplaza `192.168.1.100` con **TU IP local**
✅ Asegúrate de que el backend esté corriendo en el puerto `5000`
✅ Tu computadora y dispositivo deben estar en la **misma red Wi-Fi**

#### Opción B: Android Emulator
```properties
SERVER_URI=http://10.0.2.2:5000
```
✅ La IP `10.0.2.2` es la IP especial que Android usa para `localhost` de tu PC

#### Opción C: iOS Simulator
```properties
SERVER_URI=http://localhost:5000
```
✅ iOS Simulator puede usar directamente `localhost`

#### Opción D: Producción (cuando el backend esté desplegado)
```properties
SERVER_URI=https://tu-servidor-backend.com
```

---

## 🚀 Iniciar el Proyecto

### 1. Iniciar el Backend (si lo tienes local)
```bash
cd ../backend
npm start
# El backend debe estar corriendo en el puerto 5000
```

### 2. Iniciar Expo
```bash
npx expo start
```

### 3. Conectar tu Dispositivo/Emulador
- **Dispositivo físico**: Escanea el código QR con Expo Go
- **Android Emulator**: Presiona `a` en la terminal de Expo
- **iOS Simulator**: Presiona `i` en la terminal de Expo

---

## ✅ Verificación

Si todo está configurado correctamente, deberías poder:

1. ✅ Iniciar sesión sin errores
2. ✅ Ver tus datos de perfil
3. ✅ Registrar actividades físicas
4. ✅ Ver estadísticas

Si ves errores de **"Network Error"** o **"Request failed"**:
- ❌ Verifica que el backend esté corriendo
- ❌ Verifica que tu IP en `.env` sea correcta
- ❌ Verifica que estés en la misma red Wi-Fi (dispositivo físico)
- ❌ Desactiva el firewall temporalmente para probar

---

## 🔄 Flujo de Trabajo en Equipo

### Al hacer cambios:
```bash
git add .
git commit -m "Descripción del cambio"
git push origin nombre-de-tu-rama
```

### Al recibir cambios (pull):
```bash
git pull origin rama
npm install  # Por si hay nuevas dependencias
```

**⚠️ IMPORTANTE**: Después de hacer `git pull`, **NO necesitas modificar ningún archivo** con IPs hardcodeadas. Solo ajusta tu `.env` si es necesario.

---

## 📂 Archivos que Usan Variables de Entorno

Los siguientes archivos ya están configurados para usar `SERVER_URI` del `.env`:

| Archivo | Uso |
|---------|-----|
| `src/api/apiClient.js` | Cliente HTTP base |
| `src/screens/ActividadFisica/NuevaSesionScreen.js` | Gestión de sesiones |
| `src/screens/ActividadFisica/EstadisticasScreen.js` | Estadísticas |
| `src/screens/ActividadFisica/AgregarActividadScreen.js` | Agregar actividades |

**✅ Estos archivos YA NO tienen IPs hardcodeadas**, usan la variable `SERVER_URI` del `.env`.

---

## 🆘 Problemas Comunes

### Error: "SERVER_URI is not defined"
**Solución:**
1. Asegúrate de tener el archivo `.env` en la raíz del proyecto
2. Verifica que `babel.config.js` tenga configurado `react-native-dotenv`
3. Reinicia Metro Bundler con cache limpio:
   ```bash
   npx expo start --clear
   ```

### Error: "Network Error" o "Request failed"
**Solución:**
1. Verifica que el backend esté corriendo (`http://TU_IP:5000` debe abrir en el navegador)
2. Verifica tu IP en `.env`
3. En dispositivo físico: asegúrate de estar en la misma red Wi-Fi
4. Desactiva temporalmente el firewall/antivirus

### Backend funciona en navegador pero no en la app
**Solución:**
- Si usas dispositivo físico, NO uses `localhost` o `127.0.0.1`
- Usa tu IP local (ej: `192.168.1.100`)
- Verifica que el firewall permita conexiones entrantes en el puerto 5000

---

## 📝 Ejemplo Completo

**Escenario**: Karla (192.168.0.14) y Juan (192.168.0.25) trabajan en el mismo proyecto.

### Karla (.env):
```properties
SERVER_URI=http://192.168.0.14:5000
```

### Juan (.env):
```properties
SERVER_URI=http://192.168.0.25:5000
```

Ambos pueden:
- ✅ Hacer `git pull` sin conflictos (`.env` está en `.gitignore`)
- ✅ Trabajar con sus propios backends locales
- ✅ NO necesitan modificar archivos de código con IPs

---

## 📚 Recursos Adicionales

- [Documentación de Expo](https://docs.expo.dev/)
- [React Native Dotenv](https://github.com/goatandsheep/react-native-dotenv)
- [Firebase Setup](./FIREBASE_DATABASE_SETUP.md)

---

## 🎯 Resumen

1. ✅ Clona el proyecto
2. ✅ Ejecuta `npm install`
3. ✅ Copia `.env.example` a `.env`
4. ✅ Configura `SERVER_URI` con tu IP local
5. ✅ Inicia el backend
6. ✅ Ejecuta `npx expo start`
7. ✅ ¡Desarrolla sin preocuparte por IPs hardcodeadas!

**¡Listo para colaborar!** 🚀
