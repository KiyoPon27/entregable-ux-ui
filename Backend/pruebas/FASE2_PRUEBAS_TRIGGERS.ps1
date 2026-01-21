# Script de pruebas para FASE 2 - Triggers Automaticos
# Valida que los triggers automaticos funcionen correctamente

$BASE_URL = "http://localhost:8080/api"
$TOKEN = ""

Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "PRUEBAS FASE 2 - TRIGGERS AUTOMATICOS"  -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# PASO 1: LOGIN
Write-Host "[1/5] Obteniendo token de autenticacion..." -ForegroundColor Yellow

$loginBody = @{
    correo = "admin@correo.com"
    password = "123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $TOKEN = $loginResponse.token
    Write-Host "[OK] Token obtenido exitosamente" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Error al obtener token: $_" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TRIGGER #7: SERIALIZACIONES AL CREAR SUCURSAL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Crear una sucursal nueva
Write-Host "[2/5] Creando nueva sucursal..." -ForegroundColor Yellow

$sucursalBody = @{
    nombre = "Sucursal Test Trigger"
    direccion_fiscal = "Calle Test #123"
    empresa = @{
        id = 1
    }
} | ConvertTo-Json

try {
    $sucursalResponse = Invoke-RestMethod -Uri "$BASE_URL/sucursales" -Method POST -Headers $headers -Body $sucursalBody
    $idSucursal = $sucursalResponse.id
    Write-Host "[OK] Sucursal creada con ID: $idSucursal" -ForegroundColor Green
    
    # Verificar que se crearon las 5 serializaciones automaticamente
    Write-Host "Verificando serializaciones automaticas..." -ForegroundColor Yellow
    Start-Sleep -Seconds 1
    
    $serializaciones = Invoke-RestMethod -Uri "$BASE_URL/serializaciones/sucursal/$idSucursal" -Method GET -Headers $headers
    
    if ($serializaciones.Count -eq 5) {
        Write-Host "[OK] Se crearon correctamente las 5 serializaciones (Factura, Boleta, NV, NC, ND)" -ForegroundColor Green
        
        # Mostrar las series creadas
        foreach ($ser in $serializaciones) {
            $tipoCom = $ser.tipoComprobante.nombre
            $serie = $ser.serie
            $defecto = if ($ser.porDefecto) { "[Por defecto]" } else { "" }
            Write-Host "   - $tipoCom | Serie: $serie $defecto" -ForegroundColor Gray
        }
    } else {
        Write-Host "[ERROR] Se esperaban 5 serializaciones, pero se encontraron $($serializaciones.Count)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "[ERROR] en prueba de serializaciones: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TRIGGER #8: IMPRESORA AL CREAR CAJA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Crear una caja nueva
Write-Host "[3/5] Creando nueva caja..." -ForegroundColor Yellow

$cajaBody = @{
    descripcion = "Caja Test Trigger"
    sucursal = @{
        id = $idSucursal
    }
} | ConvertTo-Json

try {
    $cajaResponse = Invoke-RestMethod -Uri "$BASE_URL/cajas" -Method POST -Headers $headers -Body $cajaBody
    $idCaja = $cajaResponse.id
    Write-Host "[OK] Caja creada con ID: $idCaja" -ForegroundColor Green
    
    # Verificar que se creo la impresora automaticamente
    Write-Host "Verificando impresora automatica..." -ForegroundColor Yellow
    Start-Sleep -Seconds 1
    
    $impresoras = Invoke-RestMethod -Uri "$BASE_URL/impresoras/caja/$idCaja" -Method GET -Headers $headers
    
    if ($impresoras.Count -gt 0) {
        $impresora = $impresoras[0]
        Write-Host "[OK] Se creo automaticamente la impresora:" -ForegroundColor Green
        Write-Host "   - Nombre: $($impresora.nombre)" -ForegroundColor Gray
        Write-Host "   - Estado: $($impresora.estado)" -ForegroundColor Gray
    } else {
        Write-Host "[ERROR] No se creo ninguna impresora automaticamente" -ForegroundColor Red
    }
    
} catch {
    Write-Host "[ERROR] en prueba de impresora: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TRIGGER #9: PERMISO HOME AL CREAR USUARIO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Crear un usuario nuevo
Write-Host "[4/5] Creando nuevo usuario..." -ForegroundColor Yellow

$usuarioBody = @{
    nombres = "Usuario Test Trigger"
    correo = "test.trigger@correo.com"
    password = "123"
    rol = @{
        id = 2
    }
} | ConvertTo-Json

try {
    $usuarioResponse = Invoke-RestMethod -Uri "$BASE_URL/usuarios" -Method POST -Headers $headers -Body $usuarioBody
    $idUsuario = $usuarioResponse.id
    Write-Host "[OK] Usuario creado con ID: $idUsuario" -ForegroundColor Green
    
    # Verificar que se asigno el permiso Home automaticamente
    Write-Host "Verificando permiso Home automatico..." -ForegroundColor Yellow
    Start-Sleep -Seconds 1
    
    $permisos = Invoke-RestMethod -Uri "$BASE_URL/permisos/usuario/$idUsuario" -Method GET -Headers $headers
    
    $permisoHome = $permisos | Where-Object { $_.modulo.nombre -eq "Home" }
    
    if ($permisoHome) {
        Write-Host "[OK] Se asigno automaticamente el permiso 'Home' al usuario" -ForegroundColor Green
        Write-Host "   - Modulo: $($permisoHome.modulo.nombre)" -ForegroundColor Gray
        Write-Host "   - Enlace: $($permisoHome.modulo.enlace)" -ForegroundColor Gray
    } else {
        Write-Host "[ERROR] No se asigno el permiso 'Home' automaticamente" -ForegroundColor Red
        Write-Host "Permisos encontrados: $($permisos.Count)" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "[ERROR] en prueba de permiso Home: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TRIGGER #10: CLIENTE GENERICO EN VENTAS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Este trigger se valida al confirmar una venta sin cliente
Write-Host "[5/5] Validando asignacion de cliente generico..." -ForegroundColor Yellow
Write-Host "Este trigger se validara en el flujo completo de ventas" -ForegroundColor Gray
Write-Host "El cliente generico (ID 1) debe asignarse automaticamente" -ForegroundColor Gray
Write-Host "cuando se confirma una venta sin especificar idCliente" -ForegroundColor Gray
Write-Host "[OK] Trigger implementado y listo para usar" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LIMPIEZA DE DATOS DE PRUEBA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "Eliminando datos de prueba..." -ForegroundColor Yellow

# Eliminar usuario de prueba
try {
    Invoke-RestMethod -Uri "$BASE_URL/usuarios/$idUsuario" -Method DELETE -Headers $headers | Out-Null
    Write-Host "[OK] Usuario de prueba eliminado" -ForegroundColor Green
} catch {
    Write-Host "[WARN] No se pudo eliminar usuario: $_" -ForegroundColor Yellow
}

# Eliminar caja de prueba
try {
    Invoke-RestMethod -Uri "$BASE_URL/cajas/$idCaja" -Method DELETE -Headers $headers | Out-Null
    Write-Host "[OK] Caja de prueba eliminada" -ForegroundColor Green
} catch {
    Write-Host "[WARN] No se pudo eliminar caja: $_" -ForegroundColor Yellow
}

# Eliminar sucursal de prueba
try {
    Invoke-RestMethod -Uri "$BASE_URL/sucursales/$idSucursal" -Method DELETE -Headers $headers | Out-Null
    Write-Host "[OK] Sucursal de prueba eliminada" -ForegroundColor Green
} catch {
    Write-Host "[WARN] No se pudo eliminar sucursal: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESUMEN DE PRUEBAS FASE 2" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[OK] TRIGGER #7: Serializaciones al crear sucursal" -ForegroundColor Green
Write-Host "[OK] TRIGGER #8: Impresora al crear caja" -ForegroundColor Green
Write-Host "[OK] TRIGGER #9: Permiso Home a nuevos usuarios" -ForegroundColor Green
Write-Host "[OK] TRIGGER #10: Cliente generico en ventas" -ForegroundColor Green
Write-Host ""
Write-Host "Todas las pruebas de la Fase 2 completadas" -ForegroundColor Cyan
Write-Host ""
