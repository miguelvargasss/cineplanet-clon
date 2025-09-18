# 🎨 Sistema de Iconos Mejorado con @expo/vector-icons

Este proyecto usa un sistema de iconos potente basado en `@expo/vector-icons` que te permite acceder a **miles de iconos** de diferentes familias.

## 📚 Familias de Iconos Disponibles

### 1. **Ionicons** (Recomendado) - `IIcon`

```tsx
import { IIcon } from '@/components/ui/Icon';

<IIcon name="home" size={24} color="#007AFF" />
<IIcon name="person" size={20} color="#666" />
<IIcon name="heart" size={18} color="#FF3B30" />
```

### 2. **Material Icons** - `MIcon`

```tsx
import { MIcon } from '@/components/ui/Icon';

<MIcon name="home" size={24} color="#007AFF" />
<MIcon name="person" size={20} color="#666" />
<MIcon name="favorite" size={18} color="#FF3B30" />
```

### 3. **Font Awesome** - `FAIcon`

```tsx
import { FAIcon } from '@/components/ui/Icon';

<FAIcon name="home" size={24} color="#007AFF" />
<FAIcon name="user" size={20} color="#666" />
<FAIcon name="heart" size={18} color="#FF3B30" />
```

### 4. **Feather Icons** - `FeatherIcon`

```tsx
import { FeatherIcon } from '@/components/ui/Icon';

<FeatherIcon name="home" size={24} color="#007AFF" />
<FeatherIcon name="user" size={20} color="#666" />
<FeatherIcon name="heart" size={18} color="#FF3B30" />
```

### 5. **Ant Design** - `AIcon`

```tsx
import { AIcon } from '@/components/ui/Icon';

<AIcon name="home" size={24} color="#007AFF" />
<AIcon name="user" size={20} color="#666" />
<AIcon name="heart" size={18} color="#FF3B30" />
```

### 6. **Material Community Icons** - `MCIcon`

```tsx
import { MCIcon } from '@/components/ui/Icon';

<MCIcon name="home" size={24} color="#007AFF" />
<MCIcon name="account" size={20} color="#666" />
<MCIcon name="heart" size={18} color="#FF3B30" />
```

## 🔧 Uso General

### Componente `Icon` genérico:

```tsx
import { Icon } from '@/components/ui/Icon';

<Icon family="Ionicons" name="home" size={24} color="#007AFF" />
<Icon family="MaterialIcons" name="person" size={20} color="#666" />
```

## 🎯 Iconos Comunes para Cineplanet

### Navegación y UI

```tsx
// Inicio
<IIcon name="home" size={24} color="#007AFF" />

// Usuario/Perfil
<IIcon name="person" size={24} color="#666" />

// Películas
<IIcon name="film" size={24} color="#FF6B35" />

// Búsqueda
<IIcon name="search" size={24} color="#666" />

// Configuración
<IIcon name="settings" size={24} color="#666" />

// Favoritos
<IIcon name="heart" size={24} color="#FF3B30" />

// Carrito/Compras
<IIcon name="cart" size={24} color="#007AFF" />
```

### Controles de Input

```tsx
// Mostrar/Ocultar contraseña
<IIcon name="eye" size={20} color="#666" />
<IIcon name="eye-off" size={20} color="#666" />

// Dropdown
<IIcon name="chevron-down" size={16} color="#666" />

// Checkbox marcado
<IIcon name="checkmark" size={16} color="#007AFF" />
```

## 🌐 Recursos Útiles

- **Ionicons**: https://ionic.io/ionicons
- **Material Icons**: https://fonts.google.com/icons
- **Font Awesome**: https://fontawesome.com/icons
- **Feather Icons**: https://feathericons.com/
- **Ant Design Icons**: https://ant.design/components/icon/
- **Material Community**: https://materialdesignicons.com/

## 📱 Ejemplos de Migración

### Antes (IconSymbol):

```tsx
import { IconSymbol } from "@/components/ui/IconSymbol";

<IconSymbol name="person.fill" size={28} color={color} />;
```

### Después (Sistema mejorado):

```tsx
import { IIcon } from "@/components/ui/Icon";

<IIcon name="person" size={28} color={color} />;
```

## ⚡ Ventajas del Nuevo Sistema

1. **🎨 Más opciones**: Acceso a 6 familias de iconos
2. **📱 Mejor rendimiento**: Optimizado para React Native
3. **🔧 Más flexible**: Fácil cambio entre familias
4. **📚 Mejor documentación**: Cada familia tiene su documentación oficial
5. **🎯 Más específico**: Iconos especializados para cada necesidad

## 🔄 Compatibilidad

El sistema anterior (`IconSymbol`) sigue funcionando para mantener compatibilidad, pero se recomienda migrar al nuevo sistema gradualmente.
