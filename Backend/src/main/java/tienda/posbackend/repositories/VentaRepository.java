package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tienda.posbackend.entities.Venta;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface VentaRepository extends JpaRepository<Venta, Long> {
    List<Venta> findByEmpresaId(Long empresaId);
    List<Venta> findByUsuarioId(Long usuarioId);
    List<Venta> findBySucursalId(Long sucursalId);
    
    Optional<Venta> findBySucursalIdAndEstado(Long sucursalId, String estado);
    
    // Find all ventas for specific cierre caja
    List<Venta> findByCierreCajaId(Long cierreCajaId);
    
    void deleteByEstadoAndUsuarioIdAndCierreCajaId(String estado, Long usuarioId, Long cierreCajaId);
    
    // Filtrar ventas confirmadas por empresa, tipo de comprobante y fecha
    @Query("SELECT DISTINCT v FROM Venta v " +
           "LEFT JOIN FETCH v.cliente c " +
           "LEFT JOIN FETCH v.usuario u " +
           "LEFT JOIN FETCH v.empresa e " +
           "WHERE v.empresa.id = :empresaId " +
           "AND v.estado = 'confirmada' " +
           "AND (:tipo IS NULL OR v.tipoComprobante = :tipo) " +
           "AND (:fechaInicio IS NULL OR v.fecha >= :fechaInicio) " +
           "AND (:fechaFin IS NULL OR v.fecha <= :fechaFin) " +
           "AND (:buscador IS NULL OR v.nroComprobante LIKE CONCAT('%', :buscador, '%') OR c.nombres LIKE CONCAT('%', :buscador, '%')) " +
           "ORDER BY v.fecha DESC")
    List<Venta> findFacturasConFiltros(@Param("empresaId") Long empresaId,
                                       @Param("tipo") String tipo,
                                       @Param("fechaInicio") LocalDateTime fechaInicio,
                                       @Param("fechaFin") LocalDateTime fechaFin,
                                       @Param("buscador") String buscador);
    
    // Contar ventas por tipo de comprobante
    @Query("SELECT COUNT(v) FROM Venta v WHERE v.empresa.id = :empresaId " +
           "AND v.estado = 'confirmada' " +
           "AND v.tipoComprobante = :tipo " +
           "AND (:fechaInicio IS NULL OR v.fecha >= :fechaInicio) " +
           "AND (:fechaFin IS NULL OR v.fecha <= :fechaFin)")
    Long countByTipoComprobante(@Param("empresaId") Long empresaId,
                                @Param("tipo") String tipo,
                                @Param("fechaInicio") LocalDateTime fechaInicio,
                                @Param("fechaFin") LocalDateTime fechaFin);
    
    // Sumar total de ventas por tipo de comprobante
    @Query("SELECT COALESCE(SUM(v.montoTotal), 0) FROM Venta v WHERE v.empresa.id = :empresaId " +
           "AND v.estado = 'confirmada' " +
           "AND v.tipoComprobante = :tipo " +
           "AND (:fechaInicio IS NULL OR v.fecha >= :fechaInicio) " +
           "AND (:fechaFin IS NULL OR v.fecha <= :fechaFin)")
    BigDecimal sumTotalByTipoComprobante(@Param("empresaId") Long empresaId,
                                         @Param("tipo") String tipo,
                                         @Param("fechaInicio") LocalDateTime fechaInicio,
                                         @Param("fechaFin") LocalDateTime fechaFin);
    
    // Sumar total de todas las ventas confirmadas
    @Query("SELECT COALESCE(SUM(v.montoTotal), 0) FROM Venta v WHERE v.empresa.id = :empresaId " +
           "AND v.estado = 'confirmada' " +
           "AND (:fechaInicio IS NULL OR v.fecha >= :fechaInicio) " +
           "AND (:fechaFin IS NULL OR v.fecha <= :fechaFin)")
    BigDecimal sumTotalVentas(@Param("empresaId") Long empresaId,
                              @Param("fechaInicio") LocalDateTime fechaInicio,
                              @Param("fechaFin") LocalDateTime fechaFin);
}
