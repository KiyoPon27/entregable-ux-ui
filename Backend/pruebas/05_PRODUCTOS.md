# PRUEBAS - PRODUCTOS

## Endpoints Probados
- `GET /api/productos/empresa/{idEmpresa}`
- `GET /api/productos/{id}`
- `POST /api/productos`
- `PUT /api/productos/{id}`
- `DELETE /api/productos/{id}`
- `GET /api/productos/buscar/{idEmpresa}?q={query}`

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

## 1. Listar todos los productos de la empresa

```powershell
$productos = Invoke-RestMethod -Method Get -Uri "$base/productos/empresa/1" -Headers $headers
Write-Host "Productos encontrados: $($productos.Count)" -ForegroundColor Cyan
$productos | Select-Object -First 5 | Format-Table id, nombre, precioVenta, codigoBarras
```

**Resultado esperado:**
- Status: 200 OK
- Array de productos con: `id`, `nombre`, `precioCompra`, `precioVenta`, `codigoBarras`, `codigoInterno`, `seVendePor`, `manejaInventarios`, `manejaMultiprecios`, `categoria`, `empresa`

---

## 2. Obtener un producto específico

```powershell
$producto = Invoke-RestMethod -Method Get -Uri "$base/productos/1" -Headers $headers
Write-Host "Producto obtenido:" -ForegroundColor Green
Write-Host "  ID: $($producto.id)" -ForegroundColor Gray
Write-Host "  Nombre: $($producto.nombre)" -ForegroundColor Gray
Write-Host "  Precio Compra: $($producto.precioCompra)" -ForegroundColor Gray
Write-Host "  Precio Venta: $($producto.precioVenta)" -ForegroundColor Gray
Write-Host "  Codigo Barras: $($producto.codigoBarras)" -ForegroundColor Gray
Write-Host "  Se Vende Por: $($producto.seVendePor)" -ForegroundColor Gray
Write-Host "  Categoria: $($producto.categoria.nombre)" -ForegroundColor Gray
Write-Host "  Maneja Inventarios: $($producto.manejaInventarios)" -ForegroundColor Gray
```

**Resultado esperado:**
- Status: 200 OK
- Producto con todos sus datos y relaciones

---

## 3. Crear nuevo producto

```powershell
$nuevoProducto = @{
    nombre = "Laptop HP Pavilion Test"
    descripcion = "Laptop de prueba 15.6 pulgadas"
    precioCompra = 850.00
    precioVenta = 1200.00
    codigoBarras = "TEST-LAPTOP-001"
    codigoInterno = "INT-LAPTOP-001"
    seVendePor = "unidad"
    manejaInventarios = $true
    manejaMultiprecios = $false
    categoria = @{ id = 1 }  # Ajustar según tu BD
    empresa = @{ id = 1 }
} | ConvertTo-Json -Depth 5

$productoCreado = Invoke-RestMethod -Method Post -Uri "$base/productos" -Headers $headers -Body $nuevoProducto -ContentType "application/json"
Write-Host "Producto creado con ID: $($productoCreado.id)" -ForegroundColor Green
Write-Host "  Nombre: $($productoCreado.nombre)" -ForegroundColor Gray
Write-Host "  Precio Venta: $($productoCreado.precioVenta)" -ForegroundColor Gray
Write-Host "  Codigo Barras: $($productoCreado.codigoBarras)" -ForegroundColor Gray
Write-Host "  Se Vende Por: $($productoCreado.seVendePor)" -ForegroundColor Gray
$idTest = $productoCreado.id
```

**Resultado esperado:**
- Status: 201 Created (o 200 OK)
- Producto creado con ID asignado

---

## 4. Editar producto

