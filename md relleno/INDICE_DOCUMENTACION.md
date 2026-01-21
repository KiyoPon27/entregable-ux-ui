# 📚 ÍNDICE DE DOCUMENTACIÓN - PRIORIDAD 2

## 📁 Estructura de Archivos

```
PROYECTO_TIENDA_CHINA/
│
├── PRIORIDAD_2_COMPLETADA.md ⭐ (RESUMEN GENERAL)
├── INICIO_RAPIDO_PRIORIDAD_2.md ⚡ (GUÍA DE INICIO)
│
├── Backend/
│   ├── src/main/java/tienda/posbackend/
│   │   ├── entities/
│   │   │   └── MovimientoStock.java
│   │   ├── repositories/
│   │   │   └── MovimientoStockRepository.java
│   │   ├── services/
│   │   │   └── MovimientoStockService.java
│   │   └── controllers/
│   │       ├── MovimientoStockController.java
│   │       └── StockController.java (modificado)
│   │
│   └── pruebas/
│       ├── EJECUTAR_12_PRUEBAS_MOVIMIENTOS.ps1
│       ├── 08_MOVIMIENTOS_STOCK.md
│       └── MOVIMIENTOS_STOCK_RESUMEN.md
│
└── Fronted/
    ├── src/
    │   ├── store/
    │   │   └── MovimientosStockStore.jsx
    │   ├── pages/
    │   │   └── MovimientosStock.jsx
    │   └── routers/
    │       └── routes.jsx (modificado)
    │
    └── pruebas/
        ├── README.md ⭐ (GUÍA DE PRUEBAS)
        ├── PRIORIDAD_2_MOVIMIENTOS_STOCK.md (18 casos)
        └── RESUMEN_IMPLEMENTACION_PRIORIDAD_2.md
```

---

## 🎯 ¿Qué archivo leer según tu necesidad?

### 🚀 Quiero empezar RÁPIDO
👉 **INICIO_RAPIDO_PRIORIDAD_2.md** (raíz del proyecto)
- 3 pasos para iniciar
- Primera prueba en 2 minutos

---

### 📖 Quiero entender QUÉ se hizo
👉 **PRIORIDAD_2_COMPLETADA.md** (raíz del proyecto)
- Resumen completo backend + frontend
- Lista de archivos creados
- Endpoints disponibles
- Checklist de funcionalidades

---

### 🧪 Quiero PROBAR el Frontend
👉 **Fronted/pruebas/README.md**
- Guía paso a paso
- Cómo ejecutar pruebas
- Herramientas recomendadas

👉 **Fronted/pruebas/PRIORIDAD_2_MOVIMIENTOS_STOCK.md**
- 18 casos de prueba detallados
- Resultados esperados
- Checklist de funcionalidades

---

### 🔧 Quiero PROBAR el Backend
👉 **Backend/pruebas/08_MOVIMIENTOS_STOCK.md**
- 12 casos de prueba
- Peticiones de ejemplo
- Respuestas esperadas

👉 **Backend/pruebas/EJECUTAR_12_PRUEBAS_MOVIMIENTOS.ps1**
- Script automatizado (tiene errores de PowerShell)
- Usar comandos manuales del .md es más confiable

---

### 💻 Soy DESARROLLADOR y quiero detalles técnicos

**Backend:**
👉 **Backend/pruebas/MOVIMIENTOS_STOCK_RESUMEN.md**
- Explicación técnica completa
- Flujo de registro automático
- Queries de ejemplo
- Estructura de respuestas JSON

**Frontend:**
👉 **Fronted/pruebas/RESUMEN_IMPLEMENTACION_PRIORIDAD_2.md**
- Arquitectura del frontend
- Componentes y styled-components
- Integración con backend
- Métricas de implementación

---

### 🐛 Tengo un ERROR

**Backend no inicia:**
1. Ver sección "Si algo falla" en **INICIO_RAPIDO_PRIORIDAD_2.md**
2. Verificar puerto 8080 disponible
3. Ver logs en terminal de Backend

**Frontend con errores:**
1. Verificar que backend esté corriendo
2. `npm install` para reinstalar dependencias
3. Verificar URL del backend en `Fronted/src/api/api.js`

**Endpoints no responden:**
1. Autenticarse correctamente (ver Backend/pruebas/08_MOVIMIENTOS_STOCK.md)
2. Usar `$resp.accessToken` (no `$resp.token`)
3. Verificar que el usuario tenga permisos

---

### 📊 Quiero VER los endpoints disponibles

👉 **PRIORIDAD_2_COMPLETADA.md** → Sección "Endpoints REST"

O directamente en el código:
👉 **Backend/src/main/java/tienda/posbackend/controllers/MovimientoStockController.java**

---

### 🎨 Quiero saber cómo se VE la interfaz

Capturas de pantalla NO disponibles, pero puedes ver:

**Diseño en código:**
👉 **Fronted/src/pages/MovimientosStock.jsx**
- Sección `Styled Components` al final del archivo

