# 🚀 GUÍA DE PRUEBAS - FRONTEND MIGRADO

## ✅ PREREQUISITOS

1. **Backend ejecutándose** en `http://localhost:8080`
2. **Base de datos MySQL** funcionando
3. **Node.js** y npm instalados
4. **Dependencias del frontend** instaladas

---

## 📋 PASOS PARA PROBAR

### 1. Verificar Backend
```powershell
cd Backend
./gradlew bootRun
```

**Verificar que aparezca**:
```
Started PosBackendApplication in X.XXX seconds
Tomcat started on port(s): 8080
```

### 2. Iniciar Frontend
```powershell
cd Fronted
npm install  # Solo si no está instalado
npm run dev
```

**Verificar que aparezca**:
```
VITE v4.x.x  ready in XXX ms
➜  Local:   http://localhost:5173/
```

---

## 🧪 PRUEBAS POR MÓDULO

### ✅ MÓDULO 1: Autenticación
1. Abrir `http://localhost:5173`
2. Login con credenciales existentes
3. **Verificar**:
   - Token JWT guardado en localStorage
   - Redirección a Home
   - Nombre de usuario visible

**Endpoints usados**:
- POST `/api/auth/login`

---

### ✅ MÓDULO 2: Empresa
1. Ir a **Configuraciones → Empresa**
2. **Verificar**:
   - Carga datos de empresa
   - Editar datos básicos
   - Cambiar moneda

**Endpoints usados**:
- GET `/api/empresas/mostrar?idUsuario={id}`
- PUT `/api/empresas/editar/{id}`

⚠️ **Nota**: Subida de logo pendiente (usar texto por ahora)

---

### ✅ MÓDULO 3: Categorías
1. Ir a **Productos → Categorías**
2. **Probar**:
   - ✅ Listar categorías
   - ✅ Crear categoría nueva
   - ✅ Editar categoría
   - ✅ Eliminar categoría
   - ✅ Buscar categoría

**Endpoints usados**:
- GET `/api/categorias/mostrar/{idEmpresa}`
- POST `/api/categorias/insertar`
- PUT `/api/categorias/editar/{id}`
- DELETE `/api/categorias/eliminar/{id}`

---

### ✅ MÓDULO 4: Productos
1. Ir a **Productos**
2. **Probar**:
   - ✅ Listar productos
   - ✅ Crear producto
   - ✅ Editar producto
   - ✅ Buscar por código/nombre
   - ✅ Filtrar por categoría

**Endpoints usados**:
- GET `/api/productos/empresa/{idEmpresa}`
- POST `/api/productos/insertar`
- PUT `/api/productos/editar/{id}`
- GET `/api/productos/buscar/{idEmpresa}?q={busqueda}`

---

### ✅ MÓDULO 5: Almacenes
1. Ir a **Inventario → Almacenes**
2. **Probar**:
   - ✅ Listar almacenes por sucursal
   - ✅ Crear almacén
   - ✅ Editar almacén

**Endpoints usados**:
- GET `/api/almacenes/sucursal/{idSucursal}`
- POST `/api/almacenes/insertar`
- PUT `/api/almacenes/editar/{id}`

---

### ✅ MÓDULO 6: Stock
1. Ir a **Inventario → Stock**
2. **Probar**:
   - ✅ Ver stock por almacén
   - ✅ Ajustar stock
   - ✅ Ver stock mínimo

**Endpoints usados**:
- GET `/api/stock/almacen/{idAlmacen}`
- POST `/api/stock/ajuste`

---

### ✅ MÓDULO 7: Movimientos de Stock
1. Ir a **Inventario → Movimientos**
2. **Probar**:
   - ✅ Ver movimientos de un producto
   - ✅ Registrar movimiento de entrada
   - ✅ Registrar movimiento de salida

**Endpoints usados**:
- GET `/api/movimientos-stock/producto/{idProducto}`
- POST `/api/movimientos-stock`

---

