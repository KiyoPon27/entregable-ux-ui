-- =====================================================
-- SOLUCIÓN: MOVIMIENTOS DE CAJA CON ID_VENTAS NULL
-- Fecha: 20 de enero de 2026
-- =====================================================
-- Problema: Los movimientos de caja no tenían vinculado
-- el id_ventas, apareciendo como NULL en la base de datos
-- 
-- Causa: Al confirmar una venta, no se creaba automáticamente
-- el movimiento de caja correspondiente
--
-- Solución: Modificar el VentaService para crear el movimiento
-- de caja automáticamente al confirmar la venta
-- =====================================================

-- CAMBIOS REALIZADOS EN EL BACKEND:
-- =====================================================

-- 1. VentaService.java
--    - Agregados repositorios: MovimientoCajaRepository, MetodoPagoRepository, CierreCajaRepository
--    - Modificado método confirmarVenta() para crear MovimientoCaja automáticamente
--    - Ahora vincula el id_ventas correctamente

-- 2. ConfirmarVentaDTO.java
--    - Agregados campos: pagoCon, referenciaTarjeta, idMetodoPago, idCierreCaja
--    - Permite enviar la información necesaria para crear el movimiento de caja

-- 3. Venta.java (Entidad)
--    - Agregado campo: tipoComprobante (VARCHAR(20))
--    - Permite registrar si la venta es con FACTURA o BOLETA

-- 4. Producto.java (Entidad)
--    - Agregado campo: tipoComprobante (VARCHAR(20))
--    - Permite configurar el tipo de comprobante preferido por producto

-- FLUJO CORREGIDO:
-- =====================================================

-- ANTES (INCORRECTO):
-- 1. Usuario confirma venta
-- 2. Se guarda la venta
-- 3. NO se crea movimiento de caja
-- 4. Dashboard no muestra correctamente (id_ventas = NULL)

-- DESPUÉS (CORRECTO):
-- 1. Usuario confirma venta (envía idMetodoPago e idCierreCaja)
-- 2. Se guarda la venta
-- 3. SE CREA AUTOMÁTICAMENTE el movimiento de caja con:
--    - tipo_movimiento: "ingreso"
--    - monto: monto total de la venta
--    - descripcion: "Pago de venta con [nro_comprobante]"
--    - id_ventas: ID de la venta (AHORA SE VINCULA CORRECTAMENTE)
--    - id_usuario: usuario que realizó la venta
--    - id_metodo_pago: método de pago utilizado
--    - id_cierre_caja: cierre de caja activo
--    - vuelto: vuelto generado
--    - fecha_movimiento: fecha de la venta
-- 4. Dashboard muestra correctamente los movimientos

-- VALIDACIONES AGREGADAS:
-- =====================================================
-- - Se valida que exista el método de pago
-- - Se valida que exista el cierre de caja
-- - Solo se crea movimiento si se proporcionan idMetodoPago e idCierreCaja

-- PRUEBAS RECOMENDADAS:
-- =====================================================
-- 1. Compilar el backend: gradlew build
-- 2. Iniciar el backend: gradlew bootRun
-- 3. Realizar una venta completa
-- 4. Verificar en la base de datos:
--    SELECT * FROM movimientos_caja ORDER BY id DESC LIMIT 5;
--    -- Verificar que id_ventas YA NO sea NULL
-- 5. Verificar el dashboard:
--    - Ver que los movimientos se muestran correctamente
--    - Ver que las ventas están asociadas a movimientos de caja

-- EJEMPLO DE DATOS DESPUÉS DE LA CORRECCIÓN:
-- =====================================================
-- movimientos_caja:
-- id | fecha_movimiento | tipo_movimiento | monto | id_metodo_pago | descripcion              | id_usuario | id_cierre_caja | id_ventas | vuelto
-- ---+------------------+-----------------+-------+----------------+--------------------------+------------+----------------+-----------+--------
-- 1  | 2026-01-20 16:06 | ingreso         | 2.00  | 1              | Pago de venta con F001-1 | 1          | 1              | 1         | 0.00

-- NOTAS IMPORTANTES:
-- =====================================================
-- 1. El frontend debe enviar los campos adicionales en el DTO:
--    - idMetodoPago (obligatorio para crear movimiento)
--    - idCierreCaja (obligatorio para crear movimiento)
--    - pagoCon (opcional, para registro)
--    - referenciaTarjeta (opcional, para tarjetas)

-- 2. Los movimientos de caja creados manualmente (aperturas, retiros)
--    NO tienen id_ventas, y eso es correcto.

-- 3. Solo los movimientos de caja de VENTAS deben tener id_ventas.

-- 4. El dashboard ahora funcionará al 100% mostrando:
--    - Ventas totales con sus movimientos asociados
--    - Movimientos de caja filtrados correctamente
--    - Gráficos y reportes con datos completos

-- FIN DEL DOCUMENTO
-- =====================================================
