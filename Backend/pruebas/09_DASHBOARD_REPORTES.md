# Pruebas Dashboard y Reportes

## ⚠️ PREREQUISITOS
- Backend ejecutándose en `http://localhost:8080`
- Token JWT válido (login previo)
- Datos de prueba existentes en la base de datos

---

## 📊 ENDPOINTS DASHBOARD

### 1. Dashboard - Cajas con Ventas por Empresa
**Endpoint:** `GET /api/dashboard/cajas/empresa/{empresaId}`

**Descripción:** Obtiene todas las cajas de una empresa con sus ventas totales y último cierre

```powershell
# Con empresaId = 1
curl -X GET "http://localhost:8080/api/dashboard/cajas/empresa/1" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -H "Content-Type: application/json"
```

**Respuesta esperada:**
```json
[
  {
    "cajaId": 1,
    "cajaNombre": "Caja 1",
    "sucursalNombre": "Sucursal Principal",
    "totalVentas": 15000.50,
    "ultimoCierreId": 5,
    "ultimoCierreFecha": "2026-01-19T10:30:00"
  }
]
```

---

### 2. Dashboard - Resumen General por Empresa
**Endpoint:** `GET /api/dashboard/resumen/empresa/{empresaId}`

**Descripción:** Obtiene el resumen de ventas, cantidad y ganancias para un período

```powershell
# Con empresaId = 1, fechas de hoy
$fechaInicio = (Get-Date).ToString("yyyy-MM-dd")
$fechaFin = (Get-Date).ToString("yyyy-MM-dd")

curl -X GET "http://localhost:8080/api/dashboard/resumen/empresa/1?fechaInicio=$fechaInicio&fechaFin=$fechaFin" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -H "Content-Type: application/json"
```

**Respuesta esperada:**
```json
{
  "totalVentas": 50000.75,
  "cantidadProductos": 250,
  "gananciaTotal": 15000.25
}
```

---

### 3. Dashboard - Top 5 Productos Más Vendidos (Por Cantidad)
**Endpoint:** `GET /api/dashboard/top5-productos-cantidad/empresa/{empresaId}`

**Descripción:** Obtiene los 5 productos más vendidos por cantidad

```powershell
$fechaInicio = (Get-Date).AddDays(-30).ToString("yyyy-MM-dd")
$fechaFin = (Get-Date).ToString("yyyy-MM-dd")

curl -X GET "http://localhost:8080/api/dashboard/top5-productos-cantidad/empresa/1?fechaInicio=$fechaInicio&fechaFin=$fechaFin" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -H "Content-Type: application/json"
```

**Respuesta esperada:**
```json
[
  {
    "productoId": 15,
    "nombreProducto": "Coca Cola 2L",
    "cantidadVendida": 450,
    "montoTotal": 2250.00
  },
  {
    "productoId": 8,
    "nombreProducto": "Pan Bimbo",
    "cantidadVendida": 320,
    "montoTotal": 1280.00
  }
]
```

---

### 4. Dashboard - Top 10 Productos Más Vendidos (Por Monto)
**Endpoint:** `GET /api/dashboard/top10-productos-monto/empresa/{empresaId}`

**Descripción:** Obtiene los 10 productos con mayor monto de ventas

```powershell
$fechaInicio = (Get-Date).AddDays(-30).ToString("yyyy-MM-dd")
$fechaFin = (Get-Date).ToString("yyyy-MM-dd")

curl -X GET "http://localhost:8080/api/dashboard/top10-productos-monto/empresa/1?fechaInicio=$fechaInicio&fechaFin=$fechaFin" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -H "Content-Type: application/json"
```

**Respuesta esperada:**
```json
[
  {
    "productoId": 25,
    "nombreProducto": "Whisky Jack Daniels",
    "cantidadVendida": 15,
    "montoTotal": 7500.00
  }
]
```

---

### 5. Dashboard - Ventas por Fecha
**Endpoint:** `GET /api/dashboard/ventas-por-fecha/empresa/{empresaId}`

**Descripción:** Obtiene el total de ventas agrupadas por fecha

```powershell
$fechaInicio = (Get-Date).AddDays(-7).ToString("yyyy-MM-dd")
$fechaFin = (Get-Date).ToString("yyyy-MM-dd")

curl -X GET "http://localhost:8080/api/dashboard/ventas-por-fecha/empresa/1?fechaInicio=$fechaInicio&fechaFin=$fechaFin" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -H "Content-Type: application/json"
```

**Respuesta esperada:**
```json
[
  {
    "fecha": "2026-01-19",
    "totalVentas": 5000.50,
    "cantidadVentas": 25
  },
  {
    "fecha": "2026-01-18",
    "totalVentas": 4500.75,
    "cantidadVentas": 22
  }
]
```

---

### 6. Dashboard - Ventas por Método de Pago
**Endpoint:** `GET /api/dashboard/ventas-por-metodo-pago/empresa/{empresaId}`

**Descripción:** Obtiene el total de ventas agrupadas por método de pago

