# INSTRUCCIONES PARA PROBAR CATEGORÍAS CON VALIDACIONES

## Backend ya está corriendo en puerto 8080

## PRUEBAS MANUALES CON POWERSHELL

Abre una **NUEVA ventana de PowerShell** (no la misma donde corre el backend) y ejecuta estos comandos:

### 1. Login y obtener token
```powershell
$base = "http://localhost:8080/api"
$loginBody = @{ correo = "admin@tienda.com"; password = "123" } | ConvertTo-Json
$resp = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -Body $loginBody -ContentType "application/json"
$token = $resp.accessToken
$headers = @{ Authorization = "Bearer $token" }
Write-Host "Token obtenido: Usuario $($resp.nombre)" -ForegroundColor Green
```

### 2. Listar categorías actuales
```powershell
$cats = Invoke-RestMethod -Method Get -Uri "$base/categorias/empresa/1" -Headers $headers
Write-Host "Categorias actuales: $($cats.Count)" -ForegroundColor Cyan
$cats | Format-Table id, nombre, color
```

### 3. Crear categoría nueva (debe funcionar)
```powershell
$nueva = @{
    nombre = "Electrodomesticos"
    color = "#3498db"
    icono = "electric"
    empresa = @{ id = 1 }
} | ConvertTo-Json -Depth 5

$catCreada = Invoke-RestMethod -Method Post -Uri "$base/categorias" -Headers $headers -Body $nueva -ContentType "application/json"
Write-Host "Categoria creada con ID: $($catCreada.id)" -ForegroundColor Green
$idTest = $catCreada.id
```

### 4. PRUEBA DE VALIDACIÓN: Intentar crear duplicada (debe FALLAR con error 409)
```powershell
$duplicada = @{
    nombre = "Electrodomesticos"  # Mismo nombre
    color = "#e74c3c"
    icono = "plug"
    empresa = @{ id = 1 }
} | ConvertTo-Json -Depth 5

try {
    Invoke-RestMethod -Method Post -Uri "$base/categorias" -Headers $headers -Body $duplicada -ContentType "application/json"
    Write-Host "ERROR: Se permitio duplicado!" -ForegroundColor Red
} catch {
    $err = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "VALIDACION CORRECTA: Duplicado rechazado" -ForegroundColor Green
    Write-Host "  Status: $($err.status)" -ForegroundColor Yellow
    Write-Host "  Mensaje: $($err.message)" -ForegroundColor Yellow
}
```

### 5. Editar categoría (debe funcionar)
```powershell
$editada = @{
    nombre = "Electrodomesticos Premium"
    color = "#9b59b6"
    icono = "premium"
} | ConvertTo-Json -Depth 5

$catActualizada = Invoke-RestMethod -Method Put -Uri "$base/categorias/$idTest" -Headers $headers -Body $editada -ContentType "application/json"
Write-Host "Categoria editada: $($catActualizada.nombre)" -ForegroundColor Green
```

### 6. PRUEBA DE VALIDACIÓN: Editar con nombre duplicado (debe FALLAR con error 409)
```powershell
$conflicto = @{
    nombre = "Abarrotes"  # Ya existe en otra categoría
    color = "#e74c3c"
    icono = "cart"
} | ConvertTo-Json -Depth 5

try {
    Invoke-RestMethod -Method Put -Uri "$base/categorias/$idTest" -Headers $headers -Body $conflicto -ContentType "application/json"
    Write-Host "ERROR: Se permitio duplicado en edicion!" -ForegroundColor Red
} catch {
    $err = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "VALIDACION CORRECTA: Duplicado rechazado en edicion" -ForegroundColor Green
    Write-Host "  Status: $($err.status)" -ForegroundColor Yellow
    Write-Host "  Mensaje: $($err.message)" -ForegroundColor Yellow
}
```

### 7. Buscar categorías
```powershell
$busqueda = Invoke-RestMethod -Method Get -Uri "$base/categorias/buscar/1?q=beb" -Headers $headers
Write-Host "Busqueda 'beb': $($busqueda.Count) resultados" -ForegroundColor Cyan
$busqueda | Format-Table nombre, color
```

### 8. Eliminar categoría de prueba
```powershell
Invoke-RestMethod -Method Delete -Uri "$base/categorias/$idTest" -Headers $headers
Write-Host "Categoria $idTest eliminada" -ForegroundColor Green
```

### 9. PRUEBA DE VALIDACIÓN: Eliminar ID inexistente (debe FALLAR con error 404)
```powershell
try {
    Invoke-RestMethod -Method Delete -Uri "$base/categorias/99999" -Headers $headers
    Write-Host "ERROR: Se permitio eliminar ID inexistente!" -ForegroundColor Red
} catch {
    $err = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "VALIDACION CORRECTA: ID inexistente rechazado" -ForegroundColor Green
    Write-Host "  Status: $($err.status)" -ForegroundColor Yellow
    Write-Host "  Mensaje: $($err.message)" -ForegroundColor Yellow
}
```

---

## RESULTADOS ESPERADOS

✅ **CREAR nueva categoría**: Status 201, retorna categoría creada
❌ **CREAR duplicada**: Status 409 (Conflict) con mensaje "Ya existe una categoría con el nombre..."
✅ **EDITAR categoría**: Status 200, retorna categoría actualizada
❌ **EDITAR con duplicado**: Status 409 (Conflict) con mensaje "Ya existe otra categoría con el nombre..."
✅ **ELIMINAR categoría**: Status 204 (No Content)
❌ **ELIMINAR inexistente**: Status 404 (Not Found) con mensaje "Categoría no encontrada..."

---

## VERIFICAR EN LA BASE DE DATOS

Si quieres verificar directamente en MySQL:

```sql
USE LT_Sanchez;
SELECT * FROM categorias WHERE id_empresa = 1;
```

---

## SI TODO FUNCIONA CORRECTAMENTE

Avísame y continuamos con el **Frontend** para adaptar el store de categorías.
