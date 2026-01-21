-- =====================================================
-- AGREGAR COLUMNA id_ventas A movimientos_stock
-- =====================================================
-- Esta columna vincula los movimientos de stock con las ventas que los generaron
-- Ejecutar este script EN LA BASE DE DATOS antes de reiniciar el backend

USE LT_Sanchez;

-- Agregar columna id_ventas (nullable, para movimientos no relacionados con ventas)
ALTER TABLE movimientos_stock 
ADD COLUMN id_ventas BIGINT NULL AFTER origen;

-- Agregar foreign key constraint
ALTER TABLE movimientos_stock
ADD CONSTRAINT fk_movimientos_stock_ventas 
    FOREIGN KEY (id_ventas) 
    REFERENCES ventas(id) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE;

-- Crear índice para mejorar performance en queries
CREATE INDEX idx_movimientos_stock_id_ventas ON movimientos_stock(id_ventas);

-- Verificar que la columna se agregó correctamente
SELECT 'Columna id_ventas agregada exitosamente a movimientos_stock' AS resultado;
DESCRIBE movimientos_stock;
