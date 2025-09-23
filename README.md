# Cineplanet Clone App 🎬

Este es un clon de la aplicación móvil de Cineplanet desarrollado con [Expo](https://expo.dev) y React Native. Una aplicación moderna y escalable que replica la experiencia de usuario de Cineplanet con arquitectura limpia y tecnologías de vanguardia.

## 🛠️ Stack Tecnológico

### Core Technologies

- **React Native 0.81.4** - Framework para desarrollo móvil multiplataforma
- **Expo SDK 54.0.8** - Plataforma de desarrollo y despliegue (ACTUALIZADO)
- **TypeScript ~5.9.2** - Tipado estático para mayor robustez
- **Expo Router ~6.0.6** - Navegación basada en archivos

### UI & Animaciones

- **React Native Reanimated ~4.1.0** - Animaciones de alto rendimiento (Nueva arquitectura)
- **React Native Gesture Handler ~2.28.0** - Manejo avanzado de gestos
- **React Native Safe Area Context ~5.6.0** - Manejo de áreas seguras

### Recursos y Assets

- **@expo/vector-icons ^15.0.2** - Biblioteca completa de iconos (6 familias disponibles)
- **Expo Font ~14.0.8** - Carga de fuentes personalizadas
- **Expo Image ~3.0.8** - Componente optimizado de imágenes
- **Expo Symbols ~1.0.7** - Iconos del sistema SF Symbols

### Desarrollo y Calidad

- **ESLint ^9.25.0** - Linter para calidad de código
- **eslint-config-expo ~10.0.0** - Configuración ESLint para Expo
- **Babel Core ^7.25.2** - Transpilador JavaScript

### Nuevas Dependencias (SDK 54)

- **@expo/metro-runtime ~6.1.2** - Runtime optimizado para Metro
- **React Native Worklets 0.5.1** - Soporte para worklets (Reanimated v4)
- **React Native Web ^0.21.0** - Soporte web mejorado

## �🚀 Inicio Rápido

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/miguelvargasss/cineplanet-clon.git
   cd cineplanet
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Iniciar la aplicación**
   ```bash
   npx expo start
   ```

En la salida, encontrarás opciones para abrir la app en:

- 📱 [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- 🍎 [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- 🌐 [Expo Go](https://expo.dev/go) (recomendado para desarrollo)
- 💻 [Web browser](https://docs.expo.dev/workflow/web/)

## 🏗️ Arquitectura del Proyecto

### Estructura Principal

```
📁 cineplanet/
├── 🎯 app/                          # NAVEGACIÓN Y PANTALLAS (Expo Router)
│   ├── _layout.tsx                  # Layout principal de la aplicación
│   ├── +not-found.tsx               # Página 404 personalizada
│   ├── movies.tsx                   # Pantalla principal de cartelera
│   ├── (tabs)/                      # 📑 Grupo de navegación por tabs
│   │   ├── _layout.tsx              # Layout de tabs (configuración)
│   │   └── index.tsx                # Pantalla inicial (redirige a auth)
│   └── (auth)/                      # 🔐 Grupo de autenticación
│       ├── _layout.tsx              # Layout para pantallas de auth
│       ├── login.tsx                # Pantalla de inicio de sesión
│       └── register.tsx             # Pantalla de registro completo
│
├── 🧩 components/                   # COMPONENTES REUTILIZABLES
│   ├── ThemedInput.tsx              # Input con soporte de temas
│   ├── ThemedButton.tsx             # Botón personalizado temático
│   ├── ThemedText.tsx               # Texto con sistema de temas
│   ├── ThemedView.tsx               # Vista con soporte de temas
│   ├── ThemedDropdown.tsx           # Dropdown personalizado
│   ├── ThemedCheckbox.tsx           # Checkbox con temas
│   ├── GenderSelector.tsx           # Selector de género para registro
│   ├── DateSelector.tsx             # Selector de fecha de nacimiento
│   ├── CineplanetSelector.tsx       # Selector de cines favoritos
│   └── ui/                          # 🎨 Componentes UI básicos
│       ├── Icon.tsx                 # Sistema de iconos mejorado (@expo/vector-icons)
│       ├── IconSymbol.tsx           # Sistema de iconos multiplataforma (legacy)
│       ├── IconSymbol.ios.tsx       # Iconos específicos para iOS (legacy)
│       └── Modal.tsx                # Modal básico reutilizable
│
├── 💼 src/                          # LÓGICA DE NEGOCIO
│   ├── services/                    # 🌐 Servicios externos
│   │   └── api.ts                   # Servicios de API y autenticación
│   ├── store/                       # �️ Gestión de estado global
│   │   └── context.tsx              # Context API para estado compartido
│   ├── types/                       # 📝 Definiciones de tipos
│   │   └── index.ts                 # Tipos TypeScript globales
│   └── utils/                       # 🔧 Utilidades y helpers
│       └── index.ts                 # Validaciones, formateo, storage
│
├── ⚙️ constants/                    # CONSTANTES GLOBALES
│   └── Colors.ts                    # Paleta de colores Cineplanet oficial
│
├── 🪝 hooks/                        # HOOKS PERSONALIZADOS
│   ├── useColorScheme.ts            # Hook para esquema de colores
│   ├── useColorScheme.web.ts        # Hook específico para web
│   └── useThemeColor.ts             # Hook para colores del tema
│
├── 🎨 assets/                       # RECURSOS ESTÁTICOS
│   ├── images/                      # Imágenes, logos e iconos
│   │   ├── icon.png                 # Icono principal de la app
│   │   ├── adaptive-icon.png        # Icono adaptativo Android
│   │   ├── favicon.png              # Favicon para web
│   │   └── peliculas-cajamarca.jpg  # Imagen demo de películas
│   └── fonts/                       # Fuentes personalizadas
│       └── SpaceMono-Regular.ttf    # Fuente monoespaciada
│
├── 🔧 scripts/                      # SCRIPTS DE AUTOMATIZACIÓN
│   └── reset-project.js             # Script para reiniciar proyecto
│
├── 📁 .expo/                        # CONFIGURACIÓN EXPO
│   ├── types/router.d.ts            # Tipos generados de routing
│   └── cache/                       # Caché de compilación
│
└── 📄 Archivos de configuración
    ├── app.json                     # Configuración principal de Expo
    ├── package.json                 # Dependencias y scripts npm
    ├── tsconfig.json                # Configuración TypeScript
    ├── eslint.config.js             # Reglas de ESLint
    ├── expo-env.d.ts                # Variables de entorno Expo
    └── ARQUITECTURA.md              # Documentación detallada
```

### Principios Arquitectónicos

✅ **Separación de responsabilidades**: Cada carpeta tiene un propósito específico  
✅ **Componentes reutilizables**: UI modular y escalable  
✅ **Navegación basada en archivos**: Estructura intuitiva con Expo Router  
✅ **Sistema de temas**: Soporte completo para modo claro/oscuro  
✅ **TypeScript**: Tipado estático para mayor confiabilidad  
✅ **Arquitectura limpia**: Separación entre UI, lógica y datos

## 🎨 Tecnologías Utilizadas

- **React Native** - Framework para desarrollo móvil
- **Expo** - Plataforma de desarrollo
- **TypeScript** - Tipado estático
- **Expo Router** - Navegación basada en archivos

## 🎯 Funcionalidades y Estado del Desarrollo

### ✅ Implementado:

- **Sistema de autenticación completo** (Login/Registro)
- **Navegación fluida** entre pantallas con Expo Router
- **Diseño responsivo** con SafeAreaView y áreas seguras
- **Sistema de temas** claro/oscuro dinámico
- **Componentes UI modulares** y reutilizables
- **Arquitectura escalable** con separación de responsabilidades
- **Validación de formularios** en tiempo real
- **Gestión de estado global** con Context API
- **Interfaz de películas** con navegación por tabs
- **Sistema de iconos mejorado** con 6 familias disponibles
- **SDK actualizado** a Expo 54 con mejor rendimiento

### 🆕 Actualizaciones Recientes (Septiembre 2025):

- ⬆️ **Expo SDK 53 → 54**: Actualización completa con mejor rendimiento
- 🎨 **Sistema de iconos renovado**: 6 familias de @expo/vector-icons
- ⚡ **React Native Reanimated v4**: Nueva arquitectura de animaciones
- 🛠️ **Dependencias optimizadas**: Todas las librerías actualizadas
- 📚 **Documentación mejorada**: Guías detalladas para iconos

### � En Desarrollo:

- Catálogo de películas con datos dinámicos desde API
- Sistema de reservas y selección de asientos
- Integración con backend real
- Notificaciones push
- Sistema de favoritos
- Carrito de compras y pagos

### 🎨 Sistema de Diseño

**Paleta de Colores Oficial Cineplanet:**

- 🔵 **Azul Principal**: `#1976D2` (Brand primary)
- 🌹 **Rosa/Rojo**: `#E91E63` (Accent color)
- ⚫ **Modo Oscuro**: Automático según preferencias del sistema
- ⚪ **Modo Claro**: Interfaz limpia y moderna

**Tipografía:**

- **Fuente Principal**: SpaceMono (Monoespaciada)
- **Iconos**: @expo/vector-icons + SF Symbols
- **Responsive**: Adaptable a diferentes tamaños de pantalla

### 🎯 Sistema de Iconos Mejorado

**Familias de Iconos Disponibles:**

- **Ionicons** (`IIcon`) - Recomendado para UI general
- **Material Icons** (`MIcon`) - Iconos de Material Design
- **Font Awesome** (`FAIcon`) - Iconos populares y reconocibles
- **Feather Icons** (`FeatherIcon`) - Minimalistas y elegantes
- **Ant Design** (`AIcon`) - Iconos de Ant Design System
- **Material Community** (`MCIcon`) - Extensión de Material Icons

**Uso Simplificado:**

```tsx
import { IIcon, MIcon, FAIcon } from '@/components/ui/Icon';

<IIcon name="home" size={24} color="#007AFF" />
<MIcon name="person" size={20} color="#666" />
<FAIcon name="heart" size={18} color="#FF3B30" />
```

**Documentación Completa:** Ver archivo `ICONOS.md` para guía detallada.

## 🛣️ Flujo de Usuario

```
🏠 Inicio (app/index.tsx)
    ↓
🔐 Login (app/(auth)/login.tsx)
    ↓ (autenticación exitosa)
🎬 Cartelera (app/movies.tsx)
    ├── 📱 En Cartelera
    ├── 🆕 Próximos Estrenos
    └── 🎭 BTS Week

🆕 Registro (app/(auth)/register.tsx)
    ├── 👤 Datos Personales
    ├── 📍 Ubicación
    ├── 🎯 Cineplanet Favorito
    └── ✅ Términos y Condiciones
```

## 📱 Detalles de Pantallas

### 🔐 Autenticación

#### Login (`app/(auth)/login.tsx`)

- **Campos**: Email, Contraseña
- **Validaciones**: Email válido, contraseña mínima
- **Funciones**: Recordar usuario, recuperar contraseña
- **Navegación**: Registro, Inicio

#### Registro (`app/(auth)/register.tsx`)

- **Datos Personales**: Nombre, apellidos, email, teléfono
- **Fecha de Nacimiento**: Selector de fecha interactivo
- **Género**: Selector personalizado
- **Ubicación**: Departamento y provincia
- **Preferencias**: Cineplanet favorito
- **Legal**: Términos, condiciones y políticas

### 🎬 Cartelera (`app/movies.tsx`)

#### Header de Navegación

- Logo Cineplanet
- Selector de ubicación
- Menú de usuario

#### Tabs de Contenido

- **En Cartelera**: Películas actualmente disponibles
- **Próximos Estrenos**: Películas por estrenar
- **BTS Week**: Contenido especial BTS

#### Filtros y Búsqueda

- Filtro por fecha
- Filtro por ubicación
- Búsqueda por nombre
- Grid responsivo de películas

#### Navegación Inferior

- Cartelera (actual)
- Mis Entradas
- Promociones
- Perfil

## 🔧 Scripts y Comandos

```bash
# 🚀 Desarrollo
npm run start          # Iniciar servidor de desarrollo Expo
npm run android        # Abrir en emulador Android
npm run ios           # Abrir en simulador iOS
npm run web           # Abrir en navegador web

# 🧹 Mantenimiento
npm run lint          # Verificar código con ESLint
npm run reset-project # Reiniciar proyecto a estado inicial

# � Gestión de dependencias
npm install           # Instalar todas las dependencias
npm update           # Actualizar dependencias
expo install         # Instalar dependencias compatibles con Expo
```

## 🗂️ Archivos de Configuración

### 📄 `package.json`

- **Dependencias principales**: Expo, React Native, TypeScript
- **Scripts**: Comandos de desarrollo y compilación
- **Versión**: 1.0.0

### ⚙️ `app.json`

- **Configuración Expo**: Nombre, slug, íconos
- **Orientación**: Portrait (vertical)
- **Soporte**: iOS, Android, Web
- **Plugins**: expo-router, expo-splash-screen

### 🔍 `tsconfig.json`

- **Target**: ES2020
- **Module**: CommonJS
- **Strict mode**: Activado
- **Path mapping**: Configurado para imports absolutos

### 🎨 `eslint.config.js`

- **Configuración**: eslint-config-expo
- **Reglas**: Estándar para proyectos React Native/Expo

## 📊 Dependencias Principales

### 🔧 Core Dependencies

```json
{
  "expo": "54.0.8",
  "react": "19.1.0",
  "react-native": "0.81.4",
  "expo-router": "~6.0.6",
  "typescript": "~5.9.2"
}
```

### 🎨 UI & Animations

```json
{
  "react-native-reanimated": "~4.1.0",
  "react-native-gesture-handler": "~2.28.0",
  "react-native-worklets": "0.5.1",
  "expo-blur": "~15.0.7",
  "expo-haptics": "~15.0.7",
  "@expo/vector-icons": "^15.0.2"
}
```

### 🛠️ Development Tools

```json
{
  "eslint": "^9.25.0",
  "eslint-config-expo": "~10.0.0",
  "@babel/core": "^7.25.2",
  "@types/react": "~19.1.10"
}
```

## 🏢 Información del Proyecto

- **Nombre**: Cineplanet Clone App
- **Versión**: 1.0.0
- **Autor**: Miguel Vargas ([@miguelvargasss](https://github.com/miguelvargasss))
- **Repositorio**: [cineplanet-clon](https://github.com/miguelvargasss/cineplanet-clon)
- **Licencia**: Proyecto educativo/demo
- **Fecha**: Septiembre 2025

## 🎓 Propósito Educativo

Este proyecto es una demostración de:

- **Desarrollo móvil moderno** con React Native/Expo
- **Arquitectura escalable** y mantenible
- **Mejores prácticas** en TypeScript
- **UI/UX** profesional para aplicaciones móviles
- **Navegación avanzada** con Expo Router
- **Sistema de temas** dinámico
- **Gestión de dependencias** y actualizaciones de SDK
- **Sistema de iconos profesional** con múltiples familias

## 📞 Soporte y Contribuciones

¿Encontraste un bug? ¿Tienes una sugerencia?

- 🐛 **Issues**: [GitHub Issues](https://github.com/miguelvargasss/cineplanet-clon/issues)
- 💡 **Discusiones**: [GitHub Discussions](https://github.com/miguelvargasss/cineplanet-clon/discussions)
- 📧 **Email**: miguel.vargas@email.com

---
