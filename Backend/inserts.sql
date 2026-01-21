-- =====================================================
-- DATOS INICIALES: LT_Sanchez
-- Sistema POS - Tienda China
-- Versión: 2.0 (COMPLETO)
-- Fecha: 17 de enero de 2026
-- =====================================================
-- 
-- ⚠️ IMPORTANTE: Ejecutar DESPUÉS de LT_Sanchez_LIMPIO.sql
-- 
-- Orden de ejecución:
-- 1. LT_Sanchez_LIMPIO.sql (crea las tablas)
-- 2. DATOS_INICIALES.sql (este archivo - inserta datos base)
-- 3. Iniciar backend Spring Boot
--
-- =====================================================

USE LT_Sanchez;

-- Deshabilitar verificación de Foreign Keys temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 1. ROLES (3 registros)
-- =====================================================
-- Estos roles son OBLIGATORIOS para el funcionamiento del sistema
-- El trigger UsuarioEntityListener busca el rol "superadmin" (id=1)

INSERT INTO roles (id, nombre) VALUES 
(1, 'superadmin'),
(2, 'cajero'),
(3, 'admin')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- =====================================================
-- 2. MODULOS (25 registros)
-- =====================================================
-- Los módulos definen las secciones del sistema
-- El trigger UsuarioEntityListener busca el módulo con link="/" (Home)
-- Los permisos se asignan según estos módulos

INSERT INTO modulos (id, nombre, marcado, descripcion, icono, enlace, etiquetas) VALUES 
(1, 'Categorias de productos', 0, 'asigna categorias a tus productos', 'https://i.ibb.co/VYbMRLZ/categoria.png', '/configuracion/categorias', '#configuracion'),
(2, 'Productos', 0, 'registra tus productos', 'https://i.ibb.co/85zJ6yG/caja-del-paquete.png', '/configuracion/productos', '#configuracion'),
(3, 'Empresa', 0, 'configura tu empresa', 'https://i.ibb.co/S0pkQWF/comercio-y-compras.png', '/configuracion/empresa', '#configuracion'),
(4, 'Clientes', 0, 'gestiona tus clientes', 'https://i.ibb.co/g4YBrpf/satisfecho.png', '/configuracion/clientes', '#configuracion'),
(5, 'Proveedores', 0, 'gestiona tus proveedores', 'https://i.ibb.co/q5rjxjG/proveedor.png', '/configuracion/proveedores', '#configuracion'),
(6, 'Métodos de pago', 0, 'gestiona tus métodos de pago', 'https://i.ibb.co/PtjvQkB/transferencia-movil.png', '/configuracion/metodospago', '#configuracion'),
(7, 'Sucursales y cajas', 0, 'gestiona tus sucursales y cajas', 'https://qkzybkelsdmoezaaypou.supabase.co/storage/v1/object/public/imagenes/modulos/sucursales.png', '/configuracion/sucursalcaja', '#configuracion'),
(8, 'Usuarios', 0, 'gestiona tus usuarios', 'https://qkzybkelsdmoezaaypou.supabase.co/storage/v1/object/public/imagenes/modulos/escritorio-de-oficina.png', '/configuracion/usuarios', '#configuracion'),
(9, 'Impresoras', 0, 'gestiona tus comprobantes de pago', 'https://qkzybkelsdmoezaaypou.supabase.co/storage/v1/object/public/imagenes/modulos/impresora.png', '/configuracion/impresoras', '#configuracion'),
(15, 'Configuracion', 0, '-', '-', '/configuracion', '#operacion'),
(16, 'Ventas', 0, '-', '-', '/pos', '#operacion'),
(17, 'Dashboard', 0, '-', '-', '/dashboard', '#operacion'),
(18, 'Cobrar venta', 0, '-', '-', '-', '#operacion'),
(19, 'Empresa basicos', 0, '-', '-', '/configuracion/empresa/empresabasicos', '#operacion'),
(20, 'Empresa moneda', 0, '-', '-', '/configuracion/empresa/monedaconfig', '#operacion'),
(21, 'Almacenes', 0, 'gestiona tus almacenes por sucursales', 'https://qkzybkelsdmoezaaypou.supabase.co/storage/v1/object/public/imagenes/modulos/almacen.png', '/configuracion/almacenes', '#configuracion'),
(22, 'Home', 0, '-', '-', '/', '#default'),
(23, 'Inventarios', 0, '-', '-', '/inventario', '#operacion'),
(24, 'Configuración de ticket', 0, 'configura tu ticket personalizado', 'https://i.ibb.co/Z1BQHJ92/boleto.png', '/configuracion/ticket', '#configuracion'),
(25, 'Serialización de comprobantes', 0, 'serializa tus comprobantes', 'https://i.ibb.co/xtCdPGhx/factura-2.png', '/configuracion/serializacion', '#configuracion')
ON DUPLICATE KEY UPDATE 
    nombre = VALUES(nombre),
    marcado = VALUES(marcado),
    descripcion = VALUES(descripcion),
    icono = VALUES(icono),
    enlace = VALUES(enlace),
    etiquetas = VALUES(etiquetas);

