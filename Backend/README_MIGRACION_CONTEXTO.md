# Contexto de Migración y Plan de Acción

Este documento resume el estado actual del backend y frontend tras rearmar el proyecto desde cero, verificando el login e implementando progresivamente módulos críticos. Incluye todo el trabajo realizado el 2026-01-17 con las migraciones de Movimientos de Stock, Clientes/Proveedores, correcciones exhaustivas de nomenclatura y el plan de acción para continuar.

**ÚLTIMA ACTUALIZACIÓN:** 2026-01-17 (después de completar Prioridades 2 y 3)
Rama: `master`

---

## 1) Historia cronológica de avances

1. Reinicio del backend y flujo de login
   - Se rearmó la autenticación con Spring Security + JWT.
   - Se validó `POST /api/auth/login` y `GET /api/auth/me` devolviendo contexto de usuario, empresa (por dueño o por asignación) y permisos (IDs de módulos).
   - Se corrigió CORS (orígenes 5173/5174), se permitió `OPTIONS` y se deshabilitó CSRF.

2. Permisos y módulos en frontend
   - Se ajustó el mapeo del store de permisos para alinearlo con la estructura entregada por el backend.
   - Resultado: módulos de Configuración visibles y navegables.

3. Productos (listar, buscar, crear/editar/eliminar)
   - Backend: `ProductoController` con rutas `/api/productos` CRUD, `/empresa/{id}` y `/buscar/{id}?q=`.
   - Frontend: `crudProductos.jsx` y `ProductosStore.jsx` adaptados para payload anidado (`empresa.id`, `categoria.id`) y nombres camelCase.
   - Solución a 403: CORS/CSRF y `OPTIONS` permitidos; se verificó envío de `Authorization: Bearer` desde Axios.

4. Empresa del usuario
   - Backend: `EmpresaController` con `GET /api/empresas/mostrar?idUsuario=`, usado para acoplar productos a la empresa del usuario autenticado.

5. Inventario: Almacenes y Stock
   - Backend:
     - Entidades: `Almacen`, `Stock` con relaciones a `Sucursal` y `Producto`.
     - Repositorios: `AlmacenRepository` (por sucursal/empresa) y `StockRepository` (por producto/almacén).
     - Controladores:
       - `AlmacenController`: `/api/almacenes/sucursal/{id}`, `/empresa/{id}`, `POST`, `PUT`, `DELETE`.
       - `StockController`: `/api/stock/producto/{id}`, `/almacen/{id}`, `POST /ajuste` (crea/actualiza stock por producto+almacén).
     - Se añadió `@PrePersist` en `Almacen` para completar `fecha_creacion` automáticamente y valores por defecto.
   - Frontend:
     - `crudAlmacenes.jsx` migrado a backend (Axios). Respuesta agrupada por sucursal para mantener UI actual.
     - `crudStock.jsx` migrado a backend: lectura por producto/almacén y ajuste de stock con `/ajuste`.
     - `MovStockStack.jsx` y `StockStack.jsx` alineados para enviar `id_almacen`, `id_producto`, `cantidad`.

6. Datos iniciales
   - Archivo `Backend/inserts.sql`: roles, módulos, empresa de prueba, usuario admin (admin@tienda.com / 123), categorías base, productos de muestra, sucursal, almacén y stock inicial.

7. **NUEVO - Movimientos de Stock (Prioridad 2 - COMPLETADO 2026-01-17)**
   - Backend:
     - Entidad: `MovimientoStock` con campos: `almacen`, `producto`, `tipoMovimiento`, `cantidad`, `fecha`, `detalle`, `origen`.
     - Repositorio: `MovimientoStockRepository` con queries por producto, almacén y rango de fechas.
     - Servicio: `MovimientoStockService` con lógica de negocio y actualización automática de stock.
     - Controlador: `MovimientoStockController` con 7 endpoints:
       * `POST /api/movimientos-stock` - Registrar movimiento manual
       * `GET /api/movimientos-stock` - Listar todos
       * `GET /api/movimientos-stock/producto/{id}` - Kardex por producto
       * `GET /api/movimientos-stock/almacen/{id}` - Movimientos por almacén
  **Auth** ✅
  - `POST /api/auth/login` (correo, password) → token + datos básicos
  - `GET /api/auth/me` → `usuario`, `empresa`, `asignacion`, `permisos` (IDs de módulo)

- **Empresa** ✅
  - `GET /api/empresas/mostrar?idUsuario={id}` → empresa del usuario (por dueño o asignación)

- **Productos** ✅
  - `GET /api/productos/empresa/{idEmpresa}`
  - `GET /api/productos/buscar/{idEmpresa}?q=texto`
  - `POST /api/productos` (payload con `empresa.id`, `categoria.id`)
  - `PUT /api/productos/{id}`
  - `DELETE /api/productos/{id}`

- **Almacenes** ✅
  - `GET /api/almacenes/sucursal/{idSucursal}`
  - `GET /api/almacenes/empresa/{idEmpresa}`
  - `POST /api/almacenes` (requiere `sucursal.id`)
  - `PUT /api/almacenes/{id}`
  - `DELETE /api/almacenes/{id}`

