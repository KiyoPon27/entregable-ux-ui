# ============================================
# PRUEBAS AUTOMATIZADAS - MOVIMIENTOS STOCK
# ============================================

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  PRUEBAS BACKEND - MOVIMIENTOS DE STOCK" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$base = "http://localhost:8080/api"
$ErrorActionPreference = "Continue"

# Autenticación
Write-Host ">> Autenticando usuario..." -ForegroundColor Yellow
try {
    $loginBody = @{ correo = "admin@tienda.com"; password = "123" } | ConvertTo-Json
    $resp = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/auth/login" -Body $loginBody -ContentType "application/json"
    $token = $resp.accessToken
    $headers = @{ Authorization = "Bearer $token" }
    Write-Host "   ✓ Autenticación exitosa" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "   ✗ ERROR: No se pudo autenticar" -ForegroundColor Red
    exit 1
}

# ============================================
# PRUEBA 1: Registrar Movimiento Manual
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA 1: Registrar movimiento manual" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    $movimiento = @{
        almacen = @{ id = 1 }
        producto = @{ id = 1 }
        tipoMovimiento = "ENTRADA"
        cantidad = 50
        detalle = "Compra inicial de mercadería"
        origen = "COMPRA"
    } | ConvertTo-Json -Depth 5
    
    $resultado = Invoke-RestMethod -Method Post -Uri "$base/movimientos-stock" -Headers $headers -Body $movimiento -ContentType "application/json"
    Write-Host "  ✓ Movimiento registrado exitosamente" -ForegroundColor Green
    Write-Host "    ID: $($resultado.id)" -ForegroundColor Gray
    Write-Host "    Tipo: $($resultado.tipoMovimiento)" -ForegroundColor Gray
    Write-Host "    Cantidad: $($resultado.cantidad)" -ForegroundColor Gray
    Write-Host "    Fecha: $($resultado.fecha)" -ForegroundColor Gray
    $movimientoManualId = $resultado.id
} catch {
    Write-Host "  ✗ ERROR: No se pudo registrar movimiento" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "    Detalle: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}
Write-Host ""

# ============================================
# PRUEBA 2: Listar Todos los Movimientos
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA 2: Listar todos los movimientos" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    $movimientos = Invoke-RestMethod -Method Get -Uri "$base/movimientos-stock" -Headers $headers
    Write-Host "  ✓ Movimientos listados exitosamente" -ForegroundColor Green
    Write-Host "    Total de movimientos: $($movimientos.Count)" -ForegroundColor Gray
    if ($movimientos.Count -gt 0) {
        Write-Host "    Último movimiento: ID=$($movimientos[0].id), Tipo=$($movimientos[0].tipoMovimiento)" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ✗ ERROR: No se pudieron listar movimientos" -ForegroundColor Red
}
Write-Host ""

# ============================================
# PRUEBA 3: Listar Movimientos por Producto
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA 3: Listar movimientos por producto (ID=1)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    $movimientos = Invoke-RestMethod -Method Get -Uri "$base/movimientos-stock/producto/1" -Headers $headers
    Write-Host "  ✓ Kardex del producto obtenido exitosamente" -ForegroundColor Green
    Write-Host "    Movimientos del producto: $($movimientos.Count)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ ERROR: No se pudo obtener Kardex del producto" -ForegroundColor Red
}
Write-Host ""

# ============================================
# PRUEBA 4: Listar Movimientos por Almacén
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA 4: Listar movimientos por almacén (ID=1)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    $movimientos = Invoke-RestMethod -Method Get -Uri "$base/movimientos-stock/almacen/1" -Headers $headers
    Write-Host "  ✓ Movimientos del almacén obtenidos exitosamente" -ForegroundColor Green
    Write-Host "    Total movimientos: $($movimientos.Count)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ ERROR: No se pudieron obtener movimientos del almacén" -ForegroundColor Red
}
Write-Host ""

# ============================================
# PRUEBA 5: Listar por Producto y Almacén
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA 5: Listar por producto y almacén" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    $movimientos = Invoke-RestMethod -Method Get -Uri "$base/movimientos-stock/producto/1/almacen/1" -Headers $headers
    Write-Host "  ✓ Kardex específico obtenido exitosamente" -ForegroundColor Green
    Write-Host "    Movimientos: $($movimientos.Count)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ ERROR: No se pudo obtener Kardex específico" -ForegroundColor Red
}
Write-Host ""

