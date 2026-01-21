# REPORTE DE ERRORES ENCONTRADOS - DASHBOARD E INVENTARIO

**Fecha**: 20 Enero 2026  
**Problemas Reportados**:
1. ❌ Dashboard no muestra datos
2. ❌ Modal inventario parpadea al guardar

---

## 🔴 PROBLEMA 1: DASHBOARD NO MUESTRA DATOS

### ✅ ANÁLISIS COMPLETO

He revisado TODO el flujo de dashboard (frontend y backend) y encontré **1 ERROR CRÍTICO**:

### ❌ ERROR CRÍTICO: Formato de Fechas Incompatible

**Ubicación**: `Fronted/src/supabase/crudDashboard.jsx`

**Problema**:
El frontend envía fechas en formato `YYYY-MM-DD` (solo fecha), pero el backend espera `LocalDateTime` (fecha + hora) en formato ISO 8601.

**Código Frontend** (líneas 22, 37, 52, 67, 82):
```javascript
const response = await api.get(`/dashboard/resumen/empresa/${p.id_empresa}`, {
  params: {
    fechaInicio: p.fecha_inicio,  // ❌ Envía "2026-01-20" 
    fechaFin: p.fecha_fin          // ❌ Envía "2026-01-20"
  }
});
```

**Código Backend** (DashboardController líneas 39-40):
```java
public ResponseEntity<Map<String, BigDecimal>> resumenVentas(
    @PathVariable Long idEmpresa,
    @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,  // ❌ Espera "2026-01-20T00:00:00"
    @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin) {
```

**Consecuencia**:
- El backend NO puede parsear "2026-01-20" como `LocalDateTime`
- Lanza error 400 Bad Request
- Frontend recibe array vacío `[]` o error
- Dashboard muestra sin datos

---

### 🔧 SOLUCIÓN RECOMENDADA

**Opción 1: Convertir fechas en Frontend (RECOMENDADO)** ✅

Modificar `crudDashboard.jsx` para enviar fechas con hora:

```javascript
// En cada función (ObtenerResumenPorEmpresa, ObtenerTop5, etc.)
const response = await api.get(`/dashboard/resumen/empresa/${p.id_empresa}`, {
  params: {
    fechaInicio: `${p.fecha_inicio}T00:00:00`,  // ✅ Envía "2026-01-20T00:00:00"
    fechaFin: `${p.fecha_fin}T23:59:59`          // ✅ Envía "2026-01-20T23:59:59"
  }
});
```

**Opción 2: Cambiar Backend a LocalDate**

Modificar `DashboardController.java`:
```java
@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio
```

---

### 📊 FLUJO COMPLETO VERIFICADO

**Backend**: ✅ SIN ERRORES
- ✅ DashboardController: Todos los endpoints correctos
- ✅ DashboardService: Lógica correcta con filtros `!isBefore` y `!isAfter` (ya corregidos)
- ✅ Repositories: Funcionan correctamente

**Frontend**: ❌ 1 ERROR
- ❌ crudDashboard.jsx: Formato de fechas incorrecto
- ✅ ReportesStore.jsx: Lógica correcta
- ✅ DashboardStore.jsx: Manejo de fechas correcto
- ✅ Componentes (ChartVentas, CardTotales, etc.): Sin errores

---

## 🟡 PROBLEMA 2: MODAL INVENTARIO PARPADEA

### ✅ ANÁLISIS COMPLETO

He revisado TODO el flujo de inventario y encontré **2 PROBLEMAS**:

### ⚠️ PROBLEMA 1: Invalidación Agresiva de Queries

**Ubicación**: `Fronted/src/tanstack/MovStockStack.jsx` línea 88

**Problema**:
Después de guardar un movimiento de stock, se invalida la query de movimientos:

```javascript
onSuccess: () => {
  toast.success("Registro guardado correctamente");
  queryClient.invalidateQueries(["mostrar movimientos de stock"]);  // ❌ Causa refetch
  resetProductosItemSelect();
},
```

**Consecuencia**:
- Al guardar, se invalida la query
- Esto fuerza un refetch de todos los movimientos
- El componente re-renderiza mientras carga datos
- El modal parpadea durante el refetch

**Solución**: Ya aplicada en commit anterior (reducir invalidaciones)

---

### ⚠️ PROBLEMA 2: Modal No Se Cierra Automáticamente

**Ubicación**: `Fronted/src/tanstack/MovStockStack.jsx` línea 88

**Problema**:
El modal NO se cierra después de guardar exitosamente:

```javascript
onSuccess: () => {
  toast.success("Registro guardado correctamente");
  queryClient.invalidateQueries(["mostrar movimientos de stock"]);
  resetProductosItemSelect();
  // ❌ FALTA: setStateClose(false)
},
```

**Consecuencia**:
- Usuario guarda registro
- Modal permanece abierto
- Usuario ve el modal parpadeando mientras refetch
- Da impresión de que algo falló

---

### 🔧 SOLUCIÓN RECOMENDADA

**Modificar `MovStockStack.jsx` línea 88-91**:

```javascript
onSuccess: () => {
  toast.success("Registro guardado correctamente");
  
  // ✅ Cerrar modal ANTES de invalidar
  setStateClose(false);
  
  // ✅ Invalidar solo si el modal está cerrado
  setTimeout(() => {
    queryClient.invalidateQueries(["mostrar movimientos de stock"]);
  }, 300);
  
  resetProductosItemSelect();
},
```

---

### 📊 FLUJO COMPLETO VERIFICADO

