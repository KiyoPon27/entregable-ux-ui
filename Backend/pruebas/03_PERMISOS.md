# PRUEBAS - PERMISOS

## Endpoints Probados
- `GET /api/permisos/usuario/{idUsuario}`

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

## 1. Obtener permisos del usuario autenticado

```powershell
$permisos = Invoke-RestMethod -Method Get -Uri "$base/permisos/usuario/$usuarioId" -Headers $headers
Write-Host "Permisos obtenidos: $($permisos.Count) modulos" -ForegroundColor Green

# Mostrar permisos agrupados por etiqueta
$porEtiqueta = $permisos | Group-Object { $_.modulo.etiquetas }
foreach ($grupo in $porEtiqueta) {
    Write-Host "`n$($grupo.Name):" -ForegroundColor Cyan
    foreach ($permiso in $grupo.Group) {
        Write-Host "  - $($permiso.modulo.nombre) ($($permiso.modulo.enlace))" -ForegroundColor Gray
    }
}
```

**Resultado esperado:**
- Status: 200 OK
- Array de permisos con estructura: `{ id, usuario, modulo: { id, nombre, enlace, etiquetas, ... } }`
- Usuario superadmin debe tener acceso a todos los módulos

---

## 2. Verificar permisos de configuración

```powershell
$permisosConfig = $permisos | Where-Object { $_.modulo.etiquetas -like "*configuracion*" }
Write-Host "Permisos de Configuracion: $($permisosConfig.Count)" -ForegroundColor Cyan
$permisosConfig | ForEach-Object {
    Write-Host "  - $($_.modulo.nombre)" -ForegroundColor Gray
}
```

**Resultado esperado:**
- Módulos como: Categorías, Productos, Empresa, Clientes, etc.

---

## 3. Verificar permisos operativos

```powershell
$permisosOp = $permisos | Where-Object { $_.modulo.etiquetas -like "*operacion*" }
Write-Host "Permisos Operativos: $($permisosOp.Count)" -ForegroundColor Cyan
$permisosOp | ForEach-Object {
    Write-Host "  - $($_.modulo.nombre) ($($_.modulo.enlace))" -ForegroundColor Gray
}
```

**Resultado esperado:**
- Módulos como: Ventas, Dashboard, Inventarios, etc.

---

## 4. Obtener permisos de usuario inexistente

```powershell
try {
    $permisosInexistente = Invoke-RestMethod -Method Get -Uri "$base/permisos/usuario/99999" -Headers $headers
    Write-Host "Permisos retornados: $($permisosInexistente.Count)" -ForegroundColor Yellow
    if ($permisosInexistente.Count -eq 0) {
        Write-Host "CORRECTO: Array vacio para usuario inexistente" -ForegroundColor Green
    }
} catch {
    Write-Host "ADVERTENCIA: Error al obtener permisos de usuario inexistente" -ForegroundColor Yellow
    Write-Host "  Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
}
```

**Resultado esperado:**
- Status: 200 OK con array vacío, o 404 Not Found

---

## 5. Intentar acceder sin autenticación (debe fallar)

```powershell
try {
    Invoke-RestMethod -Method Get -Uri "$base/permisos/usuario/$usuarioId"
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

✅ Obtener permisos del usuario autenticado
✅ Permisos tienen estructura completa con módulo
✅ Módulos agrupados por etiquetas
⚠️ Usuario inexistente retorna array vacío
❌ Acceder sin autenticación
