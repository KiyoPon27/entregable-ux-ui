package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tienda.posbackend.models.MovimientoCaja;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * REPOSITORY: MovimientoCajaRepository
 * 
 * QUERIES PRINCIPALES:
 * 1. Listar movimientos de una caja
 * 2. Calcular saldo actual de caja
 * 3. Reportes de ingresos/egresos
 * 4. Cierre de caja (resumen del día)
 */
public interface MovimientoCajaRepository extends JpaRepository<MovimientoCaja, Long> {

    /**
     * ============================================================
     * FUNCIÓN: mostrarmovimientoscaja
     * ============================================================
     * 
     * Muestra movimientos de una caja con información del usuario
     * 
     * POSTGRESQL ORIGINAL:
     * SELECT 
     *   mc.id,
     *   mc.tipo_movimiento,
     *   mc.monto,
     *   mc.saldo_anterior,
     *   mc.saldo_nuevo,
     *   mc.descripcion,
     *   mc.fecha_movimiento,
     *   u.nombres AS usuario
     * FROM movimientos_caja mc
     * INNER JOIN usuarios u ON mc.id_usuario = u.id
     * WHERE mc.id_caja = ?
     * ORDER BY mc.fecha_movimiento DESC
     * 
     * @param idCaja - ID de la caja
     * @return Lista de movimientos con información completa
     */
    @Query(value = "SELECT " +
           "mc.id AS id, " +
           "mc.tipo_movimiento AS tipoMovimiento, " +
           "mc.monto AS monto, " +
           "mc.saldo_anterior AS saldoAnterior, " +
           "mc.saldo_nuevo AS saldoNuevo, " +
           "mc.descripcion AS descripcion, " +
           "mc.fecha_movimiento AS fechaMovimiento, " +
           "u.nombres AS usuario " +
           "FROM movimientos_caja mc " +
           "INNER JOIN usuarios u ON mc.id_usuario = u.id " +
           "WHERE mc.id_caja = :idCaja " +
           "ORDER BY mc.fecha_movimiento DESC",
           nativeQuery = true)
    List<Map<String, Object>> mostrarMovimientosPorCaja(@Param("idCaja") Long idCaja);

    /**
     * LISTAR MOVIMIENTOS POR CAJA
     * 
     * @param idCaja - ID de la caja
     * @return Lista de movimientos ordenados por fecha descendente
     */
    List<MovimientoCaja> findByIdCajaOrderByFechaMovimientoDesc(Long idCaja);

    /**
     * CALCULAR SALDO ACTUAL DE CAJA
     * 
     * Obtiene el saldo_nuevo del último movimiento
     * 
     * @param idCaja - ID de la caja
     * @return Saldo actual (0 si no hay movimientos)
     */
    @Query("SELECT COALESCE(mc.saldoNuevo, 0) FROM MovimientoCaja mc " +
           "WHERE mc.idCaja = :idCaja " +
           "ORDER BY mc.fechaMovimiento DESC LIMIT 1")
    BigDecimal calcularSaldoActual(@Param("idCaja") Long idCaja);

    /**
     * ÚLTIMO MOVIMIENTO DE UNA CAJA
     * 
     * @param idCaja - ID de la caja
     * @return Último movimiento registrado
     */
    @Query("SELECT mc FROM MovimientoCaja mc WHERE mc.idCaja = :idCaja " +
           "ORDER BY mc.fechaMovimiento DESC LIMIT 1")
    MovimientoCaja findUltimoMovimiento(@Param("idCaja") Long idCaja);

    /**
     * MOVIMIENTOS POR RANGO DE FECHAS
     * 
     * Para reportes diarios, semanales, mensuales
     * 
     * @param idCaja - ID de la caja
     * @param fechaInicio - Fecha inicial
     * @param fechaFin - Fecha final
     * @return Lista de movimientos en el rango
     */
    @Query("SELECT mc FROM MovimientoCaja mc WHERE mc.idCaja = :idCaja " +
           "AND mc.fechaMovimiento BETWEEN :fechaInicio AND :fechaFin " +
           "ORDER BY mc.fechaMovimiento ASC")
    List<MovimientoCaja> findByIdCajaAndFechaMovimientoBetween(
        @Param("idCaja") Long idCaja,
        @Param("fechaInicio") LocalDateTime fechaInicio,
        @Param("fechaFin") LocalDateTime fechaFin
    );

