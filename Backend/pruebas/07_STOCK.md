# PRUEBAS - GESTIÓN DE STOCK

## Endpoints Probados
- `GET /api/stock/almacen/{idAlmacen}`
- `GET /api/stock/producto/{idProducto}`
- `GET /api/stock/almacen/{idAlmacen}/producto/{idProducto}`
- `POST /api/stock/ajuste`
- `GET /api/stock/ajustar/{idProducto}`

---

## Setup: Obtener token

```powershell
$base = "http://localhost:8080/api"
$loginBody = @{ correo = "admin@tienda.com"; password = "123" } | ConvertTo-Json
$resp = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -Body $loginBody -ContentType "application/json"
$token = $resp.accessToken
$headers = @{ Authorization = "Bearer $token" }
Write-Host "Token obtenido: Usuario $($resp.nombre)" -ForegroundColor Green
```

---

## 1. Obtener stock completo de un almacén

```powershell
$stockAlmacen = Invoke-RestMethod -Method Get -Uri "$base/stock/almacen/1" -Headers $headers
Write-Host "Stock en almacen 1: $($stockAlmacen.Count) productos" -ForegroundColor Cyan
$stockAlmacen | Select-Object -First 10 | Format-Table @{L="Producto";E={$_.producto.nombre}}, stock
```

**Resultado esperado:**
- Status: 200 OK
- Array de stock con: `id`, `producto`, `almacen`, `stock`

---

## 2. Obtener stock de un producto en todos los almacenes

```powershell
$stockProducto = Invoke-RestMethod -Method Get -Uri "$base/stock/producto/1" -Headers $headers
Write-Host "Stock del producto 1 en todos los almacenes:" -ForegroundColor Cyan
$stockProducto | Format-Table @{L="Almacen";E={$_.almacen.nombre}}, stock
```

**Resultado esperado:**
- Status: 200 OK
- Array mostrando en qué almacenes está el producto y sus cantidades

---

## 3. Obtener stock de un producto en almacén específico

```powershell
$stockEspecifico = Invoke-RestMethod -Method Get -Uri "$base/stock/almacen/1/producto/1" -Headers $headers
Write-Host "Stock especifico:" -ForegroundColor Green
Write-Host "  Producto: $($stockEspecifico.producto.nombre)" -ForegroundColor Gray
Write-Host "  Almacen: $($stockEspecifico.almacen.nombre)" -ForegroundColor Gray
Write-Host "  Stock: $($stockEspecifico.stock)" -ForegroundColor Gray
```

**Resultado esperado:**
- Status: 200 OK
- Un solo registro de stock

---

## 4. Realizar ajuste de stock (incrementar)

```powershell
# Primero obtener el stock actual
$stockActual = Invoke-RestMethod -Method Get -Uri "$base/stock/almacen/1/producto/1" -Headers $headers
$stockInicial = $stockActual.stock
Write-Host "Stock inicial: $stockInicial" -ForegroundColor Yellow

# Hacer ajuste de +10 unidades
$nuevoStock = $stockInicial + 10
$ajuste = @{
    producto = @{ id = 1 }
    almacen = @{ id = 1 }
    stock = $nuevoStock
    stockMinimo = $stockActual.stockMinimo
    ubicacion = $stockActual.ubicacion
} | ConvertTo-Json -Depth 5

$stockAjustado = Invoke-RestMethod -Method Post -Uri "$base/stock/ajuste" -Headers $headers -Body $ajuste -ContentType "application/json"
Write-Host "Ajuste realizado:" -ForegroundColor Green
Write-Host "  Stock anterior: $stockInicial" -ForegroundColor Gray
Write-Host "  Stock nuevo: $($stockAjustado.stock)" -ForegroundColor Gray
Write-Host "  Diferencia: +$($stockAjustado.stock - $stockInicial)" -ForegroundColor Gray
```

**Resultado esperado:**
- Status: 200 OK
- Stock incrementado en 10

---

## 5. Realizar ajuste de stock (decrementar)

```powershell
$stockActual = Invoke-RestMethod -Method Get -Uri "$base/stock/almacen/1/producto/1" -Headers $headers
$stockInicial = $stockActual.stock

# Hacer ajuste de -5 unidades
$nuevoStock = $stockInicial - 5
$ajuste = @{
    producto = @{ id = 1 }
    almacen = @{ id = 1 }
    stock = $nuevoStock
    stockMinimo = $stockActual.stockMinimo
    ubicacion = $stockActual.ubicacion
} | ConvertTo-Json -Depth 5

$stockAjustado = Invoke-RestMethod -Method Post -Uri "$base/stock/ajuste" -Headers $headers -Body $ajuste -ContentType "application/json"
Write-Host "Ajuste realizado:" -ForegroundColor Green
Write-Host "  Stock anterior: $stockInicial" -ForegroundColor Gray
Write-Host "  Stock nuevo: $($stockAjustado.stock)" -ForegroundColor Gray
Write-Host "  Diferencia: $($stockAjustado.stock - $stockInicial)" -ForegroundColor Gray
```

**Resultado esperado:**
- Status: 200 OK
- Stock decrementado en 5

---

## 6. Intentar ajuste con stock negativo (debe permitirse o validarse)