```powershell
$fechaInicio = (Get-Date).AddDays(-30).ToString("yyyy-MM-dd")
$fechaFin = (Get-Date).ToString("yyyy-MM-dd")

curl -X GET "http://localhost:8080/api/dashboard/ventas-por-metodo-pago/empresa/1?fechaInicio=$fechaInicio&fechaFin=$fechaFin" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -H "Content-Type: application/json"
```

**Respuesta esperada:**
```json
[
  {
    "metodoPago": "EFECTIVO",
    "totalVentas": 25000.00,
    "cantidadVentas": 150
  },
  {
    "metodoPago": "TARJETA",
    "totalVentas": 18000.50,
    "cantidadVentas": 85
  }
]
```

---

## 📋 ENDPOINTS REPORTES

### 7. Reporte - Stock Bajo Mínimo
**Endpoint:** `GET /api/reportes/stock-bajo-minimo`

**Descripción:** Obtiene productos con stock por debajo del mínimo

```powershell
curl -X GET "http://localhost:8080/api/reportes/stock-bajo-minimo?sucursalId=1&almacenId=1" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -H "Content-Type: application/json"
```

**Respuesta esperada:**
```json
[
  {
    "productoId": 12,
    "codigoProducto": "PRD-001",
    "nombreProducto": "Leche Gloria 1L",
    "stockActual": 5.0,
    "stockMinimo": 20.0,
    "diferencia": -15.0,
    "almacenNombre": "Almacén Principal"
  }
]
```

---

### 8. Reporte - Stock Valorizado por Almacén
**Endpoint:** `GET /api/reportes/stock-por-almacen`

**Descripción:** Obtiene el inventario valorizado de un almacén

```powershell
curl -X GET "http://localhost:8080/api/reportes/stock-por-almacen?sucursalId=1&almacenId=1" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -H "Content-Type: application/json"
```

**Respuesta esperada:**
```json
[
  {
    "productoId": 15,
    "codigoProducto": "PRD-015",
    "nombreProducto": "Coca Cola 2L",
    "cantidad": 150.0,
    "precioCompra": 3.50,
    "precioVenta": 5.00,
    "valorInventario": 525.00,
    "almacenNombre": "Almacén Principal",
    "categoria": "Bebidas"
  }
]
```

---

### 9. Reporte - Ventas por Sucursal
**Endpoint:** `GET /api/reportes/ventas-por-sucursal/{sucursalId}`

**Descripción:** Obtiene el reporte de ventas detallado de una sucursal

```powershell
$fechaInicio = (Get-Date).AddDays(-30).ToString("yyyy-MM-dd")
$fechaFin = (Get-Date).ToString("yyyy-MM-dd")

curl -X GET "http://localhost:8080/api/reportes/ventas-por-sucursal/1?fechaInicio=$fechaInicio&fechaFin=$fechaFin" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -H "Content-Type: application/json"
```

**Respuesta esperada:**
```json
[
  {
    "ventaId": 125,
    "comprobanteNumero": "F001-00125",
    "fecha": "2026-01-19T14:30:00",
    "totalVenta": 250.50,
    "metodoPago": "EFECTIVO",
    "vendedor": "Juan Pérez",
    "cliente": "PÚBLICO GENERAL"
  }
]
```

---

## 🧪 SCRIPT COMPLETO DE PRUEBAS

```powershell
# Script completo para probar todos los endpoints de Dashboard y Reportes
# Guardar como: EJECUTAR_PRUEBAS_DASHBOARD_REPORTES.ps1

Write-Host "=== PRUEBAS DASHBOARD Y REPORTES ===" -ForegroundColor Cyan
Write-Host ""

# Variables de configuración
$baseUrl = "http://localhost:8080"
$empresaId = 1
$sucursalId = 1
$almacenId = 1
$token = "YOUR_TOKEN_HERE"  # ⚠️ REEMPLAZAR CON TOKEN VÁLIDO

# Fechas
$fechaInicio = (Get-Date).AddDays(-30).ToString("yyyy-MM-dd")
$fechaFin = (Get-Date).ToString("yyyy-MM-dd")

Write-Host "📅 Período: $fechaInicio a $fechaFin" -ForegroundColor Yellow
Write-Host ""

# Headers comunes
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# TEST 1: Dashboard - Cajas con Ventas
Write-Host "TEST 1: Dashboard - Cajas con Ventas..." -ForegroundColor Green
$response1 = Invoke-RestMethod -Uri "$baseUrl/api/dashboard/cajas/empresa/$empresaId" -Headers $headers -Method Get
Write-Host "✅ Cajas encontradas: $($response1.Length)" -ForegroundColor Green
Write-Host ""

# TEST 2: Dashboard - Resumen General
Write-Host "TEST 2: Dashboard - Resumen General..." -ForegroundColor Green
$response2 = Invoke-RestMethod -Uri "$baseUrl/api/dashboard/resumen/empresa/$empresaId`?fechaInicio=$fechaInicio&fechaFin=$fechaFin" -Headers $headers -Method Get
Write-Host "✅ Total Ventas: $($response2.totalVentas)" -ForegroundColor Green
Write-Host ""

