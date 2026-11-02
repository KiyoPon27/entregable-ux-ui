-- Migración: crear tabla independiente para códigos de producto (product_barcodes)
-- Diseñado para MySQL / MariaDB
-- Archivo: create_product_codes.sql
-- Fecha: 2026-08-14

-- RECUERDA: Hacer BACKUP antes de ejecutar.

-- 1) Crear la tabla product_barcodes
CREATE TABLE IF NOT EXISTS product_barcodes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  barcode VARCHAR(255) NOT NULL,
  code_type VARCHAR(50) DEFAULT NULL, -- 'principal','interno','sabor', etc.
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY ux_product_barcodes_barcode (barcode),
  KEY idx_product_barcodes_product_id (product_id),
  CONSTRAINT fk_product_barcodes_product FOREIGN KEY (product_id) REFERENCES productos(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2) (Opcional) Verificar duplicados actuales en la tabla productos
-- Ejecuta esto primero para revisar conflictos antes de migrar:
-- SELECT codigo_barras AS barcode, COUNT(*) AS cnt, GROUP_CONCAT(id) AS products
-- FROM productos
-- WHERE codigo_barras IS NOT NULL AND TRIM(codigo_barras) <> ''
-- GROUP BY codigo_barras
-- HAVING cnt > 1;

-- 3) Migrar valores existentes desde columnas codigo_barras y codigo_interno
-- Ajusta los nombres de columnas si tu tabla usa otros nombres.
START TRANSACTION;

-- Insertar codigo_barras como tipo 'principal' y marcarlo is_default=1
INSERT IGNORE INTO product_barcodes (product_id, barcode, code_type, is_default)
SELECT id AS product_id, TRIM(codigo_barras) AS barcode, 'principal' AS code_type, 1 AS is_default
FROM productos
WHERE codigo_barras IS NOT NULL AND TRIM(codigo_barras) <> '';

-- Insertar codigo_interno como tipo 'interno'
INSERT IGNORE INTO product_barcodes (product_id, barcode, code_type, is_default)
SELECT id AS product_id, TRIM(codigo_interno) AS barcode, 'interno' AS code_type, 0 AS is_default
FROM productos
WHERE codigo_interno IS NOT NULL AND TRIM(codigo_interno) <> '';

COMMIT;

-- 4) Consultas de uso habituales
-- Obtener el producto por cualquier código escaneado:
-- Reemplaza ? por el valor escaneado (ej: '7751234567890')
-- Devuelve una fila de la tabla productos
-- SELECT p.*
-- FROM productos p
-- JOIN product_barcodes b ON b.product_id = p.id
-- WHERE b.barcode = ?
-- LIMIT 1;

-- Listar todos los códigos de un producto
-- SELECT * FROM product_barcodes WHERE product_id = 123 ORDER BY is_default DESC, id;

-- Insertar un nuevo código (previamente comprobar si existe en otra fila)
-- INSERT INTO product_barcodes (product_id, barcode, code_type, is_default) VALUES (123, '7770001112223', 'sabor_x', 0);

-- Comprobar si un barcode ya pertenece a un producto
-- SELECT product_id FROM product_barcodes WHERE barcode = '7770001112223' LIMIT 1;

-- 5) Nota sobre is_default
-- is_default puede usarse para marcar el código principal del producto. Si prefieres no usarlo, ignóralo o déjalo siempre en 0.

-- 6) Sugerencia para el backend
-- Al crear/editar un producto, enviar un array de códigos (barcodes) y manejar inserciones/actualizaciones/eliminaciones en product_barcodes.
-- Ejemplo de flujo al editar:
-- 1. Obtener los barcodes actuales (SELECT id, barcode FROM product_barcodes WHERE product_id = ?)
-- 2. Comparar con la lista enviada por el frontend
-- 3. Insertar nuevos, eliminar los que faltan, actualizar los que cambian (code_type/is_default)

-- 7) (Opcional) Si quieres limpiar las columnas antiguas una vez verificado todo:
-- ALTER TABLE productos DROP COLUMN codigo_barras;
-- ALTER TABLE productos DROP COLUMN codigo_interno;

-- FIN
