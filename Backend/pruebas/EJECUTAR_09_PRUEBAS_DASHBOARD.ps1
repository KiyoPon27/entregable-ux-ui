# Script de Pruebas Rápidas para Dashboard y Reportes
# Autor: GitHub Copilot
# Fecha: 19 Enero 2026

Write-Host "=======================================================
" -ForegroundColor Cyan
Write-Host "     PRUEBAS DASHBOARD Y REPORTES - BACKEND" -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

# Variables de configuración
$baseUrl = "http://localhost:8080"
$empresaId = 1
$sucursalId = 1
$almacenId = 1

# Fechas para pruebas
$fechaInicio = (Get-Date).AddDays(-30).ToString("yyyy-MM-dd")
$fechaFin = (Get-Date).ToString("yyyy-MM-dd")

Write-Host "📋 Configuración:" -ForegroundColor White
Write-Host "   - Base URL: $baseUrl" -ForegroundColor Gray
Write-Host "   - Empresa ID: $empresaId" -ForegroundColor Gray
Write-Host "   - Sucursal ID: $sucursalId" -ForegroundColor Gray
Write-Host "   - Almacén ID: $almacenId" -ForegroundColor Gray
Write-Host "   - Período: $fechaInicio a $fechaFin" -ForegroundColor Gray
Write-Host ""

# Primero obtenemos el token JWT
Write-Host "🔐 Paso 1: Obteniendo token de autenticación..." -ForegroundColor Magenta
$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method Post `
        -Body $loginBody `
        -ContentType "application/json"
    
    $token = $loginResponse.token
    Write-Host "✅ Token obtenido correctamente" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Error al obtener token: $_" -ForegroundColor Red
    Write-Host "Verifica que el backend esté ejecutándose en $baseUrl" -ForegroundColor Yellow
    exit 1
}

# Headers para las peticiones
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Contador de pruebas
$testsPasados = 0
$testsFallidos = 0

# Función auxiliar para ejecutar tests
function Test-Endpoint {
    param(
        [string]$Nombre,
        [string]$Url,
        [hashtable]$Headers
    )
    
    Write-Host "🧪 $Nombre" -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri $Url -Headers $Headers -Method Get -ErrorAction Stop
        
        if ($response -is [array]) {
            Write-Host "   ✅ Exitoso - $($response.Length) registros" -ForegroundColor Green
        } elseif ($response -is [PSCustomObject]) {
            Write-Host "   ✅ Exitoso - Objeto recibido" -ForegroundColor Green
        } else {
            Write-Host "   ✅ Exitoso" -ForegroundColor Green
        }
        
        $script:testsPasados++
        return $response
    } catch {
        Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        $script:testsFallidos++
        return $null
    }
    Write-Host ""
}

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "     📊 PRUEBAS DE ENDPOINTS DASHBOARD" -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

# TEST 1: Dashboard - Cajas con Ventas por Empresa
$url1 = "$baseUrl/api/dashboard/cajas/empresa/$empresaId"
$resultado1 = Test-Endpoint -Nombre "TEST 1: Cajas con Ventas por Empresa" -Url $url1 -Headers $headers

# TEST 2: Dashboard - Resumen General
$url2 = "$baseUrl/api/dashboard/resumen/empresa/$empresaId`?fechaInicio=$fechaInicio&fechaFin=$fechaFin"
$resultado2 = Test-Endpoint -Nombre "TEST 2: Resumen General de Ventas" -Url $url2 -Headers $headers
if ($resultado2) {
    Write-Host "   📈 Total Ventas: $($resultado2.totalVentas)" -ForegroundColor Cyan
    Write-Host "   📦 Cantidad Productos: $($resultado2.cantidadProductos)" -ForegroundColor Cyan
    Write-Host "   💰 Ganancia Total: $($resultado2.gananciaTotal)" -ForegroundColor Cyan
}
Write-Host ""

# TEST 3: Dashboard - Top 5 Productos por Cantidad
$url3 = "$baseUrl/api/dashboard/top5-productos-cantidad/empresa/$empresaId`?fechaInicio=$fechaInicio&fechaFin=$fechaFin"
$resultado3 = Test-Endpoint -Nombre "TEST 3: Top 5 Productos Más Vendidos (Cantidad)" -Url $url3 -Headers $headers
if ($resultado3 -and $resultado3.Length -gt 0) {
    Write-Host "   🏆 Top 1: $($resultado3[0].nombreProducto) - $($resultado3[0].cantidadVendida) unidades" -ForegroundColor Cyan
}
Write-Host ""

