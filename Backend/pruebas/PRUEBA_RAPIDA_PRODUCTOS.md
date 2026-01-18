# PRUEBA RÁPIDA - PRODUCTOS (Verificar correcciones)

Ejecuta estos comandos para verificar que los problemas se corrigieron:

## 1. Login y Setup

```powershell
$base = "http://localhost:8080/api"
$loginBody = @{ correo = "admin@tienda.com"; password = "123" } | ConvertTo-Json
$resp = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -Body $loginBody -ContentType "application/json"
$token = $resp.accessToken
$headers = @{ Authorization = "Bearer $token" }
Write-Host "Token obtenido: Usuario $($resp.nombre)" -ForegroundColor Green
```

## 2. PRUEBA: Obtener producto por ID (antes daba error 500)

```powershell
$producto = Invoke-RestMethod -Method Get -Uri "$base/productos/1" -Headers $headers
Write-Host "Producto obtenido exitosamente!" -ForegroundColor Green
Write-Host "  ID: $($producto.id)" -ForegroundColor Gray
Write-Host "  Nombre: $($producto.nombre)" -ForegroundColor Gray
Write-Host "  Precio Compra: $($producto.precioCompra)" -ForegroundColor Gray
Write-Host "  Precio Venta: $($producto.precioVenta)" -ForegroundColor Gray
Write-Host "  Codigo Barras: $($producto.codigoBarras)" -ForegroundColor Gray
Write-Host "  Se Vende Por: $($producto.seVendePor)" -ForegroundColor Gray
Write-Host "  Categoria: $($producto.categoria.nombre)" -ForegroundColor Gray
Write-Host "  Maneja Inventarios: $($producto.manejaInventarios)" -ForegroundColor Gray
```

## 3. PRUEBA: Crear producto (antes dejaba campos NULL)

```powershell
$nuevoProducto = @{
    nombre = "Laptop HP Test Corregido"
    precioCompra = 850.00
    precioVenta = 1200.00
    codigoBarras = "TEST-LAPTOP-FIX-001"
    codigoInterno = "INT-LAPTOP-FIX-001"
    seVendePor = "unidad"
    manejaInventarios = $true
    manejaMultiprecios = $false
    categoria = @{ id = 1 }
    empresa = @{ id = 1 }
} | ConvertTo-Json -Depth 5

$productoCreado = Invoke-RestMethod -Method Post -Uri "$base/productos" -Headers $headers -Body $nuevoProducto -ContentType "application/json"
Write-Host "Producto creado con ID: $($productoCreado.id)" -ForegroundColor Green
Write-Host "  Nombre: $($productoCreado.nombre)" -ForegroundColor Gray
Write-Host "  Codigo Barras: $($productoCreado.codigoBarras)" -ForegroundColor Gray
Write-Host "  Codigo Interno: $($productoCreado.codigoInterno)" -ForegroundColor Gray
Write-Host "  Se Vende Por: $($productoCreado.seVendePor)" -ForegroundColor Gray
Write-Host "  Maneja Inventarios: $($productoCreado.manejaInventarios)" -ForegroundColor Gray
Write-Host "  Maneja Multiprecios: $($productoCreado.manejaMultiprecios)" -ForegroundColor Gray
$idTest = $productoCreado.id
```

## 4. PRUEBA: Editar producto (antes dejaba campos NULL)

```powershell
$productoEditado = @{
    nombre = "Laptop HP Test EDITADO Corregido"
    precioCompra = 800.00
    precioVenta = 1150.00
    codigoBarras = "TEST-LAPTOP-FIX-EDIT"
    codigoInterno = "INT-LAPTOP-FIX-EDIT"
    seVendePor = "unidad"
    manejaInventarios = $true
    manejaMultiprecios = $false
    categoria = @{ id = 1 }
    empresa = @{ id = 1 }
} | ConvertTo-Json -Depth 5

$actualizado = Invoke-RestMethod -Method Put -Uri "$base/productos/$idTest" -Headers $headers -Body $productoEditado -ContentType "application/json"
Write-Host "Producto editado exitosamente!" -ForegroundColor Green
Write-Host "  Nombre: $($actualizado.nombre)" -ForegroundColor Gray
Write-Host "  Codigo Barras: $($actualizado.codigoBarras)" -ForegroundColor Gray
Write-Host "  Codigo Interno: $($actualizado.codigoInterno)" -ForegroundColor Gray
Write-Host "  Se Vende Por: $($actualizado.seVendePor)" -ForegroundColor Gray
```

## 5. Verificar en la BD (opcional)

```sql
USE LT_Sanchez;
SELECT id, nombre, codigo_barras, codigo_interno, sevende_por, maneja_inventarios, maneja_multiprecios
FROM productos 
WHERE nombre LIKE '%Test%';
```

## 6. Limpiar: Eliminar productos de prueba

```powershell
Invoke-RestMethod -Method Delete -Uri "$base/productos/$idTest" -Headers $headers
Write-Host "Productos de prueba eliminados" -ForegroundColor Green
```

---

## ✅ Correcciones Aplicadas

1. **Error 500 al obtener producto por ID**: Se agregó el endpoint faltante `GET /api/productos/{id}`
2. **Referencias circulares en JSON**: Se agregó `@JsonIgnoreProperties` en las relaciones
3. **Campos NULL al crear/editar**: Se establecen valores por defecto:
   - `seVendePor`: "unidad"
   - `manejaInventarios`: true
   - `manejaMultiprecios`: false

## 🔍 Qué Verificar

- ✅ Producto se obtiene sin error 500
- ✅ Todos los campos tienen valor (no NULL)
- ✅ Categoría y empresa se cargan correctamente
- ✅ Edición mantiene todos los valores