- **Stock** ✅
  - `GET /api/stock/producto/{idProducto}`
  - `GET /api/stock/almacen/{idAlmacen}`
  - `POST /api/stock/ajuste` (crea/actualiza el stock unificando producto+almacén)

- **Movimientos de Stock** ✅ NUEVO
  - `POST /api/movimientos-stock` (registra y actualiza stock automáticamente)
  - `GET /api/movimientos-stock` (listar todos)
  - `GET /api/movimientos-stock/producto/{id}` (kardex por producto)
  - `GET /api/movimientos-stock/almacen/{id}` (por almacén)
  - `GET /api/movimientos-stock/almacen/{id}/fechas?inicio=&fin=` (con filtro de fechas)
  - `GET /api/movimientos-stock/producto/{idProducto}/almacen/{idAlmacen}` (específico)
  - `GET /api/movimientos-stock/{id}` (por ID)

- **Clientes/Proveedores** ✅ NUEVO
  - `GET /api/clientes-proveedores/empresa/{id}` (listar todos)
  - `GET /api/clientes-proveedores/empresa/{id}/tipo/{tipo}` (CLIENTE/PROVEEDOR/AMBOS)
  - `GET /api/clientes-proveedores/empresa/{id}/estado/{estado}` (activo/inactivo)
  - `GET /api/clientes-proveedores/empresa/{id}/buscar?q=texto` (búsqueda por nombre)
  - `GET /api/clientes-proveedores/{id}` (obtener uno)
  - `POST /api/clientes-proveedores` (crear con validaciones)
  - `PUT /api/clientes-proveedores/{id}` (editar con validaciones)
  - `DELETE /api/clientes-proveedores/{id}` (eliminar)
  - `PATCH /api/clientes-proveedores/{id}/estado` (cambiar estadombre
       * `GET /api/clientes-proveedores/{id}` - Obtener uno
       * `POST /api/clientes-proveedores` - Crear (con validaciones)
       * `PUT /api/clientes-proveedores/{id}` - Editar (con validaciones)
       * `DELETE /api/clientes-proveedores/{id}` - Eliminar
       * `PATCH /api/clientes-proveedores/{id}/estado` - Cambiar estado
   - Frontend:
     - `ClientesProveedoresStore.jsx` migrado completamente a backend.
     - Páginas separadas: `/configuracion/clientes` y `/configuracion/proveedores` filtran por tipo automáticamente.
     - Formulario: `RegistrarClientesProveedores.jsx` muestra errores de validación del backend al usuario.
     - Mensajes de error claros en español (sin emojis).

9. **NUEVO - Correcciones Exhaustivas de Nomenclatura (2026-01-17)**
   - Se realizó auditoría completa de todos los módulos migrados.
   - **Problema identificado:** Frontend usaba snake_case (nombres de Supabase) pero backend devuelve camelCase (estándar Java).
   - **Archivos corregidos (10 archivos):**
     * `TablaProductos.jsx`: 4 campos (`precioVenta`, `precioCompra`, `seVendePor`, `manejaInventarios`)
     * `RegistrarProductos.jsx`: 7 referencias de campos
     * `TablaInventarios.jsx`: 1 campo (`tipoMovimiento`)
     * `TablaClientesProveedores.jsx`: 2 campos (`identificadorNacional`, `identificadorFiscal`)
     * `MovStockStack.jsx`: 2 referencias
     * `HeaderPos.jsx`: 3 referencias
     * `SelectAlmacenModal.jsx`: 2 referencias  
     * `RegistrarInventario.jsx`: 3 referencias
     * `CartVentasStoreTemporal.jsx`: fallback agregado
     * `ClientesProveedoresStore.jsx`: tipo en mayúsculas
   - **Resultado:** Todos los módulos migrados 100% coherentes con el formato del backend.

---

## 2) Arquitectura técnica actual

- Backend: Spring Boot 3.5.9, Java 17, JPA/Hibernate, MySQL.
- Seguridad: JWT (filtro `JwtAuthFilter`), CORS permitido (`http://localhost:5173`, `5174`), CSRF deshabilitado, `OPTIONS` permitido.
- Frontend: React + Zustand + TanStack Query + Axios con interceptor de token.

### Endpoints implementados (principales)

- Auth
  - `POST /api/auth/login` (correo, password) → token + datos básicos
  - `GET /api/auth/me` → `usuario`, `empresa`, `asignacion`, `permisos` (IDs de módulo)

- Empresa
  - `GET /api/empresas/mostrar?idUsuario={id}` → empresa del usuario (por dueño o asignación)

- Productos
  - `GET /api/productos/empresa/{idEmpresa}`
  - `GET /api/productos/buscar/{idEmpresa}?q=texto`
  - `POST /api/productos` (payload con `empresa.id`, `categoria.id`)
  - `PUT /api/productos/{id}`
  - `DELETE /api/productos/{id}`

- Almacenes
  - `GET /api/almacenes/sucursal/{idSucursal}`
  - `GET /api/almacenes/empresa/{idEmpresa}`
  - `POST /api/almacenes` (requiere `sucursal.id`)
  - `PUT /api/almacenes/{id}`
  - `DELETE /api/almacenes/{id}`

- Stock
  - `GET /api/stock/producto/{idProducto}`
  - `GET /api/stock/almacen/{idAlmacen}`
  - `POST /api/stock/ajuste` (crea/actualiza el stock unificando producto+almacén)

### Modelos de datos relevantes

- Producto: `nombre`, `precioVenta`, `precioCompra`, `categoria`, `codigoBarras`, `codigoInterno`, `empresa`, `seVendePor`, `manejaInventarios`, `manejaMultiprecios`.
- Almacen: `sucursal`, `fechaCreacion` (auto), `eliminar`, `nombre`, `defecto`.
- Stock: `almacen`, `producto`, `cantidad`, `stockMinimo`, `ubicacion`.

---

## 3) Referencias a SQL (Supabase → MySQL)

- Archivo base: `Backend/tablas.sql` — definición de tablas.
- Datos de ejemplo: `Backend/inserts.sql` — incluye usuario admin, empresa, sucursal, almacén, productos y stock.
- Funciones/Triggers de Supabase que guían la migración: `Backend/funciones y trigers supabase para migrar a mysql.sql`.
  - Validaciones a replicar en Java (ejemplos):
    - `insertarcategorias`, `editarcategorias` (evitar duplicados por nombre+empresa).
    - `insertarclientesproveedores`, `editarclientesproveedores` (unicidad por documento/nombre).
    - `incrementarstock`, `reducirstock` (trasladado a `POST /api/stock/ajuste` con cálculo en el servicio/controlador).
    - `generar_nro_comprobante`, `confirmar_venta` (para el bloque de Ventas/Comprobantes).

---

## 4) Cómo probar rápidamente

1) Backend
```powershell
Get-Process -Name java -ErrorAction SilentlyContinue | Stop-Process -Force
cd C:\Users\LSanchez01\PROYECTO_TIENDA_CHINA\Backend
.\u0067radlew.bat bootRun
```

