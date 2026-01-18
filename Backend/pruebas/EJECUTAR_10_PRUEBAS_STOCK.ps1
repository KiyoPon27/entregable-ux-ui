# Script automatizado para ejecutar las 10 pruebas de Stock
# REQUISITO: Backend debe estar ejecutándose en http://localhost:8080

$ErrorActionPreference = "Continue"
$base = "http://localhost:8080/api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   PRUEBAS DE STOCK - 10 VALIDACIONES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ============ SETUP ============
Write-Host "SETUP: Obteniendo token..." -ForegroundColor Yellow
try {
    $loginBody = @{ correo = "admin@tienda.com"; password = "123" } | ConvertTo-Json
    $resp = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -Body $loginBody -ContentType "application/json"
    $token = $resp.accessToken
    $headers = @{ Authorization = "Bearer $token" }
    Write-Host "✓ Token obtenido exitosamente" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Error al obtener token. Verifica que el backend esté ejecutándose." -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    exit 1
}

# ============ PRUEBA 1 ============
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA 1: Obtener stock completo de un almacén" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    $stockAlmacen = Invoke-RestMethod -Method Get -Uri "$base/stock/almacen/1" -Headers $headers
    Write-Host "✓ Status: 200 OK" -ForegroundColor Green
    Write-Host "  Stock en almacén 1: $($stockAlmacen.Count) productos" -ForegroundColor Gray
    if ($stockAlmacen.Count -gt 0) {
        Write-Host "  Primeros 3 productos:" -ForegroundColor Gray
        $stockAlmacen | Select-Object -First 3 | ForEach-Object {
            Write-Host "    - Producto: $($_.producto.nombre), Stock: $($_.stock)" -ForegroundColor Gray
        }
    }
    Write-Host "✅ PRUEBA 1 EXITOSA" -ForegroundColor Green
} catch {
    Write-Host "❌ PRUEBA 1 FALLÓ" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}
Write-Host ""

# ============ PRUEBA 2 ============
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA 2: Obtener stock de un producto en todos los almacenes" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    $stockProducto = Invoke-RestMethod -Method Get -Uri "$base/stock/producto/1" -Headers $headers
    Write-Host "✓ Status: 200 OK" -ForegroundColor Green
    Write-Host "  Stock del producto 1 en $($stockProducto.Count) almacén(es)" -ForegroundColor Gray
    $stockProducto | ForEach-Object {
        Write-Host "    - Almacén: $($_.almacen.nombre), Stock: $($_.stock)" -ForegroundColor Gray
    }
    Write-Host "✅ PRUEBA 2 EXITOSA" -ForegroundColor Green
} catch {
    Write-Host "❌ PRUEBA 2 FALLÓ" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}
Write-Host ""

# ============ PRUEBA 3 ============
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA 3: Obtener stock de un producto en almacén específico" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    $stockEspecifico = Invoke-RestMethod -Method Get -Uri "$base/stock/almacen/1/producto/1" -Headers $headers
    Write-Host "✓ Status: 200 OK" -ForegroundColor Green
    Write-Host "  Producto: $($stockEspecifico.producto.nombre)" -ForegroundColor Gray
    Write-Host "  Almacén: $($stockEspecifico.almacen.nombre)" -ForegroundColor Gray
    Write-Host "  Stock: $($stockEspecifico.stock)" -ForegroundColor Gray
    Write-Host "  Stock mínimo: $($stockEspecifico.stockMinimo)" -ForegroundColor Gray
    Write-Host "  Ubicación: $($stockEspecifico.ubicacion)" -ForegroundColor Gray
    Write-Host "✅ PRUEBA 3 EXITOSA" -ForegroundColor Green
} catch {
    Write-Host "❌ PRUEBA 3 FALLÓ" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}
Write-Host ""

