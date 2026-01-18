# Instrucciones para Ejecutar Pruebas del Backend

## ⚙️ Requisitos Previos

1. Backend debe estar ejecutándose en `http://localhost:8080`
2. PowerShell 7+ instalado
3. Base de datos MySQL activa con datos de prueba

---

## 🚀 Método Rápido (Recomendado)

### Paso 1: Iniciar el Backend

Abre una **terminal dedicada** y ejecuta:

```powershell
cd C:\Users\alons\Documents\GitHub\PROYECTO_TIENDA_CHINA\Backend
.\INICIAR_BACKEND.ps1
```

**Espera hasta ver el mensaje:**
```
Started PosbackendApplication in X.XXX seconds
```

⚠️ **NO CIERRES esta terminal** - déjala ejecutándose durante las pruebas.

---

### Paso 2: Ejecutar Pruebas

Abre una **segunda terminal** (nueva) y ejecuta:

#### Opción A: Prueba Rápida Completa (5-10 segundos)
```powershell
cd C:\Users\alons\Documents\GitHub\PROYECTO_TIENDA_CHINA\Backend\pruebas
.\PRUEBA_RAPIDA_COMPLETA.ps1
```

Esta prueba verifica:
- ✅ Autenticación (login + token)
- ✅ Categorías (crear, leer, eliminar)
- ✅ Productos (crear, leer con `/productos/{id}`, eliminar)
- ✅ Sucursales (listar por empresa)
- ✅ Almacenes (crear, leer con `/almacenes/{id}`, eliminar)
- ✅ Stock (ajustar, leer stock específico)

#### Opción B: Suite Completa (2-3 minutos)
```powershell
cd C:\Users\alons\Documents\GitHub\PROYECTO_TIENDA_CHINA\Backend\pruebas
.\ejecutar_pruebas.ps1
```

Esta suite ejecuta **todos los tests** de los 8 módulos:
1. Auth (login, /me, validaciones)
2. Empresa (contexto, datos)
3. Permisos (roles, módulos)
4. Categorías (CRUD completo + validaciones)
5. Productos (CRUD completo + búsqueda)
6. Sucursales (listado por empresa)
7. Almacenes (CRUD completo + búsqueda)
8. Stock (ajustes, consultas específicas)

---

## 📋 Pruebas Individuales por Módulo

Si quieres probar un módulo específico:

```powershell
cd C:\Users\alons\Documents\GitHub\PROYECTO_TIENDA_CHINA\Backend\pruebas
```

Luego abre el archivo `.md` correspondiente y ejecuta los comandos:

- **Auth:** `01_AUTH.md`
- **Empresa:** `02_EMPRESA.md`
- **Permisos:** `03_PERMISOS.md`
- **Categorías:** `04_CATEGORIAS.md`
- **Productos:** `05_PRODUCTOS.md` o `PRUEBA_RAPIDA_PRODUCTOS.md`
- **Almacenes:** `06_ALMACENES.md` o `PRUEBA_RAPIDA_ALMACENES.md`
- **Stock:** `07_STOCK.md`

Cada archivo contiene comandos PowerShell listos para copiar y pegar.

---

## ❌ Solución de Problemas

### Error: "No es posible conectar con el servidor remoto"

**Causa:** El backend no está ejecutándose.

**Solución:**
1. Verifica que el backend esté corriendo:
   ```powershell
   Get-Process -Name java
   ```
2. Si no hay procesos, reinicia el backend con `INICIAR_BACKEND.ps1`

### Error: "Conexión rechazada en puerto 8080"

**Causa:** Otro proceso está usando el puerto 8080.

**Solución:**
```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :8080

# Matar el proceso (reemplaza PID con el número del proceso)
Stop-Process -Id PID -Force

# Reiniciar backend
.\INICIAR_BACKEND.ps1
```

### Error 401: "Unauthorized"

**Causa:** Credenciales incorrectas o token expirado.

**Solución:**
1. Verifica que el usuario `admin@example.com` / `admin123` existe en tu base de datos
2. Revisa los logs del backend para más detalles

### Error 404: "Endpoint no encontrado"

**Causa:** El backend no tiene el endpoint o hay un error en la URL.

**Solución:**
1. Verifica que estás usando la versión correcta del código
2. Revisa que todos los controllers estén compilados:
   ```powershell
   cd Backend
   .\gradlew clean build
   ```

### Error 500: "Internal Server Error"

**Causa:** Error en el backend (SQL, validación, etc.)

**Solución:**
1. Revisa los logs del backend (terminal donde ejecutaste `INICIAR_BACKEND.ps1`)
2. Busca la excepción Java y el stack trace
3. Verifica que tu base de datos tenga la estructura correcta

---

## 🎯 Ejemplo de Flujo Completo

```powershell
# TERMINAL 1: Iniciar Backend
cd C:\Users\alons\Documents\GitHub\PROYECTO_TIENDA_CHINA\Backend
.\INICIAR_BACKEND.ps1
# Esperar a "Started PosbackendApplication..."

# TERMINAL 2: Ejecutar Pruebas
cd C:\Users\alons\Documents\GitHub\PROYECTO_TIENDA_CHINA\Backend\pruebas
.\PRUEBA_RAPIDA_COMPLETA.ps1
```

**Resultado esperado:**
```
========================================
   PRUEBA RÁPIDA - TODOS LOS MÓDULOS
========================================

1. AUTENTICACION...
   ✓ Login exitoso
   ✓ Empresa ID: 1

2. CATEGORIAS...
   ✓ Categoria creada: ID 25

3. PRODUCTOS...
   ✓ Producto creado: ID 120
   ✓ GET /productos/{id} funciona

4. SUCURSALES...
   ✓ Sucursal encontrada: ID 1

5. ALMACENES...
   ✓ Almacen creado: ID 10
   ✓ GET /almacenes/{id} funciona

6. STOCK...
   ✓ Stock ajustado: 100 unidades
   ✓ GET stock específico funciona

7. LIMPIEZA...
   ✓ Almacen eliminado
   ✓ Producto eliminado
   ✓ Categoria eliminada

========================================
   ✓ TODAS LAS PRUEBAS COMPLETADAS
========================================
```

---

## 📝 Notas Importantes

1. **Siempre ejecuta el backend en una terminal separada** - no lo interrumpas durante las pruebas
2. **Las pruebas crean y eliminan datos de prueba** - son seguras para ejecutar en desarrollo
3. **Si una prueba falla**, revisa los logs del backend para más detalles
4. **Ejecuta las pruebas antes de hacer commits** para asegurar que todo funciona

---

## ✅ Verificación Final

Después de ejecutar las pruebas, verifica:

- ✅ Todos los módulos devuelven códigos HTTP correctos (200, 201, 204)
- ✅ No hay errores 500 en los logs del backend
- ✅ Las validaciones funcionan (nombres duplicados, campos requeridos, etc.)
- ✅ Los endpoints nuevos (`/productos/{id}`, `/almacenes/{id}`, etc.) funcionan
- ✅ Las relaciones entre entidades no causan JSON circular

---

**Última actualización:** 2026-01-17
