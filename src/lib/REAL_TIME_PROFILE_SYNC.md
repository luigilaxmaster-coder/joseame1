# Sistema de Sincronización en Tiempo Real del Perfil de Usuario

## Descripción General

Este documento describe el mecanismo implementado para sincronizar automáticamente los cambios realizados por administradores en el panel de administración con los perfiles personales de los usuarios en tiempo real.

## Arquitectura del Sistema

### 1. Componentes Principales

#### ProfilePage.tsx (Perfil del Usuario)
- **Ubicación**: `/src/components/pages/ProfilePage.tsx`
- **Función**: Muestra el perfil personal del usuario y sincroniza automáticamente los cambios del administrador
- **Frecuencia de actualización**: Cada 10 segundos

#### AdminUsersVerificationPage.tsx (Panel de Administración)
- **Ubicación**: `/src/components/pages/AdminUsersVerificationPage.tsx`
- **Función**: Permite a los administradores modificar estados de verificación, roles e insignias
- **Frecuencia de actualización**: Cada 10 segundos

### 2. Colección de Datos

**Colección**: `registeredusers`

**Campos sincronizados**:
- `verificationStatus`: Estado de verificación del usuario (verificado, pendiente, no_verificado)
- `badges`: Insignias otorgadas al usuario (separadas por comas)
- `role`: Rol del usuario (client, joseador, admin)

## Flujo de Sincronización

### Paso 1: Cambio por Administrador
1. El administrador accede a `/admin/users-verification`
2. Modifica el estado de verificación, rol o insignias de un usuario
3. Los cambios se guardan en la colección `registeredusers` mediante `BaseCrudService.update()`

### Paso 2: Detección de Cambios
1. El perfil del usuario ejecuta `loadUserDataFromAdmin()` cada 10 segundos
2. Compara los datos actuales con los datos almacenados en el estado local
3. Si detecta cambios, actualiza el estado y muestra una notificación

### Paso 3: Actualización Visual
1. Los nuevos datos se reflejan inmediatamente en la interfaz
2. Se muestra una notificación animada indicando que el perfil fue actualizado
3. Se actualiza el timestamp de la última actualización

## Implementación Técnica

### Polling Interval

```typescript
useEffect(() => {
  loadProfileData();
  
  // Actualización cada 10 segundos
  const intervalId = setInterval(() => {
    loadUserDataFromAdmin();
  }, 10000);

  return () => clearInterval(intervalId);
}, [member?.loginEmail]);
```

### Detección de Cambios

```typescript
const loadUserDataFromAdmin = async () => {
  if (!member?.loginEmail) return;
  
  try {
    const { items: users } = await BaseCrudService.getAll<RegisteredUsers>('registeredusers');
    const currentUser = users.find(u => u.email === member.loginEmail);
    
    if (currentUser) {
      // Verificar si los datos han cambiado
      const hasChanged = 
        currentUser.verificationStatus !== verificationStatus ||
        currentUser.badges !== userBadges.join(',') ||
        currentUser.role !== registeredUserRole;

      if (hasChanged) {
        // Mostrar notificación cuando se actualizan los datos
        setShowUpdateNotification(true);
        setLastUpdateTime(new Date());
        setTimeout(() => setShowUpdateNotification(false), 3000);
      }

      // Actualizar estados
      setVerificationStatus(currentUser.verificationStatus || 'no_verificado');
      
      if (currentUser.badges) {
        const badgesArray = currentUser.badges.split(',').map(b => b.trim()).filter(b => b);
        setUserBadges(badgesArray);
      }
      
      setRegisteredUserRole(currentUser.role || '');
    }
  } catch (error) {
    console.error('Error loading user data from admin:', error);
  }
};
```

### Notificación Visual

