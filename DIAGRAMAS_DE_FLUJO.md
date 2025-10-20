# 📊 Diagramas de Flujo - Cineplanet Clone

## 🔄 Flujo General de la Aplicación

```
┌─────────────────────────────────────────────────────────────────┐
│                     INICIO DE APLICACIÓN                         │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   _layout.tsx   │
                    │  (Root Layout)  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  AuthProvider   │
                    │  Inicializado   │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
        ┌──────────────┐         ┌──────────────┐
        │   Usuario    │         │   Usuario    │
        │  Autenticado │         │ NO Autent.   │
        └──────┬───────┘         └──────┬───────┘
               │                        │
               ▼                        ▼
        ┌──────────────┐         ┌──────────────┐
        │   /movies    │         │   /login     │
        │  (Principal) │         │              │
        └──────────────┘         └──────────────┘
```

---

## 🔐 Flujo de Autenticación

### Registro de Usuario

```
┌───────────────┐
│  /register    │
│   Screen      │
└───────┬───────┘
        │
        │ Usuario completa formulario
        ▼
┌──────────────────────────────┐
│  Validación de Campos        │
│  ✓ Email válido              │
│  ✓ DNI 8 dígitos             │
│  ✓ Password min 6 chars      │
│  ✓ Términos aceptados        │
└────────┬─────────────────────┘
         │
         │ Campos válidos
         ▼
┌───────────────────────────────┐
│  authService.registerUser()   │
└────────┬──────────────────────┘
         │
         ├─→ 1. Firebase Auth:
         │    createUserWithEmailAndPassword()
         │
         ├─→ 2. Firestore:
         │    Crear doc en 'users' con:
         │    - email, DNI, nombre, etc.
         │    - cineplanetNumber (generado)
         │    - createdAt, lastLogin
         │
         ├─→ 3. Firebase Auth:
         │    updateProfile(displayName)
         │
         └─→ 4. AuthContext actualizado
                     │
                     ▼
            ┌─────────────────┐
            │  Redirect →     │
            │    /movies      │
            └─────────────────┘
```

### Inicio de Sesión

```
┌───────────────┐
│   /login      │
│   Screen      │
└───────┬───────┘
        │
        │ Usuario ingresa DNI + Password
        ▼
┌──────────────────────────────┐
│  authService.loginWithDNI()  │
└────────┬─────────────────────┘
         │
         ├─→ PASO 1: Buscar Email
         │   ┌────────────────────────┐
         │   │ findEmailByDNI(dni)    │
         │   │                        │
         │   │ Firestore Query:       │
         │   │ users                  │
         │   │ .where('documentNumber'│
         │   │        '==', dni)      │
         │   └───────┬────────────────┘
         │           │
         │           ├─→ Encontrado → email
         │           └─→ No encontrado → Error
         │
         ├─→ PASO 2: Autenticar
         │   ┌────────────────────────────┐
         │   │ Firebase Auth:             │
         │   │ signInWithEmailAndPassword │
         │   │   (email, password)        │
         │   └───────┬────────────────────┘
         │           │
         │           ├─→ Exitoso → user
         │           └─→ Error → Credenciales inválidas
         │
         ├─→ PASO 3: Actualizar Firestore
         │   ┌────────────────────────┐
         │   │ updateDoc(users/{uid}) │
         │   │ lastLogin: now()       │
         │   └────────────────────────┘
         │
         └─→ PASO 4: AuthContext actualizado
                     │
                     ▼
            ┌─────────────────┐
            │  Redirect →     │
            │    /movies      │
            └─────────────────┘
```

---

## 🎬 Flujo de Navegación de Películas

```
┌──────────────────────────────────────────────────────┐
│                    /movies Screen                    │
│                                                      │
│  ┌────────┬────────────────┬─────────────┐         │
│  │ Tab 1  │     Tab 2      │   Tab 3     │         │
│  │En Cart.│Próx. Estrenos  │  BTS Week   │         │
│  └────────┴────────────────┴─────────────┘         │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  Grid de Películas (MovieCard)               │  │
│  │                                               │  │
│  │  ┌────────┐  ┌────────┐  ┌────────┐         │  │
│  │  │ Movie1 │  │ Movie2 │  │ Movie3 │         │  │
│  │  └────────┘  └────────┘  └────────┘         │  │
│  └──────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────┘
                       │
                       │ Click en película
                       ▼
         ┌──────────────────────────────┐
         │    /movie-details?id=X       │
         │                              │
         │  ┌─────────┬──────────┐     │
         │  │ Detalle │ Comprar  │     │
         │  └─────────┴──────────┘     │
         │                              │
         │  Tab "Detalle":              │
         │  - Póster                    │
         │  - Sinopsis                  │
         │  - Director, Reparto         │
         │  - Tráiler                   │
         │                              │
         │  Tab "Comprar":              │
         │  ┌────────────────────┐     │
         │  │ Filtros:           │     │
         │  │ • Ciudad: Lima     │     │
         │  │ • Cine: CP Alcazar │     │
         │  │ • Fecha: Hoy       │     │
         │  └────────────────────┘     │
         │                              │
         │  Horarios disponibles:       │
         │  ┌──────────────────┐       │
         │  │ 14:00 | 2D | SUB │       │
         │  │ S/ 12.00         │       │
         │  └──────────────────┘       │
         │  ┌──────────────────┐       │
         │  │ 17:00 | 3D | DOB │       │
         │  │ S/ 18.00         │       │
         │  └──────────────────┘       │
         └──────────┬───────────────────┘
                    │
                    │ Click en horario
                    ▼
    ┌────────────────────────────────────────────┐
    │ /seat-selection?movieId=X&cinemaId=Y       │
    │                &showtimeId=Z               │
    └────────────────────────────────────────────┘
```

