# 🚨 LEER PRIMERO - CONTEXTO ACTUAL DEL PROYECTO

**Fecha de última actualización:** 19 de Enero de 2026  
**Sesión:** Revisión exhaustiva Backend + Frontend  
**Branch actual:** `POST_AVANCE`  
**Estado:** En fase de corrección de errores post-migración

---

## 📖 HISTORIA DEL PROYECTO

### Origen
Sistema de punto de venta (POS) originalmente desarrollado con:
- **Frontend:** React + Supabase Client
- **Backend:** Supabase (PostgreSQL + Auth + Functions + Triggers)
- **Base de datos:** PostgreSQL con 30+ funciones RPC y 9 triggers automáticos

### Migración Realizada (Supabase → MySQL + Spring Boot)
**Razón:** Migrar de Supabase (cloud) a infraestructura local con MySQL

**Cambios arquitectónicos:**
1. **Base de datos:** PostgreSQL → MySQL 8.0+
2. **Backend:** Supabase Functions → Spring Boot + JPA + Gradle
3. **Autenticación:** Supabase Auth → JWT local con Spring Security
4. **Frontend:** Supabase Client → Axios + REST API

**Trabajo realizado hasta ahora:**
- ✅ Migración completa de tablas PostgreSQL → MySQL
- ✅ Creación de 120+ archivos Java (Entities, Services, Controllers, Repositories)
- ✅ Migración de 26 archivos CRUD del frontend
- ✅ Implementación de JWT con bcrypt
- ✅ Configuración de CORS y seguridad
- ⚠️ **Pendiente:** Implementar lógica de 6 triggers críticos de Supabase
- ⚠️ **Pendiente:** Corregir 4 endpoints del frontend que no coinciden

---

## 🎯 ESTADO ACTUAL DEL PROYECTO

### Backend (73% Completado)
- ✅ **Funcionando:** Autenticación, CRUD básicos, DTOs, validaciones
- ❌ **13 errores críticos identificados** (ver `Backend/PROBLEMAS_POR_RESOLVER_BACKEND_MYSQL.md`)
- 🔴 **6 triggers de Supabase NO implementados** (validación de stock, retorno de stock, permisos, etc.)

### Frontend (85% Completado)
- ✅ **Funcionando:** La mayoría de stores migrados a axios
- ❌ **4 errores críticos identificados** (ver `Fronted/PROBLEMAS_POR_RESOLVER_FRONT_MYSQL.md`)
- 🔴 **Endpoints no coinciden** con backend (ej: `/insertar` vs `/create`)

### Base de Datos MySQL
- ✅ Todas las tablas creadas correctamente
- ✅ Campos traducidos: `delete→eliminar`, `print→imprimir`, `check→marcado`, etc.
- ✅ 2 campos nuevos agregados: `productos.estado`, `usuarios.password`
- ✅ **Estructura IDÉNTICA a Supabase** (solo nombres de columnas cambiaron)

---

## 🚨 PROBLEMAS CRÍTICOS IDENTIFICADOS

### 🔴 TOP 3 - PRIORIDAD MÁXIMA (ROMPEN EL SISTEMA)

#### 1. **ERROR CRÍTICO: Ventas sin validación de stock**
- **Ubicación:** `DetalleVentaService.insertarDetalle()`
- **Problema:** NO valida ni deduce stock al agregar producto a venta
- **Impacto:** Permite vender productos sin inventario
- **Causa raíz:** Trigger `triggervalidarstock` de Supabase NO migrado
- **Solución:** Ver líneas 145-180 de `Backend/PROBLEMAS_POR_RESOLVER_BACKEND_MYSQL.md`

