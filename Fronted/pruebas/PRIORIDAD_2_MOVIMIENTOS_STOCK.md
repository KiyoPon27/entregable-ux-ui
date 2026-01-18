# CASOS DE PRUEBA - PRIORIDAD 2: MOVIMIENTOS DE STOCK (KARDEX)

## 📋 Información General

**Módulo:** Movimientos de Stock / Kardex  
**Prioridad:** 2  
**Fecha:** Enero 2026  
**Objetivo:** Validar la interfaz de usuario para consulta de historial de movimientos de stock

---

## 🎯 Casos de Prueba Frontend

### PRUEBA 1: Acceso a la Página Kardex
**Descripción:** Verificar que la página de Movimientos de Stock sea accesible desde el menú principal

**Pasos:**
1. Iniciar sesión como usuario administrador
2. Buscar opción "Movimientos de Stock" o "Kardex" en el menú lateral
3. Hacer clic en la opción

**Resultado Esperado:**
- ✓ La página carga correctamente
- ✓ Se muestra el título "Movimientos de Stock" o "Kardex"
- ✓ Se visualiza una tabla vacía o con datos si existen movimientos
- ✓ Se muestran filtros de búsqueda

---

### PRUEBA 2: Listar Todos los Movimientos
**Descripción:** Verificar que se muestren todos los movimientos de stock registrados

**Pasos:**
1. Acceder a la página de Movimientos de Stock
2. Observar la tabla principal sin aplicar filtros

**Resultado Esperado:**
- ✓ Se muestra una tabla con columnas: Fecha, Producto, Almacén, Tipo, Cantidad, Detalle, Origen
- ✓ Los datos se cargan automáticamente al entrar
- ✓ Se muestra un loading mientras carga
- ✓ Los movimientos están ordenados por fecha descendente (más reciente primero)
- ✓ Si no hay datos, se muestra mensaje "No hay movimientos registrados"

---

### PRUEBA 3: Filtrar por Producto
**Descripción:** Filtrar movimientos de un producto específico (Kardex de producto)

**Pasos:**
1. En la página de Movimientos de Stock
2. Buscar el filtro "Producto" o selector de producto
3. Seleccionar un producto de la lista
4. Hacer clic en "Buscar" o esperar filtrado automático

**Resultado Esperado:**
- ✓ La tabla se actualiza mostrando solo movimientos del producto seleccionado
- ✓ Se muestra el nombre del producto en algún indicador visual
- ✓ Los datos corresponden únicamente a ese producto
- ✓ Se puede limpiar el filtro para volver a ver todos

---

### PRUEBA 4: Filtrar por Almacén
**Descripción:** Filtrar movimientos de un almacén específico

**Pasos:**
1. Seleccionar un almacén del filtro
2. Aplicar el filtro

**Resultado Esperado:**
- ✓ Solo se muestran movimientos del almacén seleccionado
- ✓ El indicador visual muestra el almacén filtrado
- ✓ Los datos son correctos

---

### PRUEBA 5: Filtrar por Tipo de Movimiento
**Descripción:** Filtrar por tipo (ENTRADA, SALIDA, AJUSTE_ENTRADA, AJUSTE_SALIDA, etc.)

**Pasos:**
1. Seleccionar un tipo de movimiento del filtro
2. Aplicar el filtro

**Resultado Esperado:**
- ✓ Solo se muestran movimientos del tipo seleccionado
- ✓ La columna "Tipo" muestra valores consistentes con el filtro
- ✓ Se puede filtrar por múltiples tipos si está implementado

---

### PRUEBA 6: Filtrar por Rango de Fechas
**Descripción:** Filtrar movimientos entre dos fechas

**Pasos:**
1. Seleccionar fecha de inicio en el date picker
2. Seleccionar fecha de fin
3. Aplicar filtro

**Resultado Esperado:**
- ✓ Solo se muestran movimientos dentro del rango de fechas
- ✓ La columna "Fecha" muestra valores dentro del rango
- ✓ Se valida que fecha inicio ≤ fecha fin
- ✓ Mensaje de error si el rango es inválido

---

### PRUEBA 7: Filtros Combinados (Producto + Almacén)
**Descripción:** Aplicar múltiples filtros simultáneamente

**Pasos:**
1. Seleccionar un producto específico
2. Seleccionar un almacén específico
3. Aplicar filtros

**Resultado Esperado:**
- ✓ Se muestran solo movimientos que cumplan AMBOS criterios
- ✓ Es el Kardex específico de ese producto en ese almacén
- ✓ Los datos son precisos

---

### PRUEBA 8: Filtros Combinados (Producto + Fechas)
**Descripción:** Kardex de producto en un período específico

**Pasos:**
1. Seleccionar un producto
2. Definir rango de fechas
3. Aplicar filtros

**Resultado Esperado:**
- ✓ Se muestra el historial del producto solo en el período indicado
- ✓ Útil para auditorías de producto

---

### PRUEBA 9: Limpiar Filtros
**Descripción:** Verificar que se puedan limpiar todos los filtros

