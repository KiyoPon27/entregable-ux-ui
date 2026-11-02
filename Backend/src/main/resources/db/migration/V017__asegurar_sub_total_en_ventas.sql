-- Migración: Asegurar que sub_total existe en tabla ventas
-- Fecha: 2026-04-27
-- Descripción: Valida y crea la columna sub_total si no existe (para sincronización de descuentos)

-- Verificar y crear columna sub_total si no existe
-- En MySQL 8.0+ se puede usar ALTER TABLE IF NOT EXISTS
-- Para versiones anteriores, la creación será ignorada si ya existe
ALTER TABLE ventas 
ADD COLUMN IF NOT EXISTS sub_total DECIMAL(10,2) DEFAULT NULL COMMENT 'Subtotal sin descuento (para cálculo de IGV)';

-- Índice para búsquedas por sub_total
CREATE INDEX IF NOT EXISTS idx_ventas_sub_total ON ventas(sub_total);