# TEST 4: Dashboard - Top 10 Productos por Monto
$url4 = "$baseUrl/api/dashboard/top10-productos-monto/empresa/$empresaId`?fechaInicio=$fechaInicio&fechaFin=$fechaFin"
$resultado4 = Test-Endpoint -Nombre "TEST 4: Top 10 Productos Más Vendidos (Monto)" -Url $url4 -Headers $headers
if ($resultado4 -and $resultado4.Length -gt 0) {
    Write-Host "   🏆 Top 1: $($resultado4[0].nombreProducto) - S/ $($resultado4[0].montoTotal)" -ForegroundColor Cyan
}
Write-Host ""

# TEST 5: Dashboard - Ventas por Fecha
$url5 = "$baseUrl/api/dashboard/ventas-por-fecha/empresa/$empresaId`?fechaInicio=$fechaInicio&fechaFin=$fechaFin"
$resultado5 = Test-Endpoint -Nombre "TEST 5: Ventas Agrupadas por Fecha" -Url $url5 -Headers $headers

# TEST 6: Dashboard - Ventas por Método de Pago
$url6 = "$baseUrl/api/dashboard/ventas-por-metodo-pago/empresa/$empresaId`?fechaInicio=$fechaInicio&fechaFin=$fechaFin"
$resultado6 = Test-Endpoint -Nombre "TEST 6: Ventas por Método de Pago" -Url $url6 -Headers $headers
if ($resultado6) {
    foreach ($metodo in $resultado6) {
        Write-Host "   💳 $($metodo.metodoPago): S/ $($metodo.totalVentas) ($($metodo.cantidadVentas) ventas)" -ForegroundColor Cyan
    }
}
Write-Host ""

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "     📋 PRUEBAS DE ENDPOINTS REPORTES" -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

# TEST 7: Reporte - Stock Bajo Mínimo
$url7 = "$baseUrl/api/reportes/stock-bajo-minimo?sucursalId=$sucursalId&almacenId=$almacenId"
$resultado7 = Test-Endpoint -Nombre "TEST 7: Reporte Stock Bajo Mínimo" -Url $url7 -Headers $headers
if ($resultado7 -and $resultado7.Length -gt 0) {
    Write-Host "   ⚠️ Productos con stock bajo: $($resultado7.Length)" -ForegroundColor Yellow
    $resultado7 | Select-Object -First 3 | ForEach-Object {
        Write-Host "      - $($_.nombreProducto): Stock $($_.stockActual) / Mínimo $($_.stockMinimo)" -ForegroundColor Gray
    }
}
Write-Host ""

# TEST 8: Reporte - Stock Valorizado por Almacén
$url8 = "$baseUrl/api/reportes/stock-por-almacen?sucursalId=$sucursalId&almacenId=$almacenId"
$resultado8 = Test-Endpoint -Nombre "TEST 8: Reporte Stock Valorizado" -Url $url8 -Headers $headers
if ($resultado8) {
    $valorTotal = ($resultado8 | Measure-Object -Property valorInventario -Sum).Sum
    Write-Host "   💰 Valor Total del Inventario: S/ $valorTotal" -ForegroundColor Cyan
}
Write-Host ""

# TEST 9: Reporte - Ventas por Sucursal
$url9 = "$baseUrl/api/reportes/ventas-por-sucursal/$sucursalId`?fechaInicio=$fechaInicio&fechaFin=$fechaFin"
$resultado9 = Test-Endpoint -Nombre "TEST 9: Reporte Ventas por Sucursal" -Url $url9 -Headers $headers
if ($resultado9) {
    $totalVentas = ($resultado9 | Measure-Object -Property totalVenta -Sum).Sum
    Write-Host "   💵 Total Ventas: S/ $totalVentas" -ForegroundColor Cyan
    Write-Host "   🧾 Número de Ventas: $($resultado9.Length)" -ForegroundColor Cyan
}
Write-Host ""

# Resumen final
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "     📊 RESUMEN DE PRUEBAS" -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Tests Exitosos: $testsPasados" -ForegroundColor Green
Write-Host "❌ Tests Fallidos: $testsFallidos" -ForegroundColor Red
Write-Host ""

if ($testsFallidos -eq 0) {
    Write-Host "🎉 ¡TODAS LAS PRUEBAS PASARON CORRECTAMENTE!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Algunas pruebas fallaron. Revisa los errores arriba." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan
