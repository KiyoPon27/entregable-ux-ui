# PRUEBA RÁPIDA - ALMACENES (Verificar correcciones)

## Cambios Importantes

⚠️ **IMPORTANTE**: La ruta cambió de `/api/almacen` a `/api/almacenes` (con 's')

⚠️ **ESTRUCTURA DE DATOS**: Los almacenes pertenecen a **sucursales**, no directamente a empresa. La estructura real es:
- Almacen → Sucursal → Empresa

⚠️ **CAMPOS REALES**: La tabla `almacen` tiene estos campos:
- `nombre`: Nombre del almacén
- `defecto`: Boolean (true si es el almacén predeterminado)
- `eliminar`: Boolean (true si se puede eliminar, false si no)
- `sucursal`: Relación con sucursal
- `fechaCreacion`: Auto-generado

❌ **NO EXISTEN** estos campos: `direccion`, `referencia`, `activo`, `empresa`

---

## Pruebas Corregidas

### 1. Login y Setup

```powershell
$base = "http://localhost:8080/api"
$loginBody = @{ correo = "admin@tienda.com"; password = "123" } | ConvertTo-Json
$resp = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -Body $loginBody -ContentType "application/json"
$token = $resp.accessToken
$headers = @{ Authorization = "Bearer $token" }
Write-Host "Token obtenido: Usuario $($resp.nombre)" -ForegroundColor Green
```

### 2. Obtener sucursales (necesario para crear almacenes)

```powershell
$sucursales = Invoke-RestMethod -Method Get -Uri "$base/sucursales/empresa/1" -Headers $headers
Write-Host "Sucursales encontradas: $($sucursales.Count)" -ForegroundColor Cyan
$sucursales | Format-Table id, nombre, direccionFiscal
$sucursalId = $sucursales[0].id
Write-Host "Usando sucursal ID: $sucursalId" -ForegroundColor Yellow
```

### 3. PRUEBA: Listar almacenes (antes daba error 500)

```powershell
$almacenes = Invoke-RestMethod -Method Get -Uri "$base/almacenes/empresa/1" -Headers $headers
Write-Host "Almacenes encontrados: $($almacenes.Count)" -ForegroundColor Cyan
$almacenes | Format-Table id, nombre, defecto, eliminar
```

### 4. PRUEBA: Obtener almacén por ID (antes daba error 500)

```powershell
if ($almacenes.Count -gt 0) {
    $almacenId = $almacenes[0].id
    $almacen = Invoke-RestMethod -Method Get -Uri "$base/almacenes/$almacenId" -Headers $headers
    Write-Host "Almacen obtenido exitosamente!" -ForegroundColor Green
    Write-Host "  ID: $($almacen.id)" -ForegroundColor Gray
    Write-Host "  Nombre: $($almacen.nombre)" -ForegroundColor Gray
    Write-Host "  Sucursal: $($almacen.sucursal.nombre)" -ForegroundColor Gray
    Write-Host "  Defecto: $($almacen.defecto)" -ForegroundColor Gray
    Write-Host "  Eliminar: $($almacen.eliminar)" -ForegroundColor Gray
}
```

### 5. PRUEBA: Crear almacén (antes daba error 500)

```powershell
$nuevoAlmacen = @{
    nombre = "Almacen Test Corregido"
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

### 6. PRUEBA: Editar almacén (antes daba error 500)

```powershell
$almacenEditado = @{
    nombre = "Almacen Test EDITADO Corregido"
    defecto = $false
    eliminar = $true
    sucursal = @{ id = $sucursalId }
} | ConvertTo-Json -Depth 5

$actualizado = Invoke-RestMethod -Method Put -Uri "$base/almacenes/$idTest" -Headers $headers -Body $almacenEditado -ContentType "application/json"
Write-Host "Almacen editado exitosamente!" -ForegroundColor Green
Write-Host "  Nombre: $($actualizado.nombre)" -ForegroundColor Gray
Write-Host "  Sucursal: $($actualizado.sucursal.nombre)" -ForegroundColor Gray
```

### 7. PRUEBA: Buscar almacenes (antes daba error 500)

```powershell
$busqueda = Invoke-RestMethod -Method Get -Uri "$base/almacenes/buscar/1?q=test" -Headers $headers
Write-Host "Busqueda 'test': $($busqueda.Count) resultados" -ForegroundColor Cyan
$busqueda | Format-Table nombre, defecto
```

### 8. Limpiar: Eliminar almacén de prueba

```powershell
Invoke-RestMethod -Method Delete -Uri "$base/almacenes/$idTest" -Headers $headers
Write-Host "Almacen de prueba eliminado" -ForegroundColor Green
```

---

## ✅ Correcciones Aplicadas

1. **Ruta corregida**: `/api/almacen` → `/api/almacenes`
2. **Referencias circulares solucionadas**: Agregado `@JsonIgnoreProperties` en Almacen y Sucursal
3. **Endpoints agregados**:
   - `GET /api/almacenes/{id}` - Obtener por ID
   - `GET /api/almacenes/buscar/{idEmpresa}?q=query` - Buscar
4. **Controller SucursalController creado**: Para obtener sucursales necesarias
5. **Estructura de datos alineada**: Usar `sucursal` en lugar de `empresa`, campos correctos

---

## 🔍 Qué Verificar

- ✅ Listar almacenes sin error 500
- ✅ Obtener almacén por ID correctamente
- ✅ Crear almacén con la estructura correcta
- ✅ Editar almacén sin mezclar con productos
- ✅ Buscar almacenes funciona
- ✅ Sucursal se carga correctamente en la respuesta
