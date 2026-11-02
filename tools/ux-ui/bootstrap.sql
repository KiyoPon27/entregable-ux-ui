-- =====================================================
-- Bootstrap de base de datos para capturas UX/UI
-- Idempotente. Solo para la BD de desarrollo LT_Sanchez.
-- =====================================================
USE LT_Sanchez;
SET FOREIGN_KEY_CHECKS = 0;

-- Helper: agrega columna solo si no existe (MySQL 8 no soporta IF NOT EXISTS)
DROP PROCEDURE IF EXISTS add_col_if_missing;
DELIMITER //
CREATE PROCEDURE add_col_if_missing(IN tbl VARCHAR(64), IN col VARCHAR(64), IN def TEXT)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = tbl AND COLUMN_NAME = col
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `', tbl, '` ADD COLUMN `', col, '` ', def);
    PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;
  END IF;
END//
DELIMITER ;

CALL add_col_if_missing('usuarios', 'empresa_id', 'BIGINT NULL');
CALL add_col_if_missing('usuarios', 'fecharegistro', 'DATETIME NULL');
CALL add_col_if_missing('empresa', 'habilitada', 'TINYINT(1) NOT NULL DEFAULT 1');
CALL add_col_if_missing('metodos_pago', 'color', 'VARCHAR(50) DEFAULT NULL');
CALL add_col_if_missing('ventas', 'numero_sunat', 'VARCHAR(255) DEFAULT NULL');
CALL add_col_if_missing('ventas', 'porcentaje_descuento', 'DECIMAL(5,2) DEFAULT 0.00');
CALL add_col_if_missing('ventas', 'monto_descuento', 'DECIMAL(10,2) DEFAULT 0.00');
CALL add_col_if_missing('compras', 'resumen_gravada', 'DECIMAL(15,2) DEFAULT 0.00');
CALL add_col_if_missing('compras', 'resumen_igv', 'DECIMAL(15,2) DEFAULT 0.00');
CALL add_col_if_missing('compras', 'resumen_descuento_total', 'DECIMAL(15,2) DEFAULT 0.00');
CALL add_col_if_missing('compras', 'resumen_total', 'DECIMAL(15,2) DEFAULT 0.00');
CALL add_col_if_missing('detalle_compra', 'unidad_medida_compra', 'VARCHAR(50) DEFAULT NULL');
CALL add_col_if_missing('detalle_compra', 'factor_compra', 'INT DEFAULT 1');
CALL add_col_if_missing('detalle_compra', 'importe', 'DECIMAL(15,2) DEFAULT 0.00');
CALL add_col_if_missing('detalle_compra', 'valor_unitario', 'DECIMAL(15,2) DEFAULT 0.00');
CALL add_col_if_missing('productos', 'imagen', 'VARCHAR(255) DEFAULT NULL');
CALL add_col_if_missing('productos', 'imagen_base64', 'LONGTEXT DEFAULT NULL');

DROP PROCEDURE IF EXISTS add_col_if_missing;