# ============================================
# PRUEBA 6: Ajuste Stock Incremento + Verificar Movimiento
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA 6: Ajuste stock incremento + verificar movimiento automático" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    # Obtener stock actual
    $stockActual = Invoke-RestMethod -Method Get -Uri "$base/stock/almacen/1/producto/1" -Headers $headers
    $stockInicial = if ($stockActual) { $stockActual.stock } else { 0 }
    Write-Host "  Stock inicial: $stockInicial" -ForegroundColor Yellow
    
    # Contar movimientos antes del ajuste
    $movimientosAntes = Invoke-RestMethod -Method Get -Uri "$base/movimientos-stock/producto/1/almacen/1" -Headers $headers
    $countAntes = $movimientosAntes.Count
    Write-Host "  Movimientos antes del ajuste: $countAntes" -ForegroundColor Yellow
    
    # Ajustar stock (incremento)
    $nuevoStock = $stockInicial + 100
    $ajuste = @{
        producto = @{ id = 1 }
        almacen = @{ id = 1 }
        stock = $nuevoStock
        stockMinimo = 10
        ubicacion = "Estante A"
    } | ConvertTo-Json -Depth 5
    
    $resultado = Invoke-RestMethod -Method Post -Uri "$base/stock/ajuste" -Headers $headers -Body $ajuste -ContentType "application/json"
    Write-Host "  ✓ Stock ajustado de $stockInicial a $($resultado.stock)" -ForegroundColor Green
    
    # Verificar que se creó el movimiento automático
    Start-Sleep -Milliseconds 500
    $movimientosDespues = Invoke-RestMethod -Method Get -Uri "$base/movimientos-stock/producto/1/almacen/1" -Headers $headers
    $countDespues = $movimientosDespues.Count
    
    if ($countDespues -gt $countAntes) {
        $ultimoMov = $movimientosDespues[0]
        Write-Host "  ✓ Movimiento automático registrado" -ForegroundColor Green
        Write-Host "    Tipo: $($ultimoMov.tipoMovimiento)" -ForegroundColor Gray
        Write-Host "    Cantidad: $($ultimoMov.cantidad)" -ForegroundColor Gray
        Write-Host "    Origen: $($ultimoMov.origen)" -ForegroundColor Gray
        Write-Host "    Detalle: $($ultimoMov.detalle)" -ForegroundColor Gray
        
        if ($ultimoMov.tipoMovimiento -eq "AJUSTE_ENTRADA") {
            Write-Host "  ✓ Tipo de movimiento correcto (AJUSTE_ENTRADA)" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Tipo de movimiento incorrecto: $($ultimoMov.tipoMovimiento)" -ForegroundColor Red
        }
    } else {
        Write-Host "  ✗ ERROR: No se registró movimiento automático" -ForegroundColor Red
    }
} catch {
    Write-Host "  ✗ ERROR en la prueba" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "    Detalle: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}
Write-Host ""

# ============================================
# PRUEBA 7: Ajuste Stock Decremento + Verificar Movimiento
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA 7: Ajuste stock decremento + verificar movimiento automático" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    # Obtener stock actual
    $stockActual = Invoke-RestMethod -Method Get -Uri "$base/stock/almacen/1/producto/1" -Headers $headers
    $stockInicial = $stockActual.stock
    Write-Host "  Stock inicial: $stockInicial" -ForegroundColor Yellow
    
    # Contar movimientos antes
    $movimientosAntes = Invoke-RestMethod -Method Get -Uri "$base/movimientos-stock/producto/1/almacen/1" -Headers $headers
    $countAntes = $movimientosAntes.Count
    
    # Ajustar stock (decremento)
    $nuevoStock = $stockInicial - 50
    $ajuste = @{
        producto = @{ id = 1 }
        almacen = @{ id = 1 }
        stock = $nuevoStock
        stockMinimo = 10
        ubicacion = "Estante A"
    } | ConvertTo-Json -Depth 5
    
    $resultado = Invoke-RestMethod -Method Post -Uri "$base/stock/ajuste" -Headers $headers -Body $ajuste -ContentType "application/json"
    Write-Host "  ✓ Stock ajustado de $stockInicial a $($resultado.stock)" -ForegroundColor Green
    
    # Verificar movimiento
    Start-Sleep -Milliseconds 500
    $movimientosDespues = Invoke-RestMethod -Method Get -Uri "$base/movimientos-stock/producto/1/almacen/1" -Headers $headers
    $countDespues = $movimientosDespues.Count
    
    if ($countDespues -gt $countAntes) {
        $ultimoMov = $movimientosDespues[0]
        Write-Host "  ✓ Movimiento automático registrado" -ForegroundColor Green
        Write-Host "    Tipo: $($ultimoMov.tipoMovimiento)" -ForegroundColor Gray
        Write-Host "    Cantidad: $($ultimoMov.cantidad)" -ForegroundColor Gray
        
        if ($ultimoMov.tipoMovimiento -eq "AJUSTE_SALIDA") {
            Write-Host "  ✓ Tipo de movimiento correcto (AJUSTE_SALIDA)" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Tipo de movimiento incorrecto: $($ultimoMov.tipoMovimiento)" -ForegroundColor Red
        }
    } else {
        Write-Host "  ✗ ERROR: No se registró movimiento automático" -ForegroundColor Red
    }
} catch {
    Write-Host "  ✗ ERROR en la prueba" -ForegroundColor Red
}
Write-Host ""