---

## 💺 Flujo de Compra de Tickets

```
┌──────────────────────────────────────────────────────────────┐
│              PANTALLA: /seat-selection                       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  PASO 1: Información de la Compra                            │
│                                                              │
│  📋 Resumen:                                                 │
│     Película: Avatar                                         │
│     Cine: CP Alcazar                                        │
│     Horario: 14:00 (2D - SUB)                               │
│     Fecha: 19 Oct 2025                                      │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  PASO 2: Selección de Asientos                              │
│                                                              │
│           [=== PANTALLA ===]                                 │
│                                                              │
│  A  ⊙ ⊙ ○ ○ ○ ○ ○ ○ ○ ○ ○ ⊙   ⊙ = Discapacitados          │
│  B  ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○   ○ = Disponible              │
│  C  ○ ○ ● ○ ○ ○ ○ ○ ● ○ ○ ○   ● = Ocupado                 │
│  D  ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○   ◉ = Seleccionado            │
│  E  ○ ○ ○ ◉ ◉ ○ ○ ○ ○ ○ ○ ○                                │
│  F  ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○                                │
│  G  ● ● ○ ○ ○ ○ ○ ○ ○ ○ ○ ○                                │
│  H  ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ● ●                                │
│  I  ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○                                │
│  J  ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○                                │
│                                                              │
│  Asientos seleccionados: E4, E5                             │
│  Total: S/ 24.00                                            │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  PASO 3: Tipo de Entrada                                    │
│                                                              │
│  ┌────────────────────────────────────────┐                │
│  │ ○ 50% Promo Amex 2025    S/ 12.00     │                │
│  │   Válido con tarjeta American Express │                │
│  └────────────────────────────────────────┘                │
│                                                              │
│  ┌────────────────────────────────────────┐                │
│  │ ● Clásica                S/ 24.00     │ ← Seleccionado │
│  │   Entrada estándar                    │                │
│  └────────────────────────────────────────┘                │
│                                                              │
│  ┌────────────────────────────────────────┐                │
│  │ ○ Prime                  S/ 34.00     │                │
│  │   Experiencia premium                 │                │
│  └────────────────────────────────────────┘                │
│                                                              │
│  Total: S/ 48.00 (24 × 2 asientos)                         │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  PASO 4: Dulcería                                           │
│                                                              │
│  Categorías: [Combos] [Canchita] [Bebidas] [Dulces] ...    │
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │ 🍿 Combo Dúo         │  │ 🥤 Combo Triple      │        │
│  │ S/ 25.00             │  │ S/ 35.00             │        │
│  │ [-]  1  [+]          │  │ [-]  0  [+]          │        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                              │
│  Total Snacks: S/ 25.00                                     │
│  Total General: S/ 73.00                                    │
└──────────────────────────────────────────────────────────────┘
                              │
                              │ Click "Confirmar Compra"
                              ▼
┌──────────────────────────────────────────────────────────────┐
│              MODAL: Resumen de Compra                        │
│                                                              │
│  📋 Detalle:                                                 │
│     Película: Avatar                                         │
│     Cine: CP Alcazar                                        │
│     Horario: 14:00                                          │
│     Asientos: E4, E5                                        │
│     Entrada: Clásica × 2 = S/ 48.00                         │
│     Snacks: Combo Dúo × 1 = S/ 25.00                        │
│                                                              │
│  💰 TOTAL: S/ 73.00                                          │
│                                                              │
│  [Cancelar]          [Confirmar]                            │
└──────────────────────────────────────────────────────────────┘
                              │
                              │ Click "Confirmar"
                              ▼
                  ┌───────────────────────┐
                  │ ticketService.        │
                  │ createTicketPurchase()│
                  └───────────┬───────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
          ┌──────────────┐    ┌──────────────┐
          │   Firestore  │    │   Alert      │
          │   Save to    │    │   ¡Compra    │
          │   'ticket    │    │   exitosa!   │
          │   Purchases' │    └──────────────┘
          └──────────────┘             │
                                       │
                                       ▼
                              ┌─────────────────┐
                              │  Redirect →     │
                              │    /movies      │
                              └─────────────────┘
```

