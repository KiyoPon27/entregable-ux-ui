-- =====================================================
-- ACTUALIZAR CAMPO ICONO EN METODOS_PAGO
-- Fecha: 20 de enero de 2026
-- =====================================================
-- Este script actualiza el campo icono en metodos_pago
-- para permitir URLs igual que en la tabla modulos
-- =====================================================

USE LT_Sanchez;

-- =====================================================
-- 1. ACTUALIZAR VALORES EXISTENTES
-- =====================================================
-- Cambiar los valores '-' por NULL para consistencia
UPDATE metodos_pago 
SET icono = NULL 
WHERE icono = '-';

-- =====================================================
-- 2. MODIFICAR LA COLUMNA
-- =====================================================
-- Cambiar el DEFAULT de '-' a NULL
ALTER TABLE metodos_pago 
MODIFY COLUMN icono VARCHAR(255) DEFAULT NULL;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Ver la estructura actualizada
DESCRIBE metodos_pago;

-- Ver los registros actualizados
SELECT id, nombre, icono 
FROM metodos_pago;

-- =====================================================
-- NOTAS
-- =====================================================
-- 1. Ahora el campo icono acepta URLs como en la tabla modulos
-- 2. El valor por defecto es NULL en vez de '-'
-- 3. Puedes guardar URLs de iconos, por ejemplo:
--    - https://i.ibb.co/imagen.png
--    - https://ejemplo.com/icono.svg
-- 4. Es consistente con la tabla modulos
-- =====================================================
