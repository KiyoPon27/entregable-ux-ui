# 📋 PRUEBAS BACKEND - MOVIMIENTOS DE STOCK (KARDEX)

## 🎯 Objetivo
Validar que el sistema registra automáticamente todos los movimientos de stock y permite consultar el historial (Kardex).

## 📦 Requisitos Previos
1. Backend ejecutándose en `http://localhost:8080`
2. Base de datos con datos iniciales (`inserts.sql`)
3. Token de autenticación válido
4. Al menos 1 producto y 1 almacén creados

---

## ✅ PRUEBA 1: Registrar Movimiento Manual
**Objetivo:** Verificar que se puede registrar un movimiento manualmente

**Request:**
```powershell
POST /api/movimientos-stock
{
  "almacen": { "id": 1 },
  "producto": { "id": 1 },
  "tipoMovimiento": "ENTRADA",
  "cantidad": 50,
  "detalle": "Compra inicial de mercadería",
  "origen": "COMPRA"
}
```

**Resultado Esperado:**
- Status: 201 Created
- Respuesta con ID del movimiento generado
- Campos `fecha`, `detalle`, `origen` completados automáticamente

---

## ✅ PRUEBA 2: Listar Todos los Movimientos
**Objetivo:** Obtener todos los movimientos de stock del sistema

**Request:**
```powershell
GET /api/movimientos-stock
```

**Resultado Esperado:**
- Status: 200 OK
- Array con todos los movimientos ordenados por fecha descendente
- Cada movimiento con: id, almacen, producto, tipoMovimiento, cantidad, fecha, detalle, origen

---

## ✅ PRUEBA 3: Listar Movimientos por Producto
**Objetivo:** Ver el historial completo (Kardex) de un producto específico

**Request:**
```powershell
GET /api/movimientos-stock/producto/1
```

**Resultado Esperado:**
- Status: 200 OK
- Array con movimientos solo del producto ID=1
- Ordenados por fecha descendente (más recientes primero)

---

## ✅ PRUEBA 4: Listar Movimientos por Almacén
**Objetivo:** Ver todos los movimientos de un almacén específico

**Request:**
```powershell
GET /api/movimientos-stock/almacen/1
```

**Resultado Esperado:**
- Status: 200 OK
- Array con movimientos solo del almacén ID=1
- Todos los productos que han tenido movimientos en ese almacén

---

## ✅ PRUEBA 5: Listar Movimientos por Producto y Almacén
**Objetivo:** Ver el Kardex de un producto en un almacén específico

**Request:**
```powershell
GET /api/movimientos-stock/producto/1/almacen/1
```

**Resultado Esperado:**
- Status: 200 OK
- Array con movimientos del producto ID=1 en almacén ID=1
- Historial detallado de ese producto en ese almacén

---

## ✅ PRUEBA 6: Ajuste de Stock Registra Movimiento Automático (Incremento)
**Objetivo:** Validar que al incrementar stock se registra movimiento automático

**Request 1:** Ajustar stock
```powershell
POST /api/stock/ajuste
{
  "producto": { "id": 1 },
  "almacen": { "id": 1 },
  "stock": 100,
  "stockMinimo": 10,
  "ubicacion": "Estante A"
}
```

**Request 2:** Verificar movimiento creado
```powershell
GET /api/movimientos-stock/producto/1/almacen/1
```

**Resultado Esperado:**
- Ajuste exitoso con status 200
- Movimiento automático registrado con:
  - `tipoMovimiento`: "AJUSTE_ENTRADA"
  - `cantidad`: Diferencia positiva (ej: 100 - stock_anterior)
  - `detalle`: "Ajuste manual de stock. Stock anterior: X, Stock nuevo: 100"
  - `origen`: "AJUSTE_MANUAL"

---

## ✅ PRUEBA 7: Ajuste de Stock Registra Movimiento Automático (Decremento)
**Objetivo:** Validar que al reducir stock se registra movimiento de salida

**Request 1:** Reducir stock
```powershell
POST /api/stock/ajuste
{
  "producto": { "id": 1 },
  "almacen": { "id": 1 },
  "stock": 50,
  "stockMinimo": 10,
  "ubicacion": "Estante A"
}
```

**Request 2:** Verificar movimiento creado
```powershell
GET /api/movimientos-stock/producto/1/almacen/1
```

**Resultado Esperado:**
- Ajuste exitoso con status 200
- Movimiento automático registrado con:
  - `tipoMovimiento`: "AJUSTE_SALIDA"
  - `cantidad`: Diferencia en valor absoluto (ej: 50)
  - `detalle`: "Ajuste manual de stock. Stock anterior: 100, Stock nuevo: 50"
  - `origen`: "AJUSTE_MANUAL"

---

## ✅ PRUEBA 8: Listar Movimientos por Tipo
**Objetivo:** Filtrar movimientos por tipo específico

**Request:**
```powershell
GET /api/movimientos-stock/tipo/AJUSTE_ENTRADA
```

**Resultado Esperado:**
- Status: 200 OK
- Array solo con movimientos tipo "AJUSTE_ENTRADA"
- Útil para reportes de entradas vs salidas

---

## ✅ PRUEBA 9: Listar Movimientos por Rango de Fechas
**Objetivo:** Obtener movimientos de un período específico

**Request:**
```powershell
GET /api/movimientos-stock/fechas?inicio=2026-01-01T00:00:00&fin=2026-01-31T23:59:59
```

