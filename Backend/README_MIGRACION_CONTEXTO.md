# Contexto de Migración y Plan de Acción

Este documento resume el estado actual del backend y frontend tras rearmar el proyecto desde cero, verificando el login e implementando progresivamente módulos críticos (permisos, productos, almacenes y stock). También incluye un plan de acción para continuar la migración desde Supabase a MySQL/Spring Boot.

Fecha: 2026-01-17
Rama: `backend_bueno`

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

5) Stock (API)
```powershell
# Ajustar stock (crea/actualiza para producto+almacén)
$ajuste = @{ almacen=@{id=1}; producto=@{id=1}; cantidad=25; stockMinimo=5; ubicacion="Estante Z" } | ConvertTo-Json -Depth 5
Invoke-RestMethod -Method Post -Uri "$base/api/stock/ajuste" -Headers $headers -Body $ajuste -ContentType "application/json"

# Consultar por producto
Invoke-RestMethod -Method Get -Uri "$base/api/stock/producto/1" -Headers $headers
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
- Puerto 8080 en uso: detener procesos Java antes de `bootRun`.
- `fecha_creacion` de `almacen` ahora se completa automáticamente (`@PrePersist`).

---

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