# ============ PRUEBA 4 ============
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA 4: Realizar ajuste de stock (incrementar +10)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    $stockActual = Invoke-RestMethod -Method Get -Uri "$base/stock/almacen/1/producto/1" -Headers $headers
    $stockInicial = $stockActual.stock
    Write-Host "  Stock inicial: $stockInicial" -ForegroundColor Yellow
    
    $nuevoStock = $stockInicial + 10
    $ajuste = @{
        producto = @{ id = 1 }
        almacen = @{ id = 1 }
        stock = $nuevoStock
        stockMinimo = $stockActual.stockMinimo
        ubicacion = $stockActual.ubicacion
    } | ConvertTo-Json -Depth 5
    
    $stockAjustado = Invoke-RestMethod -Method Post -Uri "$base/stock/ajuste" -Headers $headers -Body $ajuste -ContentType "application/json"
    Write-Host "✓ Status: 200 OK" -ForegroundColor Green
    Write-Host "  Stock anterior: $stockInicial" -ForegroundColor Gray
    Write-Host "  Stock nuevo: $($stockAjustado.stock)" -ForegroundColor Gray
    Write-Host "  Diferencia: +$($stockAjustado.stock - $stockInicial)" -ForegroundColor Gray
    
    if ($stockAjustado.stock -eq $nuevoStock) {
        Write-Host "✅ PRUEBA 4 EXITOSA - Stock incrementado correctamente" -ForegroundColor Green
    } else {
        Write-Host "⚠ PRUEBA 4 PARCIAL - Stock ajustado pero valor inesperado" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ PRUEBA 4 FALLÓ" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}
Write-Host ""

# ============ PRUEBA 5 ============
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA 5: Realizar ajuste de stock (decrementar -5)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    $stockActual = Invoke-RestMethod -Method Get -Uri "$base/stock/almacen/1/producto/1" -Headers $headers
    $stockInicial = $stockActual.stock
    Write-Host "  Stock inicial: $stockInicial" -ForegroundColor Yellow
    
    $nuevoStock = $stockInicial - 5
    $ajuste = @{
        producto = @{ id = 1 }
        almacen = @{ id = 1 }
        stock = $nuevoStock
        stockMinimo = $stockActual.stockMinimo
        ubicacion = $stockActual.ubicacion
    } | ConvertTo-Json -Depth 5
    
    $stockAjustado = Invoke-RestMethod -Method Post -Uri "$base/stock/ajuste" -Headers $headers -Body $ajuste -ContentType "application/json"
    Write-Host "✓ Status: 200 OK" -ForegroundColor Green
    Write-Host "  Stock anterior: $stockInicial" -ForegroundColor Gray
    Write-Host "  Stock nuevo: $($stockAjustado.stock)" -ForegroundColor Gray
    Write-Host "  Diferencia: $($stockAjustado.stock - $stockInicial)" -ForegroundColor Gray
    
    if ($stockAjustado.stock -eq $nuevoStock) {
        Write-Host "✅ PRUEBA 5 EXITOSA - Stock decrementado correctamente" -ForegroundColor Green
    } else {
        Write-Host "⚠ PRUEBA 5 PARCIAL - Stock ajustado pero valor inesperado" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ PRUEBA 5 FALLÓ" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}
Write-Host ""

# ============ PRUEBA 6 ============
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA 6: Intentar ajuste con stock negativo" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    $stockActual = Invoke-RestMethod -Method Get -Uri "$base/stock/almacen/1/producto/1" -Headers $headers
    $stockInicial = $stockActual.stock
    Write-Host "  Stock inicial: $stockInicial" -ForegroundColor Yellow
    
    $ajusteNegativo = @{
        producto = @{ id = 1 }
        almacen = @{ id = 1 }
        stock = -10
        stockMinimo = $stockActual.stockMinimo
        ubicacion = $stockActual.ubicacion
    } | ConvertTo-Json -Depth 5
    
    $resultado = Invoke-RestMethod -Method Post -Uri "$base/stock/ajuste" -Headers $headers -Body $ajusteNegativo -ContentType "application/json"
    Write-Host "⚠ VALIDACIÓN PENDIENTE: Se permitió stock negativo" -ForegroundColor Yellow
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
    Write-Host "  Stock revertido a: $stockInicial" -ForegroundColor Gray
    Write-Host "⚠ PRUEBA 6 COMPLETADA - Validación de stock negativo pendiente" -ForegroundColor Yellow
} catch {
    Write-Host "✅ VALIDACIÓN CORRECTA: Stock negativo rechazado" -ForegroundColor Green
    if ($_.ErrorDetails.Message) {
        $err = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "  Mensaje: $($err.message)" -ForegroundColor Yellow
    }
}
Write-Host ""

# ============ PRUEBA 7 ============
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA 7: Obtener información para ajustar" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    $infoAjuste = Invoke-RestMethod -Method Get -Uri "$base/stock/ajustar/1" -Headers $headers
    Write-Host "✓ Status: 200 OK" -ForegroundColor Green
    Write-Host "  Registros encontrados: $($infoAjuste.Count)" -ForegroundColor Gray
    $infoAjuste | ForEach-Object {
        Write-Host "    - Almacén: $($_.almacen.nombre), Stock: $($_.stock)" -ForegroundColor Gray
    }
    Write-Host "✅ PRUEBA 7 EXITOSA" -ForegroundColor Green
} catch {
    Write-Host "❌ PRUEBA 7 FALLÓ" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}