-- =====================================================
-- 3. TIPO_COMPROBANTES (5 registros)
-- =====================================================
-- Tipos de comprobantes para ventas
-- El trigger SucursalEntityListener crea serializaciones basándose en estos

INSERT INTO tipo_comprobantes (id, nombre, destino) VALUES 
(1, 'Factura', 'ventas'),
(2, 'Boleta', 'ventas'),
(3, 'Nota de credito', '-'),
(4, 'Nota de debito', '-'),
(5, 'Ticket', 'ventas')
ON DUPLICATE KEY UPDATE 
    nombre = VALUES(nombre),
    destino = VALUES(destino);

-- =====================================================
-- 4. USUARIO ADMINISTRADOR INICIAL (1 registro)
-- =====================================================
-- Usuario SuperAdmin para primer acceso al sistema
-- Contraseña: "ltsanchez" (encriptada con BCrypt)
-- 
-- IMPORTANTE: Cambiar la contraseña después del primer login

INSERT INTO usuarios (
    id,
    nombres,
    correo,
    password,
    id_rol,
    estado,
    nro_doc,
    telefono,
    tema,
    id_auth,
    id_tipodocumento
) VALUES (
    1,
    'Laura Sanchez',
    'itsanchezadm@gmail.com',
    '$2a$12$Z9OfQ48Wn8ZnoZFZuY7xje.RPM5tYvSKSAN4SR8gmCJ3GL.Cphi6O', -- Contraseña: "ltsanchez"
    1,  -- superadmin
    'ACTIVO',
    '40438437',
    '962510490',
    'light',
    'auth-admin-1',
    1  -- DNI
)
ON DUPLICATE KEY UPDATE 
    nombres = VALUES(nombres),
    correo = VALUES(correo),
    password = VALUES(password),
    id_tipodocumento = VALUES(id_tipodocumento);

-- =====================================================
-- 5. EMPRESA (1 registro)
-- =====================================================
-- Empresa de prueba inicial

INSERT INTO empresa (
    id,
    nombre, 
    id_fiscal, 
    direccion_fiscal, 
    simbolo_moneda, 
    id_auth, 
    id_usuario, 
    iso, 
    pais, 
    currency, 
    impuesto, 
    valor_impuesto, 
    nombre_moneda, 
    correo, 
    pie_pagina_ticket
) VALUES (
    1,
    'Tienda LT Sanchez', 
    '20123456789', 
    'Av. Principal 123', 
    'S/', 
    'auth-empresa-1', 
    1, 
    'PE', 
    'Peru', 
    'PEN', 
    'IGV', 
    18.00, 
    'Soles', 
    'contacto@ltsanchez.com', 
    'Gracias por su compra - Tienda LT Sanchez'
)
ON DUPLICATE KEY UPDATE 
    nombre = VALUES(nombre),
    id_usuario = VALUES(id_usuario);

