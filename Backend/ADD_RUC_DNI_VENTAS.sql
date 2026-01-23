-- Agregar columna ruc_dni a la tabla ventas
ALTER TABLE ventas ADD COLUMN ruc_dni VARCHAR(20) DEFAULT NULL AFTER nro_comprobante;

-- Comentario
COMMENT ON COLUMN ventas.ruc_dni IS 'RUC o DNI del cliente que realizó la compra';
