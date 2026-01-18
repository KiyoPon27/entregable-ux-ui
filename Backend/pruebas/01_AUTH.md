# PRUEBAS - AUTENTICACIÓN (AUTH)

## Endpoints Probados
- `POST /api/auth/login`
- `GET /api/auth/me`

---

## 1. Login con credenciales correctas

```powershell
$base = "http://localhost:8080/api"
$loginBody = @{ 
    correo = "admin@tienda.com"
    password = "123" 
} | ConvertTo-Json

$resp = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -Body $loginBody -ContentType "application/json"
Write-Host "Login exitoso!" -ForegroundColor Green
Write-Host "  Access Token: $($resp.accessToken.Substring(0,20))..." -ForegroundColor Gray
Write-Host "  ID Usuario: $($resp.idUsuario)" -ForegroundColor Gray
Write-Host "  Nombre: $($resp.nombre)" -ForegroundColor Gray
Write-Host "  Rol: $($resp.rol)" -ForegroundColor Gray

# Guardar token para próximas pruebas
$token = $resp.accessToken
$headers = @{ Authorization = "Bearer $token" }
```

**Resultado esperado:**
- Status: 200 OK
- Response con: `accessToken`, `idUsuario`, `nombre`, `rol`

---

## 2. Login con credenciales incorrectas (debe fallar)

```powershell
$loginBad = @{ 
    correo = "admin@tienda.com"
    password = "contraseña_incorrecta" 
} | ConvertTo-Json

try {
    Invoke-RestMethod -Method Post -Uri "$base/auth/login" -Body $loginBad -ContentType "application/json"
    Write-Host "ERROR: Login permitido con credenciales incorrectas!" -ForegroundColor Red
} catch {
    Write-Host "VALIDACION CORRECTA: Login rechazado" -ForegroundColor Green
    Write-Host "  Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
}
```

**Resultado esperado:**
- Status: 401 Unauthorized

---

## 3. Login con usuario inexistente (debe fallar)

```powershell
$loginInexistente = @{ 
    correo = "usuario_inexistente@test.com"
    password = "123" 
} | ConvertTo-Json

try {
    Invoke-RestMethod -Method Post -Uri "$base/auth/login" -Body $loginInexistente -ContentType "application/json"
    Write-Host "ERROR: Login permitido con usuario inexistente!" -ForegroundColor Red
} catch {
    Write-Host "VALIDACION CORRECTA: Usuario inexistente rechazado" -ForegroundColor Green
    Write-Host "  Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
}
```

**Resultado esperado:**
- Status: 401 Unauthorized

---

## 4. Obtener contexto del usuario autenticado (/me)

```powershell
# Usar el token obtenido en la prueba 1
$contexto = Invoke-RestMethod -Method Get -Uri "$base/auth/me" -Headers $headers
Write-Host "Contexto del usuario obtenido!" -ForegroundColor Green
Write-Host "  Usuario ID: $($contexto.usuario.id)" -ForegroundColor Gray
Write-Host "  Nombre: $($contexto.usuario.nombres)" -ForegroundColor Gray
Write-Host "  Correo: $($contexto.usuario.correo)" -ForegroundColor Gray
Write-Host "  Rol: $($contexto.usuario.rol.nombre)" -ForegroundColor Gray
Write-Host "  Empresa ID: $($contexto.empresa.id)" -ForegroundColor Gray
Write-Host "  Empresa: $($contexto.empresa.nombre)" -ForegroundColor Gray
Write-Host "  Permisos: $($contexto.permisos.Count) modulos" -ForegroundColor Gray
```

**Resultado esperado:**
- Status: 200 OK
- Response con: `usuario`, `empresa`, `asignacion`, `permisos` (array de IDs)

---

## 5. Intentar acceder a /me sin token (debe fallar)

```powershell
try {
    Invoke-RestMethod -Method Get -Uri "$base/auth/me"
    Write-Host "ERROR: Acceso permitido sin token!" -ForegroundColor Red
} catch {
    Write-Host "VALIDACION CORRECTA: Acceso sin token rechazado" -ForegroundColor Green
    Write-Host "  Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
}
```

**Resultado esperado:**
- Status: 401 Unauthorized o 403 Forbidden

---

## 6. Intentar acceder con token invalido (debe fallar)

```powershell
$headersInvalidos = @{ Authorization = "Bearer token_invalido_123" }

try {
    Invoke-RestMethod -Method Get -Uri "$base/auth/me" -Headers $headersInvalidos
    Write-Host "ERROR: Acceso permitido con token invalido!" -ForegroundColor Red
} catch {
    Write-Host "VALIDACION CORRECTA: Token invalido rechazado" -ForegroundColor Green
    Write-Host "  Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
}
```

**Resultado esperado:**
- Status: 401 Unauthorized o 403 Forbidden

---

## Resumen de Validaciones

✅ Login con credenciales correctas
❌ Login con password incorrecta
❌ Login con usuario inexistente
✅ Obtener contexto con token válido
❌ Acceder sin token
❌ Acceder con token inválido