```typescript
<AnimatePresence>
  {showUpdateNotification && (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-4 right-4 z-[100] max-w-sm"
    >
      <div className="bg-gradient-to-r from-accent to-support text-white px-6 py-4 rounded-xl shadow-2xl">
        <div className="flex items-center gap-3">
          <RefreshCw size={20} className="text-white animate-spin" />
          <div>
            <p className="font-heading font-bold text-sm">¡Perfil Actualizado!</p>
            <p className="font-paragraph text-xs">
              Tu información ha sido actualizada por el administrador
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

## Elementos Visuales Sincronizados

### 1. Estado de Verificación
- **Ubicación**: Tarjeta de información de contacto
- **Estados**: Verificado, Pendiente, No Verificado
- **Indicador visual**: Icono y color cambian según el estado
- **Animación**: Pulso en el icono de actualización

### 2. Insignias (Badges)
- **Ubicación**: Debajo del nombre en el encabezado del perfil
- **Formato**: Chips con icono de premio
- **Animación**: Aparición escalonada con efecto de escala

### 3. Rol del Usuario
- **Ubicación**: Debajo de las insignias en el encabezado
- **Formato**: Chip con icono de usuario
- **Valores**: Cliente, Joseador, Admin

## Características Adicionales

### Indicador de Tiempo Real
- Muestra la hora de la última actualización
- Se actualiza cada vez que se detectan cambios
- Formato: HH:MM (24 horas)

### Animaciones
- **Notificación**: Desliza desde arriba, permanece 3 segundos
- **Icono de actualización**: Rotación continua para indicar sincronización activa
- **Estado verificado**: Pulso en el icono de verificación
- **Badges**: Aparición con efecto de escala

### Optimización de Rendimiento
- Solo se actualiza cuando hay cambios reales
- Comparación eficiente de estados
- Limpieza de intervalos al desmontar componentes

## Casos de Uso

### Caso 1: Verificación de Joseador
1. Joseador completa el proceso de verificación
2. Administrador revisa documentos en el panel
3. Administrador cambia estado a "Aprobado"
4. En máximo 10 segundos, el perfil del joseador muestra "Verificado"
5. Aparece notificación de actualización

### Caso 2: Otorgamiento de Insignias
1. Usuario completa un hito importante
2. Administrador otorga insignia "Profesional Destacado"
3. Perfil del usuario muestra la nueva insignia automáticamente
4. Insignia aparece con animación

### Caso 3: Cambio de Rol
1. Cliente se registra como joseador también
2. Administrador actualiza el rol
3. Perfil muestra el nuevo rol inmediatamente
4. Usuario ve la actualización sin necesidad de recargar

## Consideraciones de Seguridad

- Los usuarios solo pueden ver sus propios datos
- Solo administradores pueden modificar estados de verificación y roles
- Todas las actualizaciones pasan por `BaseCrudService` con validación
- No se exponen datos sensibles en las consultas

## Mantenimiento y Monitoreo

### Logs
- Errores de carga se registran en la consola
- Útil para debugging y monitoreo

### Ajuste de Frecuencia
Para cambiar la frecuencia de actualización, modificar el valor en el `setInterval`:
```typescript
// Cambiar 10000 (10 segundos) al valor deseado en milisegundos
const intervalId = setInterval(() => {
  loadUserDataFromAdmin();
}, 10000);
```

## Mejoras Futuras Potenciales

1. **WebSockets**: Implementar conexión en tiempo real para actualizaciones instantáneas
2. **Notificaciones Push**: Alertas del sistema cuando hay cambios importantes
3. **Historial de Cambios**: Registro de todas las modificaciones realizadas
4. **Confirmación de Lectura**: Indicador de que el usuario vio la actualización
5. **Sincronización Selectiva**: Solo actualizar campos específicos que cambiaron

## Conclusión

Este sistema proporciona una experiencia fluida y en tiempo real para los usuarios, asegurando que siempre vean información actualizada sin necesidad de recargar la página manualmente. La implementación es eficiente, escalable y fácil de mantener.