**Descripción visual:**
👉 **Fronted/pruebas/PRIORIDAD_2_MOVIMIENTOS_STOCK.md**
- Sección "Notas de Diseño UI/UX"
- Colores, iconos, layout

---

## 📝 Resumen de Documentos

| Archivo | Ubicación | Propósito | Páginas |
|---------|-----------|-----------|---------|
| **PRIORIDAD_2_COMPLETADA.md** | Raíz | Resumen general | ~200 líneas |
| **INICIO_RAPIDO_PRIORIDAD_2.md** | Raíz | Guía rápida | ~100 líneas |
| **08_MOVIMIENTOS_STOCK.md** | Backend/pruebas | Casos backend | ~300 líneas |
| **MOVIMIENTOS_STOCK_RESUMEN.md** | Backend/pruebas | Técnico backend | ~400 líneas |
| **README.md** | Fronted/pruebas | Guía pruebas frontend | ~200 líneas |
| **PRIORIDAD_2_MOVIMIENTOS_STOCK.md** | Fronted/pruebas | Casos frontend | ~400 líneas |
| **RESUMEN_IMPLEMENTACION_PRIORIDAD_2.md** | Fronted/pruebas | Técnico frontend | ~400 líneas |
| **INDICE_DOCUMENTACION.md** | Raíz | Este archivo | ~150 líneas |

**Total:** ~2150 líneas de documentación 📚

---

## ✅ Checklist de Lectura Recomendada

Para un **usuario que va a probar:**
- [ ] INICIO_RAPIDO_PRIORIDAD_2.md
- [ ] Fronted/pruebas/README.md
- [ ] Fronted/pruebas/PRIORIDAD_2_MOVIMIENTOS_STOCK.md

Para un **desarrollador que mantiene el código:**
- [ ] PRIORIDAD_2_COMPLETADA.md
- [ ] Backend/pruebas/MOVIMIENTOS_STOCK_RESUMEN.md
- [ ] Fronted/pruebas/RESUMEN_IMPLEMENTACION_PRIORIDAD_2.md

Para un **QA que valida funcionalidad:**
- [ ] Backend/pruebas/08_MOVIMIENTOS_STOCK.md
- [ ] Fronted/pruebas/PRIORIDAD_2_MOVIMIENTOS_STOCK.md
- [ ] Crear checklist en Excel con todos los casos

---

## 🎯 Flujo de Trabajo Recomendado

### 1. Primera Vez (Setup)
1. Lee: **INICIO_RAPIDO_PRIORIDAD_2.md**
2. Inicia backend y frontend
3. Accede a `/movimientos-stock`
4. Prueba rápida de 2 minutos

### 2. Entender el Sistema
1. Lee: **PRIORIDAD_2_COMPLETADA.md**
2. Revisa la sección de endpoints
3. Ve los ejemplos de datos

### 3. Pruebas Completas
1. Lee: **Fronted/pruebas/README.md**
2. Sigue: **Fronted/pruebas/PRIORIDAD_2_MOVIMIENTOS_STOCK.md**
3. Ejecuta los 18 casos de prueba
4. Registra resultados

### 4. Validación Backend (Opcional)
1. Lee: **Backend/pruebas/08_MOVIMIENTOS_STOCK.md**
2. Ejecuta comandos PowerShell manualmente
3. Verifica respuestas JSON

### 5. Desarrollo Futuro
1. Lee documentos técnicos (RESUMEN_*)
2. Revisa el código fuente
3. Documenta cambios nuevos

---

## 🔍 Búsqueda Rápida

**¿Cómo filtrar por producto?**
→ Fronted/pruebas/PRIORIDAD_2_MOVIMIENTOS_STOCK.md → PRUEBA 3

**¿Qué hace el registro automático?**
→ Backend/pruebas/MOVIMIENTOS_STOCK_RESUMEN.md → Sección "Integración con StockController"

**¿Cuántos endpoints hay?**
→ PRIORIDAD_2_COMPLETADA.md → 11 endpoints (tabla completa)

**¿Qué colores usar para cada tipo?**
→ Fronted/pruebas/PRIORIDAD_2_MOVIMIENTOS_STOCK.md → Notas de Diseño UI/UX

**¿Cómo probar el backend?**
→ Backend/pruebas/08_MOVIMIENTOS_STOCK.md

**¿Error al ejecutar script PowerShell?**
→ INICIO_RAPIDO_PRIORIDAD_2.md → Sección "Si algo falla"

---

## 📧 Contacto y Soporte

Si después de leer la documentación tienes dudas:
1. Verifica que backend y frontend estén corriendo
2. Revisa la consola del navegador (F12)
3. Consulta los logs del backend
4. Revisa la sección "Si algo falla" en INICIO_RAPIDO

---

**Documentación creada por:** GitHub Copilot  
**Fecha:** Enero 2026  
**Versión:** 1.0  
**Estado:** ✅ Completa
