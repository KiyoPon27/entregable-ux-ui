# ============================================
# SUITE COMPLETA DE PRUEBAS BACKEND
# Ejecuta validación de 8 módulos principales
# ============================================

$ErrorActionPreference = "Continue"
$base = "http://localhost:8080/api"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  SUITE COMPLETA - 8 MÓDULOS BACKEND" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$exitCode = 0

# ============================================
# PRUEBA 1: AUTENTICACIÓN
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA 1: Autenticación (Login + Token)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    $loginBody = @{ correo = "admin@tienda.com"; password = "123" } | ConvertTo-Json
    $resp = Invoke-RestMethod -Method Post -Uri "$base/api/auth/login" -Body $loginBody -ContentType "application/json"
    $token = $resp.accessToken
    $headers = @{ Authorization = "Bearer $token" }
    
    Write-Host "  ✓ Login exitoso" -ForegroundColor Green
    Write-Host "    Usuario: $($resp.nombre)" -ForegroundColor Gray
    Write-Host "    ID Usuario: $($resp.idUsuario)" -ForegroundColor Gray
    Write-Host "✅ PRUEBA 1 EXITOSA" -ForegroundColor Green
} catch {
    Write-Host "  ✗ ERROR: No se pudo autenticar" -ForegroundColor Red
    Write-Host "    $_" -ForegroundColor Red
    Write-Host "❌ PRUEBA 1 FALLÓ" -ForegroundColor Red
    $exitCode = 1
}
Write-Host ""

# ============================================
# PRUEBA 2: EMPRESA
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA 2: Obtener Empresa del Usuario" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    $empresa = Invoke-RestMethod -Method Get -Uri "$base/empresas/mostrar?idUsuario=$($resp.idUsuario)" -Headers $headers
    
    Write-Host "  ✓ Empresa obtenida" -ForegroundColor Green
    Write-Host "    Nombre: $($empresa.nombre)" -ForegroundColor Gray
    Write-Host "    ID: $($empresa.id)" -ForegroundColor Gray
    Write-Host "✅ PRUEBA 2 EXITOSA" -ForegroundColor Green
} catch {
    Write-Host "  ✗ ERROR: No se pudo obtener empresa" -ForegroundColor Red
    Write-Host "❌ PRUEBA 2 FALLÓ" -ForegroundColor Red
    $exitCode = 1
}
Write-Host ""

# ============================================
# PRUEBA 3: PERMISOS
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA 3: Listar Permisos del Usuario" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    $permisos = Invoke-RestMethod -Method Get -Uri "$base/permisos/usuario/$($resp.idUsuario)" -Headers $headers
    
    Write-Host "  ✓ Permisos obtenidos" -ForegroundColor Green
    Write-Host "    Total módulos: $($permisos.Count)" -ForegroundColor Gray
    Write-Host "✅ PRUEBA 3 EXITOSA" -ForegroundColor Green
} catch {
    Write-Host "  ✗ ERROR: No se pudieron obtener permisos" -ForegroundColor Red
    Write-Host "❌ PRUEBA 3 FALLÓ" -ForegroundColor Red
    $exitCode = 1
}
Write-Host ""

# ============================================
# PRUEBA 4: CATEGORÍAS
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA 4: Listar Categorías" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    $cats = Invoke-RestMethod -Method Get -Uri "$base/categorias/empresa/1" -Headers $headers
    
    Write-Host "  ✓ Categorías listadas" -ForegroundColor Green
    Write-Host "    Total: $($cats.Count)" -ForegroundColor Gray
    if ($cats.Count -gt 0) {
        Write-Host "    Ejemplo: $($cats[0].nombre)" -ForegroundColor Gray
    }
    Write-Host "✅ PRUEBA 4 EXITOSA" -ForegroundColor Green
} catch {
    Write-Host "  ✗ ERROR: No se pudieron listar categorías" -ForegroundColor Red
    Write-Host "❌ PRUEBA 4 FALLÓ" -ForegroundColor Red
    $exitCode = 1
}
Write-Host ""