2) Login y token (PowerShell)
```powershell
$base = "http://localhost:8080"
$loginBody = @{ correo = "admin@tienda.com"; password = "123" } | ConvertTo-Json
$resp = Invoke-RestMethod -Method Post -Uri "$base/api/auth/login" -Body $loginBody -ContentType "application/json"
$token = $resp.token
$headers = @{ Authorization = "Bearer $token" }
```

3) Productos (API)
```powershell
# Crear
$body = @{ nombre="Galletas"; precioVenta=2.5; precioCompra=1.2; empresa=@{id=1}; categoria=@{id=1}; seVendePor="UNIDAD"; manejaInventarios=$true; manejaMultiprecios=$false } | ConvertTo-Json -Depth 5
Invoke-RestMethod -Method Post -Uri "$base/api/productos" -Headers $headers -Body $body -ContentType "application/json"

# Listar
Invoke-RestMethod -Method Get -Uri "$base/api/productos/empresa/1" -Headers $headers
```

4) Almacenes (API)
```powershell
Invoke-RestMethod -Method Get -Uri "$base/api/almacenes/empresa/1" -Headers $headers
```

### Problemas técnicos resueltos:
- ✅ CORS y preflight (OPTIONS) causaban bloqueos; configurado correctamente.
- ✅ CSRF deshabilitado para API stateless.
- ✅ Desajustes de payload entre front (nombres con `_`) y backend (camelCase) resueltos mapeando en stores.
- ✅ Puerto 8080 en uso: detener procesos Java antes de `bootRun`.
- ✅ `fecha_creacion` de `almacen` y `fechaRegistro` de `cliente_proveedor` se completan automáticamente (`@PrePersist`).

### **CRÍTICO - Errores de nomenclatura identificados y corregidos (2026-01-17):**

#### **Problema 1: snake_case vs camelCase**
- **Causa:** Frontend hereda nombres de Supabase (snake_case), backend usa Java (camelCase).
- **Ejemplos encontrados:**
  * `precio_venta` → `precioVenta`
  * `precio_compra` → `precioCompra`
  * `tipo_movimiento` → `tipoMovimiento`
  * `identificador_nacional` → `identificadorNacional`
  * `identificador_fiscal` → `identificadorFiscal`
  * `codigo_barras` → `codigoBarras`
  * `maneja_inventarios` → `manejaInventarios`
- **Solución:** Se auditaron y corrigieron TODOS los archivos de tablas y formularios que usan datos del backend.
- **Archivos afectados:** 10 archivos corregidos (ver sección 9 en Historia).
- **IMPORTANTE PARA PRÓXIMA IA:** Al migrar un nuevo módulo, SIEMPRE verifica que los `accessorKey` en tablas y `defaultValue` en formularios usen camelCase, NO snake_case.

#### **Problema 2: Tipos en minúsculas vs mayúsculas**
- **Causa:** Supabase permitía "cliente"/"proveedor" en minúsculas, backend necesita "CLIENTE"/"PROVEEDOR" en mayúsculas.
- **Solución:** 
  * Backend valida con `.toUpperCase()`
  * Frontend convierte a mayúsculas antes de enviar: `tipo.toUpperCase()`
  * Páginas separadasactualizado (siguientes bloques)

### ✅ COMPLETADO (2026-01-17)

