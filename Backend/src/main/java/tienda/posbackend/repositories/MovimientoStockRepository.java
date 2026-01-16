package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tienda.posbackend.models.MovimientoStock;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * REPOSITORY: MovimientoStockRepository
 * 
 * QUERIES PRINCIPALES:
 * 1. Listar movimientos por stock/producto
 * 2. Filtrar por tipo de movimiento y fechas
 * 3. Reportes de entradas/salidas
 * 4. Auditoría de cambios
 */
public interface MovimientoStockRepository extends JpaRepository<MovimientoStock, Long> {

    /**
     * ============================================================
     * FUNCIÓN: mostrarmovimientosstock
     * ============================================================
     * 
     * Muestra historial de movimientos de un producto en un almacén
     * 
     * POSTGRESQL ORIGINAL:
     * SELECT 
     *   ms.id,
     *   ms.tipo_movimiento,
     *   ms.cantidad,
     *   ms.cantidad_anterior,
     *   ms.cantidad_nueva,
     *   ms.motivo,
     *   ms.fecha_movimiento,
     *   u.nombres AS usuario
     * FROM movimientos_stock ms
     * INNER JOIN stock s ON ms.id_stock = s.id
     * LEFT JOIN usuarios u ON ms.id_usuario = u.id
     * WHERE s.id_producto = ? AND s.id_almacen = ?
     * ORDER BY ms.fecha_movimiento DESC
     * 
     * @param idProducto - ID del producto
     * @param idAlmacen - ID del almacén
     * @return Lista de movimientos con información del usuario
     */
    @Query(value = "SELECT " +
           "ms.id AS id, " +
           "ms.tipo_movimiento AS tipoMovimiento, " +
           "ms.cantidad AS cantidad, " +
           "ms.cantidad_anterior AS cantidadAnterior, " +
           "ms.cantidad_nueva AS cantidadNueva, " +
           "ms.motivo AS motivo, " +
           "ms.precio_unitario AS precioUnitario, " +
           "ms.fecha_movimiento AS fechaMovimiento, " +
           "u.nombres AS usuario " +
           "FROM movimientos_stock ms " +
           "INNER JOIN stock s ON ms.id_stock = s.id " +
           "LEFT JOIN usuarios u ON ms.id_usuario = u.id " +
           "WHERE s.id_producto = :idProducto AND s.id_almacen = :idAlmacen " +
           "ORDER BY ms.fecha_movimiento DESC",
           nativeQuery = true)
    List<Map<String, Object>> mostrarMovimientosPorProductoAlmacen(
        @Param("idProducto") Long idProducto,
        @Param("idAlmacen") Long idAlmacen
    );

    /**
     * LISTAR MOVIMIENTOS POR ID DE STOCK
     * 
     * @param idStock - ID del registro de stock
     * @return Lista de movimientos ordenados por fecha descendente
     */
    List<MovimientoStock> findByIdStockOrderByFechaMovimientoDesc(Long idStock);

    /**
     * LISTAR MOVIMIENTOS POR TIPO
     * 
     * @param tipoMovimiento - ENTRADA, SALIDA, AJUSTE, TRANSFERENCIA
     * @return Lista de movimientos del tipo especificado
     */
    List<MovimientoStock> findByTipoMovimientoOrderByFechaMovimientoDesc(String tipoMovimiento);

    /**
     * LISTAR MOVIMIENTOS POR RANGO DE FECHAS
     * 
     * Útil para reportes mensuales/semanales
     * 
     * @param fechaInicio - Fecha inicial
     * @param fechaFin - Fecha final
     * @return Lista de movimientos en el rango
     */
    @Query("SELECT ms FROM MovimientoStock ms WHERE ms.fechaMovimiento BETWEEN :fechaInicio AND :fechaFin " +
           "ORDER BY ms.fechaMovimiento DESC")
    List<MovimientoStock> findByFechaMovimientoBetween(
        @Param("fechaInicio") LocalDateTime fechaInicio,
        @Param("fechaFin") LocalDateTime fechaFin
    );

    /**
     * LISTAR MOVIMIENTOS POR USUARIO
     * 
     * Auditoría de qué usuario hizo qué cambios
     * 
     * @param idUsuario - ID del usuario
     * @return Lista de movimientos del usuario
     */
    List<MovimientoStock> findByIdUsuarioOrderByFechaMovimientoDesc(Long idUsuario);

    /**
     * LISTAR MOVIMIENTOS POR VENTA
     * 
     * Muestra todos los productos vendidos en una venta específica
     * 
     * @param idVenta - ID de la venta
     * @return Lista de movimientos asociados a la venta
     */
    List<MovimientoStock> findByIdVenta(Long idVenta);

    /**
     * CALCULAR TOTAL DE ENTRADAS EN UN PERÍODO
     * 
     * @param idStock - ID del stock
     * @param fechaInicio - Fecha inicial
     * @param fechaFin - Fecha final
     * @return Suma de cantidades de entradas
     */
    @Query("SELECT COALESCE(SUM(ms.cantidad), 0) FROM MovimientoStock ms " +
           "WHERE ms.idStock = :idStock " +
           "AND ms.tipoMovimiento = 'ENTRADA' " +
           "AND ms.fechaMovimiento BETWEEN :fechaInicio AND :fechaFin")
    Integer calcularEntradasPeriodo(
        @Param("idStock") Long idStock,
        @Param("fechaInicio") LocalDateTime fechaInicio,
        @Param("fechaFin") LocalDateTime fechaFin
    );

    /**
     * CALCULAR TOTAL DE SALIDAS EN UN PERÍODO
     * 
     * @param idStock - ID del stock
     * @param fechaInicio - Fecha inicial
     * @param fechaFin - Fecha final
     * @return Suma de cantidades de salidas
     */
    @Query("SELECT COALESCE(SUM(ms.cantidad), 0) FROM MovimientoStock ms " +
           "WHERE ms.idStock = :idStock " +
           "AND ms.tipoMovimiento = 'SALIDA' " +
           "AND ms.fechaMovimiento BETWEEN :fechaInicio AND :fechaFin")
    Integer calcularSalidasPeriodo(
        @Param("idStock") Long idStock,
        @Param("fechaInicio") LocalDateTime fechaInicio,
        @Param("fechaFin") LocalDateTime fechaFin
    );

    /**
     * ÚLTIMO MOVIMIENTO DE UN STOCK
     * 
     * @param idStock - ID del stock
     * @return Último movimiento registrado
     */
    @Query("SELECT ms FROM MovimientoStock ms WHERE ms.idStock = :idStock " +
           "ORDER BY ms.fechaMovimiento DESC LIMIT 1")
    MovimientoStock findUltimoMovimiento(@Param("idStock") Long idStock);

    /**
     * CONTAR MOVIMIENTOS POR TIPO EN UN PERÍODO
     * 
     * @param tipoMovimiento - ENTRADA, SALIDA, etc.
     * @param fechaInicio - Fecha inicial
     * @param fechaFin - Fecha final
     * @return Cantidad de movimientos
     */
    @Query("SELECT COUNT(ms) FROM MovimientoStock ms " +
           "WHERE ms.tipoMovimiento = :tipoMovimiento " +
           "AND ms.fechaMovimiento BETWEEN :fechaInicio AND :fechaFin")
    Long contarMovimientosPorTipo(
        @Param("tipoMovimiento") String tipoMovimiento,
        @Param("fechaInicio") LocalDateTime fechaInicio,
        @Param("fechaFin") LocalDateTime fechaFin
    );
}
