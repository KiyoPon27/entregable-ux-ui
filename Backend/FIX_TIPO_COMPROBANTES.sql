-- =====================================================
-- SCRIPT PARA CORREGIR INCONSISTENCIAS DE MAYÚSCULAS
-- EN LOS TIPOS DE COMPROBANTES
-- =====================================================
-- Este script actualiza TODOS los registros existentes
-- para usar MAYÚSCULAS en tipo_comprobante
-- =====================================================

USE LT_Sanchez;

-- Deshabilitar verificación de Foreign Keys temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Deshabilitar modo seguro de MySQL Workbench temporalmente
SET SQL_SAFE_UPDATES = 0;

-- =====================================================
-- 1. ACTUALIZAR TABLA tipo_comprobantes
-- =====================================================
-- Convertir todos los nombres a MAYÚSCULAS

UPDATE tipo_comprobantes 
SET nombre = 'FACTURA' 
WHERE id = 1 OR nombre IN ('Factura', 'factura', 'FACTURA');

UPDATE tipo_comprobantes 
SET nombre = 'BOLETA' 
WHERE id = 2 OR nombre IN ('Boleta', 'boleta', 'BOLETA');

UPDATE tipo_comprobantes 
SET nombre = 'NOTA DE CREDITO' 
WHERE id = 3 OR nombre IN ('Nota de credito', 'nota de credito', 'NOTA DE CREDITO');

UPDATE tipo_comprobantes 
SET nombre = 'NOTA DE DEBITO' 
WHERE id = 4 OR nombre IN ('Nota de debito', 'nota de debito', 'NOTA DE DEBITO');

UPDATE tipo_comprobantes 
SET nombre = 'TICKET' 
WHERE id = 5 OR nombre IN ('Ticket', 'ticket', 'TICKET');

-- =====================================================
-- 2. ACTUALIZAR TABLA ventas
-- =====================================================
-- Convertir tipo_comprobante a MAYÚSCULAS

UPDATE ventas 
SET tipo_comprobante = 'FACTURA' 
WHERE tipo_comprobante IN ('Factura', 'factura', 'FACTURA');

UPDATE ventas 
SET tipo_comprobante = 'BOLETA' 
WHERE tipo_comprobante IN ('Boleta', 'boleta', 'BOLETA') OR tipo_comprobante IS NULL;

UPDATE ventas 
SET tipo_comprobante = 'TICKET' 
WHERE tipo_comprobante IN ('Ticket', 'ticket', 'TICKET');

-- =====================================================
-- 3. ACTUALIZAR TABLA productos
-- =====================================================
-- Convertir tipo_comprobante a MAYÚSCULAS

UPDATE productos 
SET tipo_comprobante = 'FACTURA' 
WHERE tipo_comprobante IN ('Factura', 'factura', 'FACTURA');

UPDATE productos 
SET tipo_comprobante = 'BOLETA' 
WHERE tipo_comprobante IN ('Boleta', 'boleta', 'BOLETA') OR tipo_comprobante IS NULL;

UPDATE productos 
SET tipo_comprobante = 'TICKET' 
WHERE tipo_comprobante IN ('Ticket', 'ticket', 'TICKET');

-- Rehabilitar verificación de Foreign Keys
SET FOREIGN_KEY_CHECKS = 1;

-- Rehabilitar modo seguro de MySQL Workbench
SET SQL_SAFE_UPDATES = 1;

-- =====================================================
-- VERIFICAR LOS CAMBIOS
-- =====================================================

SELECT '=== TIPO_COMPROBANTES ===' AS tabla;
SELECT id, nombre, destino FROM tipo_comprobantes ORDER BY id;

SELECT '=== VENTAS (MUESTRA 10) ===' AS tabla;
SELECT id, nro_comprobante, tipo_comprobante, fecha FROM ventas ORDER BY fecha DESC LIMIT 10;

SELECT '=== PRODUCTOS (MUESTRA 10) ===' AS tabla;
SELECT id, nombre, tipo_comprobante FROM productos LIMIT 10;

SELECT '=== RESUMEN TIPOS EN VENTAS ===' AS tabla;
SELECT tipo_comprobante, COUNT(*) as cantidad FROM ventas GROUP BY tipo_comprobante;

-- =====================================================
-- ✅ CORRECCIONES APLICADAS CORRECTAMENTE
-- =====================================================
