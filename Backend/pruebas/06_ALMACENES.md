# PRUEBAS - ALMACENES

## Endpoints Probados
- `GET /api/almacenes/empresa/{idEmpresa}`
- `GET /api/almacenes/{id}`
- `POST /api/almacenes`
- `PUT /api/almacenes/{id}`
- `DELETE /api/almacenes/{id}`
- `GET /api/almacenes/buscar/{idEmpresa}?q={query}`
- `GET /api/almacenes/sucursal/{idSucursal}`

---

## Setup: Obtener token

```powershell
$base = "http://localhost:8080/api"
$loginBody = @{ correo = "admin@tienda.com"; password = "123" } | ConvertTo-Json
$resp = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -Body $loginBody -ContentType "application/json"
$token = $resp.accessToken
$headers = @{ Authorization = "Bearer $token" }
Write-Host "Token obtenido: Usuario $($resp.nombre)" -ForegroundColor Green
```

---

## 1. Listar todos los almacenes de la empresa

```powershell
$almacenes = Invoke-RestMethod -Method Get -Uri "$base/almacenes/empresa/1" -Headers $headers
Write-Host "Almacenes encontrados: $($almacenes.Count)" -ForegroundColor Cyan
$almacenes | Format-Table id, nombre, defecto, eliminar
```

**Resultado esperado:**
- Status: 200 OK
- Array de almacenes con: `id`, `nombre`, `defecto`, `eliminar`, `sucursal`, `fechaCreacion`

---

## 2. Obtener un almacén específico

```powershell
if ($almacenes.Count -gt 0) {
    $almacenId = $almacenes[0].id
    $almacen = Invoke-RestMethod -Method Get -Uri "$base/almacenes/$almacenId" -Headers $headers
    Write-Host "Almacen obtenido:" -ForegroundColor Green
    Write-Host "  ID: $($almacen.id)" -ForegroundColor Gray
    Write-Host "  Nombre: $($almacen.nombre)" -ForegroundColor Gray
    Write-Host "  Sucursal: $($almacen.sucursal.nombre)" -ForegroundColor Gray
    Write-Host "  Defecto: $($almacen.defecto)" -ForegroundColor Gray
    Write-Host "  Eliminar: $($almacen.eliminar)" -ForegroundColor Gray
}
```

**Resultado esperado:**
- Status: 200 OK
- Almacén con todos sus datos

---

## 3. Crear nuevo almacén

```powershell
# Primero obtener una sucursal existente
$sucursales = Invoke-RestMethod -Method Get -Uri "$base/sucursales/empresa/1" -Headers $headers
if ($sucursales.Count -eq 0) {
    Write-Host "ERROR: No hay sucursales en la empresa" -ForegroundColor Red
    exit
}
$sucursalId = $sucursales[0].id

$nuevoAlmacen = @{
    nombre = "Almacen Central Test"
    defecto = $false
    eliminar = $true
    sucursal = @{ id = $sucursalId }
} | ConvertTo-Json -Depth 5

$almacenCreado = Invoke-RestMethod -Method Post -Uri "$base/almacenes" -Headers $headers -Body $nuevoAlmacen -ContentType "application/json"
Write-Host "Almacen creado con ID: $($almacenCreado.id)" -ForegroundColor Green
Write-Host "  Nombre: $($almacenCreado.nombre)" -ForegroundColor Gray
Write-Host "  Sucursal: $($almacenCreado.sucursal.nombre)" -ForegroundColor Gray
$idTest = $almacenCreado.id
```

**Resultado esperado:**
- Status: 201 Created (o 200 OK)
- Almacén creado con ID asignado

---

## 4. Crear almacén con nombre duplicado (actualmente NO valida)

```powershell
$almacenDuplicado = @{
    nombre = "Almacen Central Test"  # Mismo nombre
    defecto = $false
    eliminar = $true
    sucursal = @{ id = $sucursalId }
} | ConvertTo-Json -Depth 5

try {
    $duplicado = Invoke-RestMethod -Method Post -Uri "$base/almacenes" -Headers $headers -Body $almacenDuplicado -ContentType "application/json"
    Write-Host "ADVERTENCIA: Se permitio crear almacen duplicado (validacion pendiente)" -ForegroundColor Yellow
    Write-Host "  ID creado: $($duplicado.id)" -ForegroundColor Yellow
    # Guardar ID para limpieza
    $idDuplicado = $duplicado.id
} catch {
    Write-Host "VALIDACION CORRECTA: Duplicado rechazado" -ForegroundColor Green
}
```

**Resultado esperado ACTUAL:**
- ⚠️ Status: 201 Created (PERMITE duplicados - validación pendiente)

