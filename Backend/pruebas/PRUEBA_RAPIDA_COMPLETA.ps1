# PRUEBA RÁPIDA COMPLETA - Verifica todos los módulos críticos
# REQUISITO: Backend debe estar ejecutándose en http://localhost:8080

$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:8080"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   PRUEBA RÁPIDA - TODOS LOS MÓDULOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Variables globales
$token = $null
$idEmpresa = $null
$idCategoria = $null
$idProducto = $null
$idSucursal = $null
$idAlmacen = $null

try {
    # 1. AUTH - Login
    Write-Host "1. AUTENTICACION..." -ForegroundColor Yellow
    $loginBody = @{
        correo = "admin@example.com"
        password = "admin123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "   ✓ Login exitoso" -ForegroundColor Green
    
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    # Obtener contexto
    $meResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method Get -Headers $headers
    $idEmpresa = $meResponse.empresa.id
    Write-Host "   ✓ Empresa ID: $idEmpresa" -ForegroundColor Green
    Write-Host ""
    
    # 2. CATEGORIAS
    Write-Host "2. CATEGORIAS..." -ForegroundColor Yellow
    $catBody = @{
        nombre = "TEST_CAT_$(Get-Date -Format 'HHmmss')"
        color = "#FF5733"
        icono = "🔧"
        id_empresa = $idEmpresa
    } | ConvertTo-Json
    
    $catResponse = Invoke-RestMethod -Uri "$baseUrl/api/categorias" -Method Post -Body $catBody -ContentType "application/json" -Headers $headers
    $idCategoria = $catResponse.id
    Write-Host "   ✓ Categoria creada: ID $idCategoria" -ForegroundColor Green
    Write-Host ""
    
    # 3. PRODUCTOS
    Write-Host "3. PRODUCTOS..." -ForegroundColor Yellow
    $prodBody = @{
        nombre = "TEST_PROD_$(Get-Date -Format 'HHmmss')"
        precioVenta = 15.50
        precioCompra = 10.00
        codigoBarras = "TEST$(Get-Date -Format 'yyyyMMddHHmmss')"
        id_categoria = $idCategoria
        id_empresa = $idEmpresa
    } | ConvertTo-Json
    
    $prodResponse = Invoke-RestMethod -Uri "$baseUrl/api/productos" -Method Post -Body $prodBody -ContentType "application/json" -Headers $headers
    $idProducto = $prodResponse.id
    Write-Host "   ✓ Producto creado: ID $idProducto" -ForegroundColor Green
    
    # Verificar GET /productos/{id}
    $prodGet = Invoke-RestMethod -Uri "$baseUrl/api/productos/$idProducto" -Method Get -Headers $headers
    if ($prodGet.id -eq $idProducto) {
        Write-Host "   ✓ GET /productos/{id} funciona" -ForegroundColor Green
    }
    Write-Host ""
    
    # 4. SUCURSALES
    Write-Host "4. SUCURSALES..." -ForegroundColor Yellow
    $sucursales = Invoke-RestMethod -Uri "$baseUrl/api/sucursales/empresa/$idEmpresa" -Method Get -Headers $headers
    if ($sucursales.Count -gt 0) {
        $idSucursal = $sucursales[0].id
        Write-Host "   ✓ Sucursal encontrada: ID $idSucursal" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ No hay sucursales. Crea una primero." -ForegroundColor Yellow
    }
    Write-Host ""
    
    # 5. ALMACENES
    Write-Host "5. ALMACENES..." -ForegroundColor Yellow
    if ($idSucursal) {
        $almBody = @{
            nombre = "TEST_ALM_$(Get-Date -Format 'HHmmss')"
            defecto = $false
            sucursal = @{ id = $idSucursal }
        } | ConvertTo-Json
        
        $almResponse = Invoke-RestMethod -Uri "$baseUrl/api/almacenes" -Method Post -Body $almBody -ContentType "application/json" -Headers $headers
        $idAlmacen = $almResponse.id
        Write-Host "   ✓ Almacen creado: ID $idAlmacen" -ForegroundColor Green
        
        # Verificar GET /almacenes/{id}
        $almGet = Invoke-RestMethod -Uri "$baseUrl/api/almacenes/$idAlmacen" -Method Get -Headers $headers
        if ($almGet.id -eq $idAlmacen) {
            Write-Host "   ✓ GET /almacenes/{id} funciona" -ForegroundColor Green
        }
    } else {
        Write-Host "   ⚠ Saltando (no hay sucursal)" -ForegroundColor Yellow
    }
    Write-Host ""
    
    # 6. STOCK
    Write-Host "6. STOCK..." -ForegroundColor Yellow
    if ($idAlmacen -and $idProducto) {
        $stockBody = @{
            almacen = @{ id = $idAlmacen }
            producto = @{ id = $idProducto }
            stock = 100
            stockMinimo = 10
            ubicacion = "A1"
        } | ConvertTo-Json
        
        $stockResponse = Invoke-RestMethod -Uri "$baseUrl/api/stock/ajuste" -Method Post -Body $stockBody -ContentType "application/json" -Headers $headers
        Write-Host "   ✓ Stock ajustado: $($stockResponse.stock) unidades" -ForegroundColor Green
        
        # Verificar GET específico
        $stockGet = Invoke-RestMethod -Uri "$baseUrl/api/stock/almacen/$idAlmacen/producto/$idProducto" -Method Get -Headers $headers
        if ($stockGet.stock -eq 100) {
            Write-Host "   ✓ GET stock específico funciona" -ForegroundColor Green
        }
    } else {
        Write-Host "   ⚠ Saltando (falta almacen o producto)" -ForegroundColor Yellow
    }
    Write-Host ""
    
    # LIMPIEZA
    Write-Host "7. LIMPIEZA..." -ForegroundColor Yellow
    if ($idAlmacen) {
        try {
            Invoke-RestMethod -Uri "$baseUrl/api/almacenes/$idAlmacen" -Method Delete -Headers $headers | Out-Null
            Write-Host "   ✓ Almacen eliminado" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠ Error al eliminar almacen: $_" -ForegroundColor Yellow
        }
    }
    
    if ($idProducto) {
        try {
            Invoke-RestMethod -Uri "$baseUrl/api/productos/$idProducto" -Method Delete -Headers $headers | Out-Null
            Write-Host "   ✓ Producto eliminado" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠ Error al eliminar producto: $_" -ForegroundColor Yellow
        }
    }
    
    if ($idCategoria) {
        try {
            Invoke-RestMethod -Uri "$baseUrl/api/categorias/$idCategoria" -Method Delete -Headers $headers | Out-Null
            Write-Host "   ✓ Categoria eliminada" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠ Error al eliminar categoria: $_" -ForegroundColor Yellow
        }
    }
    Write-Host ""
    
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   ✓ TODAS LAS PRUEBAS COMPLETADAS" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green

} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "   ✗ ERROR EN PRUEBAS" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host "Detalles:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message -ForegroundColor Yellow
    }
    
    exit 1
}