**Prioridad 2 — Movimientos de Stock (Kardex)** ✅ COMPLETADO
- ✅ Backend: Entidad `MovimientoStock` + `MovimientoStockRepository` + `MovimientoStockService` + `MovimientoStockController` (7 endpoints)
- ✅ Actualización automática de stock al registrar movimiento
- ✅ Frontend: `MovStockStore.jsx` migrado completamente
- ✅ Funciones SQL migradas: `incrementarstock`, `reducirstock` → lógica en `MovimientoStockService`
- ✅ Páginas: Inventario y Kardex funcionando
- ✅ Pruebas: Registro manual, consulta por producto, consulta por almacén con fechas
- 📄 Documentación: `PRIORIDAD_2_MOVIMIENTOS_STOCK.md` con casos de prueba

**Prioridad 3 — Clientes/Proveedores** ✅ COMPLETADO
- ✅ Backend: Entidad `ClienteProveedor` + `ClienteProveedorRepository` (10 queries) + `ClienteProveedorService` + `ClienteProveedorController` (9 endpoints)
- ✅ Validaciones migradas: `insertarclientesproveedores`, `editarclientesproveedores`
  * No duplicar nombre+tipo
  * No duplicar identificadorFiscal+tipo
  * No duplicar identificadorNacional+tipo
- ✅ Frontend: `ClientesProveedoresStore.jsx` migrado completamente
- ✅ Páginas separadas: `/clientes` y `/proveedores` filtran automáticamente por tipo
- ✅ Formulario: Muestra errores de validación del backend al usuario
- ✅ Corrección: Tipo en mayúsculas (CLIENTE/PROVEEDOR/AMBOS)
- 📄 Documentación: `PRIORIDAD_3_COMPLETADA.md` con casos de prueba

**Auditoría y Correcciones** ✅ COMPLETADO
- ✅ Revisión exhaustiva de todos los módulos migrados
- ✅ Corrección de 10 archivos con problemas de nomenclatura
- ✅ Verificación de coherencia entre backend (camelCase) y frontend
- ✅ Todos los módulos migrados 100% coherentes

---

### 📋 PENDIENTE (Próximas prioridades)

**Prioridad 1 — Categorías** (Config → Categorías) 🔴 SIGUIENTE
- Backend
  - ✅ Entidad `Categoria` ya existe
  - ❌ Falta: Controlador con endpoints CRUD `/api/categorias`
  - ❌ Falta: Servicio con validaciones de duplicados por nombre+empresa
  - **Funciones SQL a migrar:**
    * `insertarcategorias` (línea 1-20 en funciones.sql) - Evitar duplicado nombre+empresa
    * `editarcategorias` (línea 21-40) - Evitar duplicado nombre+empresa excluyendo ID actual
- Frontend
  - ❌ `CategoriasStore.jsx` aún usa Supabase
  - ❌ Cambiar a Axios/backend
  - ❌ Adaptar manejo de errores (sin emojis, mensajes claros)
- Pruebas
  - Alta/edición con colisiones de nombre
  - Verificar que color e icono se guarden correctamente
- **IMPORTANTE:** Usar camelCase en toda la comunicación. Nombres de validación en español sin emojis.