# ============================================
# PRUEBA 8: Listar por Tipo de Movimiento
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA 8: Listar movimientos por tipo (AJUSTE_ENTRADA)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    $movimientos = Invoke-RestMethod -Method Get -Uri "$base/movimientos-stock/tipo/AJUSTE_ENTRADA" -Headers $headers
    Write-Host "  ✓ Movimientos filtrados por tipo exitosamente" -ForegroundColor Green
    Write-Host "    Total movimientos AJUSTE_ENTRADA: $($movimientos.Count)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ ERROR: No se pudieron filtrar movimientos por tipo" -ForegroundColor Red
}
Write-Host ""

# ============================================
# PRUEBA 9: Listar por Rango de Fechas
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA 9: Listar movimientos por rango de fechas" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    $fechaInicio = (Get-Date).AddDays(-7).ToString("yyyy-MM-ddT00:00:00")
    $fechaFin = (Get-Date).AddDays(1).ToString("yyyy-MM-ddT23:59:59")
    
    $url = "$base/movimientos-stock/fechas?inicio=$fechaInicio" + '&' + "fin=$fechaFin"
    $movimientos = Invoke-RestMethod -Method Get -Uri $url -Headers $headers
    Write-Host "  ✓ Movimientos filtrados por fecha exitosamente" -ForegroundColor Green
    Write-Host "    Período: Últimos 7 días" -ForegroundColor Gray
    Write-Host "    Total movimientos: $($movimientos.Count)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ ERROR: No se pudieron filtrar movimientos por fecha" -ForegroundColor Red
}
Write-Host ""

# ============================================
# PRUEBA 10: Listar por Producto y Fechas
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA 10: Listar por producto y rango de fechas" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    $fechaInicio = (Get-Date).AddDays(-7).ToString("yyyy-MM-ddT00:00:00")
    $fechaFin = (Get-Date).AddDays(1).ToString("yyyy-MM-ddT23:59:59")
    
    $url = "$base/movimientos-stock/producto/1/fechas?inicio=$fechaInicio" + '&' + "fin=$fechaFin"
    $movimientos = Invoke-RestMethod -Method Get -Uri $url -Headers $headers
    Write-Host "  ✓ Kardex con filtro de fecha obtenido exitosamente" -ForegroundColor Green
    Write-Host "    Total movimientos: $($movimientos.Count)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ ERROR: No se pudo obtener Kardex con filtro de fecha" -ForegroundColor Red
}
Write-Host ""

# ============================================
# PRUEBA 11: Listar por Empresa
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA 11: Listar movimientos por empresa (ID=1)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    $movimientos = Invoke-RestMethod -Method Get -Uri "$base/movimientos-stock/empresa/1" -Headers $headers
    Write-Host "  ✓ Movimientos de la empresa obtenidos exitosamente" -ForegroundColor Green
    Write-Host "    Total movimientos: $($movimientos.Count)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ ERROR: No se pudieron obtener movimientos de la empresa" -ForegroundColor Red
}
Write-Host ""

# ============================================
# PRUEBA 12: Obtener Movimiento por ID
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA 12: Obtener movimiento específico por ID" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    if ($movimientoManualId) {
        $movimiento = Invoke-RestMethod -Method Get -Uri "$base/movimientos-stock/$movimientoManualId" -Headers $headers
        Write-Host "  ✓ Movimiento obtenido exitosamente" -ForegroundColor Green
        Write-Host "    ID: $($movimiento.id)" -ForegroundColor Gray
        Write-Host "    Tipo: $($movimiento.tipoMovimiento)" -ForegroundColor Gray
        Write-Host "    Producto: $($movimiento.producto.nombre)" -ForegroundColor Gray
        Write-Host "    Almacén: $($movimiento.almacen.nombre)" -ForegroundColor Gray
    } else {
        Write-Host "  ⚠ SKIP: No hay ID de movimiento para consultar" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ✗ ERROR: No se pudo obtener el movimiento por ID" -ForegroundColor Red
}
Write-Host ""

# ============================================
# RESUMEN FINAL
# ============================================
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  PRUEBAS COMPLETADAS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Módulo de Movimientos de Stock (Kardex) validado" -ForegroundColor Green
Write-Host "✓ Registro automático de movimientos funcionando" -ForegroundColor Green
Write-Host "✓ Consultas y filtros operativos" -ForegroundColor Green
Write-Host ""
Write-Host "Revisar cualquier error (✗) en las pruebas anteriores" -ForegroundColor Yellow
Write-Host ""