```powershell
$productoEditado = @{
    nombre = "Laptop HP Pavilion Test EDITADO"
    precioCompra = 800.00
    precioVenta = 1150.00
    codigoBarras = "TEST-LAPTOP-001-EDIT"
    codigoInterno = "INT-LAPTOP-001-EDIT"
    seVendePor = "unidad"
    manejaInventarios = $true
    manejaMultiprecios = $false
    categoria = @{ id = 1 }
    empresa = @{ id = 1 }
} | ConvertTo-Json -Depth 5

$actualizado = Invoke-RestMethod -Method Put -Uri "$base/productos/$idTest" -Headers $headers -Body $productoEditado -ContentType "application/json"
Write-Host "Producto editado:" -ForegroundColor Green
Write-Host "  Nombre: $($actualizado.nombre)" -ForegroundColor Gray
Write-Host "  Precio Venta: $($actualizado.precioVenta)" -ForegroundColor Gray
Write-Host "  Codigo Barras: $($actualizado.codigoBarras)" -ForegroundColor Gray
```

**Resultado esperado:**
- Status: 200 OK
- Producto actualizado

---

## 5. Buscar productos por nombre

```powershell
$busqueda = Invoke-RestMethod -Method Get -Uri "$base/productos/buscar/1?q=laptop" -Headers $headers
Write-Host "Busqueda 'laptop': $($busqueda.Count) resultados" -ForegroundColor Cyan
$busqueda | Format-Table nombre, precioVenta, stock
```

**Resultado esperado:**
- Status: 200 OK
- Array de productos que coinciden con la búsqueda

---

## 6. Buscar con query vacío (debe retornar todos)

```powershell
$todosProductos = Invoke-RestMethod -Method Get -Uri "$base/productos/buscar/1?q=" -Headers $headers
Write-Host "Busqueda vacia: $($todosProductos.Count) productos" -ForegroundColor Cyan
```

**Resultado esperado:**
- Status: 200 OK
- Todos los productos de la empresa

---

## 7. Intentar obtener producto inexistente

```powershell
try {
    $inexistente = Invoke-RestMethod -Method Get -Uri "$base/productos/99999" -Headers $headers
    Write-Host "ADVERTENCIA: Se retorno producto inexistente" -ForegroundColor Yellow
} catch {
    Write-Host "CORRECTO: Producto inexistente no encontrado" -ForegroundColor Green
    Write-Host "  Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
}
```

**Resultado esperado:**
- Status: 404 Not Found (o null)

---

## 8. Eliminar producto de prueba

```powershell
try {
    Invoke-RestMethod -Method Delete -Uri "$base/productos/$idTest" -Headers $headers
    Write-Host "Producto $idTest eliminado" -ForegroundColor Green
} catch {
    Write-Host "Error al eliminar: $($_.Exception.Message)" -ForegroundColor Red
}
```

**Resultado esperado:**
- Status: 204 No Content (o 200 OK)

---

## 9. Verificar eliminación

```powershell
try {
    $eliminado = Invoke-RestMethod -Method Get -Uri "$base/productos/$idTest" -Headers $headers
    Write-Host "ADVERTENCIA: Producto aun existe despues de eliminar" -ForegroundColor Yellow
} catch {
    Write-Host "CORRECTO: Producto eliminado correctamente" -ForegroundColor Green
}
```

**Resultado esperado:**
- Status: 404 Not Found

---

## 10. Intentar acceder sin autenticación

```powershell
try {
    Invoke-RestMethod -Method Get -Uri "$base/productos/empresa/1"
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

✅ Listar productos por empresa
✅ Obtener producto específico
✅ Crear nuevo producto
✅ Editar producto existente
✅ Buscar productos por nombre
⚠️ Obtener producto inexistente retorna 404 o null
✅ Eliminar producto
❌ Acceder sin autenticación

## Validaciones Pendientes (para implementar)

⚠️ **NO IMPLEMENTADO**: Validar nombre duplicado en misma empresa
⚠️ **NO IMPLEMENTADO**: Validar código de barras único
⚠️ **NO IMPLEMENTADO**: Validar precios (venta > compra)
⚠️ **NO IMPLEMENTADO**: Validar stock no negativo
⚠️ **NO IMPLEMENTADO**: Validar categoría existe