**Pasos:**
1. Aplicar varios filtros
2. Hacer clic en botón "Limpiar Filtros" o similar
3. Observar la tabla

**Resultado Esperado:**
- ✓ Todos los filtros se resetean a su valor por defecto
- ✓ La tabla vuelve a mostrar todos los movimientos
- ✓ Los selectores/inputs quedan vacíos

---

### PRUEBA 10: Paginación de Resultados
**Descripción:** Si hay muchos movimientos, verificar paginación

**Pasos:**
1. Listar todos los movimientos (si hay más de 10-20)
2. Observar controles de paginación en la parte inferior
3. Hacer clic en "Siguiente página" o página 2
4. Hacer clic en "Anterior"

**Resultado Esperado:**
- ✓ Se muestran X registros por página (ej: 10, 20, 50)
- ✓ Los controles de paginación funcionan correctamente
- ✓ Se indica "Mostrando 1-10 de 50" o similar
- ✓ Se puede cambiar el tamaño de página

---

### PRUEBA 11: Exportar a Excel/PDF
**Descripción:** Si está implementado, exportar el Kardex

**Pasos:**
1. Aplicar filtros deseados
2. Hacer clic en botón "Exportar" o "Descargar"
3. Seleccionar formato (Excel/PDF)

**Resultado Esperado:**
- ✓ Se descarga un archivo con los datos filtrados
- ✓ El archivo contiene todas las columnas visibles
- ✓ El formato es legible y profesional

---

### PRUEBA 12: Visualización de Detalles
**Descripción:** Ver detalles completos de un movimiento

**Pasos:**
1. En la tabla, hacer clic en el ícono "ver detalles" o en una fila
2. Observar modal o panel de detalles

**Resultado Esperado:**
- ✓ Se abre un modal/drawer con información completa
- ✓ Se muestran todos los campos: ID, Fecha exacta, Producto, Almacén, Tipo, Cantidad, Detalle, Origen
- ✓ El diseño es claro y legible
- ✓ Se puede cerrar el modal

---

### PRUEBA 13: Búsqueda por Texto
**Descripción:** Si hay un campo de búsqueda general

**Pasos:**
1. Escribir texto en el campo de búsqueda (ej: nombre de producto, detalle)
2. Observar resultados

**Resultado Esperado:**
- ✓ La tabla se filtra mostrando solo coincidencias
- ✓ La búsqueda es insensible a mayúsculas/minúsculas
- ✓ Busca en múltiples columnas (producto, detalle, origen)

---

### PRUEBA 14: Indicadores Visuales por Tipo
**Descripción:** Verificar que los tipos de movimiento tengan colores diferentes

**Pasos:**
1. Listar movimientos de diferentes tipos
2. Observar la columna "Tipo"

**Resultado Esperado:**
- ✓ ENTRADA: Verde o ícono +
- ✓ SALIDA: Rojo o ícono -
- ✓ AJUSTE_ENTRADA: Verde claro o ícono ajuste +
- ✓ AJUSTE_SALIDA: Rojo claro o ícono ajuste -
- ✓ AJUSTE_SIN_CAMBIO: Gris o ícono =

---

### PRUEBA 15: Responsive Design
**Descripción:** Verificar que la interfaz sea responsive

**Pasos:**
1. Acceder desde diferentes dispositivos o cambiar tamaño de ventana
2. Probar en: Desktop (1920px), Tablet (768px), Mobile (375px)

**Resultado Esperado:**
- ✓ En desktop: Tabla completa visible
- ✓ En tablet: Algunas columnas ocultas, filtros adaptados
- ✓ En mobile: Vista de tarjetas o tabla colapsable
- ✓ Filtros accesibles en un menú desplegable en mobile

---

### PRUEBA 16: Permisos de Usuario
**Descripción:** Verificar que solo usuarios autorizados accedan

**Pasos:**
1. Iniciar sesión con usuario sin permisos de inventario
2. Intentar acceder a Movimientos de Stock

**Resultado Esperado:**
- ✓ Si no tiene permisos: Mensaje "No tienes permisos" o redirección
- ✓ Si tiene permisos de solo lectura: No se muestran botones de edición/eliminación (si existen)
- ✓ Administradores tienen acceso completo

---

### PRUEBA 17: Loading y Estados Vacíos
**Descripción:** Verificar estados de carga y vacío

**Pasos:**
1. Recargar la página y observar loading
2. Aplicar filtros que no devuelvan resultados

**Resultado Esperado:**
- ✓ Loading: Spinner o skeleton loader mientras carga
- ✓ Estado vacío: Mensaje "No hay movimientos en este período" con ícono amigable
- ✓ Error de red: Mensaje "Error al cargar movimientos. Reintentar"

---

### PRUEBA 18: Actualización Automática (Opcional)
**Descripción:** Si está implementado con subscripción real-time

**Pasos:**
1. Abrir la página de Movimientos en dos pestañas/navegadores
2. En otra pestaña, realizar un ajuste de stock
3. Observar la primera pestaña

