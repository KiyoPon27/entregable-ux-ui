# 📋 PRUEBAS FRONTEND - CATEGORÍAS

## 🎯 Objetivo
Validar que el frontend maneja correctamente los errores 409 (Nombre Duplicado) y 404 (No Encontrado) del backend.

## 📦 Requisitos Previos
1. Backend ejecutándose en `http://localhost:8080`
2. Frontend ejecutándose (probablemente `npm run dev`)
3. Usuario logueado en la aplicación
4. Navegar a la página de **Categorías**

---

## ✅ PRUEBA 1: Crear Categoría - Caso Normal
**Objetivo:** Verificar que se puede crear una categoría sin problemas

**Pasos:**
1. Click en botón "Nueva Categoría" o similar
2. Llenar el formulario:
   - Nombre: `ELECTRÓNICA`
   - Color: Seleccionar cualquier color (ej: rojo)
   - Icono: Opcional (puede dejarse por defecto)
3. Click en "Guardar"

**Resultado Esperado:**
- ✅ Mensaje: "¡Categoría creada! La categoría se ha creado exitosamente"
- ✅ Modal se cierra automáticamente después de 2 segundos
- ✅ La categoría aparece en la tabla

---

## ❌ PRUEBA 2: Crear Categoría - Nombre Duplicado (409)
**Objetivo:** Validar que el sistema detecta nombres duplicados

**Pasos:**
1. Intentar crear una nueva categoría
2. Usar el MISMO nombre de una categoría existente:
   - Nombre: `ELECTRÓNICA` (que ya existe de la prueba 1)
   - Color: Seleccionar cualquier color
3. Click en "Guardar"

**Resultado Esperado:**
- ❌ Mensaje de error: "Nombre duplicado - Ya existe una categoría con este nombre"
- ⚠️ El modal NO se cierra
- 📝 El usuario puede corregir el nombre y reintentar

**Notas:**
- El error debe ser específico y claro
- El formulario debe mantener los datos ingresados
- No se debe crear una categoría duplicada en la base de datos

---

## ✅ PRUEBA 3: Editar Categoría - Caso Normal
**Objetivo:** Verificar que se puede editar correctamente

**Pasos:**
1. Seleccionar una categoría existente (ej: `ELECTRÓNICA`)
2. Click en botón "Editar"
3. Modificar:
   - Nombre: Mantener `ELECTRÓNICA` o cambiar a `ELECTRONICA Y TECNOLOGIA`
   - Color: Cambiar a otro color si deseas
4. Click en "Guardar"

**Resultado Esperado:**
- ✅ Mensaje: "¡Categoría actualizada! Los cambios se han guardado exitosamente"
- ✅ Modal se cierra automáticamente después de 2 segundos
- ✅ Los cambios se reflejan en la tabla

---

## ❌ PRUEBA 4: Editar Categoría - Nombre Duplicado (409)
**Objetivo:** Validar que no se puede cambiar el nombre a uno que ya existe

**Pasos:**
1. Crear dos categorías:
   - Primera: `ALIMENTOS`
   - Segunda: `BEBIDAS`
2. Editar la categoría `BEBIDAS`
3. Intentar cambiar el nombre a: `ALIMENTOS` (nombre de otra categoría existente)
4. Click en "Guardar"

**Resultado Esperado:**
- ❌ Mensaje de error: "Nombre duplicado - Ya existe otra categoría con este nombre"
- ⚠️ El modal NO se cierra
- 📝 Los cambios NO se guardan
- 🔄 El usuario puede corregir y reintentar

---

## ⚠️ PRUEBA 5: Editar Categoría - No Encontrada (404)
**Objetivo:** Validar el comportamiento cuando se intenta editar una categoría que ya no existe

**Simulación (caso extremo):**
Esto puede pasar si dos usuarios están trabajando simultáneamente:
- Usuario A abre el modal para editar categoría ID=50
- Usuario B elimina la categoría ID=50
- Usuario A intenta guardar cambios

**Resultado Esperado:**
- ⚠️ Mensaje: "Categoría no encontrada - La categoría que intentas editar no existe o fue eliminada"
- 🔄 La lista de categorías se recarga automáticamente
- ✅ La categoría desaparecida ya no está en la tabla

**Nota:** Este escenario es difícil de probar manualmente. El sistema está preparado para manejarlo.

---

## ✅ PRUEBA 6: Eliminar Categoría - Caso Normal
**Objetivo:** Verificar que se puede eliminar correctamente

