package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tienda.posbackend.models.Venta;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * REPOSITORY: VentaRepository
 * 
 * QUERIES PRINCIPALES:
 * 1. Listar ventas con información completa (JOIN con usuarios, clientes, métodos de pago)
 * 2. Filtrar por fecha, sucursal, caja, usuario
 * 3. Calcular totales y estadísticas
 * 4. Reportes de ventas
 */
public interface VentaRepository extends JpaRepository<Venta, Long> {

    /**
     * ============================================================
     * FUNCIÓN: mostrarventas
     * ============================================================
     * 
     * Muestra ventas con información relacionada
     * 
     * POSTGRESQL ORIGINAL:
     * SELECT 
     *   v.id,
     *   v.fecha_venta,
     *   u.nombres AS usuario,
     *   c.nombres AS cliente,
     *   v.subtotal,
     *   v.descuento,
     *   v.impuesto,
     *   v.total,
     *   v.estado,
     *   mp.nombre AS metodo_pago
     * FROM ventas v
     * INNER JOIN usuarios u ON v.id_usuario = u.id
     * LEFT JOIN clientes_proveedores c ON v.id_cliente = c.id
     * INNER JOIN metodos_pago mp ON v.id_metodo_pago = mp.id
     * WHERE v.id_sucursal = ? AND v.id_caja = ?
     * ORDER BY v.fecha_venta DESC
     * 
     * @param idSucursal - ID de la sucursal
     * @param idCaja - ID de la caja
     * @return Lista de ventas con información completa
     */
    @Query(value = "SELECT " +
           "v.id AS id, " +
           "v.fecha_venta AS fechaVenta, " +
           "u.nombres AS usuario, " +
           "COALESCE(c.nombres, 'Cliente General') AS cliente, " +
           "v.subtotal AS subtotal, " +
           "v.descuento AS descuento, " +
           "v.impuesto AS impuesto, " +
           "v.total AS total, " +
           "v.estado AS estado, " +
           "mp.nombre AS metodoPago " +
           "FROM ventas v " +
           "INNER JOIN usuarios u ON v.id_usuario = u.id " +
           "LEFT JOIN clientes_proveedores c ON v.id_cliente = c.id " +
           "INNER JOIN metodos_pago mp ON v.id_metodo_pago = mp.id " +
           "WHERE v.id_sucursal = :idSucursal AND v.id_caja = :idCaja " +
           "ORDER BY v.fecha_venta DESC",
           nativeQuery = true)
    List<Map<String, Object>> mostrarVentasPorSucursalCaja(
        @Param("idSucursal") Long idSucursal,
        @Param("idCaja") Long idCaja
    );

    /**
     * LISTAR VENTAS POR SUCURSAL
     * 
     * @param idSucursal - ID de la sucursal
     * @return Lista de ventas ordenadas por fecha descendente
     */
    List<Venta> findByIdSucursalOrderByFechaVentaDesc(Long idSucursal);

    /**
     * LISTAR VENTAS POR USUARIO (CAJERO)
     * 
     * @param idUsuario - ID del usuario
     * @return Lista de ventas del usuario
     */
    List<Venta> findByIdUsuarioOrderByFechaVentaDesc(Long idUsuario);

    /**
     * LISTAR VENTAS POR CLIENTE
     * 
     * Historial de compras de un cliente
     * 
     * @param idCliente - ID del cliente
     * @return Lista de ventas del cliente
     */
    List<Venta> findByIdClienteOrderByFechaVentaDesc(Long idCliente);

    /**
     * LISTAR VENTAS POR RANGO DE FECHAS
     * 
     * Para reportes diarios, semanales, mensuales
     * 
     * @param fechaInicio - Fecha inicial
     * @param fechaFin - Fecha final
     * @return Lista de ventas en el rango
     */
    @Query("SELECT v FROM Venta v WHERE v.fechaVenta BETWEEN :fechaInicio AND :fechaFin " +
           "ORDER BY v.fechaVenta DESC")
    List<Venta> findByFechaVentaBetween(
        @Param("fechaInicio") LocalDateTime fechaInicio,
        @Param("fechaFin") LocalDateTime fechaFin
    );