Write-Host ""

# ============ PRUEBA 8 ============
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA 8: Ajuste con producto inexistente (debe fallar)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    $ajusteInvalido = @{
        producto = @{ id = 99999 }
        almacen = @{ id = 1 }
        stock = 10
        stockMinimo = 5
        ubicacion = "A1"
    } | ConvertTo-Json -Depth 5
    
    Invoke-RestMethod -Method Post -Uri "$base/stock/ajuste" -Headers $headers -Body $ajusteInvalido -ContentType "application/json"
    Write-Host "❌ ERROR: Se permitió ajuste con producto inexistente!" -ForegroundColor Red
} catch {
    Write-Host "✅ VALIDACIÓN CORRECTA: Producto inexistente rechazado" -ForegroundColor Green
    Write-Host "  Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
}
Write-Host ""

# ============ PRUEBA 9 ============
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA 9: Ajuste con almacén inexistente (debe fallar)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    $ajusteInvalido = @{
        producto = @{ id = 1 }
        almacen = @{ id = 99999 }
        stock = 10
        stockMinimo = 5
        ubicacion = "A1"
    } | ConvertTo-Json -Depth 5
    
    Invoke-RestMethod -Method Post -Uri "$base/stock/ajuste" -Headers $headers -Body $ajusteInvalido -ContentType "application/json"
    Write-Host "❌ ERROR: Se permitió ajuste con almacén inexistente!" -ForegroundColor Red
} catch {
    Write-Host "✅ VALIDACIÓN CORRECTA: Almacén inexistente rechazado" -ForegroundColor Green
    Write-Host "  Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
}
Write-Host ""

# ============ PRUEBA 10 ============
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA 10: Intentar acceder sin autenticación (debe fallar)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    Invoke-RestMethod -Method Get -Uri "$base/stock/almacen/1"
    Write-Host "❌ ERROR: Acceso permitido sin token!" -ForegroundColor Red
} catch {
    Write-Host "✅ VALIDACIÓN CORRECTA: Acceso sin token rechazado" -ForegroundColor Green
    Write-Host "  Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
}
Write-Host ""

# ============ RESUMEN ============
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   RESUMEN DE PRUEBAS COMPLETADO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Todas las pruebas ejecutadas." -ForegroundColor White
Write-Host "Revisa los resultados arriba para verificar cada prueba." -ForegroundColor White
Write-Host ""