**Prioridad 4 — Sucursales y Cajas** 🟡ri "$base/api/stock/producto/1" -Headers $headers
```

6) Frontend (UI)
- Login con admin.
- Configuración → Almacenes: crear/editar/eliminar. Validar `fecha_creacion` visible.
- Configuración → Productos: registrar producto (con opción de controlar stock). Si controla stock, seleccionar Sucursal y Almacén para crear stock inicial.
- Inventario: buscar producto y ver movimientos (historial actual sigue en Supabase; el stock consolidado está en backend).

---

## 5) Problemas resueltos y aprendizajes

- CORS y preflight (OPTIONS) causaban bloqueos; se configuró adecuadamente.
- CSRF deshabilitado para API stateless.
- Desajustes de payload entre front (nombres con `_`) y backend (camelCase) resueltos mapeando en stores.
- Puerto 
  - Entidades ya existen: `Sucursal`, `Caja`, `AsignacionSucursal`
  - ❌ Falta: Controladores CRUD
  - ❌ Falta: Endpoint para `mostrarsucursalesasignadas` (sucursales por usuario)
  Backend
  - ❌ Falta: Entidades `Venta`, `DetalleVenta`
  - ❌ Falta: Entidad `Serializacion` para comprobantes
  - ❌ Falta: Controlador de ventas
  - **Funciones SQL CRÍTICAS a migrar:**
    * `generar_nro_comprobante` - Genera correlativo de comprobante
    * `confirmar_venta` - Procesa venta completa:
      - Descuenta stock de productos
      - Genera movimientos de stock (uno por cada producto vendido)
      - Actualiza tabla de ventas
      - Registra movimientos de caja
    * `eliminar_ventas_incompletas` - Limpia ventas pendientes antiguas
- Frontend
  - Página POS es compleja, requiere atención especial
  - ⚠️ Usa `nro_comprobante` - cambiar a `nroComprobante`
  - ⚠️ Usa `id_cierre_caja` - cambiar a `idCierreCaja`

**Prioridad 8 — Movimientos de Caja y Cierres** 🟡
- Backend
  - ❌ Falta: Entidades `MovimientoCaja`, `CierreCaja`
  - ❌ Falta: Controladores CRUD
  - **Funciones SQL a revisar:**
    * Validaciones de cierre de caja
    * Cálculo de totales por método de pago
- Frontend
  - ❌ Varios stores usan Supabase para movimientos de caja
  - ⚠️ Usar `fechaMovimiento` no `fecha_movimiento`
  - ⚠️ Usar `tipoMovimiento` no `tipo_movimiento`

**Prioridad 9 — Dashboard/Reportes** 🟢
- Backend
  - Queries de agregación (ventas por fecha, top productos, métodos de pago)
  - Usar consultas nativas/JPQL
  - Considerar DTOs para respuestas optimizadas
- Frontend
  - Migrar stores de reportes

**Prioridad 10 — Usuarios, Roles y Permisos** 🟢
- Backend parcialmente implementado (login funciona)
- ❌ Falta: CRUD completo de usuarios
- ❌ Falta: Gestión de roles y permisos
- Frontend usa Supabase para gestión de usuarios

---

### 🔧 Tareas transversales
- ✅ Respuestas de error coherentes (sin emojis, español claro)
- ❌ Tests básicos de repos y controladores
- ❌8) Checklist de verificación para siguiente agente

### Estado actual (2026-01-17):

**✅ FUNCIONANDO:**
- [x] Backend en 8080 con `bootRun` sin puertos en uso
- [x] Login funcionando; `Authorization: Bearer` llega al backend
- [x] Productos CRUD por empresa y búsqueda `q` operativos
- [x] Almacenes por empresa/sucursal funcionando; `fechaCreacion` visible
- [x] Stock con `/api/stock/ajuste` consolida cantidades correctamente
- [x] **NUEVO:** Movimientos de Stock (Kardex) completamente funcional
- [x] **NUEVO:** Clientes/Proveedores con validaciones completas
- [x] Frontend: Productos, Almacenes, Stock, Movimientos, Clientes/Proveedores usan backend
- [x] Nomenclatura camelCase verificada y corregida en todos los módulos migrados

**⏳ SIGUIENTE TAREA:**
- [ ] Categorías: Crear controlador y servicio con validaciones
- [ ] Migrar `CategoriasStore.jsx` de Supabase a backend
- [ ] Verificar que use camelCase y mensajes sin emojis

**📋 PLAN INMEDIATO:**
1. Implementar backend de Categorías (Prioridad 1)
2. Migrar frontend de Categorías
3. Continuar con Sucursales/Cajas (Prioridad 4)
4. Luego Métodos de Pago e Impresoras
5. Finalmente el módulo crítico de Ventas (POS)`
   - Valida: nombre+tipo, identificadorFiscal+tipo, identificadorNacional+tipo
   - No permite duplicados en misma empresa

2. **`editarclientesproveedores`** → `ClienteProveedorService.editar()`
   - Mismas validaciones excluyendo ID actual
   - Evita colisiones al editar

3. **`incrementarstock`** → `MovimientoStockService.registrarMovimiento()` (tipo ENTRADA/AJUSTE_ENTRADA)
   - Actualiza stock automáticamente al registrar movimiento
   - Suma cantidad al stock existente

4. **`reducirstock`** → `MovimientoStockService.registrarMovimiento()` (tipo SALIDA/AJUSTE_SALIDA)
   - Actualiza stock automáticamente al registrar movimiento  
   - Resta cantidad del stock existente

### ❌ PENDIENTES DE MIGRAR

5. **`insertarcategorias`** - Valida nombre+empresa único
   - **Acción:** Crear `CategoriaService` con validación
 en el código

### Backend (Java/Spring Boot)
- **Seguridad:** `Backend/src/main/java/tienda/posbackend/security/`
  - `SecurityConfig.java` - Configuración de CORS, CSRF, JWT
  - `JwtAuthFilter.java` - Filtro de autenticación
  - `JwtUtil.java` - Utilidades de JWT

- **Controladores implementados:**
  - `AuthController.java` - Login y obtener usuario actual
  - `ProductoController.java` - CRUD de productos ✅
  - `AlmacenController.java` - CRUD de almacenes ✅
  - `StockController.java` - Gestión de stock ✅
  - `MovimientoStockController.java` - Kardex/historial ✅ NUEVO
  - `ClienteProveedorController.java` - Clientes y proveedores ✅ NUEVO
  - `EmpresaController.java` - Empresa del usuario

- **Servicios implementados:**
  - `ProductoService.java` (si existe, o lógica en controlador)
  - `MovimientoStockService.java` - Lógica de movimientos y actualización de stock ✅
  - `ClienteProveedorService.java` - Validaciones de duplicados ✅

- **Entidades implementadas:**
  - `Producto.java` ✅
  - `Almacen.java` ✅
  - `Stock.java` ✅
  - `MovimientoStock.java` ✅ NUEVO
  - `ClienteProveedor.java` ✅ NUEVO
  - `Categoria.java` ✅ (sin controlador aún)
  - `Sucursal.java`, `Caja.java`, `AsignacionSucursal.java` (sin controladores)
  - `Usuario.java`, `Rol.java`, `Permiso.java`, `Modulo.java` (parcialmente implementado)

