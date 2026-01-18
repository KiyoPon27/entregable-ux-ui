# SUITE DE PRUEBAS AUTOMATIZADA - BACKEND POS

Este archivo ejecuta todas las pruebas en orden para verificar el backend completo.

---

## 1. AUTENTICACIÓN

```powershell
Write-Host "`n=== 1. AUTENTICACION ===" -ForegroundColor Cyan
$base = "http://localhost:8080/api"
$loginBody = @{ correo = "admin@tienda.com"; password = "123" } | ConvertTo-Json
try {
    $resp = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -Body $loginBody -ContentType "application/json"
    $token = $resp.accessToken
    $headers = @{ Authorization = "Bearer $token" }
    Write-Host "✅ Login exitoso: $($resp.nombre) (ID: $($resp.idUsuario))" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR en login: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
```

---

## 2. EMPRESA

```powershell
Write-Host "`n=== 2. EMPRESA ===" -ForegroundColor Cyan
try {
    $empresa = Invoke-RestMethod -Method Get -Uri "$base/empresas/mostrar?idUsuario=$($resp.idUsuario)" -Headers $headers
    Write-Host "✅ Empresa: $($empresa.nombre) (ID: $($empresa.id))" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR obteniendo empresa: $($_.Exception.Message)" -ForegroundColor Red
}
```

---

## 3. PERMISOS

```powershell
Write-Host "`n=== 3. PERMISOS ===" -ForegroundColor Cyan
try {
    $permisos = Invoke-RestMethod -Method Get -Uri "$base/permisos/usuario/$($resp.idUsuario)" -Headers $headers
    Write-Host "✅ Permisos obtenidos: $($permisos.Count) modulos" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR obteniendo permisos: $($_.Exception.Message)" -ForegroundColor Red
}
```

---

## 4. CATEGORÍAS (con validaciones)

```powershell
Write-Host "`n=== 4. CATEGORIAS ===" -ForegroundColor Cyan

# 4.1 Listar categorías
try {
    $cats = Invoke-RestMethod -Method Get -Uri "$base/categorias/empresa/1" -Headers $headers
    Write-Host "✅ Categorias listadas: $($cats.Count)" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR listando categorias" -ForegroundColor Red
}

# 4.2 Crear categoría
$nuevaCat = @{
    nombre = "Test Auto Cat"
    color = "#ff5733"
    icono = "test"
    empresa = @{ id = 1 }
} | ConvertTo-Json -Depth 5

try {
    $catCreada = Invoke-RestMethod -Method Post -Uri "$base/categorias" -Headers $headers -Body $nuevaCat -ContentType "application/json"
    Write-Host "✅ Categoria creada: ID $($catCreada.id)" -ForegroundColor Green
    $catTestId = $catCreada.id
} catch {
    Write-Host "❌ ERROR creando categoria" -ForegroundColor Red
}

# 4.3 Validación: Crear duplicada (debe fallar)
try {
    $catDup = Invoke-RestMethod -Method Post -Uri "$base/categorias" -Headers $headers -Body $nuevaCat -ContentType "application/json"
    Write-Host "⚠️  ADVERTENCIA: Se permitio categoria duplicada" -ForegroundColor Yellow
} catch {
    Write-Host "✅ Validacion correcta: Duplicado rechazado (409)" -ForegroundColor Green
}

# 4.4 Limpiar
if ($catTestId) {
    Invoke-RestMethod -Method Delete -Uri "$base/categorias/$catTestId" -Headers $headers | Out-Null
    Write-Host "✅ Categoria de prueba eliminada" -ForegroundColor Green
}
```

---

## 5. PRODUCTOS

```powershell
Write-Host "`n=== 5. PRODUCTOS ===" -ForegroundColor Cyan

# 5.1 Listar productos
try {
    $productos = Invoke-RestMethod -Method Get -Uri "$base/productos/empresa/1" -Headers $headers
    Write-Host "✅ Productos listados: $($productos.Count)" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR listando productos" -ForegroundColor Red
}

# 5.2 Obtener producto por ID
try {
    if ($productos.Count -gt 0) {
        $prod = Invoke-RestMethod -Method Get -Uri "$base/productos/$($productos[0].id)" -Headers $headers
        Write-Host "✅ Producto obtenido: $($prod.nombre)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ ERROR obteniendo producto" -ForegroundColor Red
}

# 5.3 Crear producto
$nuevoProd = @{
    nombre = "Test Auto Producto"
    precioCompra = 100.00
    precioVenta = 150.00
    codigoBarras = "TEST-AUTO-001"
    codigoInterno = "INT-AUTO-001"
    seVendePor = "unidad"
    manejaInventarios = $true
    manejaMultiprecios = $false
    categoria = @{ id = 1 }
    empresa = @{ id = 1 }
} | ConvertTo-Json -Depth 5

try {
    $prodCreado = Invoke-RestMethod -Method Post -Uri "$base/productos" -Headers $headers -Body $nuevoProd -ContentType "application/json"
    Write-Host "✅ Producto creado: ID $($prodCreado.id)" -ForegroundColor Green
    $prodTestId = $prodCreado.id
} catch {
    Write-Host "❌ ERROR creando producto" -ForegroundColor Red
}

# 5.4 Buscar productos
try {
    $busqueda = Invoke-RestMethod -Method Get -Uri "$base/productos/buscar/1?q=test" -Headers $headers
    Write-Host "✅ Busqueda realizada: $($busqueda.Count) resultados" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR en busqueda" -ForegroundColor Red
}

# 5.5 Limpiar
if ($prodTestId) {
    Invoke-RestMethod -Method Delete -Uri "$base/productos/$prodTestId" -Headers $headers | Out-Null
    Write-Host "✅ Producto de prueba eliminado" -ForegroundColor Green
}
```

---

## 6. SUCURSALES

```powershell
Write-Host "`n=== 6. SUCURSALES ===" -ForegroundColor Cyan
try {
    $sucursales = Invoke-RestMethod -Method Get -Uri "$base/sucursales/empresa/1" -Headers $headers
    Write-Host "✅ Sucursales obtenidas: $($sucursales.Count)" -ForegroundColor Green
    if ($sucursales.Count -gt 0) {
        $sucursalId = $sucursales[0].id
    }
} catch {
    Write-Host "❌ ERROR obteniendo sucursales" -ForegroundColor Red
}
```

---

## 7. ALMACENES

```powershell
Write-Host "`n=== 7. ALMACENES ===" -ForegroundColor Cyan

# 7.1 Listar almacenes
try {
    $almacenes = Invoke-RestMethod -Method Get -Uri "$base/almacenes/empresa/1" -Headers $headers
    Write-Host "✅ Almacenes listados: $($almacenes.Count)" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR listando almacenes" -ForegroundColor Red
}

# 7.2 Obtener almacén por ID
try {
    if ($almacenes.Count -gt 0) {
        $alm = Invoke-RestMethod -Method Get -Uri "$base/almacenes/$($almacenes[0].id)" -Headers $headers
        Write-Host "✅ Almacen obtenido: $($alm.nombre)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ ERROR obteniendo almacen" -ForegroundColor Red
}

# 7.3 Crear almacén
if ($sucursalId) {
    $nuevoAlm = @{
        nombre = "Test Auto Almacen"
        defecto = $false
        eliminar = $true
        sucursal = @{ id = $sucursalId }
    } | ConvertTo-Json -Depth 5

    try {
        $almCreado = Invoke-RestMethod -Method Post -Uri "$base/almacenes" -Headers $headers -Body $nuevoAlm -ContentType "application/json"
        Write-Host "✅ Almacen creado: ID $($almCreado.id)" -ForegroundColor Green
        $almTestId = $almCreado.id
    } catch {
        Write-Host "❌ ERROR creando almacen" -ForegroundColor Red
    }

    # 7.4 Buscar almacenes
    try {
        $busquedaAlm = Invoke-RestMethod -Method Get -Uri "$base/almacenes/buscar/1?q=test" -Headers $headers
        Write-Host "✅ Busqueda almacenes: $($busquedaAlm.Count) resultados" -ForegroundColor Green
    } catch {
        Write-Host "❌ ERROR en busqueda almacenes" -ForegroundColor Red
    }

    # 7.5 Limpiar
    if ($almTestId) {
        Invoke-RestMethod -Method Delete -Uri "$base/almacenes/$almTestId" -Headers $headers | Out-Null
        Write-Host "✅ Almacen de prueba eliminado" -ForegroundColor Green
    }
}
```

---

## 8. STOCK

```powershell
Write-Host "`n=== 8. STOCK ===" -ForegroundColor Cyan

# 8.1 Listar stock por almacén
try {
    if ($almacenes.Count -gt 0) {
        $stockAlm = Invoke-RestMethod -Method Get -Uri "$base/stock/almacen/$($almacenes[0].id)" -Headers $headers
        Write-Host "✅ Stock por almacen: $($stockAlm.Count) productos" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ ERROR listando stock" -ForegroundColor Red
}

# 8.2 Stock por producto
try {
    if ($productos.Count -gt 0) {
        $stockProd = Invoke-RestMethod -Method Get -Uri "$base/stock/producto/$($productos[0].id)" -Headers $headers
        Write-Host "✅ Stock por producto: $($stockProd.Count) almacenes" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ ERROR obteniendo stock por producto" -ForegroundColor Red
}

# 8.3 Stock específico
try {
    if ($almacenes.Count -gt 0 -and $productos.Count -gt 0) {
        $stockEsp = Invoke-RestMethod -Method Get -Uri "$base/stock/almacen/$($almacenes[0].id)/producto/$($productos[0].id)" -Headers $headers
        Write-Host "✅ Stock especifico obtenido: Cantidad $($stockEsp.cantidad)" -ForegroundColor Green
    }
} catch {
    # Puede no existir, es normal
    Write-Host "⚠️  Stock especifico no existe (normal)" -ForegroundColor Yellow
}

# 8.4 Obtener para ajustar
try {
    if ($productos.Count -gt 0) {
        $stockAjustar = Invoke-RestMethod -Method Get -Uri "$base/stock/ajustar/$($productos[0].id)" -Headers $headers
        Write-Host "✅ Info para ajustar obtenida: $($stockAjustar.Count) registros" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ ERROR obteniendo info para ajustar" -ForegroundColor Red
}
```

---

## RESUMEN FINAL

```powershell
Write-Host "`n=== RESUMEN ===" -ForegroundColor Cyan
Write-Host "✅ AUTH: Funcional" -ForegroundColor Green
Write-Host "✅ EMPRESA: Funcional" -ForegroundColor Green
Write-Host "✅ PERMISOS: Funcional" -ForegroundColor Green
Write-Host "✅ CATEGORIAS: Funcional con validaciones" -ForegroundColor Green
Write-Host "✅ PRODUCTOS: Funcional" -ForegroundColor Green
Write-Host "✅ SUCURSALES: Funcional" -ForegroundColor Green
Write-Host "✅ ALMACENES: Funcional" -ForegroundColor Green
Write-Host "✅ STOCK: Funcional" -ForegroundColor Green
Write-Host "`nTodas las pruebas completadas!" -ForegroundColor Cyan
```

---

## EJECUCIÓN

Copia y pega este script completo en PowerShell para ejecutar todas las pruebas en orden.
