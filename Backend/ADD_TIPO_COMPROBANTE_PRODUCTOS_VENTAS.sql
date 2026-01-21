-- =====================================================
-- AGREGAR CAMPO TIPO_COMPROBANTE A PRODUCTOS Y VENTAS
-- Fecha: 20 de enero de 2026
-- =====================================================
-- Este script agrega campos para identificar si productos/ventas
-- son con FACTURA o BOLETA para facilitar filtros y reportes
-- =====================================================

USE LT_Sanchez;

-- =====================================================
-- 1. AGREGAR CAMPO A TABLA PRODUCTOS
-- =====================================================
-- Campo: tipo_comprobante
-- Valores: 'FACTURA', 'BOLETA'
-- Por defecto: 'BOLETA' (el más común)

ALTER TABLE productos 
ADD COLUMN tipo_comprobante VARCHAR(20) DEFAULT 'BOLETA' 
COMMENT 'Tipo de comprobante con el que se vende: FACTURA o BOLETA';

-- Crear índice para mejorar rendimiento en filtros
CREATE INDEX idx_productos_tipo_comprobante ON productos(tipo_comprobante);

-- =====================================================
-- 2. AGREGAR CAMPO A TABLA VENTAS
-- =====================================================
-- Campo: tipo_comprobante
-- Valores: 'FACTURA', 'BOLETA'
-- Por defecto: 'BOLETA'

ALTER TABLE ventas 
ADD COLUMN tipo_comprobante VARCHAR(20) DEFAULT 'BOLETA' 
COMMENT 'Tipo de comprobante emitido en la venta: FACTURA o BOLETA';

-- Crear índice para mejorar rendimiento en filtros y reportes
CREATE INDEX idx_ventas_tipo_comprobante ON ventas(tipo_comprobante);

-- =====================================================
-- 3. ACTUALIZAR PRODUCTOS EXISTENTES (OPCIONAL)
-- =====================================================
-- Si deseas actualizar productos existentes según algún criterio
-- Ejemplo: productos con precio > 100 podrían ser factura
-- Descomenta si necesitas:

-- UPDATE productos 
-- SET tipo_comprobante = 'FACTURA' 
-- WHERE precio_venta > 100.00;

-- =====================================================
-- 4. ACTUALIZAR VENTAS EXISTENTES (OPCIONAL)
-- =====================================================
-- Si deseas actualizar ventas existentes según algún criterio
-- Ejemplo: ventas con cliente RUC (11 dígitos) podrían ser factura
-- Descomenta si necesitas:

-- UPDATE ventas v
-- INNER JOIN clientes_proveedores c ON v.id_cliente = c.id
-- SET v.tipo_comprobante = 'FACTURA'
-- WHERE LENGTH(c.nro_documento) = 11;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Verificar que los campos se agregaron correctamente

SELECT 
    'productos' as tabla,
    COUNT(*) as total_registros,
    SUM(CASE WHEN tipo_comprobante = 'FACTURA' THEN 1 ELSE 0 END) as con_factura,
    SUM(CASE WHEN tipo_comprobante = 'BOLETA' THEN 1 ELSE 0 END) as con_boleta
FROM productos

UNION ALL

SELECT 
    'ventas' as tabla,
    COUNT(*) as total_registros,
    SUM(CASE WHEN tipo_comprobante = 'FACTURA' THEN 1 ELSE 0 END) as con_factura,
    SUM(CASE WHEN tipo_comprobante = 'BOLETA' THEN 1 ELSE 0 END) as con_boleta
FROM ventas;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. Los productos ahora tienen un campo 'tipo_comprobante' que 
--    indica si ese producto se vende preferentemente con FACTURA o BOLETA
--
-- 2. Las ventas registran en 'tipo_comprobante' el tipo de comprobante
--    que se emitió en esa venta específica
--
-- 3. Puedes filtrar reportes con:
--    SELECT * FROM ventas WHERE tipo_comprobante = 'FACTURA';
--    SELECT * FROM productos WHERE tipo_comprobante = 'BOLETA';
--
-- 4. Los índices creados mejorarán el rendimiento de consultas con filtros
--
-- 5. Todos los registros nuevos tendrán 'BOLETA' por defecto
--    (puedes cambiar el DEFAULT si prefieres 'FACTURA')
-- =====================================================
