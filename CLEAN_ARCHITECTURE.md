# Arquitectura del Proyecto Cineplanet - Clean Architecture & SOLID

## 📁 Estructura de Directorios

```
src/
├── domain/                 # Capa de Dominio (Business Logic)
│   ├── entities/          # Entidades del negocio
│   └── repositories/      # Interfaces de repositorios
├── application/           # Capa de Aplicación (Use Cases)
│   └── usecases/         # Casos de uso del negocio
├── infrastructure/       # Capa de Infraestructura (Data Access)
│   └── repositories/     # Implementaciones de repositorios
├── config/               # Configuración y DI
├── services/             # Servicios legacy y adaptadores
├── components/           # Componentes reutilizables de UI
├── contexts/             # Contextos de React
├── types/                # Tipos TypeScript
└── utils/                # Utilidades generales
```

## 🏗️ Principios SOLID Implementados

### 1. **Single Responsibility Principle (SRP)**

- Cada clase tiene una única responsabilidad
- `GetMovieByIdUseCase`: Solo obtiene una película por ID
- `FirebaseMovieRepository`: Solo maneja el acceso a datos de películas
- `Movie` entity: Solo define la estructura de una película

### 2. **Open/Closed Principle (OCP)**

- Las entidades están abiertas para extensión, cerradas para modificación
- Se pueden agregar nuevos repositorios sin modificar los existentes
- Nuevos casos de uso se pueden agregar fácilmente

### 3. **Liskov Substitution Principle (LSP)**

- Las implementaciones de repositorios son intercambiables
- `FirebaseMovieRepository` puede ser reemplazado por `PostgreSQLMovieRepository`

### 4. **Interface Segregation Principle (ISP)**

- Interfaces específicas y pequeñas
- `IMovieRepository`, `ISeatRepository`, `ITicketRepository` son independientes

### 5. **Dependency Inversion Principle (DIP)**

- Las capas superiores no dependen de las inferiores
- Los casos de uso dependen de abstracciones (interfaces), no de implementaciones

## 🔄 Flujo de Datos

```
UI Component → Use Case → Repository Interface → Repository Implementation → Database
     ↑                                                                            ↓
     ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
```

## 📦 Capa de Dominio

### Entidades (`src/domain/entities/`)

- `Movie`: Representa una película del sistema
- `Cinema`: Representa un cine
- `Seat`: Representa un asiento
- `Showtime`: Representa una función de película
- `TicketPurchase`: Representa una compra de entradas
- `User`: Representa un usuario del sistema

### Repositorios (`src/domain/repositories/`)

Interfaces que definen contratos para el acceso a datos:

- `IMovieRepository`
- `ICinemaRepository`
- `ISeatRepository`
- `IShowtimeRepository`
- `ITicketRepository`
- `IUserRepository`

## 🎯 Capa de Aplicación

### Casos de Uso (`src/application/usecases/`)

Implementan la lógica de negocio específica:

#### Películas

- `GetMoviesUseCase`: Obtener todas las películas o por categoría
- `GetMovieByIdUseCase`: Obtener una película específica

#### Asientos

- `GetSeatsByCinemaAndShowtimeUseCase`: Obtener asientos de una función
- `ReserveSeatsUseCase`: Reservar asientos
- `ReleaseSeatsUseCase`: Liberar asientos

#### Tickets

- `CreateTicketPurchaseUseCase`: Crear una compra de entradas
- `GetUserTicketsUseCase`: Obtener tickets de un usuario
- `CancelTicketUseCase`: Cancelar un ticket

## 🔧 Capa de Infraestructura

### Repositorios (`src/infrastructure/repositories/`)

Implementaciones concretas de los repositorios:

- `FirebaseMovieRepository`: Implementación con Firebase Firestore
- `FirebaseSeatRepository`: Implementación con Firebase Firestore

## ⚙️ Inyección de Dependencias

### Container (`src/config/dependencies.ts`)

Configura y provee las instancias de:

- Repositorios
- Casos de uso
- Dependencias entre componentes

```typescript
// Ejemplo de uso
import { getMovieByIdUseCase } from "@/src/config/dependencies";

const movie = await getMovieByIdUseCase.execute(movieId);
```

## 🔄 Capa de Adaptador

### Servicios Legacy (`src/services/moviesServiceAdapter.ts`)

Mantiene compatibilidad con código existente mientras se migra a la nueva arquitectura:

```typescript
// Código legacy sigue funcionando
import { getMovieById } from "@/src/services/moviesServiceAdapter";
const movie = await getMovieById(id);

// Mientras internamente usa la nueva arquitectura
```

## 🚀 Beneficios de esta Arquitectura

### 1. **Mantenibilidad**

- Código organizado y separado por responsabilidades
- Fácil localización de bugs y problemas
- Cambios aislados sin efectos secundarios

### 2. **Testabilidad**

- Cada capa se puede testear independientemente
- Mocking fácil de dependencias
- Tests unitarios más confiables

### 3. **Escalabilidad**

- Agregar nuevas funcionalidades sin afectar las existentes
- Nuevos repositorios y casos de uso son simples de implementar
- Arquitectura preparada para crecimiento

### 4. **Flexibilidad**

- Cambio de base de datos sin afectar la lógica de negocio
- Diferentes implementaciones de repositorios
- Intercambio de componentes sin romper el sistema

### 5. **Reutilización**

- Casos de uso reutilizables en diferentes contextos
- Componentes de UI independientes de la lógica de negocio
- Servicios compartibles entre módulos

## 📱 Nuevas Pantallas Implementadas

### Selección de Asientos (`app/seat-selection.tsx`)

- Navegación desde horarios de película
- Selección múltiple de asientos
- Validación de asientos ocupados
- Cálculo automático de precios
- Integración con nueva arquitectura

## 🔄 Migración Gradual

La implementación permite migración gradual:

1. **Fase 1**: Implementar nuevas funcionalidades con la nueva arquitectura
2. **Fase 2**: Migrar funcionalidades existentes usando adaptadores
3. **Fase 3**: Eliminar código legacy una vez migrado todo

## 🎯 Próximos Pasos

1. **Completar repositorios faltantes**:

   - `FirebaseTicketRepository`
   - `FirebaseCinemaRepository`
   - `FirebaseUserRepository`

2. **Implementar casos de uso pendientes**:

   - Gestión completa de tickets
   - Gestión de usuarios y preferencias
   - Gestión de cines y horarios

3. **Migrar pantallas existentes**:

   - Actualizar `movies.tsx` para usar nuevos casos de uso
   - Migrar componentes de filtros
   - Actualizar contextos de autenticación

4. **Testing**:
   - Tests unitarios para cada caso de uso
   - Tests de integración para repositorios
   - Tests end-to-end para flujos completos

## 📚 Referencias

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Dependency Injection Pattern](https://en.wikipedia.org/wiki/Dependency_injection)
