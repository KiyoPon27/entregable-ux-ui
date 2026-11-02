-- Migración: Agregar columna imagen a la tabla productos
-- Fecha: 2026-08-12
-- Descripción: Añade un campo para almacenar la URL o ruta de la imagen del producto

-- Agregar la columna sólo si no existe (guardado seguro para MySQL)
-- Esto evita errores si la columna ya fue creada manualmente.

SELECT COUNT(*) INTO @col_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'productos'
  AND COLUMN_NAME = 'imagen';

SET @sql = IF(@col_exists = 0,
  "ALTER TABLE productos ADD COLUMN imagen VARCHAR(255) DEFAULT NULL COMMENT 'URL o ruta de la imagen del producto'",
  "SELECT 'column already exists'");

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice opcional para búsquedas por existencia de imagen
-- (omitido porque algunas versiones de MySQL no soportan IF NOT EXISTS en CREATE INDEX)
-- Si desea crear el índice manualmente y está seguro de que no existe, ejecute:
-- CREATE INDEX idx_productos_imagen ON productos(imagen);

