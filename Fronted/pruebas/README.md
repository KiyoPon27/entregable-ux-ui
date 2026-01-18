# 📋 PRUEBAS MANUALES - FRONTEND

## 📁 Estructura de Pruebas

```
Fronted/pruebas/
├── README.md (este archivo)
└── PRIORIDAD_2_MOVIMIENTOS_STOCK.md (casos de prueba detallados)
```

---

## 🎯 Cómo Realizar las Pruebas

### 1. Preparación

**a) Asegúrate de que el backend esté corriendo:**
```powershell
cd Backend
.\gradlew.bat bootRun
```
El backend debe estar en: `http://localhost:8080`

**b) Inicia el frontend:**
```powershell
cd Fronted
npm run dev
```
El frontend estará en: `http://localhost:5173` (o el puerto que te indique)

---

### 2. Acceso a la Página de Movimientos de Stock

1. Inicia sesión con tu usuario administrador
2. En el menú lateral, busca la opción "Movimientos Stock" o "Kardex"
3. La ruta es: `/movimientos-stock`
4. O accede directamente: `http://localhost:5173/movimientos-stock`

---

### 3. Casos de Prueba a Ejecutar

Abre el archivo **PRIORIDAD_2_MOVIMIENTOS_STOCK.md** y sigue estos casos de prueba en orden:

#### ✅ Pruebas Básicas (Obligatorias)
- [ ] PRUEBA 1: Acceso a la página
- [ ] PRUEBA 2: Listar todos los movimientos
- [ ] PRUEBA 3: Filtrar por producto (Kardex)
- [ ] PRUEBA 4: Filtrar por almacén
- [ ] PRUEBA 5: Filtrar por tipo de movimiento
- [ ] PRUEBA 6: Filtrar por rango de fechas
- [ ] PRUEBA 9: Limpiar filtros

#### ⭐ Pruebas Intermedias
- [ ] PRUEBA 7: Filtros combinados (Producto + Almacén)
- [ ] PRUEBA 8: Filtros combinados (Producto + Fechas)
- [ ] PRUEBA 12: Visualización de detalles
- [ ] PRUEBA 14: Indicadores visuales por tipo
- [ ] PRUEBA 17: Loading y estados vacíos

#### 🚀 Pruebas Avanzadas (Opcionales)
- [ ] PRUEBA 15: Responsive design
- [ ] PRUEBA 16: Permisos de usuario
- [ ] PRUEBA 18: Actualización automática

---

## 🔧 Herramientas de Prueba

### Consola del Navegador
Presiona `F12` para abrir las DevTools y verifica:
- ✅ No hay errores en la consola
- ✅ Las peticiones al backend se realizan correctamente (pestaña Network)
- ✅ Las respuestas del backend son exitosas (status 200)

### React Developer Tools
Instala la extensión de React DevTools para verificar:
- Estado del store (zustand)
- Props de los componentes
- Re-renders

---

## 📊 Registro de Pruebas

Crea un documento (Excel, Google Sheets, o simple .txt) con esta estructura:

```
FECHA: ___________
PROBADOR: ___________

PRUEBA | RESULTADO | OBSERVACIONES
-------|-----------|---------------
  1    |  ✅ / ❌  | 
  2    |  ✅ / ❌  | 
  3    |  ✅ / ❌  | 
  ...  |  ...      | 
```

---

## 🐛 Reporte de Errores

Si encuentras un error, registra:
1. **Número de prueba:** Ej: PRUEBA 3
2. **Qué hiciste:** Seleccioné el producto ID 1 y hice clic en Buscar
3. **Qué esperabas:** Ver solo movimientos del producto 1
4. **Qué sucedió:** Se mostró un error 500
5. **Consola:** Copia el mensaje de error de la consola del navegador
6. **Screenshot:** Captura de pantalla si es posible

---

## ✅ Criterios de Aceptación

La Prioridad 2 se considera **COMPLETA** cuando:

1. ✅ Todos los casos de prueba básicos (1-9) pasan exitosamente
2. ✅ Los filtros funcionan correctamente
3. ✅ La tabla muestra los datos del backend
4. ✅ Los estados de loading/error/vacío funcionan
5. ✅ La interfaz es responsive (desktop y tablet)
6. ✅ No hay errores en consola

---

## 📞 Soporte

Si tienes dudas sobre cómo realizar alguna prueba:
1. Revisa el archivo **PRIORIDAD_2_MOVIMIENTOS_STOCK.md** con detalles completos
2. Consulta la documentación del backend en `Backend/pruebas/08_MOVIMIENTOS_STOCK.md`
3. Verifica que los endpoints del backend funcionen con las pruebas de `Backend/pruebas/`

---

## 🎨 Verificación Visual Rápida

### Colores de Tipos de Movimiento:
- **ENTRADA:** Verde brillante 🟢
- **SALIDA:** Rojo brillante 🔴
- **AJUSTE_ENTRADA:** Verde claro 🟢
- **AJUSTE_SALIDA:** Rojo claro 🔴
- **AJUSTE_SIN_CAMBIO:** Gris ⚪

### Elementos de la Interfaz:
- ✅ Título "Movimientos de Stock (Kardex)"
- ✅ Tarjeta de filtros colapsable
- ✅ 5 filtros: Producto, Almacén, Tipo, Fecha Inicio, Fecha Fin
- ✅ Botones: "Buscar" (verde), "Limpiar Filtros" (gris)
- ✅ Tabla con 9 columnas
- ✅ Botón "Ver" en cada fila
- ✅ Modal de detalles al hacer clic en "Ver"

---

## 📝 Notas Importantes

1. **Datos de Prueba:** Asegúrate de tener al menos:
   - 2-3 productos diferentes
   - 2 almacenes
   - Varios movimientos de diferentes tipos
   - Movimientos en diferentes fechas

2. **Performance:** La carga de datos debe tomar menos de 2 segundos

3. **Browser Compatibility:** Prueba en:
   - Google Chrome (recomendado)
   - Firefox
   - Edge

4. **Resoluciones de Pantalla:**
   - Desktop: 1920x1080 (prioritario)
   - Tablet: 768x1024 (importante)
   - Mobile: 375x667 (opcional)

---

**Última actualización:** Enero 2026  
**Versión:** 1.0  
**Estado:** Listo para pruebas
