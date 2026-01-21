# Sesión 19 Enero 2026 - Módulo Productos

## 📋 Resumen de la Sesión

**Objetivo Principal:** Resolver problemas de eliminación de productos y mostrar stock en la tabla de productos.

**Estado:** ✅ Completado

---

## 🔧 Problemas Resueltos

### 1. Error 500 al Eliminar Productos ❌➜✅

**Problema:**
```
DELETE http://localhost:8080/api/productos/6 500 (Internal Server Error)
```

**Causa Raíz:**
- La tabla `stock` tiene una foreign key que referencia `productos(id)`
- MySQL bloqueaba la eliminación por constraint de integridad referencial
- Similar al problema que tuvimos con usuarios y permisos

**Tablas que referencian productos:**
1. ✅ `stock` - RESUELTO
2. ⚠️ `detalle_venta` - Pendiente (no crítico por ahora)
3. ⚠️ `kardex` - Pendiente (no crítico por ahora)
4. ⚠️ `movimientos_stock` - Pendiente (no crítico por ahora)
5. ⚠️ `multiprecios` - Pendiente (no crítico por ahora)

**Solución Implementada:**
- Eliminar primero los registros de stock antes de eliminar el producto
- Usar `@Transactional` para garantizar atomicidad

---

### 2. No se Mostraba el Stock en la Tabla ❌➜✅

**Problema:**
- La tabla de productos no mostraba cuánto stock disponible había

**Solución:**
- Campo transient `stockTotal` en la entidad Producto
- Cálculo de suma de stock de todos los almacenes en el backend
- Nueva columna "Stock" en la tabla del frontend

---

## 📂 Archivos Modificados

### Backend

#### 1. `Backend/src/main/java/tienda/posbackend/repositories/StockRepository.java`
```java
// Agregado método para eliminar stock por producto
void deleteByProductoId(Long idProducto);
```

#### 2. `Backend/src/main/java/tienda/posbackend/entities/Producto.java`
```java
// Campo transient para mostrar stock total (no se guarda en BD)
@Transient
private BigDecimal stockTotal;
```

#### 3. `Backend/src/main/java/tienda/posbackend/controllers/ProductoController.java`

**Imports agregados:**
```java
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.entities.Stock;
import java.math.BigDecimal;
```

**Inyección de dependencia:**
```java
@Autowired
private tienda.posbackend.repositories.StockRepository stockRepository;
```

**Método eliminar modificado:**
```java
@DeleteMapping("/{id}")
@Transactional
public ResponseEntity<Void> eliminar(@PathVariable Long id) {
    // Verificar que el producto existe
    if (!productoRepository.existsById(id)) {
        throw new RuntimeException("Producto no encontrado");
    }
    
    // Eliminar primero el stock relacionado
    stockRepository.deleteByProductoId(id);
    
    // Luego eliminar el producto
    productoRepository.deleteById(id);
    return ResponseEntity.ok().build();
}
```

**Método listarPorEmpresa modificado:**
```java
@GetMapping("/empresa/{empresaId}")
public List<Producto> listarPorEmpresa(@PathVariable Long empresaId) {
    List<Producto> productos = productoRepository.findByEmpresaId(empresaId);
    // Calcular stock total para cada producto
    for (Producto producto : productos) {
        List<Stock> stocks = stockRepository.findByProductoId(producto.getId());
        BigDecimal total = stocks.stream()
            .map(Stock::getStock)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        producto.setStockTotal(total);
    }
    return productos;
}
```

### Frontend

#### 4. `Fronted/src/components/organismos/tablas/TablaProductos.jsx`

**Nueva columna agregada (después de "Inventarios", antes de "acciones"):**
```jsx
{
  accessorKey: "stockTotal",
  header: "Stock",
  cell: (info) => (
    <td data-title="Stock" className="ContentCell">
      <span>{info.getValue() ?? 0}</span>
    </td>
  ),
  enableColumnFilter: true,
  filterFn: (row, columnId, filterStatuses) => {
    if (filterStatuses.length === 0) return true;
    const status = row.getValue(columnId);
    return filterStatuses.includes(status?.id);
  },
},
```

---

## 🎯 Estado Actual del Sistema

### ✅ Funcionalidades Verificadas
- [x] Crear productos (POST /api/productos)
- [x] Editar productos (PUT /api/productos/{id})
- [x] Eliminar productos (DELETE /api/productos/{id}) - **ARREGLADO HOY**
- [x] Listar productos por empresa (GET /api/productos/empresa/{empresaId})
- [x] Mostrar stock total en tabla - **AGREGADO HOY**

