# ⚡ INICIO RÁPIDO - PRIORIDAD 2

## 🚀 Prueba en 3 Pasos

### 1️⃣ Inicia el Backend
```powershell
cd Backend
.\gradlew.bat bootRun
```
**Espera a ver:** `Tomcat started on port 8080`

---

### 2️⃣ Inicia el Frontend
```powershell
cd Fronted
npm run dev
```
**Copia la URL que aparece** (ej: http://localhost:5173)

---

### 3️⃣ Accede a Movimientos de Stock
```
http://localhost:5173/movimientos-stock
```

**O desde el menú lateral:** Busca "Movimientos Stock" o "Kardex"

---

## ✅ Primera Prueba Rápida

1. **Carga inicial:** ¿La página cargó? ¿Ves la tabla?
2. **Filtro por producto:** Selecciona un producto → Clic en "Buscar"
3. **Ver detalles:** Clic en el botón "👁️ Ver" de cualquier fila
4. **Limpiar:** Clic en "Limpiar Filtros"

Si todo funciona, **¡Prioridad 2 está lista!** 🎉

---

## 📋 Pruebas Completas

Para pruebas detalladas, ve a:
```
Fronted/pruebas/PRIORIDAD_2_MOVIMIENTOS_STOCK.md
```

---

## 🐛 Si algo falla

### Backend no inicia
```powershell
# Verifica que no haya otro proceso en puerto 8080
netstat -ano | findstr :8080

# Si hay uno, mátalo
taskkill /F /PID [número_de_pid]
```

### Frontend tiene error
```powershell
# Reinstala dependencias
npm install

# Limpia cache
npm run build
```

### No aparece en el menú
- La página existe en: `/movimientos-stock`
- Accede directamente con la URL completa

---

## 📁 Archivos Importantes

**Backend:**
- `Backend/src/main/java/tienda/posbackend/controllers/MovimientoStockController.java`
- `Backend/pruebas/08_MOVIMIENTOS_STOCK.md`

**Frontend:**
- `Fronted/src/pages/MovimientosStock.jsx`
- `Fronted/src/store/MovimientosStockStore.jsx`
- `Fronted/pruebas/PRIORIDAD_2_MOVIMIENTOS_STOCK.md`

**Resumen General:**
- `PRIORIDAD_2_COMPLETADA.md` (raíz del proyecto)

---

## 🎯 ¿Qué hace esta funcionalidad?

**Kardex / Movimientos de Stock:**
- 📊 Ver historial de TODOS los movimientos de stock
- 🔍 Filtrar por: Producto, Almacén, Tipo, Fechas
- 📈 Consultar Kardex de un producto específico
- ⚙️ Se registra automáticamente cuando ajustas stock
- 📝 Puedes registrar movimientos manualmente (opcional)

**Tipos de movimientos:**
- 🟢 ENTRADA: Stock que ingresa
- 🔴 SALIDA: Stock que sale
- 🟢 AJUSTE_ENTRADA: Aumentaste stock manualmente
- 🔴 AJUSTE_SALIDA: Disminuiste stock manualmente
- ⚪ AJUSTE_SIN_CAMBIO: Ajustaste pero quedó igual

---

**¡Listo para probar!** 🚀