# TEST 3: Dashboard - Top 5 Productos (Cantidad)
Write-Host "TEST 3: Dashboard - Top 5 Productos por Cantidad..." -ForegroundColor Green
$response3 = Invoke-RestMethod -Uri "$baseUrl/api/dashboard/top5-productos-cantidad/empresa/$empresaId`?fechaInicio=$fechaInicio&fechaFin=$fechaFin" -Headers $headers -Method Get
Write-Host "✅ Productos encontrados: $($response3.Length)" -ForegroundColor Green
Write-Host ""

# TEST 4: Dashboard - Top 10 Productos (Monto)
Write-Host "TEST 4: Dashboard - Top 10 Productos por Monto..." -ForegroundColor Green
$response4 = Invoke-RestMethod -Uri "$baseUrl/api/dashboard/top10-productos-monto/empresa/$empresaId`?fechaInicio=$fechaInicio&fechaFin=$fechaFin" -Headers $headers -Method Get
Write-Host "✅ Productos encontrados: $($response4.Length)" -ForegroundColor Green
Write-Host ""

# TEST 5: Dashboard - Ventas por Fecha
Write-Host "TEST 5: Dashboard - Ventas por Fecha..." -ForegroundColor Green
$response5 = Invoke-RestMethod -Uri "$baseUrl/api/dashboard/ventas-por-fecha/empresa/$empresaId`?fechaInicio=$fechaInicio&fechaFin=$fechaFin" -Headers $headers -Method Get
Write-Host "✅ Días con ventas: $($response5.Length)" -ForegroundColor Green
Write-Host ""

# TEST 6: Dashboard - Ventas por Método de Pago
Write-Host "TEST 6: Dashboard - Ventas por Método de Pago..." -ForegroundColor Green
$response6 = Invoke-RestMethod -Uri "$baseUrl/api/dashboard/ventas-por-metodo-pago/empresa/$empresaId`?fechaInicio=$fechaInicio&fechaFin=$fechaFin" -Headers $headers -Method Get
Write-Host "✅ Métodos de pago: $($response6.Length)" -ForegroundColor Green
Write-Host ""

# TEST 7: Reporte - Stock Bajo Mínimo
Write-Host "TEST 7: Reporte - Stock Bajo Mínimo..." -ForegroundColor Green
$response7 = Invoke-RestMethod -Uri "$baseUrl/api/reportes/stock-bajo-minimo?sucursalId=$sucursalId&almacenId=$almacenId" -Headers $headers -Method Get
Write-Host "✅ Productos bajo mínimo: $($response7.Length)" -ForegroundColor Green
Write-Host ""

# TEST 8: Reporte - Stock Valorizado
Write-Host "TEST 8: Reporte - Stock Valorizado..." -ForegroundColor Green
$response8 = Invoke-RestMethod -Uri "$baseUrl/api/reportes/stock-por-almacen?sucursalId=$sucursalId&almacenId=$almacenId" -Headers $headers -Method Get
Write-Host "✅ Productos en inventario: $($response8.Length)" -ForegroundColor Green
Write-Host ""

# TEST 9: Reporte - Ventas por Sucursal
Write-Host "TEST 9: Reporte - Ventas por Sucursal..." -ForegroundColor Green
$response9 = Invoke-RestMethod -Uri "$baseUrl/api/reportes/ventas-por-sucursal/$sucursalId`?fechaInicio=$fechaInicio&fechaFin=$fechaFin" -Headers $headers -Method Get
Write-Host "✅ Ventas encontradas: $($response9.Length)" -ForegroundColor Green
Write-Host ""

Write-Host "=== ✅ TODAS LAS PRUEBAS COMPLETADAS ===" -ForegroundColor Cyan
```

---

## 📝 NOTAS

1. **Token JWT**: Debes obtener un token válido primero haciendo login:
   ```powershell
   $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
     -Method Post `
     -Body '{"username":"admin","password":"admin123"}' `
     -ContentType "application/json"
   $token = $loginResponse.token
   ```

2. **IDs válidos**: Asegúrate de usar IDs que existan en tu base de datos (empresa, sucursal, almacén)

3. **Datos de prueba**: Si no hay datos, algunos endpoints pueden retornar arrays vacíos

4. **Coherencia con Supabase**: Todos los endpoints están mapeados desde las funciones de Supabase originales

---

## ✅ VALIDACIONES

- [✅] Backend compilado sin errores
- [✅] Backend iniciado correctamente
- [✅] 6 endpoints de Dashboard creados
- [✅] 3 endpoints de Reportes creados
- [✅] DTOs coherentes con respuestas de Supabase
- [✅] Servicios con lógica de negocio implementada
- [✅] Controladores con manejo de errores
- [⏳] Pruebas manuales pendientes