**Resultado Esperado:**
- ✓ La tabla se actualiza automáticamente con el nuevo movimiento
- ✓ Aparece notificación "Nuevo movimiento registrado"

---

## 🔧 Pruebas de Integración con Backend

### INT-1: Verificar Endpoint GET /api/movimientos-stock
- Hacer petición desde el frontend
- Verificar que los datos coincidan con la tabla

### INT-2: Verificar Endpoint GET /api/movimientos-stock/producto/{id}
- Seleccionar producto en el filtro
- Verificar que la petición incluya el ID correcto en la URL
- Validar que los datos sean solo de ese producto

### INT-3: Verificar Endpoint GET /api/movimientos-stock/fechas?inicio=X&fin=Y
- Aplicar filtro de fechas
- Verificar que se construyan correctamente los query params
- Validar que el backend responda con datos del rango

### INT-4: Manejo de Errores HTTP
- Simular error 401 (desloguearse)
- Simular error 500 (detener backend)
- Verificar que el frontend maneje correctamente los errores

---

## 📊 Checklist de Funcionalidades

### Funcionalidades Básicas (Mínimo Viable)
- [ ] Listar todos los movimientos
- [ ] Filtrar por producto (Kardex)
- [ ] Filtrar por almacén
- [ ] Filtrar por tipo de movimiento
- [ ] Filtrar por rango de fechas
- [ ] Mostrar detalles de movimiento
- [ ] Loading states
- [ ] Mensajes de error

### Funcionalidades Intermedias
- [ ] Filtros combinados
- [ ] Paginación
- [ ] Búsqueda por texto
- [ ] Limpiar filtros
- [ ] Indicadores visuales por tipo
- [ ] Responsive design
- [ ] Validación de permisos

### Funcionalidades Avanzadas (Opcional)
- [ ] Exportar a Excel
- [ ] Exportar a PDF
- [ ] Actualización real-time
- [ ] Gráficos de movimientos (línea de tiempo)
- [ ] Resumen estadístico (totales de entrada/salida)

---

## 🎨 Notas de Diseño UI/UX

1. **Colores por Tipo:**
   - ENTRADA: Verde (#22c55e)
   - SALIDA: Rojo (#ef4444)
   - AJUSTE_ENTRADA: Verde claro (#86efac)
   - AJUSTE_SALIDA: Rojo claro (#fca5a5)
   - AJUSTE_SIN_CAMBIO: Gris (#9ca3af)

2. **Iconos Recomendados:**
   - ENTRADA: TrendingUp, Plus
   - SALIDA: TrendingDown, Minus
   - AJUSTE: Settings, Edit

3. **Layout:**
   - Filtros en la parte superior en una tarjeta colapsable
   - Tabla principal ocupa 80% del alto de pantalla
   - Controles de paginación en la parte inferior
   - Botón de exportar en esquina superior derecha

---

## ⚠️ Validaciones Importantes

1. **Fechas:**
   - Fecha inicio no puede ser mayor a fecha fin
   - Rango máximo de 1 año (opcional)
   - Formato: YYYY-MM-DD o DD/MM/YYYY

2. **Filtros:**
   - Al menos un filtro debe estar activo para búsquedas avanzadas
   - Si se selecciona producto y almacén, usar endpoint específico

3. **Performance:**
   - Limitar resultados a 100-500 por página
   - Implementar debounce en búsqueda por texto (300ms)
   - Cache de productos/almacenes para selectores

---

## 📝 Datos de Prueba Sugeridos

### Productos de Prueba:
- Producto ID 1: Producto con muchos movimientos
- Producto ID 2: Producto con pocos movimientos
- Producto ID 999: Producto sin movimientos

### Almacenes de Prueba:
- Almacén ID 1: Almacén principal
- Almacén ID 2: Almacén secundario

### Tipos de Movimiento:
- ENTRADA
- SALIDA
- AJUSTE_ENTRADA
- AJUSTE_SALIDA
- AJUSTE_SIN_CAMBIO
- COMPRA (si está implementado)
- VENTA (si está implementado)

---

## ✅ Criterios de Aceptación

La Prioridad 2 se considera **COMPLETA** cuando:

1. ✅ Todos los casos de prueba básicos (1-9) funcionan correctamente
2. ✅ Los filtros principales (producto, almacén, tipo, fechas) están operativos
3. ✅ La tabla muestra correctamente los datos del backend
4. ✅ Los estados de loading, error y vacío están implementados
5. ✅ La interfaz es responsive (desktop y tablet mínimo)
6. ✅ Los permisos de usuario están validados
7. ✅ No hay errores de consola ni warnings críticos
8. ✅ El rendimiento es aceptable (< 2 segundos para cargar datos)

---

**Nota:** Estos casos de prueba deben ejecutarse manualmente en el navegador. Se recomienda crear un checklist en Excel/Google Sheets para marcar cada prueba como ✅ o ❌.