**Backend**: ✅ SIN ERRORES
- ✅ StockController: Endpoint `/ajuste` funciona correctamente
- ✅ MovimientoStockController: Registro de movimientos correcto
- ✅ Lógica de suma/resta stock correcta (ya corregida en commit anterior)

**Frontend**: ⚠️ 2 PROBLEMAS MENORES
- ⚠️ MovStockStack.jsx: Invalidación causa parpadeo (ya reducida)
- ⚠️ MovStockStack.jsx: Modal no se cierra automáticamente
- ✅ crudStock.jsx: Lógica correcta (ya corregida - removido `[0]`)
- ✅ StockStore.jsx: Sin errores
- ✅ RegistrarInventario.jsx: Formulario correcto

---

## 📋 RESUMEN EJECUTIVO

### Errores Encontrados

| # | Problema | Ubicación | Severidad | Estado |
|---|----------|-----------|-----------|--------|
| 1 | Formato fechas incompatible | crudDashboard.jsx | 🔴 CRÍTICO | ❌ NO CORREGIDO |
| 2 | Invalidación agresiva queries | MovStockStack.jsx | 🟡 MEDIO | ✅ PARCIALMENTE CORREGIDO |
| 3 | Modal no se cierra auto | MovStockStack.jsx | 🟡 MEDIO | ❌ NO CORREGIDO |

---

## 🎯 PLAN DE ACCIÓN INMEDIATO

### PRIORIDAD 1: Dashboard (5 minutos)

**Archivo**: `Fronted/src/supabase/crudDashboard.jsx`

Modificar 5 funciones agregando hora a las fechas:

1. `ObtenerResumenPorEmpresa` (línea 22-23)
2. `ObtenerTop5ProductosPorCantidad` (línea 37-38)
3. `ObtenerTop10ProductosPorMonto` (línea 52-53)
4. `ObtenerVentasPorFecha` (línea 67-68)
5. `ObtenerVentasPorMetodoPago` (línea 82-83)

**Cambio en cada función**:
```javascript
// ANTES ❌
params: {
  fechaInicio: p.fecha_inicio,
  fechaFin: p.fecha_fin
}

// DESPUÉS ✅
params: {
  fechaInicio: `${p.fecha_inicio}T00:00:00`,
  fechaFin: `${p.fecha_fin}T23:59:59`
}
```

---

### PRIORIDAD 2: Inventario Modal (5 minutos)

**Archivo**: `Fronted/src/tanstack/MovStockStack.jsx`

Modificar función `onSuccess` (línea 88-91):

```javascript
// ANTES ❌
onSuccess: () => {
  toast.success("Registro guardado correctamente");
  queryClient.invalidateQueries(["mostrar movimientos de stock"]);
  resetProductosItemSelect();
},

// DESPUÉS ✅
onSuccess: () => {
  toast.success("Registro guardado correctamente");
  setStateClose(false);  // Cerrar modal inmediatamente
  resetProductosItemSelect();
  
  // Invalidar después de cerrar modal
  setTimeout(() => {
    queryClient.invalidateQueries(["mostrar movimientos de stock"]);
  }, 300);
},
```

---

## ✅ TESTING CHECKLIST

Después de aplicar correcciones:

### Dashboard
- [ ] Seleccionar rango de fechas "Hoy"
- [ ] Verificar que cards muestran datos (Ventas, Cantidad, Ganancias)
- [ ] Verificar que gráfico de líneas muestra datos
- [ ] Verificar que top 5 productos muestra datos
- [ ] Seleccionar "Últimos 7 días" y verificar datos
- [ ] Seleccionar "Últimos 30 días" y verificar datos

### Inventario
- [ ] Abrir modal "Registrar Entrada"
- [ ] Seleccionar producto, almacén, ingresar cantidad
- [ ] Guardar registro
- [ ] ✅ Modal debe cerrarse inmediatamente
- [ ] ✅ NO debe parpadear
- [ ] ✅ Tabla debe actualizar con nuevo movimiento
- [ ] Repetir con "Registrar Salida"

---

## 📝 NOTAS ADICIONALES

### Por qué el Dashboard no mostraba datos

El error era silencioso:
1. Frontend enviaba `fecha_inicio=2026-01-20`
2. Backend esperaba `fechaInicio=2026-01-20T00:00:00`
3. Spring Boot no podía parsear la fecha
4. Retornaba 400 Bad Request
5. Frontend catch mostraba `[]` vacío
6. Usuario veía dashboard sin datos

### Por qué el Modal parpadeaba

Secuencia de eventos:
1. Usuario guarda registro ✅
2. Mutation success ejecuta
3. Invalida query de movimientos
4. Query refetch inicia (loading=true)
5. Modal permanece abierto durante refetch
6. Componentes re-renderizan mostrando "cargando..."
7. Modal parpadea por cambios de estado
8. Refetch completa
9. Modal todavía abierto

**Solución**: Cerrar modal ANTES de invalidar queries

---

## 🏁 CONCLUSIÓN

**Problemas Encontrados**: 3
**Severidad Alta**: 1 (Dashboard fechas)
**Severidad Media**: 2 (Inventario modal)

**Tiempo Estimado de Corrección**: 10 minutos total
- Dashboard: 5 minutos
- Inventario: 5 minutos

**Impacto de Correcciones**:
- ✅ Dashboard mostrará datos correctamente
- ✅ Modal inventario cerrará sin parpadeo
- ✅ Mejor UX para el usuario

**¿Aplicar correcciones ahora?** ✅ SÍ (son cambios simples y seguros)
