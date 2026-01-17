USE LT_Sanchez;

-- Roles
INSERT INTO roles (id, nombre, descripcion, icono) VALUES 
(1, 'superadmin', 'Administrador con todos los permisos', 'shield'),
(2, 'cajero', 'Usuario operador de caja', 'cash-register'),
(3, 'admin', 'Administrador de tienda', 'user-tie');

-- Tipo Comprobantes
INSERT INTO tipo_comprobantes (id, nombre, destino) VALUES 
(1, 'Factura', 'ventas'),
(2, 'Boleta', 'ventas'),
(3, 'Nota de credito', '-'),
(4, 'Nota de debito', '-'),
(5, 'Ticket', 'ventas');

-- Módulos
INSERT INTO modulos (id, nombre, `check`, descripcion, icono, link, etiquetas) VALUES 
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
(25, 'Serialización de comprobantes', 0, 'serializa tus comprobantes', 'https://i.ibb.co/xtCdPGhx/factura-2.png', '/configuracion/serializacion', '#configuracion');

-- Usuario Admin (password: 123)
INSERT INTO usuarios (id, nombres, nro_doc, telefono, id_rol, correo, password, fecharegistro, estado, tema) VALUES 
(1, 'Alonso Admin', '00000000', '999-999-999', 1, 'admin@tienda.com', '$2a$10$mlrsY0Oq.JlMF.AsQFSXoeMiEJlM/Tq5oV0QJcZDEhHQk5UBmwb5W', NOW(), 'ACTIVO', 'light');

-- Empresa
INSERT INTO empresa (id, nombre, id_fiscal, direccion_fiscal, simbolo_moneda, id_auth, id_usuario, iso, pais, currency, impuesto, valor_impuesto, nombre_moneda, correo, pie_pagina_ticket) VALUES 
(1, 'Tienda LT Sanchez', '20123456789', 'Av. Principal 123', 'S/', 'auth-empresa-1', 1, 'PE', 'Peru', 'PEN', 'IGV', 18.00, 'Soles', 'contacto@ltsanchez.com', 'Gracias por su compra');

-- Sucursal
INSERT INTO sucursales (id, nombre, direccion_fiscal, id_empresa, `delete`) VALUES 
(1, 'Sucursal Central', 'Av. Principal 123', 1, 1);

-- Caja
INSERT INTO caja (id, descripcion, id_sucursal, `delete`, `print`) VALUES 
(1, 'Caja 1 - Principal', 1, 1, 1);

-- Almacén
INSERT INTO almacen (id, id_sucursal, nombre, `default`) VALUES 
(1, 1, 'Almacén Principal', 1);

-- Asignación Sucursal
INSERT INTO asignacion_sucursal (id, id_sucursal, id_usuario, id_caja) VALUES 
(1, 1, 1, 1);

-- Métodos de Pago
INSERT INTO metodos_pago (id, nombre, id_empresa, icono, ver_nombre, delete_update) VALUES 
(1, 'Efectivo', 1, '💵', 1, 0),
(2, 'Tarjeta', 1, '💳', 1, 1),
(3, 'Transferencia', 1, '🏦', 1, 1),
(4, 'Yape', 1, '📱', 1, 1);

-- Permisos Admin
INSERT INTO permisos (id_usuario, idmodulo) VALUES 
(1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(1,8),(1,9),(1,15),(1,16),(1,17),(1,18),(1,19),(1,20),(1,21),(1,22),(1,23),(1,24),(1,25);

-- Categorías
INSERT INTO categorias (id, nombre, color, icono, id_empresa) VALUES 
(1, 'Abarrotes', '#FF6B6B', '🛒', 1),
(2, 'Bebidas', '#4ECDC4', '🥤', 1),
(3, 'Limpieza', '#95E1D3', '🧹', 1),
(4, 'Snacks', '#FFD93D', '🍿', 1);

-- Productos
INSERT INTO productos (id, nombre, precio_venta, precio_compra, id_categoria, codigo_barras, codigo_interno, id_empresa, sevende_por, maneja_inventarios, maneja_multiprecios) VALUES 
(1, 'Arroz Costeño 1kg', 4.50, 3.80, 1, '7751234567890', 'PROD001', 1, 'unidad', 1, 0),
(2, 'Coca Cola 1.5L', 5.00, 3.50, 2, '7754567890123', 'PROD002', 1, 'unidad', 1, 0),
(3, 'Detergente Ace 1kg', 12.00, 9.00, 3, '7757890123456', 'PROD003', 1, 'unidad', 1, 0),
(4, 'Papas Lays 180g', 3.50, 2.50, 4, '7750123456789', 'PROD004', 1, 'unidad', 1, 0);

-- Stock
INSERT INTO stock (id_almacen, id_producto, stock, stock_minimo, ubicacion) VALUES 
(1, 1, 50.00, 10.00, 'Estante A1'),
(1, 2, 30.00, 5.00, 'Refrigerador B1'),
(1, 3, 20.00, 5.00, 'Estante C1'),
(1, 4, 40.00, 10.00, 'Estante D1');

-- Cliente Genérico
INSERT INTO clientes_proveedores (id, nombres, id_empresa, direccion, telefono, email, identificador_nacional, identificador_fiscal, tipo, estado) VALUES 
(1, 'Cliente Genérico', 1, '-', '-', '-', '00000000', '00000000000', 'cliente', 'activo');
