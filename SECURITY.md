# Política de Seguridad - Cineplanet Clone 🎬🔒

## Versiones Soportadas

Las siguientes versiones del proyecto Cineplanet Clone están actualmente soportadas con actualizaciones de seguridad:

| Versión | Soportada | Estado                              |
| ------- | --------- | ----------------------------------- |
| 1.0.x   | ✅        | Versión actual con soporte completo |
| 0.9.x   | ⚠️        | Solo actualizaciones críticas       |
| < 0.9   | ❌        | Sin soporte de seguridad            |

## Stack Tecnológico y Consideraciones de Seguridad

### Dependencias Principales

- **React Native 0.81.4** - Framework principal
- **Expo SDK 54.0.8** - Plataforma de desarrollo
- **Firebase 12.3.0** - Backend y autenticación
- **TypeScript 5.9.2** - Tipado estático

### Componentes Críticos de Seguridad

- **Firebase Authentication** - Manejo de usuarios y sesiones
- **Firebase Firestore** - Base de datos con reglas de seguridad
- **Variables de entorno** - Configuración sensible

## Mejores Prácticas de Seguridad para Colaboradores

### 🔐 Variables de Entorno

- **NUNCA** commitear el archivo `.env` al repositorio
- Usar solo variables con prefijo `EXPO_PUBLIC_` para datos que pueden ser públicos
- Mantener las credenciales de Firebase seguras y rotarlas periódicamente
- Usar diferentes proyectos de Firebase para desarrollo, staging y producción

### 🛡️ Firebase Security

- Implementar reglas de seguridad estrictas en Firestore
- Habilitar autenticación multifactor cuando sea posible
- Revisar regularmente los usuarios y permisos en Firebase Console
- Monitorear logs de acceso y actividad sospechosa

### 📱 Desarrollo Móvil

- Verificar que las API keys de Firebase estén restringidas por dominio/app
- No incluir datos sensibles en el código fuente
- Usar Expo SecureStore para almacenar información sensible localmente
- Validar todos los inputs del usuario tanto en frontend como backend

### 🔄 Dependencias

- Mantener las dependencias actualizadas usando `npm audit`
- Revisar regularmente vulnerabilidades conocidas
- Usar `expo install` para garantizar compatibilidad con el SDK

## Reportar una Vulnerabilidad de Seguridad

### 📧 Contacto

Si descubres una vulnerabilidad de seguridad, por favor repórtala de manera responsable:

- **Email:** [miguelvargasss@email.com] (cambiar por email real)
- **Asunto:** `[SEGURIDAD] Vulnerabilidad en Cineplanet Clone`

### 🕐 Proceso de Reporte

1. **Reporte inicial:** Envía un email detallando la vulnerabilidad
2. **Confirmación:** Recibirás confirmación en 24-48 horas
3. **Evaluación:** Análisis y clasificación de la vulnerabilidad (3-5 días)
4. **Corrección:** Desarrollo y testing del fix (1-2 semanas)
5. **Despliegue:** Publicación de la corrección y notificación

### 📊 Clasificación de Vulnerabilidades

- **Crítica:** Acceso no autorizado a datos de usuarios, bypass de autenticación
- **Alta:** Exposición de datos sensibles, inyección de código
- **Media:** Denial of service, information disclosure
- **Baja:** Issues de configuración, problemas menores de validación

### 🎁 Reconocimiento

Los reportes válidos de vulnerabilidades serán reconocidos públicamente (si el reportero lo desea) en:

- Archivo CONTRIBUTORS.md
- Release notes de la versión que contenga el fix
- README del proyecto

## Configuración de Desarrollo Seguro

### 🚀 Configuración Inicial

```bash
# 1. Clonar el repositorio
git clone https://github.com/miguelvargasss/cineplanet-clon.git

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales reales

# 4. Ejecutar auditoría de seguridad
npm audit
```

### 🔍 Checklist de Seguridad para Pull Requests

- [ ] No incluir credenciales o información sensible
- [ ] Validar inputs de usuario en componentes
- [ ] Usar TypeScript para prevenir errores de tipo
- [ ] Probar autenticación y autorización
- [ ] Verificar que las reglas de Firestore sean seguras
- [ ] Correr `npm audit` y resolver vulnerabilidades

### 🚨 Señales de Alerta

Contacta al equipo de seguridad si observas:

- Intentos de acceso no autorizado en Firebase Console
- Actividad sospechosa en los logs de Firebase
- Errores de autenticación masivos
- Comportamiento anómalo en la aplicación

## Contacto del Equipo de Seguridad

- **Maintainer Principal:** Miguel Vargas (@miguelvargasss)
- **Repositorio:** https://github.com/miguelvargasss/cineplanet-clon
- **Issues de Seguridad:** Usar el template de security issue

---

**Nota:** Esta política de seguridad se actualiza regularmente. La última revisión fue en septiembre de 2025.
