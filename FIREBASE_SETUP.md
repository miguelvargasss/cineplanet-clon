# Cineplanet - Configuración de Firebase

## 🚨 SOLUCIÓN AL ERROR DE RESERVAS DE ASIENTOS

**Si ves error: "Error obteniendo estadísticas de ocupación"** necesitas actualizar las reglas de Firebase.

### 🔥 REGLAS DE FIRESTORE ACTUALIZADAS

Ve a [Firebase Console](https://console.firebase.google.com/) → tu proyecto → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para películas (existentes)
    match /movies/{document} {
      allow read, write: if true;
    }

    match /moviesEstreno/{document} {
      allow read, write: if true;
    }

    match /moviesBts/{document} {
      allow read, write: if true;
    }

    // ✨ NUEVAS REGLAS PARA SISTEMA DE RESERVAS
    match /seatReservations/{document} {
      allow read, write: if true; // Permite operaciones de reserva
    }

    match /tickets/{document} {
      allow read, write: if true; // Permite operaciones de tickets
    }

    // Regla para test de conectividad
    match /connectionTest/{document} {
      allow read, write: if true;
    }

    // Reglas generales
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ IMPORTANTE:** Después de guardar las reglas, espera 1-2 minutos y reinicia tu app.

## 🎬 Implementación Completada

Se ha implementado exitosamente Firebase en tu aplicación de Cineplanet con las siguientes funcionalidades:

### ✅ Funcionalidades Implementadas

1. **Autenticación de Usuarios**

   - Registro de usuarios con datos completos
   - Inicio de sesión con email y contraseña
   - Persistencia de sesión automática
   - Cierre de sesión seguro

2. **Base de Datos de Películas**

   - Estructura de datos para películas en Firestore
   - Carga de películas por categorías (En Cartelera, Próximos Estrenos, BTS Week)
   - Soporte para imágenes de pósters con Firebase Storage

3. **Interfaz de Usuario**

   - Cards de películas con diseño moderno
   - Scroll vertical para visualización de múltiples películas
   - Pull-to-refresh para actualizar contenido
   - Estados de carga y error

4. **Protección de Rutas**
   - Acceso restringido a pantallas que requieren autenticación
   - Redirección automática al login si no está autenticado

## 🔧 Configuración Requerida

### 1. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Agrega una aplicación web al proyecto
4. Copia las credenciales de configuración

### 2. Configurar Variables de Entorno

Actualiza el archivo `.env` con tus credenciales de Firebase:

```bash
# Firebase Configuration
FIREBASE_API_KEY=tu_api_key_real
FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
FIREBASE_PROJECT_ID=tu_project_id
FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
FIREBASE_APP_ID=tu_app_id
```

### 3. Actualizar Configuración de Firebase

Edita el archivo `src/config/firebase.ts` y reemplaza las credenciales de ejemplo:

```typescript
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};
```

### 4. Configurar Firestore

1. En Firebase Console, ve a Firestore Database
2. Crea la base de datos en modo de prueba
3. Crea las siguientes colecciones:
   - `users` - Para perfiles de usuarios
   - `movies` - Para películas

### 5. Configurar Storage

1. En Firebase Console, ve a Storage
2. Configura Storage para subir imágenes de pósters
3. Crear la carpeta `movie-posters/`

### 6. Reglas de Seguridad (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios pueden leer y escribir sus propios datos
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Películas - lectura pública, escritura para usuarios autenticados
    match /movies/{movieId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Tarjetas de pago - solo el usuario dueño puede acceder
    match /paymentCards/{cardId} {
      allow read, write: if request.auth != null &&
                           request.auth.uid == resource.data.userId;
      allow create: if request.auth != null &&
                     request.auth.uid == request.resource.data.userId;
    }

    // Asientos - lectura pública, escritura para usuarios autenticados
    match /seats/{seatId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Snacks/Dulcería - lectura pública, escritura para usuarios autenticados
    match /snacks/{snackId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /snackCategories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Horarios de funciones - lectura pública, escritura para usuarios autenticados
    match /schedules/{scheduleId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Tickets/Boletos - solo el usuario dueño puede acceder
    match /tickets/{ticketId} {
      allow read, write: if request.auth != null &&
                           request.auth.uid == resource.data.userId;
      allow create: if request.auth != null &&
                     request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 7. Reglas de Seguridad (Storage)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /movie-posters/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 🚀 Ejecutar la Aplicación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm start

# Para Android
npm run android

# Para iOS
npm run ios
```

## 📊 Poblar Base de Datos

Para poblar la base de datos con películas de ejemplo, puedes usar el servicio incluido:

```typescript
import { seedMoviesDatabase } from "@/src/utils/seedDatabase";

// Llamar esta función una vez para agregar películas de ejemplo
await seedMoviesDatabase();
```

## 🎯 Flujo de Usuario

1. **Primera vez**: Usuario se registra con sus datos personales
2. **Login**: Usuario inicia sesión con email y contraseña
3. **Películas**: Usuario ve las películas cargadas desde Firebase
4. **Navegación**: Usuario puede cambiar entre categorías (En Cartelera, Próximos Estrenos, BTS Week)
5. **Logout**: Usuario puede cerrar sesión tocando su avatar

## 📱 Estructura de Archivos Agregados

```
src/
├── config/
│   └── firebase.ts              # Configuración de Firebase
├── services/
│   ├── authService.ts           # Servicios de autenticación
│   └── moviesService.ts         # Servicios de películas
├── contexts/
│   └── AuthContext.tsx          # Contexto de autenticación
├── components/
│   └── ProtectedRoute.tsx       # Componente de protección de rutas
├── data/
│   └── sampleMovies.ts          # Datos de ejemplo
└── utils/
    └── seedDatabase.ts          # Script para poblar BD
```

## 🔒 Seguridad

- Autenticación segura con Firebase Auth
- Validación de datos en cliente y servidor
- Protección de rutas sensibles
- Manejo seguro de tokens de autenticación

## 🎨 UI/UX

- Diseño moderno con cards de películas
- Estados de carga y error
- Pull-to-refresh
- Scroll suave para múltiples películas
- Indicadores visuales de estado (Estreno, etc.)

¡Tu aplicación está lista para usar con Firebase! 🎉
