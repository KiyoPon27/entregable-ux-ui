-- MIGRACIÓN: Cambiar impresoras de por_caja a por_usuario
-- Fecha: 22 de enero de 2026
-- Razón: Simplificar la lógica, una impresora está en la PC del usuario, no en una caja lógica

-- 1. Crear tabla de respaldo
CREATE TABLE impresoras_backup AS SELECT * FROM impresoras;

-- 2. Eliminar constraint de caja (si existe)
ALTER TABLE impresoras DROP FOREIGN KEY IF EXISTS impresoras_ibfk_1;
ALTER TABLE impresoras DROP FOREIGN KEY IF EXISTS fk_impresoras_caja;

-- 3. Eliminar columna id_caja
ALTER TABLE impresoras DROP COLUMN IF EXISTS id_caja;

-- 4. Agregar columna id_usuario
ALTER TABLE impresoras ADD COLUMN id_usuario BIGINT NOT NULL AFTER id;

-- 5. Agregar foreign key a usuarios
ALTER TABLE impresoras 
ADD CONSTRAINT fk_impresoras_usuario 
FOREIGN KEY (id_usuario) REFERENCES usuarios(id) 
ON DELETE CASCADE;

-- 6. Agregar índice para mejorar búsquedas
CREATE INDEX idx_impresoras_usuario ON impresoras(id_usuario);
CREATE INDEX idx_impresoras_estado ON impresoras(id_usuario, estado);

-- Nota: Si hay datos existentes, se perderán. 
-- Si necesitas migrar datos, primero identifica qué usuario usa cada caja
-- y actualiza manualmente antes de ejecutar este script
