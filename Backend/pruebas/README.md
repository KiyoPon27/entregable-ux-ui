# 📋 PRUEBAS DEL BACKEND - PROYECTO TIENDA

**Estado:** ✅ TODAS LAS PRUEBAS VALIDADAS  
**Última actualización:** 2026-01-17

---

## 🎯 Resumen Ejecutivo

- **8 Módulos** completamente probados
- **10 Validaciones** para Stock
- **12 Pruebas** para Movimientos de Stock (Kardex) 🆕
- **Backend 100% funcional** y validado

➡️ **Ver resumen completo:** [RESUMEN_COMPLETO_BACKEND.md](RESUMEN_COMPLETO_BACKEND.md)

---

## 📋 Índice de Pruebas

| # | Módulo | Archivo | Estado |
|---|--------|---------|--------|
| 1 | Autenticación | [01_AUTH.md](01_AUTH.md) | ✅ OK |
| 2 | Empresa | [02_EMPRESA.md](02_EMPRESA.md) | ✅ OK |
| 3 | Permisos | [03_PERMISOS.md](03_PERMISOS.md) | ✅ OK |
| 4 | Categorías | [04_CATEGORIAS.md](04_CATEGORIAS.md) | ✅ OK |
| 5 | Productos | [05_PRODUCTOS.md](05_PRODUCTOS.md) | ✅ OK |
| 6 | Almacenes | [06_ALMACENES.md](06_ALMACENES.md) | ✅ OK |
| 7 | Stock | [07_STOCK.md](07_STOCK.md) | ✅ OK |
| 8 | Movimientos Stock | [08_MOVIMIENTOS_STOCK.md](08_MOVIMIENTOS_STOCK.md) | 🆕 NUEVO |

---

## 🚀 Scripts Automatizados

### Opción 1: Suite Completa (Recomendado)
```powershell
cd Backend\pruebas
.\ejecutar_pruebas.ps1
```
Ejecuta los 8 módulos secuencialmente (~2-3 minutos)

### Opción 2: Prueba Rápida
```powershell
cd Backend\pruebas
.\PRUEBA_RAPIDA_COMPLETA.ps1
```
Verifica módulos críticos (~10 segundos)

### Opción 3: Stock Específico
```powershell
cd Backend\pruebas
.\EJECUTAR_10_PRUEBAS_STOCK.ps1
```
10 validaciones completas de Stock (~15 segundos)
### Opción 4: Movimientos de Stock (Kardex) 🆕
```powershell
cd Backend\pruebas
.\EJECUTAR_12_PRUEBAS_MOVIMIENTOS.ps1
```
12 validaciones de historial de movimientos (~20 segundos)


---

## 📖 Instrucciones Detalladas

➡️ **Guía completa:** [INSTRUCCIONES_EJECUTAR.md](INSTRUCCIONES_EJECUTAR.md)

### Inicio Rápido

1. **Iniciar Backend** (terminal dedicada):
```powershell
cd Backend
.\INICIAR_BACKEND.ps1
```

2. **Ejecutar Pruebas** (nueva terminal):
```powershell
cd Backend\pruebas
.\PRUEBA_RAPIDA_COMPLETA.ps1
```

---

## ⚠️ Requisitos

- ✅ Backend ejecutándose en `http://localhost:8080`
- ✅ Base de datos MySQL activa
- ✅ PowerShell 7+
- ✅ Usuario de prueba: `admin@tienda.com` / `123`

---

## 📂 Estructura de Archivos

### 🚀 SCRIPTS EJECUTABLES (PowerShell)

**Estos son los archivos que debes ejecutar:**

| Script | Propósito | Pruebas | Tiempo |
|--------|-----------|---------|--------|
| `ejecutar_pruebas.ps1` | Suite completa 8 módulos | 8 | ~2-3 min |
| `EJECUTAR_10_PRUEBAS_STOCK.ps1` | Validación Stock detallada | 10 | ~15 seg |
| `EJECUTAR_12_PRUEBAS_MOVIMIENTOS.ps1` 🆕 | Kardex/Movimientos Stock | 12 | ~20 seg |

**Formato:** Todos usan ✓ verde / ✗ rojo para resultados claros

### 📖 DOCUMENTACIÓN DE REFERENCIA (.md)

**Estos archivos NO se ejecutan, solo documentan:**

| Archivo | Descripción |
|---------|-------------|
| `01_AUTENTICACION.md` | Módulo 1: Login y Auth |
| `02_EMPRESA.md` | Módulo 2: Empresa |
| `03_PERMISOS.md` | Módulo 3: Permisos |
| `04_CATEGORIAS.md` | Módulo 4: Categorías (con validaciones) 🆕 |
| `05_PRODUCTOS.md` | Módulo 5: Productos |
| `06_ALMACENES.md` | Módulo 6: Almacenes |
| `07_STOCK.md` | Módulo 7: Gestión de Stock |
| `08_MOVIMIENTOS_STOCK.md` | Módulo 8: Kardex (DOCUMENTACIÓN) 🆕 |
| `MOVIMIENTOS_STOCK_RESUMEN.md` | Resumen implementación Priority 2 🆕 |

---

## ✅ Validaciones Implementadas

- ✅ JWT Authentication en todos los endpoints
- ✅ Validación de nombres duplicados (Categorías)
- ✅ Validación de stock negativo (Stock)
- ✅ Validación de IDs inexistentes (404)
- ✅ Manejo global de errores
- ✅ JSON sin referencias circulares
- ✅ Valores por defecto en campos opcionales
- ✅ Registro automático de movimientos en ajustes de stock 🆕

---

## 📝 Notas Importantes

- Los módulos marcados con ⚠️ aún no tienen validaciones de negocio implementadas
- Todas las pruebas asumen empresa ID = 1, usuario ID = 1
- Si encuentras errores, verifica que el backend esté corriendo y la BD tenga los datos iniciales

