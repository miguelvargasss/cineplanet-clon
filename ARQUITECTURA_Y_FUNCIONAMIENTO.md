# 🎬 Cineplanet Clone - Arquitectura y Funcionamiento Completo

**Última actualización:** 19 de Octubre, 2025  
**Versión:** 1.0.0 (Post Refactorización)

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura General](#arquitectura-general)
4. [Flujo de la Aplicación](#flujo-de-la-aplicación)
5. [Módulos y Servicios](#módulos-y-servicios)
6. [Base de Datos Firebase](#base-de-datos-firebase)
7. [Autenticación y Usuarios](#autenticación-y-usuarios)
8. [Sistema de Películas](#sistema-de-películas)
9. [Sistema de Compra de Tickets](#sistema-de-compra-de-tickets)
10. [Componentes UI](#componentes-ui)
11. [Navegación](#navegación)
12. [Estado Global](#estado-global)

---

## 🎯 Resumen Ejecutivo

### ¿Qué es Cineplanet Clone?

Es una **aplicación móvil multiplataforma** (iOS, Android, Web) que replica la experiencia completa de Cineplanet. Permite a los usuarios:

✅ **Autenticarse** con DNI y contraseña  
✅ **Explorar películas** en cartelera, próximos estrenos y BTS Week  
✅ **Ver detalles** de películas (sinopsis, duración, reparto, tráiler)  
✅ **Consultar horarios** por cine y fecha  
✅ **Seleccionar asientos** de forma visual  
✅ **Agregar snacks** al pedido  
✅ **Completar compra** de tickets

### Estado Actual

- ✅ **Frontend:** 100% funcional
- ✅ **Backend:** Firebase Firestore + Authentication
- ✅ **Autenticación:** Sistema completo con DNI
- ⏳ **Pagos:** Mock (simulado, sin integración real)
- ⏳ **Notificaciones:** Pendiente
- ⏳ **Historial de compras:** Estructura creada, UI pendiente

---

## 🛠️ Stack Tecnológico

### Frontend

```json
{
  "Framework": "React Native 0.81.4",
  "Platform": "Expo SDK 54.0.13",
  "Language": "TypeScript 5.9.2",
  "Navigation": "Expo Router 6.0.12",
  "UI Library": "React Native (custom components)",
  "Animations": "React Native Reanimated 4.1.1",
  "State Management": "React Context API",
  "HTTP Client": "Firebase SDK"
}
```

### Backend

```json
{
  "Database": "Firebase Firestore",
  "Authentication": "Firebase Auth",
  "Storage": "Firebase Storage (futuro)",
  "Hosting": "Firebase Hosting (web)",
  "Functions": "Pendiente"
}
```

### Dependencias Principales

- **@expo/vector-icons** - Biblioteca de iconos
- **firebase 12.3.0** - SDK de Firebase
- **@react-native-async-storage** - Almacenamiento local
- **expo-router** - Sistema de navegación basado en archivos

---

## 🏗️ Arquitectura General

### Estructura Simplificada (Post Refactorización)

```
cineplanet/
├── app/                          # 📱 Pantallas de la aplicación
│   ├── (tabs)/                   # Pantallas con navegación por tabs
│   │   ├── index.tsx            # → Redirige a /login
│   │   └── _layout.tsx          # Layout de tabs
│   ├── (auth)/                   # 🔐 Pantallas de autenticación
│   │   ├── login.tsx            # Pantalla de inicio de sesión
│   │   ├── register.tsx         # Pantalla de registro
│   │   └── _layout.tsx          # Layout de auth
│   ├── _layout.tsx              # 🌐 Layout raíz (AuthProvider)
│   ├── movies.tsx               # 🎬 Listado de películas (principal)
│   ├── movie-details.tsx        # 📄 Detalles de película + Compra
│   ├── seat-selection.tsx       # 💺 Selección de asientos + Snacks
│   └── +not-found.tsx           # 404 Error
│
├── src/
│   ├── services/                 # 🔧 Lógica de negocio (SIMPLIFICADO)
│   │   ├── authService.ts       # Autenticación (Firebase Auth)
│   │   ├── moviesService.ts     # Películas (Firestore)
│   │   ├── ticketService.ts     # Tickets y horarios
│   │   ├── seatsService.ts      # Asientos (NUEVO)
│   │   └── snacksService.ts     # Dulcería
│   │
│   ├── components/               # 🎨 Componentes reutilizables
│   │   ├── ui/                  # Componentes base (ThemedText, Button, etc.)
│   │   ├── movies/              # Componentes de películas (MovieCard)
│   │   ├── cinema/              # Componentes de cine (filtros, horarios)
│   │   ├── forms/               # Componentes de formularios
│   │   └── ProtectedRoute.tsx   # HOC para rutas protegidas
│   │
│   ├── contexts/                 # 🌍 Estado global
│   │   └── AuthContext.tsx      # Contexto de autenticación
│   │
│   ├── hooks/                    # 🪝 Custom hooks
│   │   ├── useThemeColor.ts     # Hook para colores del tema
│   │   └── useColorScheme.ts    # Hook para dark/light mode
│   │
│   ├── types/                    # 📝 Definiciones TypeScript
│   │   └── index.ts             # Todos los tipos/interfaces
│   │
│   ├── data/                     # 📊 Datos estáticos
│   │   ├── cinemas.ts           # Lista de cines
│   │   └── geographical-data.json # Datos geográficos
│   │
│   ├── utils/                    # 🔨 Utilidades
│   │   └── index.ts             # Funciones helper
│   │
│   ├── config/                   # ⚙️ Configuración
│   │   └── firebase.ts          # Inicialización de Firebase
│   │
│   └── constants/                # 🎨 Constantes
│       └── Colors.ts            # Paleta de colores
│
├── assets/                       # 🖼️ Recursos estáticos
│   ├── fonts/                   # Fuentes
│   └── images/                  # Imágenes
│
└── scripts/                      # 🔧 Scripts auxiliares
    ├── addSampleMovies.ts       # Agregar películas de ejemplo
    ├── addSnackData.ts          # Poblar dulcería
    └── cleanDuplicateSnacks.ts  # Limpieza de datos
```

---

## 🔄 Flujo de la Aplicación

### 1. Inicio de la Aplicación

```
Usuario abre la app
    ↓
_layout.tsx (Root)
    ↓
AuthProvider se inicializa
    ↓
Firebase Auth State Listener
    ↓
¿Usuario autenticado?
    ├── SÍ → Mantener en /movies
    └── NO → Redirigir a /(auth)/login
```

### 2. Flujo de Autenticación

```
Login Screen
    ↓
Usuario ingresa DNI + Contraseña
    ↓
authService.loginWithDNI()
    ↓
    ├─→ Buscar email por DNI en Firestore
    │   (findEmailByDNI)
    ↓
    ├─→ Firebase Auth: signInWithEmailAndPassword
    ↓
    ├─→ Actualizar lastLogin en Firestore
    ↓
    ├─→ AuthContext detecta cambio
    ↓
    └─→ Redirigir a /movies
```

### 3. Flujo de Navegación Principal

```
/movies (Pantalla principal)
    ↓
    ├── Tab 1: En Cartelera
    ├── Tab 2: Próximos Estrenos
    └── Tab 3: BTS Week
    ↓
Click en película
    ↓
/movie-details?id={movieId}
    ↓
    ├── Tab: Detalle (Info de la película)
    └── Tab: Comprar
            ↓
        Filtrar: Ciudad / Cine / Fecha
            ↓
        Ver horarios disponibles
            ↓
        Click en horario
            ↓
    /seat-selection?movieId=X&cinemaId=Y&showtimeId=Z
            ↓
        Paso 1: Seleccionar asientos
            ↓
        Paso 2: Elegir tipo de entrada
            ↓
        Paso 3: Agregar snacks
            ↓
        Paso 4: Confirmar compra
            ↓
        Modal: Resumen de compra
            ↓
        Confirmar → ticketService.createTicketPurchase()
            ↓
        Éxito → Alert + Volver a /movies
```

---

## 🔧 Módulos y Servicios

### 1. authService.ts

**Responsabilidades:**

- ✅ Autenticación con Firebase Auth
- ✅ Búsqueda de usuarios por DNI
- ✅ Registro de nuevos usuarios
- ✅ Gestión de perfiles en Firestore
- ✅ Cierre de sesión

**Funciones principales:**

```typescript
loginWithDNI(dni: string, password: string)
  → Autentica usuario usando DNI en vez de email

findEmailByDNI(dni: string)
  → Busca el email asociado a un DNI en Firestore

registerUser(userData: UserRegistrationData)
  → Crea cuenta en Firebase Auth + Perfil en Firestore

getUserProfile(uid: string)
  → Obtiene perfil completo del usuario

logoutUser()
  → Cierra sesión de Firebase Auth
```

**Colecciones Firebase utilizadas:**

- `users` - Perfiles de usuarios

---

### 2. moviesService.ts (CONSOLIDADO)

**Responsabilidades:**

- ✅ Obtener películas por categoría
- ✅ Obtener detalles de película por ID
- ✅ Agregar películas a Firestore
- ✅ Auto-población de películas (ensureMoviesExist)
- ✅ Actualizar y eliminar películas

**Funciones principales:**

```typescript
getMoviesByCategory(category: 'nowPlaying' | 'comingSoon' | 'btsWeek')
  → Obtiene películas de una colección específica

getMovieById(movieId: string)
  → Obtiene detalles completos de una película

addMovieSimple(movieData, category)
  → Agrega película (verificando duplicados)

ensureMoviesExist()
  → Auto-agrega películas si hay menos de 2 en cartelera
```

**Colecciones Firebase utilizadas:**

- `movies` - Películas en cartelera (nowPlaying)
- `moviesEstreno` - Próximos estrenos (comingSoon)
- `moviesBts` - BTS Week (btsWeek)

**Estructura de datos:**

```typescript
interface Movie {
  id?: string;
  title: string;
  description: string;
  genre: string[];
  duration: number;
  releaseDate: Date;
  posterUrl: string;
  trailerUrl?: string;
  director: string;
  cast: string[];
  rating: string;
  language: string;
  subtitle?: string;
  isNowPlaying: boolean;
  isComingSoon: boolean;
  isBTSWeek?: boolean;
  schedules?: MovieSchedule[];
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 3. ticketService.ts

**Responsabilidades:**

- ✅ Gestión de horarios de funciones
- ✅ Mapeo de IDs de cines (Firebase ↔ App)
- ✅ Conversión de estructura de datos
- ✅ Creación de compras de tickets
- ✅ Consulta de tickets de usuario

**Funciones principales:**

```typescript
getMovieSchedules(movieId: string)
  → Obtiene horarios desde Firebase (o fallback hardcodeado)

getMovieScheduleForCinema(movieId: string, cinemaId: string)
  → Filtra horarios para un cine específico

createTicketPurchase(purchase: TicketPurchase)
  → Guarda compra en Firestore

getUserTicketPurchases(userId: string)
  → Obtiene historial de compras
```

**Colecciones Firebase utilizadas:**

- `ticketPurchases` - Compras de tickets

**Mapeo de IDs de cines:**

```typescript
Firebase ID           ↔  App ID
--------------------- → -------------------------
cineplanet-alcazar    → cp-alcazar
cineplanet-san-miguel → cp-san-miguel
cineplanet-brasil     → cp-brasil
```

---

### 4. seatsService.ts (NUEVO - Simplificado)

**Responsabilidades:**

- ✅ Generación de asientos para salas
- ✅ Obtención de estado de asientos
- ✅ Reserva y liberación de asientos

**Funciones principales:**

```typescript
getSeatsByCinemaAndShowtime(cinemaId: string, showtimeId: string)
  → Genera matriz de asientos (10 filas × 12 asientos)

reserveSeats(seatIds: string[], showtimeId: string)
  → Marca asientos como ocupados (futuro: Firebase)

releaseSeats(seatIds: string[], showtimeId: string)
  → Libera asientos reservados
```

**Estructura de asientos:**

```typescript
interface Seat {
  id: string; // "cp-alcazar-showtime123-A1"
  row: string; // "A", "B", "C", ... "J"
  number: number; // 1-12
  isOccupied: boolean; // Estado del asiento
  isWheelchair: boolean; // Asiento para discapacitados
  isSelected: boolean; // Seleccionado por el usuario
}
```

---

### 5. snacksService.ts

**Responsabilidades:**

- ✅ Obtener categorías de snacks
- ✅ Obtener combos por categoría
- ✅ Gestión de dulcería

**Funciones principales:**

```typescript
getSnackCategories()
  → Obtiene todas las categorías (Combos, Canchita, Bebidas, etc.)

getCombosByCategory(categoryId: string)
  → Obtiene productos de una categoría específica
```

**Colecciones Firebase utilizadas:**

- `snackCategories` - Categorías de dulcería
- `snackCombos` - Productos individuales

---

## 🔥 Base de Datos Firebase

### Estructura Firestore

```
cineplanet-21e8c (Proyecto)
│
├── users/                          # 👥 Usuarios
│   └── {userId}/
│       ├── email: string
│       ├── firstName: string
│       ├── lastName: string
│       ├── documentType: string
│       ├── documentNumber: string (ÍNDICE ÚNICO)
│       ├── phoneNumber: string
│       ├── birthDate: Timestamp
│       ├── gender: string
│       ├── department: string
│       ├── cineplanetNumber: string
│       ├── cinemaId: string
│       ├── acceptPromotions: boolean
│       ├── createdAt: Timestamp
│       └── lastLogin: Timestamp
│
├── movies/                         # 🎬 Películas en cartelera
│   └── {movieId}/
│       ├── title: string
│       ├── description: string
│       ├── genre: string[]
│       ├── duration: number
│       ├── releaseDate: Timestamp
│       ├── posterUrl: string
│       ├── trailerUrl: string
│       ├── director: string
│       ├── cast: string[]
│       ├── rating: string
│       ├── language: string
│       ├── subtitle: string
│       ├── isNowPlaying: true
│       ├── isComingSoon: false
│       ├── isBTSWeek: false
│       ├── schedules: [
│       │     {
│       │       cinemaId: "cineplanet-alcazar",
│       │       showtimes: ["14:00", "17:00", "20:00"]
│       │     }
│       │   ]
│       ├── createdAt: Timestamp
│       └── updatedAt: Timestamp
│
├── moviesEstreno/                  # 🔜 Próximos estrenos
│   └── {movieId}/
│       └── ... (misma estructura que movies)
│
├── moviesBts/                      # 🎭 BTS Week
│   └── {movieId}/
│       └── ... (misma estructura que movies)
│
├── ticketPurchases/                # 🎫 Compras de tickets
│   └── {purchaseId}/
│       ├── userId: string
│       ├── movieId: string
│       ├── movieTitle: string
│       ├── cinemaId: string
│       ├── cinemaName: string
│       ├── showtimeId: string
│       ├── showtime: string (hora)
│       ├── date: string
│       ├── seats: string[]
│       ├── ticketType: string
│       ├── snacks: [
│       │     {
│       │       id: string,
│       │       name: string,
│       │       quantity: number,
│       │       price: number
│       │     }
│       │   ]
│       ├── totalPrice: number
│       ├── purchaseDate: Timestamp
│       └── status: "pending" | "confirmed" | "cancelled"
│
├── snackCategories/                # 🍿 Categorías de dulcería
│   └── {categoryId}/
│       ├── name: string
│       ├── icon: string
│       └── order: number
│
└── snackCombos/                    # 🥤 Productos de dulcería
    └── {comboId}/
        ├── name: string
        ├── description: string
        ├── price: number
        ├── image: string
        ├── categoryId: string
        └── available: boolean
```

### Índices Importantes

```javascript
// Índice compuesto para búsqueda de usuarios
users - documentNumber(ASC) - email(ASC);

// Índice para películas por categoría
movies - isNowPlaying(ASC) - createdAt(DESC);

// Índice para tickets de usuario
ticketPurchases - userId(ASC) - purchaseDate(DESC);
```

---

## 🔐 Autenticación y Usuarios

### Sistema de Autenticación

#### 1. **Registro de Usuario**

**Flujo:**

```
1. Usuario completa formulario (register.tsx)
2. Validación de campos (utils/index.ts)
3. authService.registerUser()
   ├─→ Firebase Auth: createUserWithEmailAndPassword()
   ├─→ Firestore: Crear documento en 'users'
   ├─→ Firebase Auth: updateProfile() con displayName
   └─→ Redirigir a /movies
```

**Datos requeridos:**

- Email (único)
- Contraseña (min 6 caracteres)
- DNI (8 dígitos, único)
- Nombre y apellido
- Teléfono (9 dígitos)
- Fecha de nacimiento
- Género
- Departamento
- Aceptación de términos

#### 2. **Inicio de Sesión**

**Flujo:**

```
1. Usuario ingresa DNI + Contraseña (login.tsx)
2. authService.loginWithDNI()
   ├─→ findEmailByDNI() busca email en Firestore
   ├─→ Firebase Auth: signInWithEmailAndPassword()
   ├─→ Actualizar lastLogin en Firestore
   └─→ AuthContext se actualiza automáticamente
3. Redirigir a /movies
```

**Ventaja del sistema:**

- ✅ Usuario solo recuerda su **DNI + Contraseña**
- ✅ Email se usa internamente para Firebase Auth
- ✅ Experiencia similar a Cineplanet real

#### 3. **Estado de Autenticación**

El estado se maneja globalmente con **AuthContext**:

```typescript
interface AuthContextType {
  user: User | null; // Usuario de Firebase Auth
  userProfile: UserProfile | null; // Perfil completo de Firestore
  loading: boolean; // Estado de carga
  isAuthenticated: boolean; // true si hay usuario
}
```

**Uso en componentes:**

```typescript
const { user, userProfile, isAuthenticated } = useAuth();

if (!isAuthenticated) {
  return <Navigate to="/login" />;
}
```

---

## 🎬 Sistema de Películas

### Categorías de Películas

La aplicación maneja **3 categorías** separadas en Firestore:

| Categoría         | Colección Firebase | Tab en UI | Descripción                    |
| ----------------- | ------------------ | --------- | ------------------------------ |
| En Cartelera      | `movies`           | Tab 1     | Películas actualmente en cines |
| Próximos Estrenos | `moviesEstreno`    | Tab 2     | Películas próximas a estrenar  |
| BTS Week          | `moviesBts`        | Tab 3     | Películas especiales BTS       |

### Auto-población de Películas

**Función:** `ensureMoviesExist()`

```typescript
// Se ejecuta automáticamente al:
- Cargar pantalla /movies
- Hacer pull-to-refresh
- Cambiar de tab

// Verifica:
if (películas en "movies" < 2) {
  → Agregar películas por defecto
}

if (películas en "moviesEstreno" === 0) {
  → Agregar película de próximo estreno
}
```

**Películas por defecto:**

1. **Avatar: El Camino del Agua** (En Cartelera)
2. **Crónicas de Exorcismo** (En Cartelera)
3. **Chainsaw Man: Reze Arc** (Próximos Estrenos)

### Pantalla de Películas (movies.tsx)

**Características:**

- ✅ Tabs para cambiar categorías
- ✅ Pull-to-refresh para actualizar
- ✅ Header con perfil de usuario
- ✅ Grid de películas (MovieCard)
- ✅ Navegación a detalles

**Componentes:**

```tsx
<Header>
  <UserAvatar /> {/* Iniciales del usuario */}
  <LogoutButton />
</Header>

<Tabs>
  {tabs.map(tab => <Tab />)}
</Tabs>

<MovieList refreshControl={...}>
  {movies.map(movie => (
    <MovieCard
      movie={movie}
      onPress={() => router.push(`/movie-details?id=${movie.id}`)}
    />
  ))}
</MovieList>
```

### Pantalla de Detalles (movie-details.tsx)

**Tabs:**

#### Tab 1: Detalle

- Póster de la película
- Título, duración, clasificación
- Sinopsis completa
- Género(s)
- Director y reparto
- Botón "Ver tráiler" (WebBrowser)

#### Tab 2: Comprar

- **Filtros:**

  - Ciudad (Lima, Arequipa, etc.)
  - Cine (dropdown con cines de la ciudad)
  - Fecha (selector de calendario)

- **Horarios:**

  - Lista de horarios disponibles
  - Formato: 2D, 3D, IMAX
  - Idioma: SUB, DOB
  - Precio
  - Asientos disponibles

- **Click en horario** → `/seat-selection`

---

## 🎫 Sistema de Compra de Tickets

### Pantalla de Selección (seat-selection.tsx)

Es una pantalla **multi-paso** con 4 secciones:

#### **Paso 1: Información de la Compra**

```
📋 Resumen guardado en localStorage (React Native)
   ├─ Película
   ├─ Cine
   ├─ Horario
   └─ Fecha
```

#### **Paso 2: Selección de Asientos** 💺

**Características:**

- Matriz de 10 filas (A-J) × 12 columnas
- Vista de pantalla del cine
- Asientos disponibles (gris claro)
- Asientos ocupados (gris oscuro)
- Asientos seleccionados (azul)
- Asientos para discapacitados (fila A, extremos)
- Contador de asientos seleccionados
- Total dinámico

**Interacción:**

```typescript
onSeatPress(seat) {
  if (seat.isOccupied) return;

  toggleSeatSelection(seat);
  updateTotal();
}
```

#### **Paso 3: Tipo de Entrada** 🎟️

**Tipos disponibles:**

```typescript
const ticketTypes = [
  {
    name: "50% Promo Amex 2025",
    price: 12.0,
    description: "Válido con tarjeta American Express",
  },
  {
    name: "Clásica",
    price: 24.0,
    description: "Entrada estándar",
  },
  {
    name: "Prime",
    price: 34.0,
    description: "Experiencia premium",
  },
];
```

**Cálculo:**

```
Total = (precio_entrada × cantidad_asientos) + precio_snacks
```

#### **Paso 4: Dulcería** 🍿

**Características:**

- Tabs de categorías (Combos, Canchita, Bebidas, Dulces)
- Cards de productos con imagen
- Contador de cantidad (+/-)
- Suma automática al total

**Categorías:**

1. **Combos** - Combos completos
2. **Canchita** - Diferentes tamaños
3. **Bebidas** - Gaseosas, jugos
4. **Dulces** - Chocolates, caramelos
5. **Nachos** - Nachos con queso
6. **Hot Dogs** - Hot dogs

**Ejemplo de producto:**

```typescript
{
  id: "combo-1",
  name: "Combo Dúo",
  description: "2 Gaseosas + 1 Canchita Grande",
  price: 25.00,
  image: "https://...",
  categoryId: "combos"
}
```

### Confirmación y Compra

**Botón "Confirmar Compra":**

```typescript
onConfirmPurchase() {
  // Validar pasos completados
  if (!selectedSeats.length) {
    Alert("Debe seleccionar al menos un asiento");
    return;
  }

  if (!selectedTicketType) {
    Alert("Debe seleccionar un tipo de entrada");
    return;
  }

  // Crear objeto de compra
  const purchase = {
    userId: user.uid,
    movieId,
    movieTitle: movie.title,
    cinemaId,
    cinemaName,
    showtimeId,
    showtime,
    date,
    seats: selectedSeats.map(s => s.id),
    ticketType,
    snacks: selectedSnacks,
    totalPrice: calculateTotal(),
  };

  // Guardar en Firebase
  await ticketService.createTicketPurchase(purchase);

  // Mostrar modal de éxito
  showSuccessModal();

  // Volver a inicio
  router.replace('/movies');
}
```

---

## 🎨 Componentes UI

### Componentes Básicos (src/components/ui/)

#### **ThemedText**

```typescript
<ThemedText type="title">Título</ThemedText>
<ThemedText type="subtitle">Subtítulo</ThemedText>
<ThemedText type="default">Texto normal</ThemedText>
<ThemedText type="link">Enlace</ThemedText>
```

#### **ThemedButton**

```typescript
<ThemedButton
  title="Comprar"
  onPress={handlePress}
  variant="primary" | "secondary" | "outline"
  disabled={false}
  loading={false}
/>
```

#### **ThemedView**

```typescript
<ThemedView>{/* Contenido con fondo temático */}</ThemedView>
```

#### **Modal**

```typescript
<Modal
  visible={showModal}
  onClose={() => setShowModal(false)}
  title="Título del Modal"
>
  {/* Contenido */}
</Modal>
```

### Componentes de Películas (src/components/movies/)

#### **MovieCard**

```typescript
<MovieCard movie={movie} onPress={() => navigateToDetails(movie.id)} /> -
  // Muestra:
  Póster -
  Título -
  Duración -
  Clasificación -
  Géneros(badges);
```

### Componentes de Cine (src/components/cinema/)

#### **FilterBar**

```typescript
<FilterBar
  selectedCity={city}
  selectedCinema={cinema}
  selectedDate={date}
  onCityPress={() => setShowCityModal(true)}
  onCinemaPress={() => setShowCinemaModal(true)}
  onDatePress={() => setShowDateModal(true)}
/>
```

#### **CinemaSchedule**

```typescript
<CinemaSchedule
  cinemaName="CP Alcazar"
  schedules={movieSchedules}
  onSelectShowtime={(showtime) => navigateToSeats(showtime)}
/>
```

#### **Modales de Filtros**

- `CityFilterModal` - Selector de ciudad
- `CinemaFilterModal` - Selector de cine
- `DateFilterModal` - Selector de fecha

### Componentes de Formularios (src/components/forms/)

- `ThemedInput` - Input con tema
- `ThemedDropdown` - Selector desplegable
- `ThemedCheckbox` - Checkbox estilizado
- `DateSelector` - Selector de fecha
- `GenderSelector` - Selector de género
- `CineplanetSelector` - Selector de cine favorito

---

## 🧭 Navegación

### Estructura de Rutas (Expo Router)

```
app/
├── _layout.tsx                 # Root layout (AuthProvider)
├── (tabs)/
│   ├── _layout.tsx            # Tab layout (no usado actualmente)
│   └── index.tsx              # Redirect → /(auth)/login
│
├── (auth)/
│   ├── _layout.tsx            # Auth layout
│   ├── login.tsx              # /login
│   └── register.tsx           # /register
│
├── movies.tsx                  # /movies (principal)
├── movie-details.tsx           # /movie-details?id=X
├── seat-selection.tsx          # /seat-selection?movieId=X&cinemaId=Y&showtimeId=Z
└── +not-found.tsx             # 404
```

### Navegación Programática

```typescript
import { router } from "expo-router";

// Navegar a una ruta
router.push("/movies");

// Navegar con parámetros
router.push({
  pathname: "/movie-details",
  params: { id: movieId },
});

// Navegar y limpiar historial
router.replace("/movies");

// Volver atrás
router.back();
```

### Protección de Rutas

```typescript
// En cualquier pantalla protegida
export default function ProtectedScreen() {
  return (
    <ProtectedRoute>
      {/* Contenido solo para usuarios autenticados */}
    </ProtectedRoute>
  );
}

// ProtectedRoute redirige a /login si no hay usuario
```

---

## 🌍 Estado Global

### AuthContext

**Ubicación:** `src/contexts/AuthContext.tsx`

**Provider:**

```typescript
<AuthProvider>
  <App />
</AuthProvider>
```

**Consumo:**

```typescript
const { user, userProfile, loading, isAuthenticated } = useAuth();

// user: Usuario de Firebase Auth
// userProfile: Perfil completo de Firestore
// loading: true mientras carga
// isAuthenticated: true si está logueado
```

**Eventos que actualizan el contexto:**

- Login exitoso
- Registro exitoso
- Logout
- Cambio en Firebase Auth (onAuthStateChanged)

---

## 📊 Datos de Prueba

### Usuarios de Prueba

Puedes crear tu propio usuario o usar:

```
DNI: 12345678
Email: test@cineplanet.com
Password: Test123456
```

### Películas de Ejemplo

Se auto-crean al iniciar la app:

1. **Avatar: El Camino del Agua**

   - Categoría: En Cartelera
   - Horarios: 19:30, 21:45, 22:10

2. **Crónicas de Exorcismo: El Comienzo**

   - Categoría: En Cartelera
   - Horarios: 17:20, 20:30

3. **Chainsaw Man: Reze Arc**
   - Categoría: Próximos Estrenos
   - Horarios: 16:00, 19:00, 22:00

### Cines Disponibles

```
Lima:
- CP Alcazar (cp-alcazar)
- CP Brasil (cp-brasil)
- CP Centro Cívico (cp-centro-civico)
- CP San Miguel (cp-san-miguel)
- CP La Rambla (cp-la-rambla)
- CP Megaplaza (cp-megaplaza)

Arequipa:
- CP Arequipa Mall Plaza
- CP Arequipa Real Plaza
```

---

## ⚙️ Configuración

### Firebase Config

**Archivo:** `src/config/firebase.ts`

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyBnlF70cqIZgilnKfX3bE-spCRGzqg9eSE",
  authDomain: "cineplanet-21e8c.firebaseapp.com",
  projectId: "cineplanet-21e8c",
  storageBucket: "cineplanet-21e8c.firebasestorage.app",
  messagingSenderId: "967927294358",
  appId: "1:967927294358:web:c928e7e88d3bc44de955b7",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### Colores del Tema

**Archivo:** `src/constants/Colors.ts`

```typescript
export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: "#0a7ea4",
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: "#0a7ea4",
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: "#fff",
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#fff",
  },
};
```

---

## 🚀 Próximas Mejoras

### Funcionalidades Pendientes

1. **Historial de Compras**

   - [ ] Pantalla de tickets pasados
   - [ ] Códigos QR para validación
   - [ ] Descarga de tickets en PDF

2. **Notificaciones Push**

   - [ ] Recordatorio de función
   - [ ] Nuevos estrenos
   - [ ] Promociones

3. **Pagos Reales**

   - [ ] Integración con pasarela de pagos
   - [ ] Múltiples métodos de pago
   - [ ] Wallet de Cineplanet

4. **Mejoras de UX**

   - [ ] Animaciones más fluidas
   - [ ] Skeleton loaders
   - [ ] Caché de imágenes

5. **Funcionalidades Sociales**
   - [ ] Compartir películas
   - [ ] Reseñas y calificaciones
   - [ ] Listas de favoritos

---

## 📝 Notas del Desarrollador

### Decisiones de Arquitectura

1. **¿Por qué eliminar Clean Architecture?**

   - La app es pequeña/mediana
   - Over-engineering innecesario
   - Servicios directos son más simples y mantenibles
   - Reducción de 60% de código

2. **¿Por qué usar Expo Router?**

   - Navegación basada en archivos (como Next.js)
   - Menos código de configuración
   - Deep linking automático
   - SEO para web

3. **¿Por qué Firebase?**

   - Backend as a Service (BaaS)
   - No requiere servidor
   - Auth + DB + Storage integrados
   - Escalable y gratis hasta cierto punto

4. **¿Por qué TypeScript?**
   - Type safety
   - Mejor experiencia de desarrollo (autocomplete)
   - Menos bugs en producción
   - Documentación implícita

### Convenciones de Código

- **Nombres de archivos:** camelCase.tsx
- **Componentes:** PascalCase
- **Funciones:** camelCase
- **Constantes:** UPPER_CASE
- **Interfaces:** PascalCase con prefijo I (opcional)

---

## 🎓 Conclusión

**Cineplanet Clone** es una aplicación **completa y funcional** que demuestra:

✅ **Arquitectura moderna** - Expo + TypeScript + Firebase  
✅ **UX pulida** - Navegación fluida, componentes reutilizables  
✅ **Backend real** - Firestore + Firebase Auth  
✅ **Código limpio** - Refactorizado y optimizado  
✅ **Escalable** - Fácil de extender con nuevas funcionalidades

**Próximo paso:** Implementar pagos reales y desplegar en App Store / Play Store 🚀

---

**Desarrollado con ❤️ por Miguel Vargas**  
Octubre 2025
