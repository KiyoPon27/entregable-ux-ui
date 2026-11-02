-- Migración: Agregar columna imagen_base64 a la tabla productos
-- Descripción: Almacenar la imagen en formato base64 (data URI) además de la URL

ALTER TABLE productos
  ADD COLUMN imagen_base64 LONGTEXT NULL COMMENT 'Imagen en base64 (data URI), por ejemplo data:image/jpeg;base64,...' AFTER imagen;

-- Nota: si usa Flyway, este archivo se aplicará al reiniciar la aplicación.
-- Alternativa (ejecutar manualmente en MySQL):
-- mysql -u usuario -p -D nombre_bd -e "ALTER TABLE productos ADD COLUMN imagen_base64 LONGTEXT NULL;"