**Resultado Esperado:**
- Status: 200 OK
- Array con movimientos solo dentro del rango especificado
- Útil para reportes mensuales/semanales

---

## ✅ PRUEBA 10: Listar Movimientos por Producto y Fechas
**Objetivo:** Kardex de un producto en un período específico

**Request:**
```powershell
GET /api/movimientos-stock/producto/1/fechas?inicio=2026-01-01T00:00:00&fin=2026-01-31T23:59:59
```

**Resultado Esperado:**
- Status: 200 OK
- Historial del producto ID=1 solo en el rango de fechas
- Útil para auditorías y reportes

---

## ✅ PRUEBA 11: Listar Movimientos por Empresa
**Objetivo:** Ver todos los movimientos de una empresa

**Request:**
```powershell
GET /api/movimientos-stock/empresa/1
```

**Resultado Esperado:**
- Status: 200 OK
- Array con todos los movimientos de la empresa ID=1
- Incluye movimientos de todos los almacenes/sucursales de la empresa

---

## ✅ PRUEBA 12: Obtener Movimiento por ID
**Objetivo:** Ver detalles de un movimiento específico

**Request:**
```powershell
GET /api/movimientos-stock/5
```

**Resultado Esperado:**
- Status: 200 OK
- Objeto con el movimiento ID=5 completo
- Incluye relaciones: almacen, producto

---

## 📊 Resumen de Validaciones

| # | Prueba | Endpoint | Método | Validación Principal |
|---|--------|----------|--------|---------------------|
| 1 | Registrar manual | /movimientos-stock | POST | Crea movimiento con datos |
| 2 | Listar todos | /movimientos-stock | GET | Retorna todos ordenados |
| 3 | Por producto | /producto/{id} | GET | Kardex de producto |
| 4 | Por almacén | /almacen/{id} | GET | Movimientos de almacén |
| 5 | Producto + almacén | /producto/{id}/almacen/{id} | GET | Kardex específico |
| 6 | Ajuste incremento | /stock/ajuste + verificar | POST+GET | Registra AJUSTE_ENTRADA |
| 7 | Ajuste decremento | /stock/ajuste + verificar | POST+GET | Registra AJUSTE_SALIDA |
| 8 | Por tipo | /tipo/{tipo} | GET | Filtra por tipo movimiento |
| 9 | Por fechas | /fechas?inicio&fin | GET | Filtra por rango fechas |
| 10 | Producto + fechas | /producto/{id}/fechas | GET | Kardex con filtro fecha |
| 11 | Por empresa | /empresa/{id} | GET | Todos mov. de empresa |
| 12 | Por ID | /{id} | GET | Detalle de 1 movimiento |

---

## 🎯 Tipos de Movimiento

### Registrados Automáticamente
- **AJUSTE_ENTRADA**: Incremento de stock mediante ajuste manual
- **AJUSTE_SALIDA**: Reducción de stock mediante ajuste manual
- **AJUSTE_SIN_CAMBIO**: Modificación de otros campos sin cambio de stock

### Tipos Preparados para Futuro
- **ENTRADA**: Ingreso de mercadería (compra, devolución cliente)
- **SALIDA**: Salida de mercadería (venta, devolución a proveedor)
- **TRASPASO**: Movimiento entre almacenes

---

## 🔍 Estructura de Datos

### MovimientoStock
```json
{
  "id": 1,
  "almacen": {
    "id": 1,
    "nombre": "Almacén Principal"
  },
  "producto": {
    "id": 1,
    "nombre": "Producto Ejemplo",
    "codigoInterno": "PROD001"
  },
  "tipoMovimiento": "AJUSTE_ENTRADA",
  "cantidad": 50.00,
  "fecha": "2026-01-17T10:30:00",
  "detalle": "Ajuste manual de stock. Stock anterior: 100, Stock nuevo: 150",
  "origen": "AJUSTE_MANUAL"
}
```

---

## 📝 Notas Importantes

1. **Registro Automático**: Cada ajuste de stock (POST /api/stock/ajuste) registra automáticamente un movimiento en el historial.

2. **Detalle Auto-generado**: El campo `detalle` incluye el stock anterior y nuevo para trazabilidad completa.

3. **Fecha Automática**: Si no se especifica `fecha`, se usa la fecha/hora actual del servidor.

4. **Cantidad Absoluta**: En el movimiento se registra el valor absoluto de la diferencia (siempre positivo). El tipo indica si es entrada o salida.

5. **Sin Eliminación**: Los movimientos NO tienen endpoint DELETE - son registro histórico inmutable.

---

## ✅ Criterios de Éxito

**El módulo de Kardex es exitoso si:**
- ✅ Cada ajuste de stock genera automáticamente un movimiento
- ✅ Los movimientos se pueden consultar por producto (Kardex)
- ✅ Los movimientos se pueden consultar por almacén
- ✅ Los filtros por fecha funcionan correctamente
- ✅ Los tipos de movimiento se registran correctamente (ENTRADA/SALIDA)
- ✅ El campo `detalle` muestra stock anterior y nuevo
- ✅ No hay errores al listar movimientos

---

## 🚀 Próximos Pasos
Después de validar estas pruebas:
1. ✅ Ejecutar script automatizado de pruebas
2. ✅ Confirmar que todos los endpoints funcionan
3. ✅ Verificar que los ajustes de stock registran movimientos
4. ➡️ Migrar frontend para mostrar Kardex/Historial
5. ➡️ Proceder con **Priority 3: Clientes/Proveedores**
