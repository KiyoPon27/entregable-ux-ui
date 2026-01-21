-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.almacen (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_sucursal bigint NOT NULL,
  fecha_creacion timestamp without time zone DEFAULT now(),
  delete boolean DEFAULT true,
  nombre text,
  default boolean DEFAULT true,
  CONSTRAINT almacen_pkey PRIMARY KEY (id),
  CONSTRAINT almacen_id_sucursal_fkey FOREIGN KEY (id_sucursal) REFERENCES public.sucursales(id)
);
CREATE TABLE public.asignacion_sucursal (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_sucursal bigint NOT NULL,
  id_usuario bigint,
  id_caja bigint,
  CONSTRAINT asignacion_sucursal_pkey PRIMARY KEY (id),
  CONSTRAINT asignacion_sucursal_id_caja_fkey FOREIGN KEY (id_caja) REFERENCES public.caja(id),
  CONSTRAINT asignacion_sucursal_id_sucursal_fkey FOREIGN KEY (id_sucursal) REFERENCES public.sucursales(id),
  CONSTRAINT asignacion_sucursal_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id)
);
CREATE TABLE public.caja (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  descripcion text NOT NULL,
  id_sucursal bigint,
  fecha_creacion timestamp without time zone DEFAULT now(),
  delete boolean DEFAULT true,
  print boolean DEFAULT false,
  CONSTRAINT caja_pkey PRIMARY KEY (id),
  CONSTRAINT caja_id_sucursal_fkey FOREIGN KEY (id_sucursal) REFERENCES public.sucursales(id)
);
CREATE TABLE public.categorias (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text NOT NULL,
  color text,
  icono text DEFAULT '-'::text,
  id_empresa bigint,
  CONSTRAINT categorias_pkey PRIMARY KEY (id),
  CONSTRAINT public_categorias_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES public.empresa(id)
);
CREATE TABLE public.cierrecaja (
  fechainicio timestamp without time zone DEFAULT now(),
  fechacierre timestamp without time zone DEFAULT now(),
  id_usuario integer,
  total_efectivo_calculado numeric DEFAULT '0'::numeric,
  total_efectivo_real numeric DEFAULT '0'::numeric,
  estado bigint DEFAULT '0'::bigint,
  diferencia_efectivo numeric DEFAULT '0'::numeric,
  id_caja integer,
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  CONSTRAINT cierrecaja_pkey PRIMARY KEY (id),
  CONSTRAINT cierrecaja_id_caja_fkey FOREIGN KEY (id_caja) REFERENCES public.caja(id),
  CONSTRAINT cierrecaja_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id)
);
CREATE TABLE public.clientes_proveedores (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombres text NOT NULL DEFAULT '-'::text,
  id_empresa bigint,
  direccion text DEFAULT '-'::text,
  telefono text DEFAULT '-'::text,
  email text DEFAULT '-'::text,
  identificador_nacional text DEFAULT '-'::text,
  identificador_fiscal text DEFAULT '-'::text,
  tipo text DEFAULT '-'::text,
  estado text DEFAULT 'activo'::text,
  fecha_registro timestamp without time zone DEFAULT now(),
  CONSTRAINT clientes_proveedores_pkey PRIMARY KEY (id),
  CONSTRAINT public_clientes_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES public.empresa(id)
);
CREATE TABLE public.detalle_venta (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_venta bigint NOT NULL,
  cantidad numeric DEFAULT '1'::numeric,
  precio_venta numeric,
  total numeric,
  descripcion text,
  id_producto bigint,
  precio_compra numeric,
  id_sucursal bigint,
  estado text DEFAULT 'nueva'::text,
  id_almacen bigint,
  CONSTRAINT detalle_venta_pkey PRIMARY KEY (id),
  CONSTRAINT detalle_venta_id_sucursal_fkey FOREIGN KEY (id_sucursal) REFERENCES public.sucursales(id),
  CONSTRAINT public_detalle_venta_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.productos(id),
  CONSTRAINT public_detalle_venta_id_venta_fkey FOREIGN KEY (id_venta) REFERENCES public.ventas(id)
);
CREATE TABLE public.empresa (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text NOT NULL DEFAULT 'Generica'::text,
  id_fiscal text DEFAULT '-'::text,
  direccion_fiscal text DEFAULT '-'::text,
  simbolo_moneda text DEFAULT '$'::text,
  logo text DEFAULT '-'::text,
  id_auth text NOT NULL DEFAULT ''::text UNIQUE,
  id_usuario bigint,
  iso text DEFAULT 'PE'::text,
  pais text DEFAULT 'Peru'::text,
  currency text DEFAULT 'PEN'::text,
  impuesto text DEFAULT 'IGV'::text,
  valor_impuesto numeric DEFAULT '18'::numeric,
  nombre_moneda text DEFAULT '-'::text,
  correo text DEFAULT ''::text,
  pie_pagina_ticket text DEFAULT '-'::text,
  CONSTRAINT empresa_pkey PRIMARY KEY (id),
  CONSTRAINT empresa_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id)
);
CREATE TABLE public.impresoras (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_caja bigint NOT NULL,
  pc_name text DEFAULT '-'::text,
  ip_local text DEFAULT '-'::text,
  state boolean DEFAULT false,
  name text DEFAULT '-'::text,
  CONSTRAINT impresoras_pkey PRIMARY KEY (id),
  CONSTRAINT impresoras_id_caja_fkey FOREIGN KEY (id_caja) REFERENCES public.caja(id)
);
CREATE TABLE public.kardex (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  fecha date NOT NULL,
  motivo text,
  cantidad numeric,
  id_producto bigint,
  id_usuario bigint,
  tipo text,
  estado text,
  total numeric,
  costo numeric,
  habia numeric,
  hay numeric,
  CONSTRAINT kardex_pkey PRIMARY KEY (id),
  CONSTRAINT public_kardex_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.productos(id),
  CONSTRAINT public_kardex_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id)
);
CREATE TABLE public.metodos_pago (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text NOT NULL,
  id_empresa bigint,
  icono text DEFAULT '-'::text,
  ver_nombre boolean DEFAULT true,
  delete_update boolean DEFAULT false,
  CONSTRAINT metodos_pago_pkey PRIMARY KEY (id),
  CONSTRAINT metodos_pago_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES public.empresa(id)
);
CREATE TABLE public.modulos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text NOT NULL DEFAULT '-'::text,
  check boolean DEFAULT false,
  descripcion text DEFAULT '-'::text,
  icono text DEFAULT '-'::text,
  link text DEFAULT '-'::text,
  etiquetas text DEFAULT '#configuracion'::text,
  CONSTRAINT modulos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.movimientos_caja (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  fecha_movimiento timestamp without time zone NOT NULL DEFAULT now(),
  tipo_movimiento text,
  monto numeric DEFAULT '0'::numeric,
  id_metodo_pago bigint,
  descripcion text DEFAULT '-'::text,
  id_usuario bigint,
  id_cierre_caja bigint,
  id_ventas bigint,
  vuelto numeric DEFAULT '0'::numeric,
  CONSTRAINT movimientos_caja_pkey PRIMARY KEY (id),
  CONSTRAINT movimientos_caja_id_cierre_caja_fkey FOREIGN KEY (id_cierre_caja) REFERENCES public.cierrecaja(id),
  CONSTRAINT movimientos_caja_id_metodo_pago_fkey FOREIGN KEY (id_metodo_pago) REFERENCES public.metodos_pago(id),
  CONSTRAINT movimientos_caja_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id),
  CONSTRAINT movimientos_caja_id_ventas_fkey FOREIGN KEY (id_ventas) REFERENCES public.ventas(id)
);
CREATE TABLE public.movimientos_stock (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_almacen bigint NOT NULL,
  id_producto bigint,
  tipo_movimiento text,
  cantidad numeric,
  fecha timestamp with time zone DEFAULT now(),
  detalle text DEFAULT '-'::text,
  origen text DEFAULT '-'::text,
  CONSTRAINT movimientos_stock_pkey PRIMARY KEY (id),
  CONSTRAINT movimientos_stock_id_almacen_fkey FOREIGN KEY (id_almacen) REFERENCES public.almacen(id),
  CONSTRAINT movimientos_stock_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.productos(id)
);
CREATE TABLE public.multiprecios (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  precio_venta numeric NOT NULL,
  id_producto bigint,
  cantidad numeric,
  CONSTRAINT multiprecios_pkey PRIMARY KEY (id),
  CONSTRAINT multiprecios_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.productos(id)
);
CREATE TABLE public.permisos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_usuario bigint NOT NULL,
  idmodulo bigint,
  CONSTRAINT permisos_pkey PRIMARY KEY (id),
  CONSTRAINT permisos_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id),
  CONSTRAINT permisos_idmodulo_fkey FOREIGN KEY (idmodulo) REFERENCES public.modulos(id)
);
CREATE TABLE public.permisos_dafault (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_rol bigint NOT NULL,
  id_modulo bigint,
  CONSTRAINT permisos_dafault_pkey PRIMARY KEY (id),
  CONSTRAINT permisos_dafault_id_modulo_fkey FOREIGN KEY (id_modulo) REFERENCES public.modulos(id),
  CONSTRAINT permisos_dafault_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.roles(id)
);
CREATE TABLE public.productos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text NOT NULL,
  precio_venta numeric DEFAULT '0'::numeric,
  precio_compra numeric DEFAULT '0'::numeric,
  id_categoria bigint,
  codigo_barras text,
  codigo_interno text,
  id_empresa bigint,
  sevende_por text DEFAULT 'unidad'::text,
  maneja_inventarios boolean DEFAULT false,
  maneja_multiprecios boolean DEFAULT false,
  CONSTRAINT productos_pkey PRIMARY KEY (id),
  CONSTRAINT public_productos_id_categoria_fkey FOREIGN KEY (id_categoria) REFERENCES public.categorias(id),
  CONSTRAINT public_productos_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES public.empresa(id)
);
CREATE TABLE public.roles (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text NOT NULL,
  CONSTRAINT roles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.serializacion_comprobantes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_tipo_comprobante bigint NOT NULL,
  serie text,
  cantidad_numeros bigint,
  correlativo bigint,
  sucursal_id bigint,
  por_default boolean DEFAULT false,
  CONSTRAINT serializacion_comprobantes_pkey PRIMARY KEY (id),
  CONSTRAINT serializacion_comprobantes_id_tipo_comprobante_fkey FOREIGN KEY (id_tipo_comprobante) REFERENCES public.tipo_comprobantes(id),
  CONSTRAINT serializacion_comprobantes_sucursal_id_fkey FOREIGN KEY (sucursal_id) REFERENCES public.sucursales(id)
);
CREATE TABLE public.stock (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_almacen bigint NOT NULL,
  id_producto bigint,
  stock numeric DEFAULT '0'::numeric,
  stock_minimo numeric DEFAULT '0'::numeric,
  ubicacion text DEFAULT '-'::text,
  CONSTRAINT stock_pkey PRIMARY KEY (id),
  CONSTRAINT stock_id_almacen_fkey FOREIGN KEY (id_almacen) REFERENCES public.almacen(id),
  CONSTRAINT stock_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.productos(id)
);
CREATE TABLE public.sucursales (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text,
  direccion_fiscal text,
  id_empresa bigint,
  delete boolean DEFAULT true,
  CONSTRAINT sucursales_pkey PRIMARY KEY (id),
  CONSTRAINT sucursales_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES public.empresa(id)
);
CREATE TABLE public.tipo_comprobantes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text NOT NULL,
  destino text,
  CONSTRAINT tipo_comprobantes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tipodocumento (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text NOT NULL DEFAULT ''::text,
  id_empresa bigint,
  CONSTRAINT tipodocumento_pkey PRIMARY KEY (id),
  CONSTRAINT tipodocumento_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES public.empresa(id)
);
CREATE TABLE public.usuarios (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombres text NOT NULL DEFAULT '-'::text,
  id_tipodocumento bigint,
  nro_doc text DEFAULT '-'::text,
  telefono text DEFAULT '-'::text,
  id_rol bigint,
  correo text DEFAULT '-'::text,
  fecharegistro date DEFAULT now(),
  estado text DEFAULT 'ACTIVO'::text,
  id_auth text UNIQUE,
  tema text DEFAULT 'light'::text,
  CONSTRAINT usuarios_pkey PRIMARY KEY (id),
  CONSTRAINT usuarios_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.roles(id)
);
CREATE TABLE public.ventas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  fecha timestamp without time zone NOT NULL DEFAULT now(),
  monto_total numeric DEFAULT '0'::numeric,
  total_impuestos numeric DEFAULT '0'::numeric,
  id_usuario bigint,
  saldo numeric DEFAULT '0'::numeric,
  pago_con numeric DEFAULT '0'::numeric,
  referencia_tarjeta text DEFAULT '-'::text,
  vuelto numeric DEFAULT '0'::numeric,
  cantidad_productos bigint DEFAULT '0'::bigint,
  sub_total numeric DEFAULT '0'::numeric,
  id_cliente bigint,
  id_sucursal bigint,
  id_empresa bigint,
  estado text DEFAULT 'pendiente'::text,
  valor_impuesto numeric DEFAULT '0'::numeric,
  id_cierre_caja bigint,
  nro_comprobante text DEFAULT gen_random_uuid(),
  CONSTRAINT ventas_pkey PRIMARY KEY (id),
  CONSTRAINT public_ventas_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES public.clientes_proveedores(id),
  CONSTRAINT ventas_id_cierre_caja_fkey FOREIGN KEY (id_cierre_caja) REFERENCES public.cierrecaja(id),
  CONSTRAINT ventas_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id)
);