    /**
     * CALCULAR TOTAL INGRESOS EN UN PERÍODO
     * 
     * Suma todos los movimientos de tipo VENTA, INGRESO, APERTURA
     * 
     * @param idCaja - ID de la caja
     * @param fechaInicio - Fecha inicial
     * @param fechaFin - Fecha final
     * @return Total de ingresos
     */
    @Query("SELECT COALESCE(SUM(mc.monto), 0) FROM MovimientoCaja mc " +
           "WHERE mc.idCaja = :idCaja " +
           "AND mc.tipoMovimiento IN ('VENTA', 'INGRESO', 'APERTURA') " +
           "AND mc.fechaMovimiento BETWEEN :fechaInicio AND :fechaFin")
    BigDecimal calcularIngresosPeriodo(
        @Param("idCaja") Long idCaja,
        @Param("fechaInicio") LocalDateTime fechaInicio,
        @Param("fechaFin") LocalDateTime fechaFin
    );

    /**
     * CALCULAR TOTAL EGRESOS EN UN PERÍODO
     * 
     * Suma todos los movimientos de tipo EGRESO, ANULACION
     * 
     * @param idCaja - ID de la caja
     * @param fechaInicio - Fecha inicial
     * @param fechaFin - Fecha final
     * @return Total de egresos
     */
    @Query("SELECT COALESCE(SUM(mc.monto), 0) FROM MovimientoCaja mc " +
           "WHERE mc.idCaja = :idCaja " +
           "AND mc.tipoMovimiento IN ('EGRESO', 'ANULACION') " +
           "AND mc.fechaMovimiento BETWEEN :fechaInicio AND :fechaFin")
    BigDecimal calcularEgresosPeriodo(
        @Param("idCaja") Long idCaja,
        @Param("fechaInicio") LocalDateTime fechaInicio,
        @Param("fechaFin") LocalDateTime fechaFin
    );

    /**
     * CONTAR VENTAS DEL DÍA
     * 
     * @param idCaja - ID de la caja
     * @param fechaInicio - Inicio del día
     * @param fechaFin - Fin del día
     * @return Cantidad de ventas
     */
    @Query("SELECT COUNT(mc) FROM MovimientoCaja mc " +
           "WHERE mc.idCaja = :idCaja " +
           "AND mc.tipoMovimiento = 'VENTA' " +
           "AND mc.fechaMovimiento BETWEEN :fechaInicio AND :fechaFin")
    Long contarVentasDia(
        @Param("idCaja") Long idCaja,
        @Param("fechaInicio") LocalDateTime fechaInicio,
        @Param("fechaFin") LocalDateTime fechaFin
    );

    /**
     * MOVIMIENTOS POR TIPO
     * 
     * @param idCaja - ID de la caja
     * @param tipoMovimiento - VENTA, APERTURA, CIERRE, INGRESO, EGRESO, ANULACION
     * @return Lista de movimientos del tipo especificado
     */
    List<MovimientoCaja> findByIdCajaAndTipoMovimientoOrderByFechaMovimientoDesc(
        Long idCaja, 
        String tipoMovimiento
    );

    /**
     * MOVIMIENTOS POR USUARIO
     * 
     * Auditoría de movimientos de un cajero
     * 
     * @param idUsuario - ID del usuario
     * @return Lista de movimientos del usuario
     */
    List<MovimientoCaja> findByIdUsuarioOrderByFechaMovimientoDesc(Long idUsuario);

    /**
     * MOVIMIENTO POR VENTA
     * 
     * @param idVenta - ID de la venta
     * @return Movimiento asociado a la venta
     */
    MovimientoCaja findByIdVenta(Long idVenta);
}
