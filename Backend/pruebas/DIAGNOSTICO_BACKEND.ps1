# Script de diagnostico del backend

$BASE_URL = "http://localhost:8080/api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DIAGNOSTICO DEL BACKEND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Verificar que el puerto este abierto
Write-Host "[1/4] Verificando puerto 8080..." -ForegroundColor Yellow
try {
    $connection = Test-NetConnection -ComputerName localhost -Port 8080 -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Write-Host "[OK] Puerto 8080 esta abierto" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Puerto 8080 no responde" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[ERROR] No se pudo verificar el puerto: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Hacer login con diferentes metodos
Write-Host ""
Write-Host "[2/4] Probando endpoint de login..." -ForegroundColor Yellow

$loginBody = @{
    correo = "admin@correo.com"
    password = "123"
} | ConvertTo-Json

Write-Host "Body: $loginBody" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -TimeoutSec 10 `
        -ErrorAction Stop
    
    Write-Host "[OK] Login exitoso" -ForegroundColor Green
    Write-Host "Token recibido: $($response.token.Substring(0, 20))..." -ForegroundColor Gray
    $global:TOKEN = $response.token
    
} catch {
    Write-Host "[ERROR] Fallo el login" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    
    # Intentar obtener el body del error
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Intentando con password alternativa..." -ForegroundColor Yellow
    
    $loginBody2 = @{
        correo = "admin@correo.com"
        password = "123456"
    } | ConvertTo-Json
    
    try {
        $response2 = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" `
            -Method POST `
            -Body $loginBody2 `
            -ContentType "application/json" `
            -TimeoutSec 10
        
        Write-Host "[OK] Login exitoso con password alternativa" -ForegroundColor Green
        $global:TOKEN = $response2.token
    } catch {
        Write-Host "[ERROR] Tambien fallo con password alternativa" -ForegroundColor Red
        Write-Host "Verifica que exista un usuario admin@correo.com en la base de datos" -ForegroundColor Yellow
        exit 1
    }
}

# Test 3: Probar endpoint simple
if ($global:TOKEN) {
    Write-Host ""
    Write-Host "[3/4] Probando endpoint /api/modulos..." -ForegroundColor Yellow
    
    $headers = @{
        "Authorization" = "Bearer $global:TOKEN"
    }
    
    try {
        $modulos = Invoke-RestMethod -Uri "$BASE_URL/modulos" -Method GET -Headers $headers
        Write-Host "[OK] Endpoint funciona. Modulos encontrados: $($modulos.Count)" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Fallo el endpoint de modulos: $_" -ForegroundColor Red
    }
    
    # Test 4: Probar endpoint de empresa
    Write-Host ""
    Write-Host "[4/4] Probando endpoint /api/empresas/usuario/1..." -ForegroundColor Yellow
    
    try {
        $empresa = Invoke-RestMethod -Uri "$BASE_URL/empresas/usuario/1" -Method GET -Headers $headers
        Write-Host "[OK] Endpoint funciona. Empresa: $($empresa.nombre)" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Fallo el endpoint de empresa: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DIAGNOSTICO COMPLETADO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
