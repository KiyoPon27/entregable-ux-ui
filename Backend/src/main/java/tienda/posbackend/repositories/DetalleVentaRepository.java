package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tienda.posbackend.models.DetalleVenta;

import java.util.List;
import java.util.Map;

/**
 * REPOSITORY: DetalleVentaRepository
 * 
 * QUERIES PRINCIPALES:
 * 1. Listar productos de una venta con información completa
 * 2. Calcular totales por venta
 * 3. Reportes de productos más vendidos
 */
public interface DetalleVentaRepository extends JpaRepository<DetalleVenta, Long> {

    /**
     * ============================================================
     * FUNCIÓN: mostrardetalleventa
     * ============================================================
     * 
     * Muestra los productos de una venta específica
     * 
     * POSTGRESQL ORIGINAL:
     * SELECT 
     *   dv.id,
     *   p.nombre AS producto,
     *   p.codigo AS codigo_producto,
     *   dv.cantidad,
     *   dv.precio_unitario,
     *   dv.subtotal
     * FROM detalle_venta dv
     * INNER JOIN productos p ON dv.id_producto = p.id
     * WHERE dv.id_venta = ?
     * ORDER BY dv.id ASC
     * 
     * @param idVenta - ID de la venta
     * @return Lista de productos vendidos con información completa
     */
    @Query(value = "SELECT " +
           "dv.id AS id, " +
           "p.nombre AS producto, " +
           "p.codigo AS codigoProducto, " +
           "dv.cantidad AS cantidad, " +
           "dv.precio_unitario AS precioUnitario, " +
           "dv.subtotal AS subtotal " +
           "FROM detalle_venta dv " +
           "INNER JOIN productos p ON dv.id_producto = p.id " +
           "WHERE dv.id_venta = :idVenta " +
           "ORDER BY dv.id ASC",
           nativeQuery = true)
    List<Map<String, Object>> mostrarDetallePorVenta(@Param("idVenta") Long idVenta);

    /**
     * LISTAR DETALLES POR VENTA
     * 
     * @param idVenta - ID de la venta
     * @return Lista de detalles
     */
    List<DetalleVenta> findByIdVenta(Long idVenta);

    /**
     * CALCULAR TOTAL DE UNA VENTA (SUMA DE SUBTOTALES)
     * 
     * @param idVenta - ID de la venta
     * @return Suma de subtotales
     */
    @Query("SELECT COALESCE(SUM(dv.subtotal), 0) FROM DetalleVenta dv WHERE dv.idVenta = :idVenta")
    java.math.BigDecimal calcularTotalVenta(@Param("idVenta") Long idVenta);

    /**
     * CONTAR PRODUCTOS EN UNA VENTA
     * 
     * @param idVenta - ID de la venta
     * @return Cantidad de productos diferentes
     */
    Long countByIdVenta(Long idVenta);

    /**
     * PRODUCTOS MÁS VENDIDOS (TOP N)
     * 
     * Para reportes y análisis
     * 
     * @param limite - Cantidad de resultados (ej: 10)
     * @return Lista con productos y cantidades vendidas
     */
    @Query(value = "SELECT " +
           "p.id AS idProducto, " +
           "p.nombre AS producto, " +
           "p.codigo AS codigo, " +
           "SUM(dv.cantidad) AS cantidadVendida, " +
           "SUM(dv.subtotal) AS totalVendido " +
           "FROM detalle_venta dv " +
           "INNER JOIN productos p ON dv.id_producto = p.id " +
           "GROUP BY p.id, p.nombre, p.codigo " +
           "ORDER BY cantidadVendida DESC " +
           "LIMIT :limite",
           nativeQuery = true)
    List<Map<String, Object>> productosTopVendidos(@Param("limite") int limite);

    /**
     * PRODUCTOS VENDIDOS EN UN PERÍODO
     * 
     * Con filtro de fechas (JOIN con ventas)
     * 
     * @param fechaInicio - Fecha inicial
     * @param fechaFin - Fecha final
     * @param limite - Cantidad de resultados
     * @return Lista de productos vendidos en el período
     */
    @Query(value = "SELECT " +
           "p.id AS idProducto, " +
           "p.nombre AS producto, " +
           "SUM(dv.cantidad) AS cantidadVendida, " +
           "SUM(dv.subtotal) AS totalVendido " +
           "FROM detalle_venta dv " +
           "INNER JOIN productos p ON dv.id_producto = p.id " +
           "INNER JOIN ventas v ON dv.id_venta = v.id " +
           "WHERE v.fecha_venta BETWEEN :fechaInicio AND :fechaFin " +
           "GROUP BY p.id, p.nombre " +
           "ORDER BY cantidadVendida DESC " +
           "LIMIT :limite",
           nativeQuery = true)
    List<Map<String, Object>> productosVendidosPeriodo(
        @Param("fechaInicio") String fechaInicio,
        @Param("fechaFin") String fechaFin,
        @Param("limite") int limite
    );

    /**
     * VERIFICAR SI UN PRODUCTO FUE VENDIDO
     * 
     * Útil antes de eliminar productos
     * 
     * @param idProducto - ID del producto
     * @return true si el producto tiene ventas
     */
    boolean existsByIdProducto(Long idProducto);

    /**
     * TOTAL VENDIDO DE UN PRODUCTO
     * 
     * @param idProducto - ID del producto
     * @return Cantidad total vendida
     */
    @Query("SELECT COALESCE(SUM(dv.cantidad), 0) FROM DetalleVenta dv WHERE dv.idProducto = :idProducto")
    Integer calcularTotalVendidoProducto(@Param("idProducto") Long idProducto);
}