### Frontend (React/Zustand/Axios)
- **Stores migrados a backend:**
  - `ProductosStore.jsx` ✅
  - `AlmacenesStore.jsx` ✅
  - `StockStore.jsx` ✅
  - `MovStockStore.jsx` ✅ NUEVO
  - `ClientesProveedoresStore.jsx` ✅ NUEVO

- **Stores pendientes (aún usan Supabase):**
  - `CategoriasStore.jsx` ❌ (siguiente prioridad)
  - `SucursalesStore.jsx` ❌
  - `CajasStore.jsx` ❌
  - `MetodosPagoStore.jsx` ❌
  - `ImpresorasStore.jsx` ❌
  - `VentasStore.jsx` ❌
  - `DetalleVentasStore.jsx` ❌
  - `MovCajaStore.jsx` ❌
  - `CierreCajaStore.jsx` ❌

- **Componentes corregidos (nomenclatura):**
  - `TablaProductos.jsx` ✅
  - `TablaInventarios.jsx` ✅
  - `TablaClientesProveedores.jsx` ✅
  - `RegistrarProductos.jsx` ✅
  - `RegistrarInventario.jsx` ✅
  - `RegistrarClientesProveedores.jsx` ✅
  - `HeaderPos.jsx` ✅
  - `SelectAlmacenModal.jsx` ✅
  - `MovStockStack.jsx` ✅
  - `CartVentasStoreTemporal.jsx` ✅

### SQL y Datos
- `Backend/tablas.sql` - Definiciones de tablas MySQL
- `Backend/inserts.sql` - Datos iniciales (admin, empresa, productos, etc.)
- `Backend/funciones y trigers supabase para migrar a mysql.sql` - Referencia de validaciones a migrar

### Documentación
- `Backend/README_MIGRACION_CONTEXTO.md` - Este archivo (contexto general)
- `PRIORIDAD_2_MOVIMIENTOS_STOCK.md` - Documentación de Movimientos de Stock ✅
- `PRIORIDAD_3_COMPLETADA.md` - Documentación de Clientes/Proveedores ✅

---

## 10) Guía para la próxima IA (IMPORTANTE - LEER COMPLETO)

### 🎯 Convenciones establecidas y OBLIGATORIAS:

#### **1. Nomenclatura (MUY IMPORTANTE)**
- **Backend (Java):** SIEMPRE usa **camelCase** para nombres de campos
  - Ejemplos: `precioVenta`, `tipoMovimiento`, `identificadorNacional`, `fechaRegistro`
  - NUNCA: `precio_venta`, `tipo_movimiento`, `identificador_nacional`, `fecha_registro`

- **Frontend (React):**
  - **Tablas:** `accessorKey` DEBE usar camelCase (igual que backend)
    ```jsx
    // ✅ CORRECTO
    accessorKey: "precioVenta"
    
    // ❌ INCORRECTO
    accessorKey: "precio_venta"
    ```
  
  - **Formularios:** `defaultValue` DEBE usar camelCase
    ```jsx
    // ✅ CORRECTO
    defaultValue={dataSelect.precioVenta}
    
    // ❌ INCORRECTO
    defaultValue={dataSelect.precio_venta}
    ```
  
  - **Stores:** Al adaptar payload para backend, convertir de snake_case (convención interna) a camelCase:
    ```javascript
    // ✅ CORRECTO - Conversión en store
    const payload = {
      nombres: p._nombres ?? p.nombres,
      precioVenta: p._precio_venta ?? p.precio_venta,
      tipoMovimiento: (p._tipo ?? p.tipo).toUpperCase()
    };
    ```

#### **2. Validación de tipos y estados**
- **Tipos que requieren MAYÚSCULAS:**
  - `tipo` en ClienteProveedor: "CLIENTE", "PROVEEDOR", "AMBOS" (NUNCA minúsculas)
  - `tipoMovimiento`: "ENTRADA", "SALIDA", "AJUSTE_ENTRADA", "AJUSTE_SALIDA"
  - `seVendePor`: "UNIDAD", "GRANEL"
  
- **Convertir en frontend ANTES de enviar:**
  ```javascript
  tipo: (p._tipo ?? p.tipo).toUpperCase()
  ```

#### **3. Mensajes de error**
- **Backend:** Devolver mensajes en **español**, **sin emojis**, claros y descriptivos
  ```java
  // ✅ CORRECTO
  throw new RuntimeException("Ya existe un CLIENTE con el nombre 'Juan Pérez'");
  
  // ❌ INCORRECTO
  throw new RuntimeException("❌ Ya existe un cliente con el nombre juan perez");
  ```

- **Frontend:** Mostrar el mensaje del backend directamente al usuario (en un cuadro de error, toast o alerta)

#### **4. Estructura de respuestas de error**
- **Backend debe devolver:**
  ```json
  {
    "error": true,
    "mensaje": "Ya existe una CATEGORIA con el nombre 'Bebidas' en esta empresa"
  }
  ```
- **Status codes:**
  - 400 BAD_REQUEST - Validaciones fallidas
  - 404 NOT_FOUND - Recurso no encontrado
  - 500 INTERNAL_SERVER_ERROR - Errores del servidor

