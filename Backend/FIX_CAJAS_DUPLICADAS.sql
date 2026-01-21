/*
  FIX: Cerrar cajas duplicadas abiertas
  Problema: Usuario tiene múltiples cajas con estado=0 (abiertas)
  Solución: Cerrar todas excepto la más reciente
*/

USE LT_Sanchez;

-- Ver las cajas abiertas actuales
SELECT id, fechainicio, id_usuario, id_caja, estado 
FROM cierrecaja 
WHERE id_usuario = 1 AND estado = 0
ORDER BY fechainicio DESC;

-- Cerrar las cajas antiguas (mantener solo la más reciente - ID 19)
-- Cerrar ID 17 y 18 que son de la caja 1
UPDATE cierrecaja 
SET estado = 1, 
    fechacierre = NOW()
WHERE id IN (17, 18);

-- Verificar que solo quede una caja abierta
SELECT id, fechainicio, id_usuario, id_caja, estado 
FROM cierrecaja 
WHERE id_usuario = 1 AND estado = 0;

-- Debería mostrar solo el registro ID=19 (caja 6)
