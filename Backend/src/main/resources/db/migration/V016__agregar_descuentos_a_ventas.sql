-- Migración: Agregar columnas de descuento a la tabla ventas
-- Fecha: 2026-04-26
-- Descripción: Permite registrar porcentaje y monto de descuento en ventas

-- Agregar columna porcentaje_descuento
ALTER TABLE ventas ADD COLUMN porcentaje_descuento DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Porcentaje de descuento aplicado (0-100)';

-- Agregar columna monto_descuento
ALTER TABLE ventas ADD COLUMN monto_descuento DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Monto del descuento calculado';

-- Crear índice para búsquedas
CREATE INDEX idx_ventas_descuento ON ventas(porcentaje_descuento);