### 🔄 Comportamiento de Eliminación
1. Usuario hace clic en eliminar
2. SweetAlert2 pide confirmación
3. Frontend llama a DELETE /api/productos/{id}
4. Backend ejecuta en transacción:
   - Elimina registros de `stock` donde `id_producto` = {id}
   - Elimina el producto de `productos`
5. Frontend refresca la tabla automáticamente

### 📊 Columnas de la Tabla de Productos
| Columna | Origen | Tipo |
|---------|--------|------|
| Descripción | nombre | String |
| P. venta | precioVenta | BigDecimal |
| P. compra | precioCompra | BigDecimal |
| Se vende por | seVendePor | String |
| Inventarios | manejaInventarios | Boolean (checkbox) |
| **Stock** | **stockTotal** (calculado) | **BigDecimal** |
| Acciones | - | Botones editar/eliminar |

---

## ⚠️ Pendientes y Consideraciones

### 1. Otras Foreign Keys Pendientes
Las siguientes tablas también referencian productos pero **NO** fueron manejadas aún:
- `detalle_venta` - Ventas realizadas
- `kardex` - Historial de movimientos
- `movimientos_stock` - Movimientos de inventario
- `multiprecios` - Precios diferenciados

**Recomendación:** 
- Si un producto tiene ventas, NO permitir eliminación (validar en backend)
- O implementar "eliminación lógica" (campo `activo` = false)

### 2. Validaciones Sugeridas
```java
// En ProductoController.eliminar()
// Verificar si tiene ventas
List<DetalleVenta> ventas = detalleVentaRepository.findByProductoId(id);
if (!ventas.isEmpty()) {
    throw new RuntimeException("No se puede eliminar: producto con ventas registradas");
}

// Verificar si tiene movimientos
List<MovimientoStock> movimientos = movimientoStockRepository.findByProductoId(id);
if (!movimientos.isEmpty()) {
    throw new RuntimeException("No se puede eliminar: producto con movimientos de stock");
}
```

### 3. Optimización de Performance
Actualmente el cálculo de stock se hace producto por producto (N+1 queries).

**Mejora sugerida:**
```java
// Usar una sola query con GROUP BY
@Query("SELECT p.id, SUM(s.stock) FROM Stock s JOIN s.producto p WHERE p.empresa.id = :empresaId GROUP BY p.id")
List<Object[]> obtenerStockTotalPorEmpresa(@Param("empresaId") Long empresaId);
```

### 4. Stock en Modo Edición
Actualmente el campo stock solo se muestra en la tabla. Considerar:
- ¿Mostrar stock en el formulario de edición? (read-only)
- ¿Mostrar desglose por almacén?

---

## 🗂️ Estructura Relacionada

### Endpoints de Productos
```
GET    /api/productos/empresa/{empresaId}          - Listar con stock total
GET    /api/productos/{id}                         - Obtener uno
GET    /api/productos/buscar/{empresaId}?q={texto} - Buscar
POST   /api/productos                              - Crear
PUT    /api/productos/{id}                         - Editar
DELETE /api/productos/{id}                         - Eliminar (con stock)
```

### Endpoints de Stock
```
GET  /api/stock/almacen/{idAlmacen}                - Por almacén
GET  /api/stock/producto/{idProducto}              - Por producto (todos los almacenes)
GET  /api/stock/almacen/{idAlmacen}/producto/{idProducto} - Específico
POST /api/stock/ajuste                             - Crear/ajustar
```

### Store Frontend
```javascript
// Fronted/src/store/ProductosStore.jsx
- insertarNuevoProducto()
- editarProductoSeleccionado()
- eliminarProductos()  // Usa mutation de TanStack
- setdataProductosVista()
```

---

## 🔐 Context de Sesiones Anteriores

### Módulo de Usuarios (Completado)
- Backend: Full CRUD con Spring Boot + MySQL
- Frontend: Migrado de Supabase a Axios
- Permisos: Checkboxes funcionales en modo editar
- Seguridad: Super admin (ID 1) protegido de eliminación
- Foreign keys: Permisos se eliminan antes de eliminar usuario

### Módulo de Productos (Hoy)
- CRUD básico ya estaba funcionando
- Problema de foreign keys solucionado
- Campo stock agregado a la tabla

---

## 🚀 Próximos Pasos Sugeridos

### Prioridad Alta
1. ⚠️ **Validar eliminación de productos con ventas**
2. 🔍 **Revisar otros módulos con foreign keys similares:**
   - Categorías (¿pueden eliminarse si tienen productos?)
   - Almacenes (¿pueden eliminarse si tienen stock?)
   - Clientes/Proveedores (¿si tienen ventas/compras?)

### Prioridad Media
3. 📊 **Optimizar consulta de stock total** (evitar N+1)
4. 🎨 **Mejorar visualización de stock:**
   - Color rojo si stock < stock_minimo
   - Badge con cantidad