#### 2. **ERROR CRÍTICO: Stock no se devuelve al eliminar detalle**
- **Ubicación:** `DetalleVentaService.eliminar()`
- **Problema:** Al eliminar un producto de la venta, NO regresa stock
- **Impacto:** Inconsistencias graves en inventario
- **Causa raíz:** Trigger `triggerdevolverstockaleliminardv` NO migrado
- **Solución:** Ver líneas 220-250 de `Backend/PROBLEMAS_POR_RESOLVER_BACKEND_MYSQL.md`

#### 3. **ERROR CRÍTICO: Endpoints frontend no coinciden**
- **Ubicación:** `Fronted/src/api/crudCategorias.jsx` vs `CategoriaController.java`
- **Problema:** 
  - Frontend: `POST /categorias/insertar`, `GET /categorias/mostrar`
  - Backend: `POST /categorias`, `GET /categorias/empresa/{id}`
- **Impacto:** TODAS las operaciones de categorías fallan con 404
- **Solución:** Ver líneas 85-120 de `Fronted/PROBLEMAS_POR_RESOLVER_FRONT_MYSQL.md`

### ⚠️ Otros 10 errores documentados
Ver archivos completos:
- `Backend/PROBLEMAS_POR_RESOLVER_BACKEND_MYSQL.md` (13 errores backend)
- `Fronted/PROBLEMAS_POR_RESOLVER_FRONT_MYSQL.md` (4 errores frontend)

---

## 📋 PLAN DE CORRECCIÓN SUGERIDO

### FASE 1: Correcciones Críticas Backend (Día 1-2)
**Orden recomendado:**

1. **Validación de Stock en DetalleVentaService** ⏱️ 2-3 horas
   - Implementar lógica del trigger `triggervalidarstock`
   - Agregar validación antes de insertar detalle
   - Deducir stock automáticamente
   - Registrar movimiento de stock

2. **Retorno de Stock al Eliminar** ⏱️ 1-2 horas
   - Implementar lógica del trigger `triggerdevolverstockaleliminardv`
   - Devolver stock cuando se elimina detalle

3. **Eliminar Detalles con cantidad=0** ⏱️ 30 min
   - Implementar lógica del trigger `triggereliminardetalleventa`

4. **Crear Serializaciones al insertar Sucursal** ⏱️ 1 hora
   - Implementar lógica del trigger `insertarserializacionestrigger`
   - Crear 5 serializaciones por defecto (Boleta, Factura, etc.)

5. **Asignar Permiso Home a nuevos usuarios** ⏱️ 30 min
   - Implementar lógica del trigger `insertarpermisohome`

6. **Asignar Cliente Genérico a ventas** ⏱️ 30 min
   - Implementar en `VentaService` al confirmar venta

### FASE 2: Correcciones Frontend (Día 3)

1. **Corregir endpoints de Categorías** ⏱️ 1 hora
   - Cambiar en `crudCategorias.jsx`: `/insertar` → `/create`, etc.

2. **Agregar parámetro idUsuario en Empresa** ⏱️ 30 min
   - Modificar `useEmpresaStore.jsx` para enviar `idUsuario`

3. **Actualizar stores con nomenclatura camelCase** ⏱️ 2 horas
   - Revisar todos los stores que usen snake_case

### FASE 3: Optimizaciones (Día 4)
- Queries en `DashboardService` (stream → SQL)
- Agregar LIMIT a búsquedas
- Validar duplicados antes de guardar

---

## ⚙️ CÓMO LEVANTAR EL PROYECTO

### 1. Backend (Spring Boot + MySQL)

```powershell
cd Backend
.\gradlew.bat bootRun
```

**Configuración en `application.properties`:**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/tienda_china
spring.datasource.username=root
spring.datasource.password=tu_password
server.port=8080
```

**Prerrequisitos:**
- Java 17+
- MySQL 8.0+ con base de datos `tienda_china` creada
- Tablas creadas con `Backend/tablas.sql`

### 2. Frontend (React + Vite)

```powershell
cd Fronted
npm run dev
```

**Puerto:** http://localhost:5173

**Prerrequisitos:**
- Node.js 18+
- Backend corriendo en `http://localhost:8080`