#### **5. IDs en ediciones (PUT/PATCH)**
- El ID va como **path parameter**, NO en el body:
  ```java
  // ✅ CORRECTO
  @PutMapping("/{id}")
  public ResponseEntity<Entidad> editar(@PathVariable Long id, @RequestBody Entidad details)
  
  // Frontend debe enviar:
  await api.put(`/recurso/${p.id}`, payload);
  ```

### 🚨 Errores comunes a EVITAR:

1. **NO usar snake_case en `accessorKey` de tablas**
   - Síntoma: Columnas vacías en la tabla
   - Causa: Backend devuelve `precioVenta`, tabla busca `precio_venta`
   - Solución: Cambiar todos los `accessorKey` a camelCase

2. **NO enviar tipos en minúsculas**
   - Síntoma: Errores de validación, registros no se filtran correctamente
   - Causa: Backend espera "CLIENTE", frontend envía "cliente"
   - Solución: Usar `.toUpperCase()` antes de enviar

3. **NO usar emojis en mensajes del backend**
   - Síntoma: Problemas de encoding, mensajes mal formateados
   - Causa: Emojis en strings Java
   - Solución: Solo texto plano en español

4. **NO olvidar validaciones de Supabase al migrar**
   - Síntoma: Se permiten duplicados o datos inválidos
   - Causa: Funciones SQL no replicadas en Java
   - Solución: Revisar archivo `funciones y trigers supabase para migrar a mysql.sql`

5. **NO mezclar componentes controlados con react-hook-form**
   - Síntoma: Inputs no muestran valores o no se actualizan
   - Causa: Usar `value` + `onChange` junto con `{...register()}`
   - Solución: Usar solo `defaultValue` con `{...register()}`

### 📝 Proceso recomendado para migrar un módulo:

1. **Revisar funciones SQL** en `funciones y trigers supabase para migrar a mysql.sql`
   - Identificar validaciones (duplicados, unicidad, etc.)
   - Identificar lógica de negocio

2. **Backend:**
   - Verificar si existe Entidad (revisar `Backend/src/main/java/tienda/posbackend/entities/`)
   - Crear Repository con queries necesarios
   - Crear Service con validaciones (replicar funciones SQL)
   - Crear Controller con endpoints CRUD estándar
   - **Usar camelCase en TODOS los campos**
   - **Mensajes de error en español sin emojis**

3. **Frontend:**
   - Identificar Store actual (buscar en `Fronted/src/store/`)
   - Reemplazar llamadas a Supabase por llamadas Axios
   - Adaptar payload de snake_case (interno) a camelCase (backend)
   - Actualizar manejo de errores (mostrar mensaje del backend)
   - **Convertir tipos a mayúsculas antes de enviar**

4. **Verificar tablas y formularios:**
   - Buscar todos los archivos que usan el módulo
   - Verificar `accessorKey` en tablas (debe ser camelCase)
   - Verificar `defaultValue` en formularios (debe ser camelCase)
   - Probar crear, editar, eliminar y buscar

5. **Documentar:**
   - Crear archivo `PRIORIDAD_X_NOMBRE_MODULO.md` con:
     * Endpoints implementados
     * Casos de prueba (PowerShell)
     * Notas importantes
     * Funciones SQL migradas

### 🔍 Comandos útiles para verificar:

```powershell
# Buscar usos de snake_case en tablas
Get-ChildItem -Recurse -Filter "Tabla*.jsx" | Select-String "accessorKey.*_"

# Buscar usos de snake_case en formularios
Get-ChildItem -Recurse -Filter "Registrar*.jsx" | Select-String "defaultValue.*\._"

# Buscar stores que usan Supabase
Get-ChildItem -Path "Fronted/src/store" -Filter "*Store.jsx" | Select-String "from.*supabase"
```

### ⚡ Inicio rápido para próxima sesión:

```powershell
# 1. Iniciar backend
cd C:\Users\alons\Documents\GitHub\PROYECTO_TIENDA_CHINA\Backend
.\gradlew bootRun

# 2. Obtener token (en otra terminal)
$base = "http://localhost:8080"
$loginBody = @{ correo = "admin@tienda.com"; password = "123" } | ConvertTo-Json
$resp = Invoke-RestMethod -Method Post -Uri "$base/api/auth/login" -Body $loginBody -ContentType "application/json"
$token = $resp.token
$headers = @{ Authorization = "Bearer $token" }

# 3. Probar módulos migrados
Invoke-RestMethod -Method Get -Uri "$base/api/productos/empresa/1" -Headers $headers
Invoke-RestMethod -Method Get -Uri "$base/api/movimientos-stock/producto/1" -Headers $headers
Invoke-RestMethod -Method Get -Uri "$base/api/clientes-proveedores/empresa/1/tipo/CLIENTE" -Headers $headers
```

---

## 11) Notas finales

