# Configuración de Almacén Principal (ID=1)

**Fecha:** 19 de enero de 2026  
**Objetivo:** Simplificar el flujo del POS para usar siempre el almacén principal con ID=1

## 📝 Cambios Realizados

### 1. **Frontend - Store de Almacenes** 
**Archivo:** `Fronted/src/store/AlmacenesStore.jsx`

#### Cambios:
- ✅ **Almacén por defecto:** Configurado con `{ id: 1, nombre: "Almacén Principal" }`
- ✅ **Bloqueo de cambios:** El método `setAlmacenSelectItem` siempre mantiene el almacén con ID=1
- ✅ **Consultas:** Las funciones `mostrarAlmacenesXSucursal` siempre establecen el almacén con ID=1

```javascript
// Antes
almacenSelectItem: [],
setAlmacenSelectItem: (p) => {
  set({ almacenSelectItem: p });
},

// Después
almacenSelectItem: { id: 1, nombre: "Almacén Principal" },
setAlmacenSelectItem: (p) => {
  set({ almacenSelectItem: { id: 1, nombre: "Almacén Principal" } });
},
```

### 2. **Frontend - Header POS**
**Archivo:** `Fronted/src/components/organismos/POSDesign/HeaderPos.jsx`

#### Cambios:
- ✅ **Eliminada validación de almacén:** Ya no se valida si hay almacén seleccionado
- ✅ **Hardcoded ID=1:** En `insertarDVentas`, siempre se usa `_id_almacen: 1`
- ✅ **Imports limpiados:** Eliminadas referencias innecesarias a `useAlmacenesStore`

```javascript
// Antes
if (!almacenSelectItem || !almacenSelectItem.id) {
  toast.error("Por favor selecciona un almacén primero");
  return;
}
_id_almacen: almacenSelectItem.id,

// Después
_id_almacen: 1, // Siempre usar almacén principal
```

### 3. **Frontend - Template POS**
**Archivo:** `Fronted/src/components/templates/POSTemplate.jsx`

#### Cambios:
- ✅ **Consulta no bloqueante:** Ya no se bloquea la carga esperando almacenes
- ✅ **Simplificación:** Removido el estado `isLoadingAlmacenXSucursal`

```javascript
// Antes
const { isLoading: isLoadingAlmacenXSucursal } =
  useMostrarAlmacenesXSucursalQuery();

// Después
useMostrarAlmacenesXSucursalQuery(); // Ya no es crítico
```

### 4. **Frontend - Consultas de Stock**
**Archivo:** `Fronted/src/tanstack/StockStack.jsx`

#### Cambios:
- ✅ **Stock siempre del almacén ID=1:** La consulta `useMostrarStockXAlmacenesYProductoQuery` usa directamente `id_almacen: 1`
- ✅ **Condición enabled simplificada:** Solo valida que exista `productosItemSelect?.id`

```javascript
// Antes
queryKey: ["mostrar Stock XAlmacenes YProducto", {
  id_producto: productosItemSelect?.id,
  id_almacen: almacenSelectItem?.id,
}],
enabled: !!almacenSelectItem,

// Después
queryKey: ["mostrar Stock XAlmacenes YProducto", {
  id_producto: productosItemSelect?.id,
  id_almacen: 1,
}],
enabled: !!productosItemSelect?.id,
```

## 🗄️ Base de Datos

### Almacén Principal Pre-configurado
**Archivo:** `Backend/inserts.sql` (línea 189-193)

```sql
INSERT INTO almacen (id, id_sucursal, nombre, defecto, eliminar) VALUES 
(1, 1, 'Almacén Principal', 1, 1)
ON DUPLICATE KEY UPDATE 
    nombre = VALUES(nombre),
    defecto = VALUES(defecto);
```

✅ **Estado:** El almacén con ID=1 ya existe en la base de datos MySQL

## 📊 Backend - Sin cambios necesarios

El backend ya estaba preparado para trabajar con cualquier almacén por ID:
- ✅ `DetalleVentaService.java`: Maneja correctamente el campo `_id_almacen`
- ✅ `StockRepository.java`: Consultas por `idAlmacen` funcionan correctamente
- ✅ Relaciones de FK intactas

## ✅ Flujo Completo del POS

### 1. **Apertura de Caja**
- Usuario abre caja
- Sistema usa almacén ID=1 automáticamente

### 2. **Agregar Productos**
- Usuario busca o escanea producto
- Sistema inserta detalle venta con `id_almacen: 1`
- Stock se descuenta del almacén principal

### 3. **Consultar Stock**
- Sistema consulta stock del producto en almacén ID=1
- Modal de stock (si se abre) muestra info del almacén principal

### 4. **Cierre de Caja**
- Proceso de cierre normal
- Todos los movimientos relacionados con almacén ID=1

## 🎯 Beneficios

1. **Simplicidad:** No más selección manual de almacén
2. **Consistencia:** Todos los movimientos en un solo almacén
3. **Performance:** Menos consultas y validaciones
4. **UX mejorado:** Flujo más directo sin pasos adicionales
5. **Mantenibilidad:** Código más simple y predecible

## 🔄 Compatibilidad

- ✅ **Backend:** Compatible, acepta cualquier `id_almacen`
- ✅ **Base de datos:** Almacén ID=1 ya existe
- ✅ **Stock:** Sistema de stock funciona con almacén ID=1
- ✅ **Movimientos:** Todos los movimientos rastreables por almacén

## 📝 Notas Importantes

1. **No crear más almacenes:** El sistema está optimizado para usar solo el almacén ID=1
2. **Almacenes existentes:** Si hay otros almacenes, quedan inactivos en el POS
3. **Módulo de configuración:** El módulo de Almacenes sigue funcionando para consultas, pero el POS ignora la selección
4. **Escalabilidad futura:** Si en el futuro se necesitan múltiples almacenes, se puede revertir estos cambios

## 🚀 Estado Actual

✅ **Backend:** En ejecución (puerto 8080)  
✅ **Frontend:** En ejecución (puerto 5174)  
✅ **Base de datos:** MySQL con almacén ID=1 configurado  
✅ **Flujo completo:** Probado y funcional

---

**Autor:** GitHub Copilot  
**Sesión:** 19 de enero de 2026  
**Versión:** 1.0
