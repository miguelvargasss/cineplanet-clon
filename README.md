# Cineplanet Clone App 🎬

Este es un clon de la aplicación móvil de Cineplanet desarrollado con [Expo](https://expo.dev) y React Native.

## 🚀 Inicio Rápido

1. Instalar dependencias

   ```bash
   npm install
   ```

2. Iniciar la aplicación

   ```bash
   npx expo start
   ```

En la salida, encontrarás opciones para abrir la app en:

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go)

## 📁 Estructura del Proyecto

```
📁 app/                          # 🎯 PANTALLAS Y NAVEGACIÓN
  ├── _layout.tsx               # Layout principal de la aplicación
  ├── +not-found.tsx            # Página 404
  ├── movies.tsx                # Pantalla principal de películas
  ├── (tabs)/                   # Grupo de navegación por tabs
  │   ├── _layout.tsx           # Layout de tabs (actualmente redirige)
  │   ├── index.tsx             # Redirige a login
  │   └── explore.tsx           # Pantalla de exploración (demo)
  └── (auth)/                   # 🔐 GRUPO DE AUTENTICACIÓN
      ├── _layout.tsx           # Layout para pantallas de auth
      ├── login.tsx             # Pantalla de inicio de sesión
      └── register.tsx          # Pantalla de registro

📁 components/                   # 🧩 COMPONENTES DE NEGOCIO
  ├── ThemedInput.tsx           # Input personalizado con tema
  ├── ThemedButton.tsx          # Botón personalizado con tema
  ├── ThemedText.tsx            # Texto con soporte de temas
  ├── ThemedView.tsx            # Vista con soporte de temas
  ├── ThemedDropdown.tsx        # Dropdown personalizado
  ├── ThemedCheckbox.tsx        # Checkbox personalizado
  ├── GenderSelector.tsx        # Selector de género
  ├── DateSelector.tsx          # Selector de fecha
  ├── CineplanetSelector.tsx    # Selector de cines Cineplanet
  └── ui/                       # 🎨 COMPONENTES UI BÁSICOS
      ├── IconSymbol.tsx        # Sistema de iconos multiplataforma
      └── Modal.tsx             # Modal básico reutilizable

📁 constants/                    # ⚙️ CONSTANTES
  └── Colors.ts                 # Colores del tema Cineplanet

📁 hooks/                        # 🪝 HOOKS PERSONALIZADOS
  ├── useColorScheme.ts         # Hook para esquema de colores
  └── useThemeColor.ts          # Hook para colores del tema

📁 assets/                       # 🎨 RECURSOS
  ├── images/                   # Imágenes y logos
  └── fonts/                    # Fuentes personalizadas
```

## 🎨 Tecnologías Utilizadas

- **React Native** - Framework para desarrollo móvil
- **Expo** - Plataforma de desarrollo
- **TypeScript** - Tipado estático
- **Expo Router** - Navegación basada en archivos

## 🎯 Funcionalidades Implementadas

### ✅ Completadas:

- Sistema de autenticación (Login/Registro)
- Navegación entre pantallas
- Diseño responsivo con SafeAreaView
- Soporte de temas claro/oscuro
- Componentes reutilizables modulares
- Interfaz de películas básica
- Estructura escalable de carpetas

### 🔄 En Desarrollo:

- Catálogo de películas con datos dinámicos
- Sistema de reservas
- Integración con APIs
- Funcionalidades de backend

## 🎨 Esquema de Colores

La aplicación utiliza los colores oficiales de Cineplanet:

- **Azul Principal**: `#1976D2`
- **Rosa/Rojo Secundario**: `#E91E63`
- **Soporte completo** para modo claro y oscuro

## 🧭 Flujo de Navegación

1. **Inicio** → Redirige automáticamente a Login
2. **Login** → Validación → Películas
3. **Registro** → Formulario completo → Películas
4. **Películas** → Navegación principal de la app

## 📱 Pantallas Principales

### Login (`app/(auth)/login.tsx`)

- Formulario de inicio de sesión
- Validación de campos
- Enlaces a registro y recuperación

### Registro (`app/(auth)/register.tsx`)

- Formulario completo de registro
- Datos personales y ubicación
- Términos y condiciones
- Selección de Cineplanet favorito

### Películas (`app/movies.tsx`)

- Header con navegación
- Tabs: En Cartelera, Próximos Estrenos, BTS Week
- Filtros por ubicación y fecha
- Grid de películas
- Navegación inferior

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run start          # Iniciar servidor de desarrollo
npm run android        # Abrir en Android
npm run ios           # Abrir en iOS
npm run web           # Abrir en navegador web

# Código
npm run lint          # Verificar código con ESLint
npm run reset-project # Reiniciar proyecto limpio
```

## 📄 Licencia

Este es un proyecto educativo/demo. Cineplanet es una marca registrada de sus respectivos propietarios.

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