```powershell
$stockActual = Invoke-RestMethod -Method Get -Uri "$base/stock/almacen/1/producto/1" -Headers $headers
$stockInicial = $stockActual.stock

# Intentar poner stock negativo
$ajusteNegativo = @{
    producto = @{ id = 1 }
    almacen = @{ id = 1 }
    stock = -10  # Stock negativo
    stockMinimo = $stockActual.stockMinimo
    ubicacion = $stockActual.ubicacion
} | ConvertTo-Json -Depth 5

try {
    $resultado = Invoke-RestMethod -Method Post -Uri "$base/stock/ajuste" -Headers $headers -Body $ajusteNegativo -ContentType "application/json"
    Write-Host "ADVERTENCIA: Se permitio stock negativo (validacion pendiente)" -ForegroundColor Yellow
    Write-Host "  Stock resultante: $($resultado.stock)" -ForegroundColor Yellow
    
    # Revertir ajuste
    $revertir = @{
        producto = @{ id = 1 }
        almacen = @{ id = 1 }
        stock = $stockInicial
        stockMinimo = $stockActual.stockMinimo
        ubicacion = $stockActual.ubicacion
    } | ConvertTo-Json -Depth 5
    Invoke-RestMethod -Method Post -Uri "$base/stock/ajuste" -Headers $headers -Body $revertir -ContentType "application/json" | Out-Null
    
} catch {
    Write-Host "VALIDACION CORRECTA: Stock negativo rechazado" -ForegroundColor Green
    $err = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "  Mensaje: $($err.message)" -ForegroundColor Yellow
}
```

**Resultado esperado ACTUAL:**
- ⚠️ Probablemente permite stock negativo (validación pendiente)

**Resultado esperado FUTURO:**
- Status: 400 Bad Request - "Stock insuficiente"

---

## 7. Obtener información para ajustar (consulta especial)

```powershell
$infoAjuste = Invoke-RestMethod -Method Get -Uri "$base/stock/ajustar/1" -Headers $headers
Write-Host "Informacion para ajustar producto 1:" -ForegroundColor Cyan
Write-Host "  Registros: $($infoAjuste.Count)" -ForegroundColor Gray
$infoAjuste | Format-Table @{L="Almacen";E={$_.almacen.nombre}}, stock
```

**Resultado esperado:**
- Status: 200 OK
- Lista de stock en diferentes almacenes

---

## 8. Ajuste con producto inexistente (debe fallar)

```powershell
$ajusteInvalido = @{
    producto = @{ id = 99999 }
    almacen = @{ id = 1 }
    stock = 10
    stockMinimo = 5
    ubicacion = "A1"
} | ConvertTo-Json -Depth 5

try {
    Invoke-RestMethod -Method Post -Uri "$base/stock/ajuste" -Headers $headers -Body $ajusteInvalido -ContentType "application/json"
    Write-Host "ERROR: Se permitio ajuste con producto inexistente!" -ForegroundColor Red
} catch {
    Write-Host "VALIDACION CORRECTA: Producto inexistente rechazado" -ForegroundColor Green
    Write-Host "  Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
}
```

**Resultado esperado:**
- Status: 404 Not Found o 400 Bad Request

---

## 9. Ajuste con almacén inexistente (debe fallar)

```powershell
$ajusteInvalido = @{
    producto = @{ id = 1 }
    almacen = @{ id = 99999 }
    stock = 10
    stockMinimo = 5
    ubicacion = "A1"
} | ConvertTo-Json -Depth 5

try {
    Invoke-RestMethod -Method Post -Uri "$base/stock/ajuste" -Headers $headers -Body $ajusteInvalido -ContentType "application/json"
    Write-Host "ERROR: Se permitio ajuste con almacen inexistente!" -ForegroundColor Red
} catch {
    Write-Host "VALIDACION CORRECTA: Almacen inexistente rechazado" -ForegroundColor Green
    Write-Host "  Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
}
```

**Resultado esperado:**
- Status: 404 Not Found o 400 Bad Request

---

## 10. Intentar acceder sin autenticación

```powershell
try {
    Invoke-RestMethod -Method Get -Uri "$base/stock/almacen/1"
    Write-Host "ERROR: Acceso permitido sin token!" -ForegroundColor Red
} catch {
    Write-Host "VALIDACION CORRECTA: Acceso sin token rechazado" -ForegroundColor Green
    Write-Host "  Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
}
```

**Resultado esperado:**
- Status: 401 Unauthorized o 403 Forbidden

---

## Resumen de Validaciones

✅ Consultar stock por almacén
✅ Consultar stock por producto
✅ Consultar stock específico (almacén + producto)
✅ Realizar ajuste de entrada (incrementar)
✅ Realizar ajuste de salida (decrementar)
⚠️ Ajuste con producto inexistente (debe validarse)
⚠️ Ajuste con almacén inexistente (debe validarse)
❌ Acceder sin autenticación

## Validaciones Pendientes (para implementar)

⚠️ **NO IMPLEMENTADO**: Validar stock no negativo
⚠️ **NO IMPLEMENTADO**: Registrar movimientos en tabla de historial (kardex)
⚠️ **NO IMPLEMENTADO**: Validar producto existe
⚠️ **NO IMPLEMENTADO**: Validar almacén existe y está activo
⚠️ **NO IMPLEMENTADO**: Validar cantidadAjuste != 0
⚠️ **NO IMPLEMENTADO**: Actualizar campo `stock` en tabla `productos`
