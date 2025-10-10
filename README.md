# 🏥 Salud Bienestar - Mobile App

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

**Aplicación móvil de salud y bienestar** construida con React Native y Expo SDK 53

</div>

## 📱 Descripción

Salud Bienestar es una aplicación móvil diseñada para ayudar a los usuarios a mejorar su salud física y mental mediante seguimiento de hábitos, rutinas de ejercicio, meditación y consejos de bienestar.

## ✨ Características

- 🔐 **Autenticación segura** de usuarios
- 🏠 **Dashboard personalizado** con métricas de salud
- 📊 **Seguimiento** de hábitos y progreso
- 🧘 **Rutinas** de ejercicio y meditación
- 🎯 **Recordatorios** y notificaciones
- 📱 **UI/UX moderna** y responsive

## 🛠️ Tecnologías

### Principales
- **React Native** - Framework móvil
- **Expo SDK 53** - Plataforma de desarrollo
- **React Navigation** - Navegación entre pantallas
- **Axios** - Cliente HTTP para APIs

### Arquitectura
- **Context API** - Estado global
- **Componentes modulares** - Código reutilizable
- **Hooks personalizados** - Lógica reusable

## 📁 Estructura del Proyecto
```bash
salud_bienestar_frontend_app/
├── App.js # Punto de entrada principal
├── index.js # Registro de la app
├── src/
│ ├── components/ # Componentes reutilizables
│ │ ├── common/ # Botones, Inputs, Loaders
│ │ ├── ui/ # Cards, Modals, Layouts
│ │ └── health/ # Componentes específicos de salud
│ ├── screens/ # Pantallas de la aplicación
│ │ ├── auth/ # Login, Register, ForgotPassword
│ │ ├── main/ # Home, Dashboard, Profile
│ │ └── health/ # Rutinas, Seguimiento, Métricas
│ ├── navigation/ # Configuración de navegación
│ │ ├── AppNavigation.js
│ │ ├── AuthNavigator.js
│ │ └── MainNavigator.js
│ ├── context/ # Estado global (Context API)
│ │ └── AuthContext.js
│ ├── services/ # Lógica de negocio
│ │ ├── authService.js
│ │ └── healthService.js
│ ├── api/ # Configuración de APIs
│ │ └── apiClient.js # Configuración Axios
│ ├── utils/ # Utilidades y helpers
│ ├── constants/ # Constantes de la app
│ ├── hooks/ # Custom hooks
│ └── assets/ # Recursos estáticos
│ ├── images/
│ ├── icons/
│ └── fonts/
├── package.json
└── README.md
```

## 🚀 Instalación y Ejecución
1. Clona el repositorio:
   ```bash
   git clone

2. Navega al directorio del proyecto:
   ```bash
   cd salud_bienestar_frontend_app
   ```

3. Instala las dependencias:
   ```bash
    npm install
    # o usando yarn
    yarn install
    ```
4. Inicia la aplicación:
    ```bash
    npm start
    # o usando yarn
    yarn start
    ```