-- =====================================================
-- 6. TIPO DOCUMENTO (1 registro)
-- =====================================================
-- Tipo de documento genérico

INSERT INTO tipodocumento (id, nombre, id_empresa) VALUES 
(1, 'DNI', 1)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- =====================================================
-- 7. SUCURSAL (1 registro)
-- =====================================================
-- Sucursal principal

INSERT INTO sucursales (id, nombre, direccion_fiscal, id_empresa, eliminar) VALUES 
(1, 'Sucursal Central', 'Av. Principal 123', 1, 1)
ON DUPLICATE KEY UPDATE 
    nombre = VALUES(nombre),
    direccion_fiscal = VALUES(direccion_fiscal);

-- =====================================================
-- 8. ALMACÉN (1 registro)
-- =====================================================
-- Almacén principal de la sucursal

INSERT INTO almacen (id, id_sucursal, nombre, defecto, eliminar) VALUES 
(1, 1, 'Almacén Principal', 1, 1)
ON DUPLICATE KEY UPDATE 
    nombre = VALUES(nombre),
    defecto = VALUES(defecto);

-- =====================================================
-- 9. CAJA (1 registro)
-- =====================================================
-- Caja principal de la sucursal

INSERT INTO caja (id, descripcion, id_sucursal, eliminar, imprimir) VALUES 
(1, 'Caja 1 - Principal', 1, 1, 1)
ON DUPLICATE KEY UPDATE 
    descripcion = VALUES(descripcion);

-- =====================================================
-- 10. IMPRESORA (1 registro)
-- =====================================================
-- Impresora asociada a la caja
-- Normalmente se crea automáticamente por el trigger CajaEntityListener

INSERT INTO impresoras (id, id_caja, nombre_pc, ip_local, estado, nombre) VALUES 
(1, 1, '-', '-', 0, '-')
ON DUPLICATE KEY UPDATE 
    id_caja = VALUES(id_caja);

-- =====================================================
-- 11. ASIGNACIÓN SUCURSAL (1 registro)
-- =====================================================
-- Asigna el usuario admin a la sucursal y caja

INSERT INTO asignacion_sucursal (id, id_sucursal, id_usuario, id_caja) VALUES 
(1, 1, 1, 1)
ON DUPLICATE KEY UPDATE 
    id_sucursal = VALUES(id_sucursal),
    id_caja = VALUES(id_caja);

-- =====================================================
-- 12. SERIALIZACIONES DE COMPROBANTES (5 registros)
-- =====================================================
-- Series de comprobantes para la sucursal
-- Normalmente se crean automáticamente por el trigger SucursalEntityListener

INSERT INTO serializacion_comprobantes (id, id_tipo_comprobante, serie, cantidad_numeros, correlativo, sucursal_id, por_defecto) VALUES 
(1, 1, 'F001', 9, 0, 1, 0),  -- Factura
(2, 2, 'B001', 8, 0, 1, 0),  -- Boleta
(3, 3, 'NC01', 8, 0, 1, 0),  -- Nota Crédito
(4, 4, 'ND01', 9, 0, 1, 0),  -- Nota Débito
(5, 5, 'T001', 8, 0, 1, 1)   -- Ticket (por defecto)
ON DUPLICATE KEY UPDATE 
    correlativo = VALUES(correlativo);

-- =====================================================
-- 13. MÉTODOS DE PAGO (4 registros)
-- =====================================================
-- Métodos de pago disponibles en el sistema

INSERT INTO metodos_pago (id, nombre, id_empresa, icono, ver_nombre, eliminar_actualizar) VALUES 
(1, 'Efectivo', 1, '💵', 1, 0),
(2, 'Tarjeta', 1, '💳', 1, 1),
(3, 'Transferencia', 1, '🏦', 1, 1),
(4, 'Yape', 1, '📱', 1, 1)
ON DUPLICATE KEY UPDATE 
    nombre = VALUES(nombre),
    icono = VALUES(icono);

