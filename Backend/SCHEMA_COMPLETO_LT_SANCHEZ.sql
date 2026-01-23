/*
  MIGRACIÓN DE POS SUPABASE A MYSQL
  PROYECTO: TIENDA PRODUCTOS CHINOS
  VERSIÓN FUSIONADA, LIMPIA Y ACTUALIZADA
  Base de datos: LT_Sanchez
  
  CAMBIOS INTEGRADOS:
  - Tabla impresoras: id_usuario en lugar de id_caja
  - Tabla ventas: columna ruc_dni agregada
  - Tabla productos: columna tipo_comprobante
  - Todas las FKs y índices optimizados
*/

DROP DATABASE IF EXISTS LT_Sanchez;
CREATE DATABASE LT_Sanchez CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE LT_Sanchez;

SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 1. TABLA EMPRESA
-- =====================================================
CREATE TABLE empresa (
  id BIGINT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  id_fiscal VARCHAR(255) DEFAULT NULL,
  direccion_fiscal VARCHAR(255) DEFAULT NULL,
  simbolo_moneda VARCHAR(10) DEFAULT '$',
  logo LONGTEXT DEFAULT NULL,
  id_auth VARCHAR(255) NOT NULL UNIQUE,
  id_usuario BIGINT,
  iso VARCHAR(10) DEFAULT 'PE',
  pais VARCHAR(100) DEFAULT 'Peru',
  currency VARCHAR(10) DEFAULT 'PEN',
  impuesto VARCHAR(50) DEFAULT 'IGV',
  valor_impuesto DECIMAL(15,2) DEFAULT 18.00,
  nombre_moneda VARCHAR(100) DEFAULT NULL,
  correo VARCHAR(255) DEFAULT '',
  pie_pagina_ticket VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (id),
  INDEX idx_empresa_id_auth (id_auth)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. TABLA ROLES
-- =====================================================
CREATE TABLE roles (
  id BIGINT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_roles_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. TABLA TIPO_COMPROBANTES
-- =====================================================
CREATE TABLE tipo_comprobantes (
  id BIGINT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  destino VARCHAR(50),
  PRIMARY KEY (id),
  INDEX idx_tipo_comprobantes_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. TABLA MODULOS
-- =====================================================
CREATE TABLE modulos (
  id BIGINT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  marcado BOOLEAN DEFAULT FALSE,
  descripcion TEXT DEFAULT NULL,
  icono VARCHAR(255) DEFAULT NULL,
  enlace VARCHAR(255) DEFAULT NULL,
  etiquetas VARCHAR(255) DEFAULT '#configuracion',
  PRIMARY KEY (id),
  INDEX idx_modulos_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. TABLA SUCURSALES
-- =====================================================
CREATE TABLE sucursales (
  id BIGINT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(255),
  direccion_fiscal VARCHAR(255),
  id_empresa BIGINT,
  eliminar BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (id),
  CONSTRAINT sucursales_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES empresa(id) ON DELETE CASCADE,
  INDEX idx_sucursales_empresa (id_empresa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. TABLA ALMACEN
-- =====================================================
CREATE TABLE almacen (
  id BIGINT NOT NULL AUTO_INCREMENT,
  id_sucursal BIGINT NOT NULL,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  eliminar BOOLEAN DEFAULT TRUE,
  nombre VARCHAR(255),
  defecto BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (id),
  CONSTRAINT almacen_id_sucursal_fkey FOREIGN KEY (id_sucursal) REFERENCES sucursales(id) ON DELETE CASCADE,
  INDEX idx_almacen_sucursal (id_sucursal)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. TABLA CAJA
-- =====================================================
CREATE TABLE caja (
  id BIGINT NOT NULL AUTO_INCREMENT,
  descripcion VARCHAR(255) NOT NULL,
  id_sucursal BIGINT,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  eliminar BOOLEAN DEFAULT TRUE,
  imprimir BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (id),
  CONSTRAINT caja_id_sucursal_fkey FOREIGN KEY (id_sucursal) REFERENCES sucursales(id) ON DELETE CASCADE,
  INDEX idx_caja_sucursal (id_sucursal)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 8. TABLA CATEGORIAS
-- =====================================================
CREATE TABLE categorias (
  id BIGINT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  color VARCHAR(50),
  icono VARCHAR(255) DEFAULT '-',
  id_empresa BIGINT,
  PRIMARY KEY (id),
  CONSTRAINT categorias_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES empresa(id) ON DELETE CASCADE,
  INDEX idx_categorias_empresa (id_empresa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 9. TABLA TIPODOCUMENTO
-- =====================================================
CREATE TABLE tipodocumento (
  id BIGINT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL DEFAULT '',
  id_empresa BIGINT,
  PRIMARY KEY (id),
  CONSTRAINT tipodocumento_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES empresa(id) ON DELETE CASCADE,
  INDEX idx_tipodocumento_empresa (id_empresa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 10. TABLA USUARIOS
-- =====================================================
CREATE TABLE usuarios (
  id BIGINT NOT NULL AUTO_INCREMENT,
  nombres VARCHAR(255) NOT NULL,
  id_tipodocumento BIGINT,
  nro_doc VARCHAR(50) DEFAULT '-',
  telefono VARCHAR(50) DEFAULT '-',
  id_rol BIGINT,
  correo VARCHAR(255) DEFAULT '-',
  password VARCHAR(255) NOT NULL,
  fecharegistro DATETIME DEFAULT CURRENT_TIMESTAMP,
  estado VARCHAR(50) DEFAULT 'ACTIVO',
  id_auth VARCHAR(255) UNIQUE,
  tema VARCHAR(50) DEFAULT 'light',
  PRIMARY KEY (id),
  CONSTRAINT usuarios_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES roles(id),
  CONSTRAINT usuarios_id_tipodocumento_fkey FOREIGN KEY (id_tipodocumento) REFERENCES tipodocumento(id),
  UNIQUE KEY uk_usuarios_correo (correo),
  INDEX idx_usuarios_id_auth (id_auth),
  INDEX idx_usuarios_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Añadir la FK de empresa a usuarios
ALTER TABLE empresa ADD CONSTRAINT empresa_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE SET NULL;

-- =====================================================
-- 11. TABLA ASIGNACION_SUCURSAL
-- =====================================================
CREATE TABLE asignacion_sucursal (
  id BIGINT NOT NULL AUTO_INCREMENT,
  id_sucursal BIGINT NOT NULL,
  id_usuario BIGINT,
  id_caja BIGINT,
  PRIMARY KEY (id),
  CONSTRAINT asignacion_sucursal_id_caja_fkey FOREIGN KEY (id_caja) REFERENCES caja(id) ON DELETE CASCADE,
  CONSTRAINT asignacion_sucursal_id_sucursal_fkey FOREIGN KEY (id_sucursal) REFERENCES sucursales(id) ON DELETE CASCADE,
  CONSTRAINT asignacion_sucursal_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_asignacion_sucursal_usuario (id_usuario),
  INDEX idx_asignacion_sucursal_caja (id_caja)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 12. TABLA CIERRECAJA
-- =====================================================
CREATE TABLE cierrecaja (
  id BIGINT NOT NULL AUTO_INCREMENT,
  fechainicio DATETIME DEFAULT CURRENT_TIMESTAMP,
  fechacierre DATETIME DEFAULT CURRENT_TIMESTAMP,
  id_usuario BIGINT,
  total_efectivo_calculado DECIMAL(15,2) DEFAULT 0,
  total_efectivo_real DECIMAL(15,2) DEFAULT 0,
  estado BIGINT DEFAULT 0,
  diferencia_efectivo DECIMAL(15,2) DEFAULT 0,
  id_caja BIGINT,
  PRIMARY KEY (id),
  CONSTRAINT cierrecaja_id_caja_fkey FOREIGN KEY (id_caja) REFERENCES caja(id) ON DELETE CASCADE,
  CONSTRAINT cierrecaja_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_cierrecaja_usuario (id_usuario),
  INDEX idx_cierrecaja_caja (id_caja),
  INDEX idx_cierrecaja_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 13. TABLA CLIENTES_PROVEEDORES
-- =====================================================
CREATE TABLE clientes_proveedores (
  id BIGINT NOT NULL AUTO_INCREMENT,
  nombres VARCHAR(255) NOT NULL,
  id_empresa BIGINT,
  direccion VARCHAR(500) DEFAULT '-',
  telefono VARCHAR(50) DEFAULT '-',
  email VARCHAR(255) DEFAULT '-',
  identificador_nacional VARCHAR(50) DEFAULT '-',
  identificador_fiscal VARCHAR(50) DEFAULT '-',
  tipo VARCHAR(50) DEFAULT '-',
  estado VARCHAR(50) DEFAULT 'activo',
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT clientes_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES empresa(id) ON DELETE CASCADE,
  INDEX idx_clientes_empresa (id_empresa),
  INDEX idx_clientes_tipo (tipo),
  INDEX idx_clientes_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 14. TABLA METODOS_PAGO
-- =====================================================
CREATE TABLE metodos_pago (
  id BIGINT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  id_empresa BIGINT,
  icono VARCHAR(255) DEFAULT NULL,
  ver_nombre BOOLEAN DEFAULT TRUE,
  eliminar_actualizar BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (id),
  CONSTRAINT metodos_pago_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES empresa(id) ON DELETE CASCADE,
  INDEX idx_metodos_pago_empresa (id_empresa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 15. TABLA COMPRAS
-- =====================================================
CREATE TABLE compras (
  id BIGINT NOT NULL AUTO_INCREMENT,
  numero_factura VARCHAR(50) NOT NULL,
  fecha_emision DATE NOT NULL,
  id_proveedor BIGINT NOT NULL,
  id_metodo_pago BIGINT NOT NULL,
  id_tipo_comprobante BIGINT NOT NULL,
  observacion TEXT,
  estado VARCHAR(20) DEFAULT 'INCOMPLETO',
  monto_total DECIMAL(12,2) NOT NULL,
  id_empresa BIGINT NOT NULL,
  id_usuario BIGINT NOT NULL,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT compras_id_proveedor_fkey FOREIGN KEY (id_proveedor) REFERENCES clientes_proveedores(id),
  CONSTRAINT compras_id_metodo_pago_fkey FOREIGN KEY (id_metodo_pago) REFERENCES metodos_pago(id),
  CONSTRAINT compras_id_tipo_comprobante_fkey FOREIGN KEY (id_tipo_comprobante) REFERENCES tipo_comprobantes(id),
  CONSTRAINT compras_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES empresa(id) ON DELETE CASCADE,
  CONSTRAINT compras_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
  INDEX idx_compras_empresa (id_empresa),
  INDEX idx_compras_proveedor (id_proveedor),
  INDEX idx_compras_estado (estado),
  INDEX idx_compras_numero_factura (numero_factura),
  INDEX idx_compras_fecha_emision (fecha_emision)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 16. TABLA PRODUCTOS
-- =====================================================
CREATE TABLE productos (
  id BIGINT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  precio_venta DECIMAL(15,2) DEFAULT 0,
  precio_compra DECIMAL(15,2) DEFAULT 0,
  id_categoria BIGINT,
  codigo_barras VARCHAR(255),
  codigo_interno VARCHAR(255),
  id_empresa BIGINT,
  sevende_por VARCHAR(50) DEFAULT 'unidad',
  maneja_inventarios BOOLEAN DEFAULT FALSE,
  maneja_multiprecios BOOLEAN DEFAULT FALSE,
  estado VARCHAR(20) DEFAULT 'ACTIVO',
  tipo_comprobante VARCHAR(20) DEFAULT 'BOLETA' COMMENT 'Tipo de comprobante por defecto: FACTURA, BOLETA o TICKET',
  PRIMARY KEY (id),
  CONSTRAINT productos_id_categoria_fkey FOREIGN KEY (id_categoria) REFERENCES categorias(id),
  CONSTRAINT productos_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES empresa(id) ON DELETE CASCADE,
  INDEX idx_productos_tipo_comprobante (tipo_comprobante),
  INDEX idx_productos_empresa (id_empresa),
  INDEX idx_productos_categoria (id_categoria),
  INDEX idx_productos_codigo_barras (codigo_barras),
  INDEX idx_productos_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 17. TABLA DETALLE_COMPRA
-- =====================================================
CREATE TABLE detalle_compra (
  id BIGINT NOT NULL AUTO_INCREMENT,
  id_compra BIGINT NOT NULL,
  id_producto BIGINT NOT NULL,
  cantidad_esperada INT NOT NULL,
  cantidad_recibida INT NOT NULL,
  precio_compra DECIMAL(12,2) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT detalle_compra_id_compra_fkey FOREIGN KEY (id_compra) REFERENCES compras(id) ON DELETE CASCADE,
  CONSTRAINT detalle_compra_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES productos(id),
  INDEX idx_detalle_compra_compra (id_compra),
  INDEX idx_detalle_compra_producto (id_producto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 18. TABLA VENTAS
-- ✅ INCLUYE COLUMNAS: tipo_comprobante Y ruc_dni
-- =====================================================
CREATE TABLE ventas (
  id BIGINT NOT NULL AUTO_INCREMENT,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  monto_total DECIMAL(15,2) DEFAULT 0,
  total_impuestos DECIMAL(15,2) DEFAULT 0,
  id_usuario BIGINT,
  saldo DECIMAL(15,2) DEFAULT 0,
  pago_con DECIMAL(15,2) DEFAULT 0,
  referencia_tarjeta VARCHAR(255) DEFAULT '-',
  vuelto DECIMAL(15,2) DEFAULT 0,
  cantidad_productos BIGINT DEFAULT 0,
  sub_total DECIMAL(15,2) DEFAULT 0,
  id_cliente BIGINT,
  id_sucursal BIGINT,
  id_empresa BIGINT,
  estado VARCHAR(50) DEFAULT 'pendiente',
  valor_impuesto DECIMAL(15,2) DEFAULT 0,
  id_cierre_caja BIGINT,
  nro_comprobante VARCHAR(255) DEFAULT NULL,
  ruc_dni VARCHAR(20) DEFAULT NULL COMMENT 'RUC o DNI del cliente para facturación',
  tipo_comprobante VARCHAR(20) DEFAULT 'BOLETA' COMMENT 'Tipo de comprobante emitido: FACTURA, BOLETA o TICKET',
  PRIMARY KEY (id),
  CONSTRAINT ventas_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES clientes_proveedores(id) ON DELETE SET NULL,
  CONSTRAINT ventas_id_cierre_caja_fkey FOREIGN KEY (id_cierre_caja) REFERENCES cierrecaja(id) ON DELETE SET NULL,
  CONSTRAINT ventas_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE SET NULL,
  CONSTRAINT ventas_id_sucursal_fkey FOREIGN KEY (id_sucursal) REFERENCES sucursales(id) ON DELETE SET NULL,
  CONSTRAINT ventas_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES empresa(id) ON DELETE CASCADE,
  INDEX idx_ventas_tipo_comprobante (tipo_comprobante),
  INDEX idx_ventas_estado (estado),
  INDEX idx_ventas_fecha (fecha),
  INDEX idx_ventas_nro_comprobante (nro_comprobante),
  INDEX idx_ventas_ruc_dni (ruc_dni),
  INDEX idx_ventas_empresa (id_empresa),
  INDEX idx_ventas_usuario (id_usuario),
  INDEX idx_ventas_cierre_caja (id_cierre_caja)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 19. TABLA DETALLE_VENTA
-- =====================================================
CREATE TABLE detalle_venta (
  id BIGINT NOT NULL AUTO_INCREMENT,
  id_venta BIGINT NOT NULL,
  cantidad DECIMAL(15,2) DEFAULT 1,
  precio_venta DECIMAL(15,2),
  total DECIMAL(15,2),
  descripcion TEXT,
  id_producto BIGINT,
  precio_compra DECIMAL(15,2),
  id_sucursal BIGINT,
  estado VARCHAR(50) DEFAULT 'nueva',
  id_almacen BIGINT,
  PRIMARY KEY (id),
  CONSTRAINT detalle_venta_id_sucursal_fkey FOREIGN KEY (id_sucursal) REFERENCES sucursales(id),
  CONSTRAINT detalle_venta_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES productos(id),
  CONSTRAINT detalle_venta_id_venta_fkey FOREIGN KEY (id_venta) REFERENCES ventas(id) ON DELETE CASCADE,
  CONSTRAINT detalle_venta_id_almacen_fkey FOREIGN KEY (id_almacen) REFERENCES almacen(id),
  INDEX idx_detalle_venta_venta (id_venta),
  INDEX idx_detalle_venta_producto (id_producto),
  INDEX idx_detalle_venta_almacen (id_almacen)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 20. TABLA IMPRESORAS
-- ✅ MODIFICADA: id_usuario en lugar de id_caja
-- =====================================================
CREATE TABLE impresoras (
  id BIGINT NOT NULL AUTO_INCREMENT,
  id_usuario BIGINT NOT NULL,
  nombre_pc VARCHAR(255) DEFAULT '-',
  ip_local VARCHAR(255) DEFAULT '-',
  estado BOOLEAN DEFAULT FALSE,
  nombre VARCHAR(255) DEFAULT '-',
  PRIMARY KEY (id),
  CONSTRAINT fk_impresoras_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_impresoras_usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 21. TABLA KARDEX
-- =====================================================
CREATE TABLE kardex (
  id BIGINT NOT NULL AUTO_INCREMENT,
  fecha DATE NOT NULL,
  motivo VARCHAR(255),
  cantidad DECIMAL(15,2),
  id_producto BIGINT,
  id_usuario BIGINT,
  tipo VARCHAR(50),
  estado VARCHAR(50),
  total DECIMAL(15,2),
  costo DECIMAL(15,2),
  habia DECIMAL(15,2),
  hay DECIMAL(15,2),
  PRIMARY KEY (id),
  CONSTRAINT kardex_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES productos(id) ON DELETE CASCADE,
  CONSTRAINT kardex_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_kardex_producto (id_producto),
  INDEX idx_kardex_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 22. TABLA MOVIMIENTOS_CAJA
-- =====================================================
CREATE TABLE movimientos_caja (
  id BIGINT NOT NULL AUTO_INCREMENT,
  fecha_movimiento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tipo_movimiento VARCHAR(50),
  monto DECIMAL(15,2) DEFAULT 0,
  id_metodo_pago BIGINT,
  descripcion VARCHAR(500) DEFAULT '-',
  id_usuario BIGINT,
  id_cierre_caja BIGINT,
  id_ventas BIGINT,
  vuelto DECIMAL(15,2) DEFAULT 0,
  PRIMARY KEY (id),
  CONSTRAINT movimientos_caja_id_cierre_caja_fkey FOREIGN KEY (id_cierre_caja) REFERENCES cierrecaja(id) ON DELETE CASCADE,
  CONSTRAINT movimientos_caja_id_metodo_pago_fkey FOREIGN KEY (id_metodo_pago) REFERENCES metodos_pago(id),
  CONSTRAINT movimientos_caja_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
  CONSTRAINT movimientos_caja_id_ventas_fkey FOREIGN KEY (id_ventas) REFERENCES ventas(id) ON DELETE CASCADE,
  INDEX idx_movimientos_caja_cierre (id_cierre_caja),
  INDEX idx_movimientos_caja_fecha (fecha_movimiento),
  INDEX idx_movimientos_caja_tipo (tipo_movimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 23. TABLA MOVIMIENTOS_STOCK
-- =====================================================
CREATE TABLE movimientos_stock (
  id BIGINT NOT NULL AUTO_INCREMENT,
  id_almacen BIGINT NOT NULL,
  id_producto BIGINT,
  tipo_movimiento VARCHAR(50),
  cantidad DECIMAL(15,2),
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  detalle VARCHAR(500) DEFAULT '-',
  origen VARCHAR(255) DEFAULT '-',
  PRIMARY KEY (id),
  CONSTRAINT movimientos_stock_id_almacen_fkey FOREIGN KEY (id_almacen) REFERENCES almacen(id) ON DELETE CASCADE,
  CONSTRAINT movimientos_stock_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES productos(id) ON DELETE CASCADE,
  INDEX idx_movimientos_stock_almacen (id_almacen),
  INDEX idx_movimientos_stock_producto (id_producto),
  INDEX idx_movimientos_stock_fecha (fecha),
  INDEX idx_movimientos_stock_tipo (tipo_movimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 24. TABLA MULTIPRECIOS
-- =====================================================
CREATE TABLE multiprecios (
  id BIGINT NOT NULL AUTO_INCREMENT,
  precio_venta DECIMAL(15,2) NOT NULL,
  id_producto BIGINT,
  cantidad DECIMAL(15,2),
  PRIMARY KEY (id),
  CONSTRAINT multiprecios_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES productos(id) ON DELETE CASCADE,
  INDEX idx_multiprecios_producto (id_producto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 25. TABLA PERMISOS
-- =====================================================
CREATE TABLE permisos (
  id BIGINT NOT NULL AUTO_INCREMENT,
  id_usuario BIGINT NOT NULL,
  idmodulo BIGINT,
  PRIMARY KEY (id),
  CONSTRAINT permisos_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT permisos_idmodulo_fkey FOREIGN KEY (idmodulo) REFERENCES modulos(id) ON DELETE CASCADE,
  INDEX idx_permisos_usuario (id_usuario),
  INDEX idx_permisos_modulo (idmodulo),
  UNIQUE KEY uk_permisos_usuario_modulo (id_usuario, idmodulo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 26. TABLA PERMISOS_DEFAULT
-- =====================================================
CREATE TABLE permisos_default (
  id BIGINT NOT NULL AUTO_INCREMENT,
  id_rol BIGINT NOT NULL,
  id_modulo BIGINT,
  PRIMARY KEY (id),
  CONSTRAINT permisos_default_id_modulo_fkey FOREIGN KEY (id_modulo) REFERENCES modulos(id) ON DELETE CASCADE,
  CONSTRAINT permisos_default_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES roles(id) ON DELETE CASCADE,
  INDEX idx_permisos_default_rol (id_rol),
  INDEX idx_permisos_default_modulo (id_modulo),
  UNIQUE KEY uk_permisos_default_rol_modulo (id_rol, id_modulo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 27. TABLA SERIALIZACION_COMPROBANTES
-- =====================================================
CREATE TABLE serializacion_comprobantes (
  id BIGINT NOT NULL AUTO_INCREMENT,
  id_tipo_comprobante BIGINT NOT NULL,
  serie VARCHAR(50),
  cantidad_numeros BIGINT,
  correlativo BIGINT,
  sucursal_id BIGINT,
  por_defecto BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (id),
  CONSTRAINT serial_comprobantes_id_tipo_fkey FOREIGN KEY (id_tipo_comprobante) REFERENCES tipo_comprobantes(id),
  CONSTRAINT serial_comprobantes_sucursal_id_fkey FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE CASCADE,
  INDEX idx_serializacion_tipo (id_tipo_comprobante),
  INDEX idx_serializacion_sucursal (sucursal_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 28. TABLA STOCK
-- =====================================================
CREATE TABLE stock (
  id BIGINT NOT NULL AUTO_INCREMENT,
  id_almacen BIGINT NOT NULL,
  id_producto BIGINT,
  stock DECIMAL(15,2) DEFAULT 0,
  stock_minimo DECIMAL(15,2) DEFAULT 0,
  ubicacion VARCHAR(255) DEFAULT '-',
  PRIMARY KEY (id),
  CONSTRAINT stock_id_almacen_fkey FOREIGN KEY (id_almacen) REFERENCES almacen(id) ON DELETE CASCADE,
  CONSTRAINT stock_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES productos(id) ON DELETE CASCADE,
  INDEX idx_stock_almacen (id_almacen),
  INDEX idx_stock_producto (id_producto),
  UNIQUE KEY uk_stock_almacen_producto (id_almacen, id_producto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- DATOS INICIALES BÁSICOS
-- =====================================================

-- Insertar tipos de comprobantes
INSERT INTO tipo_comprobantes (id, nombre, destino) VALUES 
(1, 'Factura', 'ventas'),
(2, 'Boleta', 'ventas'),
(3, 'Ticket', 'ventas');

-- Insertar roles básicos
INSERT INTO roles (id, nombre) VALUES 
(1, 'Administrador'),
(2, 'Vendedor'),
(3, 'Almacenero');

-- =====================================================
-- SCRIPT COMPLETADO
-- Base de datos: LT_Sanchez
-- Fecha: 22 de enero de 2026
-- 
-- CAMBIOS APLICADOS:
-- ✅ Tabla impresoras con id_usuario (FK a usuarios)
-- ✅ Tabla ventas con columna ruc_dni
-- ✅ Tabla productos con tipo_comprobante
-- ✅ Índices optimizados en todas las tablas
-- ✅ Constraints de CASCADE apropiados
-- ✅ Datos iniciales de tipos de comprobantes y roles
-- =====================================================