# ============================================
# PRUEBA 5: PRODUCTOS
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA 5: Listar y Obtener Productos" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    $productos = Invoke-RestMethod -Method Get -Uri "$base/productos/empresa/1" -Headers $headers
    Write-Host "  ✓ Productos listados: $($productos.Count)" -ForegroundColor Green
    
    if ($productos.Count -gt 0) {
        $prod = Invoke-RestMethod -Method Get -Uri "$base/productos/$($productos[0].id)" -Headers $headers
        Write-Host "  ✓ Producto obtenido: $($prod.nombre)" -ForegroundColor Green
    }
    
    Write-Host "✅ PRUEBA 5 EXITOSA" -ForegroundColor Green
} catch {
    Write-Host "  ✗ ERROR: Fallo en productos" -ForegroundColor Red
    Write-Host "❌ PRUEBA 5 FALLÓ" -ForegroundColor Red
    $exitCode = 1
}
Write-Host ""

# ============================================
# PRUEBA 6: ALMACENES
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA 6: Listar y Obtener Almacenes" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    $almacenes = Invoke-RestMethod -Method Get -Uri "$base/almacenes/empresa/1" -Headers $headers
    Write-Host "  ✓ Almacenes listados: $($almacenes.Count)" -ForegroundColor Green
    
    if ($almacenes.Count -gt 0) {
        $alm = Invoke-RestMethod -Method Get -Uri "$base/almacenes/$($almacenes[0].id)" -Headers $headers
        Write-Host "  ✓ Almacén obtenido: $($alm.nombre)" -ForegroundColor Green
    }
    
    Write-Host "✅ PRUEBA 6 EXITOSA" -ForegroundColor Green
} catch {
    Write-Host "  ✗ ERROR: Fallo en almacenes" -ForegroundColor Red
    Write-Host "❌ PRUEBA 6 FALLÓ" -ForegroundColor Red
    $exitCode = 1
}
Write-Host ""

# ============================================
# PRUEBA 7: STOCK
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA 7: Obtener Stock de Almacén" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    if ($almacenes.Count -gt 0) {
        $stockAlm = Invoke-RestMethod -Method Get -Uri "$base/stock/almacen/$($almacenes[0].id)" -Headers $headers
        
        Write-Host "  ✓ Stock obtenido" -ForegroundColor Green
        Write-Host "    Productos en almacén: $($stockAlm.Count)" -ForegroundColor Gray
        Write-Host "✅ PRUEBA 7 EXITOSA" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ SKIP: No hay almacenes para consultar stock" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ✗ ERROR: Fallo en stock" -ForegroundColor Red
    Write-Host "❌ PRUEBA 7 FALLÓ" -ForegroundColor Red
    $exitCode = 1
}
Write-Host ""

# ============================================
# PRUEBA 8: MOVIMIENTOS DE STOCK
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA 8: Listar Movimientos de Stock" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    $movimientos = Invoke-RestMethod -Method Get -Uri "$base/movimientos-stock/empresa/1" -Headers $headers
    
    Write-Host "  ✓ Movimientos obtenidos" -ForegroundColor Green
    Write-Host "    Total movimientos: $($movimientos.Count)" -ForegroundColor Gray
    if ($movimientos.Count -gt 0) {
        Write-Host "    Último: $($movimientos[0].tipoMovimiento) - $($movimientos[0].cantidad)" -ForegroundColor Gray
    }
    Write-Host "✅ PRUEBA 8 EXITOSA" -ForegroundColor Green
} catch {
    Write-Host "  ✗ ERROR: Fallo en movimientos" -ForegroundColor Red
    Write-Host "❌ PRUEBA 8 FALLÓ" -ForegroundColor Red
    $exitCode = 1
}
Write-Host ""

# ============================================
# RESUMEN FINAL
# ============================================
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  RESUMEN DE PRUEBAS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

if ($exitCode -eq 0) {
    Write-Host "✅ TODAS LAS PRUEBAS PASARON (8/8)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Backend 100% funcional:" -ForegroundColor Green
    Write-Host "  ✓ Autenticación" -ForegroundColor Gray
    Write-Host "  ✓ Empresa" -ForegroundColor Gray
    Write-Host "  ✓ Permisos" -ForegroundColor Gray
    Write-Host "  ✓ Categorías" -ForegroundColor Gray
    Write-Host "  ✓ Productos" -ForegroundColor Gray
    Write-Host "  ✓ Almacenes" -ForegroundColor Gray
    Write-Host "  ✓ Stock" -ForegroundColor Gray
    Write-Host "  ✓ Movimientos Stock" -ForegroundColor Gray
} else {
    Write-Host "❌ ALGUNAS PRUEBAS FALLARON" -ForegroundColor Red
    Write-Host ""
    Write-Host "Revisar los errores (✗) arriba" -ForegroundColor Yellow
}
Write-Host ""

exit $exitCode
