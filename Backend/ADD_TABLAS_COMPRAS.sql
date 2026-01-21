-- =====================================================
-- AGREGAR TABLAS DE COMPRAS Y DETALLE_COMPRA
-- Fecha: 20 de enero de 2026
-- =====================================================
-- Este script agrega las tablas necesarias para el módulo
-- de compras a proveedores
-- =====================================================

USE LT_Sanchez;

SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 1. CREAR TABLA COMPRAS
-- =====================================================
-- Tabla para registrar las compras a proveedores

CREATE TABLE IF NOT EXISTS compras (
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
  CONSTRAINT compras_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES empresa(id),
  CONSTRAINT compras_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
  INDEX idx_compras_empresa (id_empresa),
  INDEX idx_compras_proveedor (id_proveedor),
  INDEX idx_compras_estado (estado),
  INDEX idx_compras_numero_factura (numero_factura)
);

-- =====================================================
-- 2. CREAR TABLA DETALLE_COMPRA
-- =====================================================
-- Tabla para el detalle de productos en cada compra

CREATE TABLE IF NOT EXISTS detalle_compra (
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
);

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Verificar que las tablas se crearon correctamente

SELECT 
    'compras' as tabla,
    COUNT(*) as total_registros
FROM compras

UNION ALL

SELECT 
    'detalle_compra' as tabla,
    COUNT(*) as total_registros
FROM detalle_compra;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. La tabla COMPRAS almacena la información general de cada compra:
--    - Número de factura del proveedor
--    - Fecha de emisión
--    - Proveedor
--    - Método de pago utilizado
--    - Tipo de comprobante
--    - Estado: INCOMPLETO (pendiente de recibir) o COMPLETO (recibido)
--    - Monto total
--
-- 2. La tabla DETALLE_COMPRA almacena los productos de cada compra:
--    - Cantidad esperada (lo que se ordenó)
--    - Cantidad recibida (lo que llegó realmente)
--    - Precio de compra por unidad
--    - Subtotal
--
-- 3. El campo 'estado' en compras permite controlar:
--    - INCOMPLETO: La compra fue registrada pero aún no se recibieron los productos
--    - COMPLETO: Los productos ya fueron recibidos y el stock fue actualizado
--
-- 4. La relación ON DELETE CASCADE en detalle_compra asegura que
--    al eliminar una compra, también se eliminen sus detalles
--
-- 5. Los índices creados mejoran el rendimiento de consultas frecuentes:
--    - Búsqueda por empresa
--    - Búsqueda por proveedor
--    - Filtrado por estado
--    - Búsqueda por número de factura
-- =====================================================
