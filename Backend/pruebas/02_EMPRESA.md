# PRUEBAS - EMPRESA

## Endpoints Probados
- `GET /api/empresas/mostrar?idUsuario={id}`

---

## Setup: Obtener token

```powershell
$base = "http://localhost:8080/api"
$loginBody = @{ correo = "admin@tienda.com"; password = "123" } | ConvertTo-Json
$resp = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -Body $loginBody -ContentType "application/json"
$token = $resp.accessToken
$headers = @{ Authorization = "Bearer $token" }
$usuarioId = $resp.idUsuario
Write-Host "Token obtenido para usuario ID: $usuarioId" -ForegroundColor Green
```

---

## 1. Obtener empresa por ID de usuario (superadmin)

```powershell
$empresa = Invoke-RestMethod -Method Get -Uri "$base/empresas/mostrar?idUsuario=$usuarioId" -Headers $headers
Write-Host "Empresa obtenida!" -ForegroundColor Green
Write-Host "  ID: $($empresa.id)" -ForegroundColor Gray
Write-Host "  Nombre: $($empresa.nombre)" -ForegroundColor Gray
Write-Host "  ID Fiscal: $($empresa.idFiscal)" -ForegroundColor Gray
Write-Host "  Direccion: $($empresa.direccionFiscal)" -ForegroundColor Gray
Write-Host "  Simbolo Moneda: $($empresa.simboloMoneda)" -ForegroundColor Gray
Write-Host "  Pais: $($empresa.pais)" -ForegroundColor Gray
Write-Host "  Impuesto: $($empresa.impuesto) ($($empresa.valorImpuesto)%)" -ForegroundColor Gray
Write-Host "  Correo: $($empresa.correo)" -ForegroundColor Gray
```

**Resultado esperado:**
- Status: 200 OK
- Response con datos completos de la empresa

---

## 2. Obtener empresa con usuario inexistente (debe retornar vacío o error)

```powershell
try {
    $empresaInexistente = Invoke-RestMethod -Method Get -Uri "$base/empresas/mostrar?idUsuario=99999" -Headers $headers
    if ($null -eq $empresaInexistente) {
        Write-Host "CORRECTO: No se encontro empresa para usuario inexistente" -ForegroundColor Green
    } else {
        Write-Host "ADVERTENCIA: Se retorno empresa para usuario inexistente" -ForegroundColor Yellow
    }
} catch {
    Write-Host "CORRECTO: Error al buscar usuario inexistente" -ForegroundColor Green
    Write-Host "  Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
}
```

**Resultado esperado:**
- Status: 200 OK con null/empty, o 404 Not Found

---

## 3. Intentar acceder sin autenticación (debe fallar)

```powershell
try {
    Invoke-RestMethod -Method Get -Uri "$base/empresas/mostrar?idUsuario=$usuarioId"
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

✅ Obtener empresa del usuario autenticado
⚠️ Usuario inexistente retorna null/empty o 404
❌ Acceder sin autenticación