**Resultado esperado FUTURO:**
- Status: 409 Conflict con mensaje "Ya existe un almacén con ese nombre"

---

## 5. Editar almacén

```powershell
$almacenEditado = @{
    nombre = "Almacen Central Test EDITADO"
    defecto = $false
    eliminar = $true
    sucursal = @{ id = $sucursalId }
} | ConvertTo-Json -Depth 5

$actualizado = Invoke-RestMethod -Method Put -Uri "$base/almacenes/$idTest" -Headers $headers -Body $almacenEditado -ContentType "application/json"
Write-Host "Almacen editado:" -ForegroundColor Green
Write-Host "  Nombre: $($actualizado.nombre)" -ForegroundColor Gray
Write-Host "  Sucursal: $($actualizado.sucursal.nombre)" -ForegroundColor Gray
```

**Resultado esperado:**
- Status: 200 OK
- Almacén actualizado

---

## 6. Buscar almacenes por nombre

```powershell
$busqueda = Invoke-RestMethod -Method Get -Uri "$base/almacenes/buscar/1?q=central" -Headers $headers
Write-Host "Busqueda 'central': $($busqueda.Count) resultados" -ForegroundColor Cyan
$busqueda | Format-Table nombre, defecto
```

**Resultado esperado:**
- Status: 200 OK
- Array de almacenes que coinciden

---

## 7. Marcar almacén como no eliminable

```powershell
$almacenNoEliminar = @{
    nombre = "Almacen Central Test EDITADO"
    defecto = $false
    eliminar = $false  # No se puede eliminar
    sucursal = @{ id = $sucursalId }
} | ConvertTo-Json -Depth 5

$noEliminar = Invoke-RestMethod -Method Put -Uri "$base/almacenes/$idTest" -Headers $headers -Body $almacenNoEliminar -ContentType "application/json"
Write-Host "Almacen marcado como no eliminable:" -ForegroundColor Green
Write-Host "  Eliminar: $($noEliminar.eliminar)" -ForegroundColor Gray
```

**Resultado esperado:**
- Status: 200 OK
- `eliminar: false`

---

## 8. Eliminar almacén de prueba

```powershell
try {
    Invoke-RestMethod -Method Delete -Uri "$base/almacenes/$idTest" -Headers $headers
    Write-Host "Almacen $idTest eliminado" -ForegroundColor Green
    
    # Si se creo duplicado, eliminarlo tambien
    if ($null -ne $idDuplicado) {
        Invoke-RestMethod -Method Delete -Uri "$base/almacenes/$idDuplicado" -Headers $headers
        Write-Host "Almacen duplicado $idDuplicado eliminado" -ForegroundColor Green
    }
} catch {
    Write-Host "Error al eliminar: $($_.Exception.Message)" -ForegroundColor Red
}
```

**Resultado esperado:**
- Status: 204 No Content (o 200 OK)

---

## 9. Intentar obtener almacén inexistente

```powershell
try {
    $inexistente = Invoke-RestMethod -Method Get -Uri "$base/almacenes/99999" -Headers $headers
    Write-Host "ADVERTENCIA: Se retorno almacen inexistente" -ForegroundColor Yellow
} catch {
    Write-Host "CORRECTO: Almacen inexistente no encontrado" -ForegroundColor Green
    Write-Host "  Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
}
```

**Resultado esperado:**
- Status: 404 Not Found (o null)

---

## 10. Intentar acceder sin autenticación

```powershell
try {
    Invoke-RestMethod -Method Get -Uri "$base/almacenes/empresa/1"
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

✅ Listar almacenes por empresa
✅ Obtener almacén específico
✅ Crear nuevo almacén
✅ Editar almacén existente
✅ Marcar como no eliminable
✅ Buscar almacenes por nombre
⚠️ Obtener almacén inexistente retorna 404 o null
✅ Eliminar almacén
❌ Acceder sin autenticación

## Validaciones Pendientes (para implementar)

⚠️ **NO IMPLEMENTADO**: Validar nombre único en misma sucursal
⚠️ **NO IMPLEMENTADO**: Validar sucursal existe
⚠️ **NO IMPLEMENTADO**: Evitar eliminación de almacén con stock
⚠️ **NO IMPLEMENTADO**: Validar al menos un almacén por sucursal

## Notas Importantes

- Los almacenes pertenecen a **sucursales**, no directamente a empresas
- Campo `defecto`: indica si es el almacén predeterminado de la sucursal
- Campo `eliminar`: indica si se puede eliminar (boolean, no es la acción)
- Para listar por empresa, se usa la relación: Almacen → Sucursal → Empresa
