# Script para iniciar el backend
# Ejecuta esto en una terminal dedicada

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   INICIANDO BACKEND - SPRING BOOT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Matar procesos Java previos
$javaProcesses = Get-Process -Name java -ErrorAction SilentlyContinue
if ($javaProcesses) {
    Write-Host "⚠ Terminando procesos Java anteriores..." -ForegroundColor Yellow
    $javaProcesses | Stop-Process -Force
    Start-Sleep -Seconds 2
    Write-Host "✓ Procesos anteriores terminados" -ForegroundColor Green
    Write-Host ""
}

# Cambiar al directorio del backend
Set-Location $PSScriptRoot

# Iniciar el backend
Write-Host "🚀 Iniciando backend en http://localhost:8080..." -ForegroundColor Green
Write-Host "   Espera hasta ver: 'Started PosbackendApplication'" -ForegroundColor Cyan
Write-Host "   Presiona Ctrl+C para detener el backend" -ForegroundColor Yellow
Write-Host ""

.\gradlew bootRun