CREATE TABLE IF NOT EXISTS producto_codigos (
  id BIGINT NOT NULL AUTO_INCREMENT,
  codigo_barras VARCHAR(255) NOT NULL,
  id_producto BIGINT DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_producto_codigos_codigo (codigo_barras),
  KEY idx_producto_codigos_producto (id_producto),
  CONSTRAINT fk_producto_codigos_producto FOREIGN KEY (id_producto)
    REFERENCES productos(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_reset_codes (
  id BIGINT NOT NULL AUTO_INCREMENT,
  correo VARCHAR(255) NOT NULL,
  codigo VARCHAR(6) NOT NULL,
  created_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_password_reset_codes_correo (correo),
  KEY idx_password_reset_codes_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Roles completos (los que crea DataInitializer)
INSERT INTO roles (id, nombre) VALUES
  (4, 'almacenero'),
  (5, 'OG')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Metodos de pago con color
UPDATE metodos_pago SET color = '#53B257' WHERE id = 1;
UPDATE metodos_pago SET color = '#3483EB' WHERE id = 2;
UPDATE metodos_pago SET color = '#9046FF' WHERE id = 3;
UPDATE metodos_pago SET color = '#7B2FF7' WHERE id = 4;

-- =====================================================
-- Categorias
-- =====================================================
INSERT INTO categorias (id, nombre, color, icono, id_empresa) VALUES
  (1, 'Abarrotes',      '#F3D20C', 'shopping-basket', 1),
  (2, 'Bebidas',        '#1CB0F6', 'coffee',          1),
  (3, 'Snacks',         '#F9743B', 'cookie',          1),
  (4, 'Limpieza',       '#53B257', 'spray-can',       1),
  (5, 'Tecnologia',     '#9046FF', 'headphones',      1)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), color = VALUES(color), icono = VALUES(icono), id_empresa = VALUES(id_empresa);

-- =====================================================
-- Productos demo
-- =====================================================
INSERT INTO productos
  (id, nombre, precio_venta, precio_compra, id_categoria, codigo_barras, codigo_interno, id_empresa, sevende_por, maneja_inventarios, maneja_multiprecios, estado, tipo_comprobante)
VALUES
  (1,  'Fideos instantaneos',   12.50,  8.00, 1, '7750001000011', 'INT-001', 1, 'unidad', 1, 0, 'ACTIVO', 'BOLETA'),
  (2,  'Salsa de soya',         20.00, 13.00, 1, '7750001000028', 'INT-002', 1, 'unidad', 1, 0, 'ACTIVO', 'BOLETA'),
  (3,  'Te verde',              25.00, 17.00, 2, '7750001000035', 'INT-003', 1, 'unidad', 1, 0, 'ACTIVO', 'BOLETA'),
  (4,  'Arroz jazmin 5kg',      35.00, 26.00, 1, '7750001000042', 'INT-004', 1, 'unidad', 1, 0, 'ACTIVO', 'BOLETA'),
  (5,  'Galletas de sesamo',    23.50, 15.00, 3, '7750001000059', 'INT-005', 1, 'unidad', 1, 0, 'ACTIVO', 'BOLETA'),
  (6,  'Bebida energizante',    15.00,  9.00, 2, '7750001000066', 'INT-006', 1, 'unidad', 1, 0, 'ACTIVO', 'BOLETA'),
  (7,  'Audifonos Bluetooth',   69.90, 45.00, 5, '7750001000073', 'INT-007', 1, 'unidad', 1, 0, 'ACTIVO', 'FACTURA'),
  (8,  'Cargador USB-C',        20.00, 11.00, 5, '7750001000080', 'INT-008', 1, 'unidad', 1, 0, 'ACTIVO', 'FACTURA'),
  (9,  'Papel higienico x4',    18.00, 12.00, 4, '7750001000097', 'INT-009', 1, 'unidad', 1, 0, 'ACTIVO', 'BOLETA'),
  (10, 'Detergente 1kg',        28.00, 19.00, 4, '7750001000103', 'INT-010', 1, 'unidad', 1, 0, 'ACTIVO', 'BOLETA')
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre), precio_venta = VALUES(precio_venta), precio_compra = VALUES(precio_compra),
  id_categoria = VALUES(id_categoria), codigo_barras = VALUES(codigo_barras), codigo_interno = VALUES(codigo_interno),
  id_empresa = VALUES(id_empresa), estado = VALUES(estado), tipo_comprobante = VALUES(tipo_comprobante);

INSERT INTO producto_codigos (id, codigo_barras, id_producto) VALUES
  (1, '7750001000011', 1), (2, '7750001000028', 2), (3, '7750001000035', 3),
  (4, '7750001000042', 4), (5, '7750001000059', 5), (6, '7750001000066', 6),
  (7, '7750001000073', 7), (8, '7750001000080', 8), (9, '7750001000097', 9),
  (10, '7750001000103', 10)
ON DUPLICATE KEY UPDATE codigo_barras = VALUES(codigo_barras), id_producto = VALUES(id_producto);

INSERT INTO stock (id, id_almacen, id_producto, stock, stock_minimo, ubicacion) VALUES
  (1, 1, 1, 50, 10, 'A-01'), (2, 1, 2, 40, 10, 'A-02'),
  (3, 1, 3, 35, 10, 'A-03'), (4, 1, 4, 25, 10, 'A-04'),
  (5, 1, 5, 60, 15, 'A-05'), (6, 1, 6, 80, 20, 'A-06'),
  (7, 1, 7, 15, 5,  'B-01'), (8, 1, 8, 22, 5,  'B-02'),
  (9, 1, 9, 45, 10, 'C-01'), (10, 1, 10, 30, 10, 'C-02')
ON DUPLICATE KEY UPDATE stock = VALUES(stock), stock_minimo = VALUES(stock_minimo), ubicacion = VALUES(ubicacion);

-- =====================================================
-- Clientes y proveedores demo
-- =====================================================
INSERT INTO clientes_proveedores
  (id, nombres, id_empresa, direccion, telefono, email, identificador_nacional, identificador_fiscal, tipo, estado, fecha_registro)
VALUES
  (2, 'Maria Fernanda Rojas', 1, 'Av. Los Olivos 452', '987654321', 'maria.rojas@example.com', '45678912', '10456789123', 'cliente', 'ACTIVO', NOW()),
  (3, 'Carlos Alberto Mendez', 1, 'Jr. Puno 128', '912345678', 'carlos.mendez@example.com', '41234567', '10412345678', 'cliente', 'ACTIVO', NOW()),
  (4, 'Distribuidora Oriental SAC', 1, 'Av. Aviacion 2100', '999888777', 'ventas@oriental.example.com', '20556677889', '20556677889', 'proveedor', 'ACTIVO', NOW())
ON DUPLICATE KEY UPDATE nombres = VALUES(nombres), direccion = VALUES(direccion), telefono = VALUES(telefono),
  email = VALUES(email), tipo = VALUES(tipo), estado = VALUES(estado);

-- =====================================================
-- Caja abierta (estado 0 = abierta)
-- =====================================================
INSERT INTO cierrecaja
  (id, fechainicio, fechacierre, id_usuario, total_efectivo_calculado, total_efectivo_real, estado, diferencia_efectivo, id_caja)
VALUES
  (1, DATE_SUB(NOW(), INTERVAL 1 DAY), NULL, 1, 0.00, 0.00, 0, 0.00, 1)
ON DUPLICATE KEY UPDATE fechainicio = VALUES(fechainicio), estado = 0, id_caja = 1;

-- =====================================================
-- Ventas demo (el dashboard ignora estado 'pendiente')
-- =====================================================
INSERT INTO ventas
  (id, fecha, monto_total, total_impuestos, id_usuario, saldo, pago_con, referencia_tarjeta, vuelto,
   cantidad_productos, sub_total, id_cliente, id_sucursal, id_empresa, estado, valor_impuesto,
   id_cierre_caja, nro_comprobante, ruc_dni, tipo_comprobante, numero_sunat, porcentaje_descuento, monto_descuento)
VALUES
  (1, DATE_SUB(NOW(), INTERVAL 3 DAY), 45.00,  6.86,  1, 0.00, 50.00, '-', 5.00,  3, 38.14,  1, 1, 1, 'pagado', 18.00, 1, 'B001-00000001', '45678912', 'BOLETA', NULL, 0.00, 0.00),
  (2, DATE_SUB(NOW(), INTERVAL 5 DAY), 89.90, 13.71,  1, 0.00, 90.00, 'TXN-7781', 0.10, 2, 76.19, 2, 1, 1, 'pagado', 18.00, 1, 'B001-00000002', '41234567', 'BOLETA', NULL, 0.00, 0.00),
  (3, DATE_SUB(NOW(), INTERVAL 2 DAY), 23.50,  3.58,  1, 0.00, 23.50, '-', 0.00,  1, 19.92,  1, 1, 1, 'pagado', 18.00, 1, 'B001-00000003', '45678912', 'BOLETA', NULL, 0.00, 0.00),
  (4, DATE_SUB(NOW(), INTERVAL 1 DAY), 118.00, 18.00, 1, 0.00, 120.00, '-', 2.00, 5, 100.00, 3, 1, 1, 'pagado', 18.00, 1, 'B001-00000004', '10412345678', 'BOLETA', NULL, 0.00, 0.00),
  (5, DATE_SUB(NOW(), INTERVAL 6 DAY), 67.50, 10.30,  1, 0.00, 70.00, '-', 2.50,  3, 57.20,  1, 1, 1, 'pagado', 18.00, 1, 'B001-00000005', '45678912', 'BOLETA', NULL, 0.00, 0.00),
  (6, DATE_SUB(NOW(), INTERVAL 4 HOUR), 207.80, 31.70, 1, 0.00, 210.00, 'TXN-9920', 2.20, 5, 176.10, 2, 1, 1, 'pagado', 18.00, 1, 'B001-00000006', '41234567', 'BOLETA', NULL, 0.00, 0.00)
ON DUPLICATE KEY UPDATE
  monto_total = VALUES(monto_total), total_impuestos = VALUES(total_impuestos), sub_total = VALUES(sub_total),
  cantidad_productos = VALUES(cantidad_productos), estado = VALUES(estado), id_cierre_caja = VALUES(id_cierre_caja);

INSERT INTO detalle_venta
  (id, id_venta, cantidad, precio_venta, total, descripcion, id_producto, precio_compra, id_sucursal, estado, id_almacen)
VALUES
  (1,  1, 2, 12.50, 25.00, 'Fideos instantaneos',   1,  8.00, 1, 'nueva', 1),
  (2,  1, 1, 20.00, 20.00, 'Salsa de soya',         2, 13.00, 1, 'nueva', 1),
  (3,  2, 1, 69.90, 69.90, 'Audifonos Bluetooth',   7, 45.00, 1, 'nueva', 1),
  (4,  2, 1, 20.00, 20.00, 'Cargador USB-C',        8, 11.00, 1, 'nueva', 1),
  (5,  3, 1, 23.50, 23.50, 'Galletas de sesamo',    5, 15.00, 1, 'nueva', 1),
  (6,  4, 2, 25.00, 50.00, 'Te verde',              3, 17.00, 1, 'nueva', 1),
  (7,  4, 1, 35.00, 35.00, 'Arroz jazmin 5kg',      4, 26.00, 1, 'nueva', 1),
  (8,  4, 1, 18.00, 18.00, 'Papel higienico x4',    9, 12.00, 1, 'nueva', 1),
  (9,  4, 1, 15.00, 15.00, 'Bebida energizante',    6,  9.00, 1, 'nueva', 1),
  (10, 5, 1, 12.50, 12.50, 'Fideos instantaneos',   1,  8.00, 1, 'nueva', 1),
  (11, 5, 1, 20.00, 20.00, 'Salsa de soya',         2, 13.00, 1, 'nueva', 1),
  (12, 5, 1, 35.00, 35.00, 'Arroz jazmin 5kg',      4, 26.00, 1, 'nueva', 1),
  (13, 6, 2, 69.90, 139.80, 'Audifonos Bluetooth',  7, 45.00, 1, 'nueva', 1),
  (14, 6, 2, 20.00, 40.00, 'Cargador USB-C',        8, 11.00, 1, 'nueva', 1),
  (15, 6, 1, 28.00, 28.00, 'Detergente 1kg',       10, 19.00, 1, 'nueva', 1)
ON DUPLICATE KEY UPDATE
  cantidad = VALUES(cantidad), precio_venta = VALUES(precio_venta), total = VALUES(total),
  descripcion = VALUES(descripcion), id_producto = VALUES(id_producto), precio_compra = VALUES(precio_compra);

-- =====================================================
-- Movimientos de caja demo
-- =====================================================
INSERT INTO movimientos_caja
  (id, fecha_movimiento, tipo_movimiento, monto, id_metodo_pago, descripcion, id_usuario, id_cierre_caja, id_ventas, vuelto)
VALUES
  (1, DATE_SUB(NOW(), INTERVAL 1 DAY), 'apertura', 200.00, 1, 'Apertura de caja', 1, 1, NULL, 0.00),
  (2, DATE_SUB(NOW(), INTERVAL 3 DAY), 'ingreso',   45.00, 1, 'Venta B001-00000001', 1, 1, 1, 0.00),
  (3, DATE_SUB(NOW(), INTERVAL 5 DAY), 'ingreso',   89.90, 2, 'Venta B001-00000002', 1, 1, 2, 0.00),
  (4, DATE_SUB(NOW(), INTERVAL 2 DAY), 'ingreso',   23.50, 1, 'Venta B001-00000003', 1, 1, 3, 0.00),
  (5, DATE_SUB(NOW(), INTERVAL 1 DAY), 'ingreso',  118.00, 1, 'Venta B001-00000004', 1, 1, 4, 0.00),
  (6, DATE_SUB(NOW(), INTERVAL 6 DAY), 'ingreso',   67.50, 4, 'Venta B001-00000005', 1, 1, 5, 0.00),
  (7, DATE_SUB(NOW(), INTERVAL 4 HOUR), 'ingreso', 207.80, 2, 'Venta B001-00000006', 1, 1, 6, 0.00),
  (8, DATE_SUB(NOW(), INTERVAL 6 HOUR), 'salida',   30.00, 1, 'Compra de bolsas y empaques', 1, 1, NULL, 0.00)
ON DUPLICATE KEY UPDATE
  tipo_movimiento = VALUES(tipo_movimiento), monto = VALUES(monto), descripcion = VALUES(descripcion),
  id_metodo_pago = VALUES(id_metodo_pago), id_cierre_caja = VALUES(id_cierre_caja), id_ventas = VALUES(id_ventas);

-- =====================================================
-- Compras demo
-- =====================================================
INSERT INTO compras
  (id, numero_factura, fecha_emision, id_proveedor, id_metodo_pago, id_tipo_comprobante, observacion, estado,
   monto_total, id_empresa, id_usuario, fecha_registro, updated_at,
   resumen_gravada, resumen_igv, resumen_descuento_total, resumen_total)
VALUES
  (1, 'F001-00001234', DATE_SUB(CURDATE(), INTERVAL 5 DAY), 4, 2, 1, 'Reposicion de stock de tecnologia', 'RECIBIDA',
   500.00, 1, 1, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY),
   423.73, 76.27, 0.00, 500.00)
ON DUPLICATE KEY UPDATE
  numero_factura = VALUES(numero_factura), monto_total = VALUES(monto_total), estado = VALUES(estado),
  resumen_gravada = VALUES(resumen_gravada), resumen_igv = VALUES(resumen_igv), resumen_total = VALUES(resumen_total);

INSERT INTO detalle_compra
  (id, id_compra, id_producto, cantidad_esperada, cantidad_recibida, precio_compra, subtotal,
   unidad_medida_compra, factor_compra, importe, valor_unitario)
VALUES
  (1, 1, 7, 5, 5, 45.00, 225.00, 'unidad', 1, 225.00, 45.00),
  (2, 1, 8, 10, 10, 11.00, 110.00, 'unidad', 1, 110.00, 11.00),
  (3, 1, 10, 10, 10, 19.00, 190.00, 'unidad', 1, 190.00, 19.00)
ON DUPLICATE KEY UPDATE
  cantidad_esperada = VALUES(cantidad_esperada), cantidad_recibida = VALUES(cantidad_recibida),
  precio_compra = VALUES(precio_compra), subtotal = VALUES(subtotal), importe = VALUES(importe),
  valor_unitario = VALUES(valor_unitario);

SET FOREIGN_KEY_CHECKS = 1;
