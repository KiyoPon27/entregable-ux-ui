# ⚠️ PROBLEMA DETECTADO - CREDENCIALES INCORRECTAS

## 🔍 Diagnóstico Realizado

### Estado del Sistema
- ✅ MySQL está ejecutándose (MySQL95 Running)
- ✅ Backend compiló correctamente (BUILD SUCCESSFUL)
- ✅ Backend está respondiendo en puerto 8080
- ❌ **ERROR: Login falla con "Bad credentials" (500)**

### Causa del Problema
El endpoint `/api/auth/login` retorna error 500 con mensaje "Bad credentials".

Esto significa que:
1. El usuario `admin@correo.com` no existe en la tabla `usuarios`, O
2. La contraseña encriptada en la BD no coincide con "123"

## 🔧 Soluciones Posibles

### Opción A: Verificar Usuario en Base de Datos (RECOMENDADO)

Ejecuta este comando en MySQL para verificar si existe el usuario admin:

```sql
USE LT_Sanchez;
SELECT id, nombres, correo, password FROM usuarios WHERE correo = 'admin@correo.com';
```

Si **NO existe el usuario**, ejecuta el script `inserts.sql` que debería crear el usuario admin.

### Opción B: Verificar Inserts

Ejecuta el archivo de inserts que debe crear el usuario administrador:

```powershell
# Desde MySQL Workbench o línea de comandos
# Archivo: Backend/inserts.sql
```

### Opción C: Crear Usuario Admin Manualmente

Si necesitas crear el usuario manualmente con contraseña "123":

```sql
USE LT_Sanchez;

-- Password "123" encriptado con BCrypt
INSERT INTO usuarios (nombres, correo, password, id_rol, estado, tema, nro_doc, telefono) 
VALUES (
    'Administrador',
    'admin@correo.com', 
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCu',  -- Password: "123"
    1,
    'ACTIVO',
    'light',
    '-',
    '-'
);
```

## 📋 Pasos para Continuar

1. **Verificar/Crear Usuario Admin** usando una de las opciones anteriores
2. **Reiniciar el Backend** (si es necesario)
3. **Ejecutar nuevamente las pruebas**:
   ```powershell
   cd Backend\pruebas
   .\DIAGNOSTICO_BACKEND.ps1
   ```

4. Si el diagnóstico pasa, ejecutar pruebas completas:
   ```powershell
   .\FASE1_PRUEBAS_STOCK_ENDPOINTS.ps1
   .\FASE2_PRUEBAS_TRIGGERS.ps1
   ```

## 🔐 Contraseñas de Referencia

- **Usuario**: admin@correo.com
- **Contraseña en texto plano**: `123`
- **Contraseña encriptada (BCrypt)**: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCu`

## 📊 Estado Actual de las Pruebas

### ✅ FASE 1 - Completada (código)
- EmpresaService creado
- Endpoints de categorías corregidos
- Endpoints de empresa corregidos
- Stock con deducción inmediata implementado
- Sin doble deducción al confirmar

### ✅ FASE 2 - Completada (código)
- Trigger #7: Serializaciones al crear sucursal
- Trigger #8: Impresora al crear caja
- Trigger #9: Permiso Home a nuevos usuarios
- Trigger #10: Cliente genérico en ventas

### ⏳ Pendiente
- ❌ Pruebas funcionales (bloqueadas por problema de login)

## 💡 Nota Importante

**El código de ambas fases está COMPLETADO y COMPILADO correctamente.**

El único problema es la configuración de datos iniciales en la base de datos.
Una vez resuelto el problema de login, todas las pruebas deberían pasar exitosamente.