---

## 🔥 Flujo de Datos con Firebase

```
┌─────────────────────────────────────────────────────────────┐
│                    APLICACIÓN CLIENTE                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Servicios
                      │
        ┌─────────────┼─────────────┬─────────────┐
        │             │             │             │
        ▼             ▼             ▼             ▼
┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│authService   │ │ movies   │ │ tickets  │ │ snacks   │
│              │ │ Service  │ │ Service  │ │ Service  │
└──────┬───────┘ └─────┬────┘ └─────┬────┘ └─────┬────┘
       │               │            │            │
       │               │            │            │
       └───────────────┴────────────┴────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │      Firebase SDK            │
        │  - Auth                      │
        │  - Firestore                 │
        │  - Storage (futuro)          │
        └──────────────┬───────────────┘
                       │
                       │ Internet
                       │
                       ▼
        ┌──────────────────────────────┐
        │      FIREBASE BACKEND        │
        │                              │
        │  ┌────────────────────────┐ │
        │  │  Authentication        │ │
        │  │  - Usuarios            │ │
        │  │  - Sessions            │ │
        │  └────────────────────────┘ │
        │                              │
        │  ┌────────────────────────┐ │
        │  │  Firestore Database    │ │
        │  │                        │ │
        │  │  Collections:          │ │
        │  │  ├─ users              │ │
        │  │  ├─ movies             │ │
        │  │  ├─ moviesEstreno      │ │
        │  │  ├─ moviesBts          │ │
        │  │  ├─ ticketPurchases    │ │
        │  │  ├─ snackCategories    │ │
        │  │  └─ snackCombos        │ │
        │  └────────────────────────┘ │
        │                              │
        └──────────────────────────────┘

LECTURA (Ejemplo: Obtener películas)
────────────────────────────────────
1. Component → getMoviesByCategory('nowPlaying')
2. moviesService → collection(db, 'movies')
3. Firebase SDK → HTTP Request
4. Firebase Backend → Query database
5. Firebase Backend → Return data
6. Firebase SDK → Parse response
7. moviesService → Transform data
8. Component → Update state → Render

ESCRITURA (Ejemplo: Crear ticket)
──────────────────────────────────
1. Component → createTicketPurchase(data)
2. ticketService → addDoc(collection(db, 'ticketPurchases'), data)
3. Firebase SDK → HTTP POST
4. Firebase Backend → Validate & Save
5. Firebase Backend → Return document ID
6. Firebase SDK → Parse response
7. ticketService → Return success
8. Component → Show confirmation
```

---

## 🔄 Ciclo de Vida de AuthContext

```
                    App Inicia
                         │
                         ▼
              ┌──────────────────┐
              │  AuthProvider    │
              │  se monta        │
              └─────────┬────────┘
                        │
                        ▼
              ┌──────────────────────┐
              │  useEffect Hook      │
              │  registra listener:  │
              │  onAuthStateChanged  │
              └──────────┬───────────┘
                         │
         ┌───────────────┴────────────────┐
         │                                │
         ▼                                ▼
  ┌─────────────┐              ┌──────────────────┐
  │ Usuario     │              │ Usuario          │
  │ Autenticado │              │ NO Autenticado   │
  └──────┬──────┘              └────────┬─────────┘
         │                              │
         │                              ▼
         │                     ┌─────────────────┐
         │                     │ setUser(null)   │
         │                     │ setProfile(null)│
         │                     │ loading = false │
         │                     └─────────────────┘
         │
         ▼
  ┌──────────────────────┐
  │ setUser(firebaseUser)│
  └──────────┬───────────┘
             │
             ▼
  ┌──────────────────────────┐
  │ getUserProfile(user.uid) │
  └──────────┬───────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌─────────┐      ┌─────────┐
│ Perfil  │      │ Perfil  │
│ Existe  │      │ NO Existe│
└────┬────┘      └────┬────┘
     │                │
     │                ▼
     │          ┌──────────────┐
     │          │setProfile(   │
     │          │    null)     │
     │          └──────────────┘
     │
     ▼
┌───────────────┐
│setProfile(    │
│   data)       │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ loading=false │
└───────┬───────┘
        │
        ▼
┌───────────────────────────┐
│  Context Actualizado      │
│                           │
│  Todos los componentes    │
│  que usan useAuth()       │
│  se re-renderizan         │
└───────────────────────────┘


EVENTOS QUE DISPARAN CAMBIOS:
──────────────────────────────
1. Login exitoso
   → onAuthStateChanged detecta usuario
   → Actualiza context

2. Logout
   → onAuthStateChanged detecta null
   → Limpia context

3. Refresh de app
   → onAuthStateChanged verifica sesión
   → Restaura context si hay sesión activa

4. Token expira
   → Firebase maneja refresh automático
   → onAuthStateChanged se mantiene
```

