# 🧪 INSTRUCCIONES PARA EJECUTAR PRUEBAS FASE 2

## 📋 CONTEXTO
Fase 2 completa la implementación de triggers automáticos que antes existían en Supabase y ahora están en Java/Spring Boot.

## ✅ TRIGGERS IMPLEMENTADOS

### ERROR #7: Serializaciones al crear sucursal
- **Qué hace**: Al crear una sucursal, automáticamente se crean 5 serializaciones:
  - Factura (F001) - Por defecto
  - Boleta (B001)
  - Nota de Venta (NV001)
  - Nota de Crédito (NC001)
  - Nota de Débito (ND001)
- **Archivo modificado**: `SucursalService.java` método `crear()`

### ERROR #8: Impresora al crear caja
- **Qué hace**: Al crear una caja, automáticamente se crea una impresora con nombre "Ticketera" en estado desactivado
- **Archivo**: `CajaService.java` método `crear()` (ya estaba implementado)

### ERROR #9: Permiso Home a nuevos usuarios
- **Qué hace**: Al crear un usuario, automáticamente se le asigna el permiso para el módulo "Home" (ID 22, enlace="/")
- **Archivo modificado**: `UsuarioService.java` método `crear()`

### ERROR #10: Cliente genérico en ventas
- **Qué hace**: Al confirmar una venta sin cliente, automáticamente se asigna el cliente genérico (ID 1)
- **Archivo modificado**: `VentaService.java` método `confirmarVenta()`

## 🚀 PASOS PARA EJECUTAR PRUEBAS

### Paso 1: Iniciar el Backend
```powershell
cd Backend
.\INICIAR_BACKEND.ps1
```
Esperar a que aparezca: `Started PosBackendApplication`

### Paso 2: Ejecutar Script de Pruebas
```powershell
cd Backend\pruebas
.\FASE2_PRUEBAS_TRIGGERS.ps1
```

## 📊 QUÉ VALIDA EL SCRIPT

1. **Login exitoso** - Obtiene token JWT
2. **Trigger #7** - Crea sucursal y verifica 5 serializaciones automáticas
3. **Trigger #8** - Crea caja y verifica impresora automática
4. **Trigger #9** - Crea usuario y verifica permiso Home automático
5. **Trigger #10** - Valida que el trigger está implementado (se prueba en flujo de ventas)
6. **Limpieza** - Elimina datos de prueba automáticamente

## ✅ RESULTADO ESPERADO

Si todo funciona correctamente, verás:

```
========================================
RESUMEN DE PRUEBAS FASE 2
========================================

✅ TRIGGER #7: Serializaciones al crear sucursal
✅ TRIGGER #8: Impresora al crear caja
✅ TRIGGER #9: Permiso Home a nuevos usuarios
✅ TRIGGER #10: Cliente genérico en ventas

Todas las pruebas de la Fase 2 completadas
```

## ❌ POSIBLES ERRORES

### Error: "Connection refused"
- **Causa**: Backend no está ejecutándose
- **Solución**: Ejecutar `.\INICIAR_BACKEND.ps1` en carpeta Backend

### Error: "401 Unauthorized"
- **Causa**: Credenciales incorrectas o usuario no existe
- **Solución**: Verificar que existe usuario `admin@correo.com` con password `123`

### Error: "Empresa no encontrada con ID: 1"
- **Causa**: Base de datos no tiene datos iniciales
- **Solución**: Ejecutar `inserts.sql` en MySQL

### Error: "Ya existe una sucursal..."
- **Causa**: Ejecución previa del script sin limpieza
- **Solución**: Eliminar manualmente la sucursal "Sucursal Test Trigger" desde la BD o frontend

## 🔍 VALIDACIÓN MANUAL

Si prefieres validar manualmente sin el script:

### Validar Trigger #7 (Serializaciones)
```sql
-- 1. Crear sucursal desde frontend o API
-- 2. Verificar en MySQL
SELECT s.nombre as sucursal, tc.nombre as tipo, sc.serie, sc.por_defecto
FROM serializacion_comprobantes sc
JOIN sucursales s ON sc.sucursal_id = s.id
JOIN tipos_comprobantes tc ON sc.id_tipo_comprobante = tc.id
WHERE s.id = [ID_SUCURSAL_CREADA]
ORDER BY sc.id;

-- Debe retornar 5 registros
```

### Validar Trigger #8 (Impresora)
```sql
-- 1. Crear caja desde frontend o API
-- 2. Verificar en MySQL
SELECT c.descripcion as caja, i.nombre, i.estado
FROM impresoras i
JOIN cajas c ON i.id_caja = c.id
WHERE c.id = [ID_CAJA_CREADA];

-- Debe retornar 1 registro con nombre "Ticketera"
```

### Validar Trigger #9 (Permiso Home)
```sql
-- 1. Crear usuario desde frontend o API
-- 2. Verificar en MySQL
SELECT u.nombres, m.nombre as modulo, m.enlace
FROM permisos p
JOIN usuarios u ON p.id_usuario = u.id
JOIN modulos m ON p.idmodulo = m.id
WHERE u.id = [ID_USUARIO_CREADO];

-- Debe retornar al menos 1 registro con módulo "Home" y enlace "/"
```

### Validar Trigger #10 (Cliente Genérico)
```sql
-- 1. Confirmar venta sin especificar idCliente en el DTO
-- 2. Verificar en MySQL
SELECT v.nro_comprobante, cp.nombres as cliente
FROM ventas v
JOIN clientes_proveedores cp ON v.id_cliente = cp.id
WHERE v.id = [ID_VENTA_CONFIRMADA];

-- Si no se especificó cliente, debe mostrar "Cliente Genérico"
```

## 📝 NOTAS IMPORTANTES

- Los triggers se ejecutan **automáticamente** en el código Java, no requieren acciones manuales
- Las serializaciones se crean con correlativo inicial = 1
- La impresora se crea con estado = false (desactivada)
- El permiso Home se asigna siempre, independientemente del rol
- El cliente genérico debe existir con ID = 1 en la tabla `clientes_proveedores`

## 🔄 ROLLBACK (Si algo falla)

Si necesitas revertir los cambios de la Fase 2:

```bash
# Revertir cambios en Git
git checkout Backend/src/main/java/tienda/posbackend/services/SucursalService.java
git checkout Backend/src/main/java/tienda/posbackend/services/UsuarioService.java
git checkout Backend/src/main/java/tienda/posbackend/services/VentaService.java

# Recompilar
cd Backend
./gradlew clean build
```

## 📞 SOPORTE

Si encuentras errores:
1. Revisar logs del backend en consola
2. Verificar que MySQL está ejecutándose
3. Verificar que existen datos base (empresa ID 1, cliente ID 1, módulo ID 22)
4. Verificar que el puerto 8080 no está siendo usado por otra aplicación
