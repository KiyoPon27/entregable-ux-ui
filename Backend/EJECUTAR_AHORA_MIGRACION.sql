-- ⚠️ EJECUTA ESTE SCRIPT EN TU BASE DE DATOS MYSQL AHORA
-- Esto cambiará las impresoras de por_caja a por_usuario

USE LT_Sanchez;

-- 1. Eliminar datos existentes (si los hay)
TRUNCATE TABLE impresoras;

-- 2. Eliminar la columna id_caja y su foreign key
ALTER TABLE impresoras DROP FOREIGN KEY impresoras_id_caja_fkey;
ALTER TABLE impresoras DROP COLUMN id_caja;

-- 3. Agregar columna id_usuario (BIGINT para coincidir con usuarios.id)
ALTER TABLE impresoras ADD COLUMN id_usuario BIGINT NOT NULL AFTER id;

-- 4. Agregar foreign key a usuarios
ALTER TABLE impresoras 
ADD CONSTRAINT fk_impresoras_usuario 
FOREIGN KEY (id_usuario) REFERENCES usuarios(id) 
ON DELETE CASCADE;

-- 5. Crear índices
CREATE INDEX idx_impresoras_usuario ON impresoras(id_usuario);

SELECT 'Migración completada exitosamente' AS resultado;