-- =====================================================
-- 14. CATEGORÍAS (4 registros)
-- =====================================================
-- Categorías de productos iniciales

INSERT INTO categorias (id, nombre, color, icono, id_empresa) VALUES 
(1, 'Abarrotes', '#FF6B6B', '🛒', 1),
(2, 'Bebidas', '#4ECDC4', '🥤', 1),
(3, 'Limpieza', '#95E1D3', '🧹', 1),
(4, 'Snacks', '#FFD93D', '🍿', 1)
ON DUPLICATE KEY UPDATE 
    nombre = VALUES(nombre),
    color = VALUES(color);

-- =====================================================
-- 15. CLIENTE GENÉRICO (1 registro)
-- =====================================================
-- Cliente por defecto para ventas sin cliente específico

INSERT INTO clientes_proveedores (
    id, 
    nombres, 
    id_empresa, 
    direccion, 
    telefono, 
    email, 
    identificador_nacional, 
    identificador_fiscal, 
    tipo, 
    estado
) VALUES (
    1, 
    'Cliente Genérico', 
    1, 
    '-', 
    '-', 
    '-', 
    '00000000', 
    '00000000000', 
    'cliente', 
    'activo'
)
ON DUPLICATE KEY UPDATE 
    nombres = VALUES(nombres),
    tipo = VALUES(tipo);

-- =====================================================
-- 16. PRODUCTOS DE PRUEBA (4 registros)
-- =====================================================
-- Productos iniciales para pruebas del sistema

INSERT INTO productos (
    id, 
    nombre, 
    precio_venta, 
    precio_compra, 
    id_categoria, 
    codigo_barras, 
    codigo_interno, 
    id_empresa, 
    sevende_por, 
    maneja_inventarios, 
    maneja_multiprecios
) VALUES 
(1, 'Arroz Costeño 1kg', 4.50, 3.80, 1, '7751234567890', 'PROD001', 1, 'unidad', 1, 0),
(2, 'Coca Cola 1.5L', 5.00, 3.50, 2, '7754567890123', 'PROD002', 1, 'unidad', 1, 0),
(3, 'Detergente Ace 1kg', 12.00, 9.00, 3, '7757890123456', 'PROD003', 1, 'unidad', 1, 0),
(4, 'Papas Lays 180g', 3.50, 2.50, 4, '7750123456789', 'PROD004', 1, 'unidad', 1, 0)
ON DUPLICATE KEY UPDATE 
    precio_venta = VALUES(precio_venta),
    precio_compra = VALUES(precio_compra);

-- =====================================================
-- 17. STOCK INICIAL (4 registros)
-- =====================================================
-- Stock de los productos en el almacén principal

INSERT INTO stock (id_almacen, id_producto, stock, stock_minimo, ubicacion) VALUES
(1, 1, 50.00, 10.00, 'Estante A1'),
(1, 2, 30.00, 5.00, 'Refrigerador B1'),
(1, 3, 20.00, 5.00, 'Estante C1'),
(1, 4, 40.00, 10.00, 'Estante D1')
ON DUPLICATE KEY UPDATE 
    stock = VALUES(stock);

-- =====================================================
-- 18. PERMISOS USUARIO ADMIN (25 registros)
-- =====================================================
-- Asignar todos los módulos al usuario admin

INSERT INTO permisos (id_usuario, idmodulo) VALUES 
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
(1, 6), (1, 7), (1, 8), (1, 9), (1, 15),
(1, 16), (1, 17), (1, 18), (1, 19), (1, 20),
(1, 21), (1, 22), (1, 23), (1, 24), (1, 25)
ON DUPLICATE KEY UPDATE 
    id_usuario = VALUES(id_usuario);

-- Rehabilitar verificación de Foreign Keys
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 🎉 DATOS INICIALES INSERTADOS CORRECTAMENTE
-- =====================================================