### 🆕 MÓDULO 8: Kardex (NUEVO)
1. Ir a **Inventario → Kardex** (si existe en UI)
2. **Probar**:
   - ✅ Ver kardex de un producto
   - ✅ Filtrar por fechas
   - ✅ Registrar movimiento

**Endpoints usados**:
- GET `/api/kardex/producto/{id}`
- GET `/api/kardex/fechas?fechaInicio={fecha}&fechaFin={fecha}`
- POST `/api/kardex/registrar-movimiento`

---

### 🆕 MÓDULO 9: Multiprecios (NUEVO)
1. Ir a **Productos → Multiprecios** (si existe en UI)
2. **Probar**:
   - ✅ Ver precios escalonados de un producto
   - ✅ Crear multiprecio (ej: 10-50 unidades → $9.50)
   - ✅ Calcular precio por cantidad

**Endpoints usados**:
- GET `/api/multiprecios/producto/{id}`
- POST `/api/multiprecios/crear`
- GET `/api/multiprecios/precio-por-cantidad?idProducto={id}&cantidad={cant}`

---

### ✅ MÓDULO 10: Ventas (POS)
1. Ir a **POS**
2. **Probar**:
   - ✅ Buscar producto
   - ✅ Agregar al carrito
   - ✅ Seleccionar cliente
   - ✅ Seleccionar método de pago
   - ✅ Completar venta

**Endpoints usados**:
- GET `/api/productos/buscar/{idEmpresa}?q={codigo}`
- POST `/api/ventas`
- POST `/api/detalle-ventas`
- GET `/api/cierre-caja/caja/{id}/aperturada`

---

### ✅ MÓDULO 11: Clientes/Proveedores
1. Ir a **Ventas → Clientes** o **Compras → Proveedores**
2. **Probar**:
   - ✅ Listar clientes
   - ✅ Crear cliente
   - ✅ Buscar cliente
   - ✅ Editar cliente

**Endpoints usados**:
- GET `/api/clientes-proveedores/empresa/{id}/tipo/{tipo}`
- POST `/api/clientes-proveedores`
- GET `/api/clientes-proveedores/buscar/{id}?tipo={tipo}&q={busqueda}`

---

### ✅ MÓDULO 12: Métodos de Pago
1. Ir a **Configuraciones → Métodos de Pago**
2. **Probar**:
   - ✅ Listar métodos de pago
   - ✅ Crear método de pago
   - ✅ Editar método de pago

**Endpoints usados**:
- GET `/api/metodos-pago/empresa/{id}`
- POST `/api/metodos-pago`
- PUT `/api/metodos-pago/{id}`

⚠️ **Nota**: Subida de iconos pendiente (usar texto por ahora)

---

### ✅ MÓDULO 13: Caja
1. Ir a **Caja**
2. **Probar**:
   - ✅ Aperturar caja
   - ✅ Ver movimientos de caja
   - ✅ Cerrar turno

**Endpoints usados**:
- POST `/api/cierre-caja/aperturar`
- GET `/api/cierre-caja/caja/{id}/aperturada`
- PUT `/api/cierre-caja/{id}/cerrar`
- POST `/api/movimientos-caja`

---

### 🆕 MÓDULO 14: Dashboard (NUEVO)
1. Ir a **Dashboard** o **Home**
2. **Probar**:
   - ✅ Ver resumen de ventas
   - ✅ Top 5 productos más vendidos
   - ✅ Top 10 productos por monto
   - ✅ Gráfico de ventas por fecha
   - ✅ Ventas por método de pago

**Endpoints usados**:
- GET `/api/dashboard/resumen/empresa/{id}`
- GET `/api/dashboard/top5-productos-cantidad/empresa/{id}`
- GET `/api/dashboard/top10-productos-monto/empresa/{id}`
- GET `/api/dashboard/ventas-por-fecha/empresa/{id}?fechaInicio={fecha}&fechaFin={fecha}`
- GET `/api/dashboard/ventas-por-metodo-pago/empresa/{id}?fechaInicio={fecha}&fechaFin={fecha}`