5. 📝 **Agregar filtros en tabla de productos:**
   - Por categoría
   - Por rango de precios
   - Por stock disponible/agotado

### Prioridad Baja
6. 🗑️ **Implementar eliminación lógica** en lugar de física
7. 📦 **Vista de stock por almacén** en el formulario de producto
8. 📸 **Agregar campo de imagen** para productos

---

## 💾 Base de Datos

### Tabla: productos
```sql
CREATE TABLE productos (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  precio_venta DECIMAL(10,2),
  precio_compra DECIMAL(10,2),
  id_categoria BIGINT,
  codigo_barras VARCHAR(255),
  codigo_interno VARCHAR(255),
  id_empresa BIGINT,
  sevende_por VARCHAR(50),      -- "unidad", "peso", "volumen"
  maneja_inventarios BOOLEAN,
  maneja_multiprecios BOOLEAN,
  FOREIGN KEY (id_categoria) REFERENCES categorias(id),
  FOREIGN KEY (id_empresa) REFERENCES empresas(id)
);
```

### Tabla: stock
```sql
CREATE TABLE stock (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  id_almacen BIGINT NOT NULL,
  id_producto BIGINT,           -- ⚠️ FK a productos
  stock DECIMAL(15,2) DEFAULT 0,
  stock_minimo DECIMAL(15,2) DEFAULT 0,
  ubicacion VARCHAR(255) DEFAULT '-',
  FOREIGN KEY (id_almacen) REFERENCES almacen(id),
  FOREIGN KEY (id_producto) REFERENCES productos(id)  -- ⚠️ Esta causaba el error
);
```

---

## 🔧 Comandos de Desarrollo

### Iniciar Backend
```powershell
cd "d:\PROYECTO_TIENDA_CHINA\Backend"
.\gradlew.bat bootRun
```

### Iniciar Frontend
```powershell
cd "d:\PROYECTO_TIENDA_CHINA\Fronted"
npm run dev
```

### Verificar Estado
- Backend: http://localhost:8080
- Frontend: http://localhost:5173
- Usuario: admin@tienda.com / 123

---

## 📝 Notas Adicionales

### Patrón de Eliminación con Foreign Keys
Este es el patrón que estamos usando en todo el proyecto:

```java
@DeleteMapping("/{id}")
@Transactional
public ResponseEntity<Void> eliminar(@PathVariable Long id) {
    // 1. Validar existencia
    if (!mainRepository.existsById(id)) {
        throw new RuntimeException("Registro no encontrado");
    }
    
    // 2. Eliminar dependencias (en orden correcto)
    dependencia1Repository.deleteByMainId(id);
    dependencia2Repository.deleteByMainId(id);
    
    // 3. Eliminar registro principal
    mainRepository.deleteById(id);
    
    return ResponseEntity.ok().build();
}
```

Aplicado en:
- ✅ Usuarios → Permisos
- ✅ Productos → Stock
- ⚠️ Pendiente: Categorías → Productos
- ⚠️ Pendiente: Almacenes → Stock

---

## 🎯 Resultado Final de Hoy

### Antes
- ❌ Error 500 al eliminar productos
- ❌ No se veía el stock en la tabla

### Después
- ✅ Eliminación funcional con manejo de foreign keys
- ✅ Columna de stock visible con suma de todos los almacenes
- ✅ Transaccionalidad garantizada
- ✅ Validación de existencia antes de eliminar

---

**Fecha:** 19 de enero de 2026  
**Duración:** ~1 hora  
**Archivos modificados:** 4  
**Líneas de código:** ~60  
**Estado del sistema:** ✅ Funcionando correctamente

---

## 📞 Para Continuar en Otro Chat

**Contexto Clave:**
1. Proyecto: Sistema POS (Punto de Venta) con Spring Boot + React
2. Base de datos: MySQL (LT_Sanchez)
3. Patrón: Backend REST API + Frontend React con Zustand + TanStack Query
4. Problema recurrente: Foreign key constraints al eliminar registros
5. Solución estándar: Eliminar dependencias antes de eliminar registro principal
6. Módulos completados: Usuarios, Permisos, Roles, Módulos, Productos (con stock)

**Si necesitas debug:**
- Revisar logs del terminal de backend (puerto 8080)
- Revisar consola del navegador (puerto 5173)
- Verificar tablas en MySQL: `stock`, `productos`, `permisos`, `usuarios`

**Archivos importantes:**
- Backend Controllers: `Backend/src/main/java/tienda/posbackend/controllers/`
- Frontend Store: `Fronted/src/store/`
- Frontend CRUD: `Fronted/src/api/` y `Fronted/src/supabase/`
- Tablas: `Backend/tablas.sql`

¡Éxito en la continuación! 🚀