    /**
     * LISTAR VENTAS POR RANGO DE FECHAS Y SUCURSAL
     * 
     * @param idSucursal - ID de la sucursal
     * @param fechaInicio - Fecha inicial
     * @param fechaFin - Fecha final
     * @return Lista de ventas
     */
    @Query("SELECT v FROM Venta v WHERE v.idSucursal = :idSucursal " +
           "AND v.fechaVenta BETWEEN :fechaInicio AND :fechaFin " +
           "ORDER BY v.fechaVenta DESC")
    List<Venta> findByIdSucursalAndFechaVentaBetween(
        @Param("idSucursal") Long idSucursal,
        @Param("fechaInicio") LocalDateTime fechaInicio,
        @Param("fechaFin") LocalDateTime fechaFin
    );

    /**
     * CALCULAR TOTAL DE VENTAS EN UN PERÍODO
     * 
     * Suma todos los totales de ventas completadas
     * 
     * @param fechaInicio - Fecha inicial
     * @param fechaFin - Fecha final
     * @return Total de ventas (0 si no hay)
     */
    @Query("SELECT COALESCE(SUM(v.total), 0) FROM Venta v " +
           "WHERE v.estado = 'COMPLETADA' " +
           "AND v.fechaVenta BETWEEN :fechaInicio AND :fechaFin")
    java.math.BigDecimal calcularTotalVentasPeriodo(
        @Param("fechaInicio") LocalDateTime fechaInicio,
        @Param("fechaFin") LocalDateTime fechaFin
    );

    /**
     * CALCULAR TOTAL DE VENTAS POR SUCURSAL EN UN PERÍODO
     * 
     * @param idSucursal - ID de la sucursal
     * @param fechaInicio - Fecha inicial
     * @param fechaFin - Fecha final
     * @return Total de ventas
     */
    @Query("SELECT COALESCE(SUM(v.total), 0) FROM Venta v " +
           "WHERE v.idSucursal = :idSucursal " +
           "AND v.estado = 'COMPLETADA' " +
           "AND v.fechaVenta BETWEEN :fechaInicio AND :fechaFin")
    java.math.BigDecimal calcularTotalVentasSucursalPeriodo(
        @Param("idSucursal") Long idSucursal,
        @Param("fechaInicio") LocalDateTime fechaInicio,
        @Param("fechaFin") LocalDateTime fechaFin
    );

    /**
     * CONTAR VENTAS EN UN PERÍODO
     * 
     * @param fechaInicio - Fecha inicial
     * @param fechaFin - Fecha final
     * @return Cantidad de ventas
     */
    @Query("SELECT COUNT(v) FROM Venta v " +
           "WHERE v.estado = 'COMPLETADA' " +
           "AND v.fechaVenta BETWEEN :fechaInicio AND :fechaFin")
    Long contarVentasPeriodo(
        @Param("fechaInicio") LocalDateTime fechaInicio,
        @Param("fechaFin") LocalDateTime fechaFin
    );

    /**
     * LISTAR VENTAS POR ESTADO
     * 
     * @param estado - COMPLETADA, ANULADA, PENDIENTE
     * @return Lista de ventas con ese estado
     */
    List<Venta> findByEstadoOrderByFechaVentaDesc(String estado);

    /**
     * VENTAS DEL DÍA POR CAJA
     * 
     * Para cierre de caja
     * 
     * @param idCaja - ID de la caja
     * @param fechaInicio - Inicio del día
     * @param fechaFin - Fin del día
     * @return Lista de ventas del día
     */
    @Query("SELECT v FROM Venta v WHERE v.idCaja = :idCaja " +
           "AND v.fechaVenta BETWEEN :fechaInicio AND :fechaFin " +
           "ORDER BY v.fechaVenta ASC")
    List<Venta> findVentasDiaPorCaja(
        @Param("idCaja") Long idCaja,
        @Param("fechaInicio") LocalDateTime fechaInicio,
        @Param("fechaFin") LocalDateTime fechaFin
    );
}
