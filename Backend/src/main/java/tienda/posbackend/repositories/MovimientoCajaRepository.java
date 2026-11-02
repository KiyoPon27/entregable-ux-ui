package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tienda.posbackend.entities.MovimientoCaja;
import java.util.List;

public interface MovimientoCajaRepository extends JpaRepository<MovimientoCaja, Long> {

    // Sumar ventas por método de pago para un cierre de caja
    @Query("SELECT mp.nombre, COALESCE(SUM(mc.monto), 0) " +
           "FROM MovimientoCaja mc " +
           "JOIN mc.metodoPago mp " +
           "WHERE mc.cierreCaja.id = :idCierreCaja " +
           "AND mc.tipoMovimiento = 'VENTA' " +
           "GROUP BY mp.nombre")
    List<Object[]> sumVentasPorMetodoPago(@Param("idCierreCaja") Long idCierreCaja);
    List<MovimientoCaja> findByCierreCajaId(Long cierreCajaId);
    
    @Query("SELECT mc.tipoMovimiento, SUM(mc.monto) " +
           "FROM MovimientoCaja mc " +
           "JOIN mc.metodoPago mp " +
           "WHERE mc.cierreCaja.id = :idCierreCaja " +
           "AND mp.nombre = 'Efectivo' " +
           "AND mc.venta IS NULL " +
           "GROUP BY mc.tipoMovimiento")
    List<Object[]> findEfectivoSinVentasPorCierre(@Param("idCierreCaja") Long idCierreCaja);
    
    @Query("SELECT mc FROM MovimientoCaja mc " +
           "INNER JOIN FETCH mc.cierreCaja cc " +
           "INNER JOIN FETCH cc.caja c " +
           "INNER JOIN FETCH c.sucursal s " +
           "LEFT JOIN FETCH mc.usuario u " +
           "LEFT JOIN FETCH mc.metodoPago mp " +
           "WHERE s.empresa.id = :idEmpresa " +
           "ORDER BY mc.fechaMovimiento DESC")
    List<MovimientoCaja> findByEmpresaIdOrderByFechaDesc(@Param("idEmpresa") Long idEmpresa);
    
    @Query("SELECT mc FROM MovimientoCaja mc " +
           "LEFT JOIN FETCH mc.metodoPago mp " +
           "WHERE mc.venta.id = :idVenta")
    List<MovimientoCaja> findByVentaId(@Param("idVenta") Long idVenta);
    
    MovimientoCaja findFirstByVentaIdAndTipoMovimiento(Long ventaId, String tipoMovimiento);
}