---

## 📁 ESTRUCTURA DEL PROYECTO

```
PROYECTO_TIENDA_CHINA/
├── Backend/                                    # Spring Boot + Gradle
│   ├── src/main/java/com/backend/tienda/
│   │   ├── controller/                        # 10+ REST Controllers
│   │   ├── service/                           # 8 Service classes
│   │   ├── entity/                            # 10+ JPA Entities
│   │   ├── repository/                        # 3+ JPA Repositories
│   │   ├── dto/                               # Data Transfer Objects
│   │   ├── config/                            # Security + CORS
│   │   └── exception/                         # Custom exceptions
│   ├── tablas.sql                             # ⭐ Esquema MySQL (26 tablas)
│   ├── funciones y trigers supabase...sql     # ⭐ SQL original Supabase
│   ├── PROBLEMAS_POR_RESOLVER_BACKEND_MYSQL.md # ⭐ 13 errores + soluciones
│   └── pruebas/                               # Scripts de prueba
│
├── Fronted/                                    # React + Vite + Axios
│   ├── src/
│   │   ├── api/                               # 26 archivos CRUD
│   │   ├── store/                             # 29 Zustand stores
│   │   ├── pages/                             # 15+ páginas
│   │   ├── components/                        # Componentes reutilizables
│   │   └── routers/                           # React Router
│   ├── PROBLEMAS_POR_RESOLVER_FRONT_MYSQL.md  # ⭐ 4 errores críticos
│   └── pruebas/                               # Guías de prueba
│
└── LEER_PRIMERO_CONTEXTO_ACTUAL.md            # ⭐ ESTE ARCHIVO
```

---

## ✅ QUÉ FUNCIONA ACTUALMENTE

### Backend
- ✅ Autenticación JWT (`POST /auth/login`, `/auth/register`)
- ✅ CRUD de Productos (con búsqueda y soft delete)
- ✅ CRUD de Categorías (crear, editar, eliminar, listar)
- ✅ CRUD de Almacenes
- ✅ Dashboard básico (7 métodos implementados)
- ✅ Ventas (crear, confirmar, eliminar incompletas)
- ✅ Detalles de venta (insertar, editar, eliminar) - ⚠️ **SIN validación de stock**

### Frontend
- ✅ Login y registro
- ✅ Navegación entre módulos
- ✅ Búsqueda de productos
- ✅ Listado de categorías - ⚠️ **Endpoints no coinciden (404)**
- ✅ La mayoría de stores migrados a axios

---

## 🚫 DECISIONES IMPORTANTES Y RESTRICCIONES

### NO Modificar (Ya están correctas)

1. **Estructura de tablas MySQL** - Ya tienen los nombres correctos en español
2. **Mapeos @Column en Entities** - Todos verificados correctos
3. **Autenticación JWT** - Funciona correctamente
4. **CORS y Security config** - Ya configurados
5. **DTOs y conversiones** - Implementados correctamente

### Campos Nuevos Intencionales (NO son errores)

1. **`productos.estado`** - Soft delete (no existía en Supabase)
2. **`usuarios.password`** - Autenticación local (Supabase usaba auth.users)

### Diferencias de Nomenclatura (Por diseño)

**Supabase (PostgreSQL):**
- Columnas: `delete`, `print`, `check`, `link`, `default`
- JSON responses: snake_case (`precio_venta`, `codigo_barras`)

**MySQL + Backend:**
- Columnas: `eliminar`, `imprimir`, `marcado`, `enlace`, `defecto`
- JSON responses: camelCase (`precioVenta`, `codigoBarras`)

**Impacto frontend:** ⚠️ Algunos stores todavía esperan snake_case

---

## 🔗 DEPENDENCIAS ENTRE CORRECCIONES

### Secuencia recomendada:

```
1. Validación de stock (ERROR #1)
   ↓
2. Retorno de stock al eliminar (ERROR #2)
   ↓ (dependen de #1 y #2)
3. Eliminar detalles con cantidad=0 (ERROR #3)
   ↓
4. Correcciones frontend (ERROR #4-7)
   ↓
5. Optimizaciones (WARNING #1-9)
```

**⚠️ IMPORTANTE:** Si se corrige ERROR #1 sin corregir el código de `VentaService.confirmarVenta()` (línea 87), habrá **doble deducción de stock**. Ver sección "ADVERTENCIA #1" en archivo de problemas backend.

---

## 📊 MÉTRICAS DE MIGRACIÓN

### Backend
- **Total archivos Java:** ~120
- **Líneas de código:** ~8,000+
- **Entities creadas:** 10+
- **Controllers creados:** 10+
- **Services creados:** 8
- **Funciones SQL migradas:** 30+ → Métodos Java
- **Triggers implementados:** 3/9 (33%)

### Frontend
- **Total archivos CRUD:** 26
- **Stores Zustand:** 29
- **Páginas React:** 15+
- **Migrados a axios:** 85%
- **Con referencias Supabase:** 3%

---

## 🗺️ PRÓXIMOS PASOS RECOMENDADOS

### Opción A: Enfoque Rápido (Solo críticos)
1. Implementar ERROR #1, #2, #3 del backend (validación de stock)
2. Corregir endpoints frontend (ERROR #4)
3. Probar flujo completo de venta
4. ⏱️ **Tiempo estimado:** 1-2 días

### Opción B: Enfoque Completo (Todos los errores)
1. Resolver los 13 errores del backend
2. Resolver los 4 errores del frontend
3. Implementar 9 warnings (optimizaciones)
4. Pruebas exhaustivas con scripts en `Backend/pruebas/`
5. ⏱️ **Tiempo estimado:** 4-5 días

### Opción C: Implementación Incremental (Módulo por módulo)
1. **Día 1:** Módulo de Ventas (ERROR #1, #2, #3, #7)
2. **Día 2:** Módulo de Categorías (ERROR #4)
3. **Día 3:** Módulo de Sucursales (ERROR #6)
4. **Día 4:** Módulo de Usuarios (ERROR #5)
5. **Día 5:** Optimizaciones y pruebas

---

## 📞 COMANDOS ÚTILES

### Backend - Pruebas
```powershell
# Ejecutar todas las pruebas
cd Backend/pruebas
.\ejecutar_pruebas.ps1

# Prueba rápida completa
.\PRUEBA_RAPIDA_COMPLETA.ps1

# Pruebas específicas
.\EJECUTAR_09_PRUEBAS_DASHBOARD.ps1
.\EJECUTAR_10_PRUEBAS_STOCK.ps1
```

### Frontend - Desarrollo
```powershell
# Modo desarrollo
npm run dev

# Build producción
npm run build

# Preview build
npm run preview
```

### Git
```powershell
# Branch actual
git branch  # POST_AVANCE

# Ver cambios
git status

# Commit
git add .
git commit -m "Descripción"
git push origin POST_AVANCE
```

---

## 🎓 CONCEPTOS CLAVE PARA ENTENDER EL PROYECTO

### 1. Sistema de Ventas Multi-empresa
- Una base de datos para múltiples empresas
- Cada empresa tiene: sucursales → cajas → usuarios → productos
- Filtrado por `id_empresa` en todas las consultas

### 2. Soft Delete vs Hard Delete
- `productos.estado = "ELIMINADO"` → Soft delete (no se borra físicamente)
- `categoria.eliminar = true` → Soft delete (legacy de Supabase)

### 3. Flujo de Venta
1. Usuario crea venta (estado: "PENDIENTE")
2. Agrega productos (detalle_venta)
3. **[AQUÍ ESTÁ EL BUG]** Debería validar stock al agregar
4. Confirma venta (estado: "CONFIRMADA")
5. **[ACTUALMENTE]** Se deduce stock al confirmar (debería ser al agregar)

### 4. Gestión de Stock
- Tabla `stock`: Relación producto-almacen con cantidad
- Tabla `movimientos_stock`: Historial de todos los movimientos
- Tipos: "ENTRADA", "SALIDA", "AJUSTE", "TRASPASO"

### 5. Serializaciones de Comprobantes
- Cada sucursal necesita 5 serializaciones: Boleta, Factura, Guía, Nota Crédito, Nota Débito
- **[BUG]** No se crean automáticamente al crear sucursal
- Formato: `F001-00000001` (serie + correlativo de 8 dígitos)

---

## 🔍 ARCHIVOS DE REFERENCIA CLAVE

1. **`Backend/funciones y trigers supabase para migrar a mysql.sql`**
   - SQL original de Supabase (1814 líneas)
   - 30+ funciones RPC
   - 9 triggers (líneas 1757-1814)
   - **Usar como referencia** para implementar lógica faltante

2. **`Backend/tablas.sql`**
   - Esquema MySQL completo
   - 26 tablas con relaciones
   - Columnas traducidas al español

3. **`Backend/PROBLEMAS_POR_RESOLVER_BACKEND_MYSQL.md`**
   - 13 errores con código de solución completo
   - 9 warnings con recomendaciones
   - 50+ aspectos correctos documentados

4. **`Fronted/PROBLEMAS_POR_RESOLVER_FRONT_MYSQL.md`**
   - 4 errores críticos
   - Estado de 29 stores
   - Análisis archivo por archivo

---

## 💡 CONSEJOS PARA LA SIGUIENTE IA

1. **Lee primero los archivos de problemas** antes de modificar código
2. **No toques las tablas MySQL** - están correctas
3. **No cambies los @Column mappings** - están verificados
4. **Implementa un error a la vez** - prueba antes de continuar
5. **Usa los scripts de prueba** en `Backend/pruebas/` después de cada cambio
6. **Pregunta antes de cambiar arquitectura** - puede haber razones
7. **Referencia el SQL de Supabase** para entender lógica de triggers
8. **Copia las soluciones** de los archivos .md - ya están probadas conceptualmente

---

## 📌 RESUMEN EJECUTIVO PARA EMPEZAR YA

**Si tienes 5 minutos:**
- Lee la sección "🚨 PROBLEMAS CRÍTICOS" de este archivo
- Revisa ERROR #1 en `Backend/PROBLEMAS_POR_RESOLVER_BACKEND_MYSQL.md` línea 145
- Implementa la solución (copiar/pegar código)
- Prueba con `Backend/pruebas/EJECUTAR_10_PRUEBAS_STOCK.ps1`

**Si tienes 30 minutos:**
- Lee completo este archivo
- Revisa los 3 errores TOP del backend
- Haz un plan de implementación
- Pregunta al usuario qué priorizar

**Si tienes 2 horas:**
- Implementa ERROR #1, #2, #3 del backend
- Prueba cada uno individualmente
- Corrige endpoints del frontend (ERROR #4)
- Haz pruebas end-to-end de una venta completa

---

**Última actualización:** 19 de Enero de 2026 - 23:45  
**Autor de la sesión:** GitHub Copilot (Claude Sonnet 4.5)  
**Usuario:** @FloxtOG

---

## 🎯 EMPEZAR AQUÍ

**Pregunta al usuario:**
1. "¿Qué errores quieres que corrija primero?"
2. "¿Implemento los 3 críticos del backend o prefieres otro orden?"
3. "¿Levanto el backend y frontend para probar?"

**Luego:**
1. Lee el archivo de problemas correspondiente
2. Implementa la solución (está lista para copiar)
3. Prueba con los scripts de `Backend/pruebas/`
4. Reporta resultado al usuario