---

## 📱 Diagrama de Componentes UI

```
┌─────────────────────────────────────────────────────────┐
│                    APP COMPONENT TREE                    │
└─────────────────────────────────────────────────────────┘

RootLayout (_layout.tsx)
│
├─→ AuthProvider (Context)
│   │
│   └─→ Stack Navigator
│       │
│       ├─→ (tabs) Group
│       │   └─→ index.tsx → Redirect /login
│       │
│       ├─→ (auth) Group
│       │   ├─→ login.tsx
│       │   │   ├─→ ThemedInput (DNI)
│       │   │   ├─→ ThemedInput (Password)
│       │   │   ├─→ ThemedButton (Ingresar)
│       │   │   └─→ ThemedText (Links)
│       │   │
│       │   └─→ register.tsx
│       │       ├─→ ThemedInput × 8 (campos)
│       │       ├─→ ThemedDropdown × 3
│       │       ├─→ DateSelector
│       │       ├─→ GenderSelector
│       │       ├─→ CineplanetSelector
│       │       ├─→ ThemedCheckbox × 2
│       │       └─→ ThemedButton
│       │
│       ├─→ movies.tsx
│       │   ├─→ ProtectedRoute (HOC)
│       │   ├─→ Header
│       │   │   ├─→ ThemedText (Logo)
│       │   │   ├─→ UserAvatar
│       │   │   └─→ LogoutButton
│       │   ├─→ Tabs (Custom)
│       │   └─→ ScrollView (RefreshControl)
│       │       └─→ MovieCard[] (Grid)
│       │           ├─→ Image (Póster)
│       │           ├─→ ThemedText (Título)
│       │           ├─→ ThemedText (Duración)
│       │           └─→ Genre Badges
│       │
│       ├─→ movie-details.tsx
│       │   ├─→ ProtectedRoute
│       │   ├─→ Header (Back button)
│       │   ├─→ Tabs (Detalle / Comprar)
│       │   ├─→ Tab: Detalle
│       │   │   ├─→ Image (Póster grande)
│       │   │   ├─→ ThemedText (Info)
│       │   │   └─→ ThemedButton (Ver tráiler)
│       │   │
│       │   └─→ Tab: Comprar
│       │       ├─→ FilterBar
│       │       │   ├─→ CityFilterModal
│       │       │   ├─→ CinemaFilterModal
│       │       │   └─→ DateFilterModal
│       │       │
│       │       └─→ CinemaSchedule
│       │           └─→ ShowtimeCard[]
│       │               └─→ TouchableOpacity → /seat-selection
│       │
│       └─→ seat-selection.tsx
│           ├─→ ProtectedRoute
│           ├─→ Header (Back + Progress)
│           ├─→ ScrollView
│           │   │
│           │   ├─→ Section 1: Info
│           │   │   └─→ ThemedText (Resumen)
│           │   │
│           │   ├─→ Section 2: Asientos
│           │   │   ├─→ Screen Visual
│           │   │   ├─→ SeatGrid (10×12)
│           │   │   │   └─→ TouchableOpacity[]
│           │   │   │       └─→ Seat Icon
│           │   │   └─→ Legend
│           │   │
│           │   ├─→ Section 3: Tipo Entrada
│           │   │   └─→ TicketTypeCard[]
│           │   │       └─→ RadioButton
│           │   │
│           │   └─→ Section 4: Snacks
│           │       ├─→ Category Tabs
│           │       └─→ SnackCard[]
│           │           ├─→ Image
│           │           ├─→ Name + Price
│           │           └─→ Quantity Selector
│           │
│           ├─→ Total Bar (Fixed bottom)
│           │   ├─→ Total Amount
│           │   └─→ ThemedButton (Confirmar)
│           │
│           └─→ Modal: Confirmation
│               ├─→ Purchase Summary
│               └─→ Confirm Button
│
└─→ +not-found.tsx
    └─→ 404 Error Screen
```

---

**Fin de Diagramas de Flujo**

Este documento complementa `ARQUITECTURA_Y_FUNCIONAMIENTO.md` con representaciones visuales de los flujos principales de la aplicación.