---

### 🆕 MÓDULO 15: Reportes (NUEVO)
1. Ir a **Reportes**
2. **Probar**:
   - ✅ Stock bajo mínimo
   - ✅ Stock por almacén
   - ✅ Ventas por sucursal

**Endpoints usados**:
- GET `/api/reportes/stock-bajo-minimo?idEmpresa={id}`
- GET `/api/reportes/stock-por-almacen?idEmpresa={id}&idAlmacen={id}`
- GET `/api/reportes/ventas-por-sucursal/{id}?fechaInicio={fecha}&fechaFin={fecha}`

---

## 🐛 DEPURACIÓN

### Ver Logs del Backend
El backend mostrará en consola todas las peticiones:
```
INFO  c.t.p.controllers.ProductoController : GET /api/productos/empresa/1
INFO  c.t.p.services.ProductoService      : Listando productos de empresa 1
```

### Ver Network en Chrome DevTools
1. Abrir DevTools (F12)
2. Ir a pestaña **Network**
3. Filtrar por **Fetch/XHR**
4. Ver peticiones a `http://localhost:8080/api/...`

### Ver JWT Token
1. Abrir DevTools (F12)
2. Ir a **Application → Local Storage**
3. Ver `token` guardado

---

## ✅ VERIFICACIÓN FINAL

### Checklist de Pruebas
- [ ] Login funciona
- [ ] Empresa carga datos
- [ ] Categorías: CRUD completo
- [ ] Productos: CRUD completo
- [ ] Almacenes: listar y crear
- [ ] Stock: ver y ajustar
- [ ] Movimientos: registrar entrada/salida
- [ ] Ventas: completar venta en POS
- [ ] Clientes: CRUD completo
- [ ] Métodos pago: listar y crear
- [ ] Caja: aperturar y cerrar
- [ ] Dashboard: ver estadísticas
- [ ] Reportes: stock bajo, ventas

### Verificar Console
Abrir Console en DevTools y verificar que **NO haya errores** de:
- `supabase is not defined`
- `Cannot read property 'from' of undefined`
- `404 Not Found` en llamadas API

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Error: "Network Error"
**Causa**: Backend no está ejecutándose  
**Solución**: Iniciar backend con `./gradlew bootRun`

### Error: 401 Unauthorized
**Causa**: Token expirado o inválido  
**Solución**: Hacer logout y login nuevamente

### Error: 404 Not Found
**Causa**: Endpoint no existe en backend  
**Solución**: Verificar que el endpoint esté en el controller correspondiente

### Error: CORS Policy
**Causa**: Backend no permite peticiones desde localhost:5173  
**Solución**: Verificar `@CrossOrigin` en controllers

### Componente no muestra datos
**Causa**: Mapping camelCase ↔ snake_case  
**Solución**: Verificar que el CRUD mapee correctamente los campos

---

## 📊 MÉTRICAS DE ÉXITO

### ✅ Frontend funcional al 100%
- Todos los módulos cargan datos
- CRUD completo en todas las secciones
- No hay errores en console
- Dashboard muestra estadísticas
- Reportes funcionan

### ✅ Backend responde correctamente
- Todas las peticiones retornan 200 OK
- JSON válido en respuestas
- No hay errores 500 en logs
- JWT validación funciona

---

## 🎉 SIGUIENTE PASO

Una vez verificado que todo funciona:

1. **Implementar Storage de Imágenes** (opcional)
   - Métodos de pago: iconos
   - Empresa: logo
   - Productos: fotos

2. **Optimizar Performance**
   - Implementar caché en frontend
   - Paginación en listados grandes
   - Lazy loading de componentes

3. **Deploy a Producción**
   - Configurar variables de entorno
   - Build frontend: `npm run build`
   - Desplegar en servidor

---

**¡Listo para probar!** 🚀

---

_Fecha: 19 de enero de 2025_  
_Guía de Pruebas - Frontend Migrado a Axios_