- ✅ Tres módulos completamente funcionales: Productos, Movimientos de Stock, Clientes/Proveedores
- ✅ Convenciones de nomenclatura establecidas y documentadas
- ✅ Sistema de validaciones funcionando (replica funciones de Supabase)
- ✅ Manejo de errores consistente y en español
- 📋 Siguiente paso: Implementar Categorías (backend simple, solo validar nombre+empresa único)
- 🔴 Módulo crítico pendiente: Ventas/POS (requiere implementar varios módulos previos)
- 💾 Base de datos con datos de prueba lista para usar
- 🔐 Autenticación JWT funcionando correctamente

**Si encuentras un error de nomenclatura (campos vacíos en tablas), primero busca `accessorKey` o `defaultValue` con snake_case y corrígelos a camelCase antes de buscar otros problemas.**
   - **Acción:** Crear tarea programada o endpoint de limpieza

10. **Otras funciones menores** por revisar en `funciones y trigers supabase para migrar a mysql.sql`
- Backend
  - ❌ Falta: Entidad `Impresora`
  - ❌ Falta: Controlador CRUD
  - **Nota:** En SQL usa `nombre_pc` (snake_case) - cambiar a `nombrePc` (camelCase)
- Frontend
  - ❌ Migrar stores de impresoras
  - ⚠️ Frontend usa `pc_name` - cambiar a `nombrePc`

**Prioridad 7 — Ventas (POS)** 🔴 CRÍTICO

## 6) Plan de acción (siguientes bloques)

Prioridad 1 — Categorías (Config → Categorías)
- Backend
  - Endpoints CRUD `/api/categorias`.
  - Validaciones de duplicados por nombre+empresa (basado en `insertarcategorias` y `editarcategorias`).
- Frontend
  - Cambiar `crudCategorias` a Axios/backend.
  - Ajustar `CategoriasStore` y tablas para nuevos mensajes de error.
- Pruebas
  - Alta/edición con colisiones de nombre.

Prioridad 2 — Historial de Movimientos de Stock (Kardex)
- Backend
  - Entidad `MovimientoStock` + repositorio + controlador (`/api/movstock` con filtros por producto/fecha/almacén).
  - Registrar movimiento al hacer `POST /api/stock/ajuste`.
- Frontend
  - Migrar `crudMovStock` a backend.

Prioridad 3 — Clientes/Proveedores
- Backend: CRUD con validaciones de unicidad (documento y nombre) según funciones SQL (`insertarclientesproveedores`, `editarclientesproveedores`).
- Frontend: sustituir supabase por Axios y manejar errores del backend.

Prioridad 4 — Sucursales y Cajas
- Backend: CRUD de sucursales y cajas, y asignaciones; exponer `mostrarsucursalesasignadas` equivalente.
- Frontend: migrar `crudSucursales` y `crudCajas`.

Prioridad 5 — Ventas (POS)
- Serialización: `generar_nro_comprobante` y `serializacion_comprobantes`.
- Confirmar venta: endpoint `confirmar_venta` que:
  - Descuente stock.
  - Genere movimiento de stock en historial.
  - Registre pagos y mueva caja.

Prioridad 6 — Dashboard/Reportes
- Portar queries de agregación (ventas por fecha, top productos, métodos de pago), vía consultas nativas/JPQL.

Prioridad 7 — Impresoras y Ticket
- CRUD de impresoras y configuración de ticket; endpoints para previsualización.

Tareas transversales
- Respuestas de error coherentes (mensajes y códigos).
- Tests básicos de repos y controladores.
- Documentación de endpoints (OpenAPI opcional).

---

## 7) Checklist de verificación para siguiente agente

- [ ] Backend en 8080 con `bootRun` sin puertos en uso.
- [ ] Login funcionando; `Authorization: Bearer` llega al backend.
- [ ] Productos CRUD por empresa y búsqueda `q` operativos.
- [ ] Almacenes por empresa/sucursal funcionando; `fecha_creacion` visible.
- [ ] Stock con `/api/stock/ajuste` consolida cantidades correctamente.
- [ ] Front: stores de Productos/Almacenes/Stock apuntan a backend (Axios).
- [ ] Pendiente migrar historial de movimientos a backend.
- [ ] Siguiente bloque: Categorías con validaciones (según funciones SQL).

---

## 8) Credenciales y datos

- Usuario admin: `admin@tienda.com` / `123` (ver `Backend/inserts.sql`).
- Base de datos: datos iniciales de empresa, sucursal, almacén y productos.

---

## 9) Ubicaciones clave

- Seguridad: `Backend/src/main/java/tienda/posbackend/security/SecurityConfig.java`, `JwtAuthFilter.java`.
- Auth: `Backend/src/main/java/tienda/posbackend/controllers/AuthController.java`.
- Productos: `Backend/src/main/java/tienda/posbackend/controllers/ProductoController.java`.
- Almacenes: `Backend/src/main/java/tienda/posbackend/controllers/AlmacenController.java`.
- Stock: `Backend/src/main/java/tienda/posbackend/controllers/StockController.java`.
- SQL: `Backend/tablas.sql`, `Backend/inserts.sql`, `Backend/funciones y trigers supabase para migrar a mysql.sql`.

---

## 10) Notas finales

- Si al usar PowerShell obtienes 403, valida que el encabezado `Authorization` tenga el token y que el backend corra con los últimos cambios de seguridad.
- La UI (Axios) incluye el token automáticamente y ya permitió operar Productos/Almacenes/Stock.
