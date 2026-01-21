-- ========================================
-- FIX: Cambiar columna logo de TEXT a LONGTEXT
-- ========================================
-- Problema: Las imágenes base64 son muy grandes (pueden ser 1-2 MB)
-- TEXT solo soporta 65,535 caracteres (~64 KB)
-- LONGTEXT soporta 4,294,967,295 caracteres (~4 GB)

-- INSTRUCCIONES:
-- 1. Abre MySQL Workbench o HeidiSQL
-- 2. Conéctate a la base de datos LT_Sanchez
-- 3. Ejecuta esta query:

ALTER TABLE empresa 
MODIFY COLUMN logo LONGTEXT;

-- Verificar el cambio:
DESCRIBE empresa;