**Pasos:**
1. Seleccionar una categoría de prueba (ej: `BEBIDAS`)
2. Click en botón "Eliminar" o ícono de papelera
3. Confirmar la eliminación en el diálogo de confirmación

**Resultado Esperado:**
- ✅ Mensaje: "¡Categoría eliminada! La categoría se ha eliminado exitosamente"
- ✅ Mensaje se muestra por 2 segundos
- ✅ La categoría desaparece de la tabla

---

## ⚠️ PRUEBA 7: Eliminar Categoría - No Encontrada (404)
**Objetivo:** Validar cuando se intenta eliminar una categoría inexistente

**Simulación (caso extremo):**
Similar a la prueba 5, escenario de usuarios simultáneos:
- Usuario A ve la categoría ID=50 en la lista
- Usuario B elimina la categoría ID=50
- Usuario A intenta eliminar la misma categoría

**Resultado Esperado:**
- ⚠️ Mensaje: "Categoría no encontrada - La categoría que intentas eliminar no existe o ya fue eliminada"
- 🔄 La lista se recarga automáticamente
- ✅ La categoría ya no aparece en la tabla

**Nota:** Escenario poco frecuente pero manejado correctamente.

---

## 📊 Resumen de Validaciones

| # | Prueba | Código HTTP | Mensaje Esperado | Comportamiento |
|---|--------|-------------|------------------|----------------|
| 1 | Crear normal | 200 | ¡Categoría creada! | Modal cierra, lista actualiza |
| 2 | Crear duplicado | 409 | Nombre duplicado | Modal abierto, puede corregir |
| 3 | Editar normal | 200 | ¡Categoría actualizada! | Modal cierra, cambios reflejan |
| 4 | Editar duplicado | 409 | Nombre duplicado | Modal abierto, puede corregir |
| 5 | Editar no existe | 404 | Categoría no encontrada | Lista recarga |
| 6 | Eliminar normal | 200 | ¡Categoría eliminada! | Categoría desaparece |
| 7 | Eliminar no existe | 404 | Categoría no encontrada | Lista recarga |

---

## 🎨 Tipos de Mensajes

### ✅ Éxito (Verde)
- Fondo verde
- Ícono de check
- Se cierra automáticamente (2 segundos)

### ❌ Error 409 - Duplicado (Rojo)
- Fondo rojo
- Ícono de error
- Botón "OK" para cerrar manualmente
- Modal principal permanece abierto

### ⚠️ Advertencia 404 - No Encontrado (Azul)
- Fondo azul
- Ícono de advertencia
- Botón "OK" para cerrar
- Lista se recarga automáticamente

---

## 🔧 Troubleshooting

### ❓ No aparecen los mensajes de SweetAlert2
**Solución:**
```bash
cd Fronted
npm install sweetalert2
```

### ❓ Los errores 409/404 no se capturan
**Verificar:**
1. Backend está corriendo en puerto 8080
2. El backend tiene GlobalExceptionHandler implementado
3. Revisar consola del navegador (F12) para ver errores de red

### ❓ El modal no se cierra automáticamente
**Verificar:**
- Los mensajes de éxito tienen `timer: 2000` y `showConfirmButton: false`

---

## 📝 Notas Importantes

1. **Consistencia de Nombres:** El backend valida por nombre + empresa, así que puedes tener categorías con el mismo nombre si pertenecen a diferentes empresas.

2. **Recarga Automática:** Después de cualquier operación exitosa o error 404, la lista se recarga para mantener sincronización con la base de datos.

3. **Retorno de Funciones:** Las funciones ahora retornan un objeto con `{ success: true/false, error: "tipo" }` para que los componentes puedan reaccionar según el resultado.

4. **Case-Insensitive:** El backend valida nombres sin distinguir mayúsculas/minúsculas. "ELECTRÓNICA" = "electrónica" (se considera duplicado).

---

## ✅ Criterios de Éxito

**La migración es exitosa si:**
- ✅ Todos los mensajes se muestran correctamente
- ✅ Los errores 409 previenen duplicados
- ✅ Los errores 404 sincronizan la lista
- ✅ La experiencia de usuario es clara e informativa
- ✅ No hay errores en la consola del navegador

---

## 🚀 Próximos Pasos
Después de validar estas pruebas:
1. ✅ Confirmar que todo funciona correctamente
2. 📸 (Opcional) Capturar screenshots de los mensajes
3. ➡️ Proceder con **Priority 2: Historial de Movimientos (Kardex)**
