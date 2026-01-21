package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tienda.posbackend.entities.Compra;
import java.util.List;

public interface CompraRepository extends JpaRepository<Compra, Long> {
    // Listar todas las compras de una empresa
    List<Compra> findByEmpresaIdOrderByFechaRegistroDesc(Long empresaId);
    
    // Buscar por número de factura
    @Query("SELECT c FROM Compra c WHERE c.empresa.id = :empresaId AND c.numeroFactura LIKE %:numeroFactura%")
    List<Compra> buscarPorNumeroFactura(@Param("empresaId") Long empresaId, @Param("numeroFactura") String numeroFactura);
    
    // Buscar por proveedor (nombre o RUC)
    @Query("SELECT c FROM Compra c WHERE c.empresa.id = :empresaId AND (lower(c.proveedor.nombres) LIKE lower(concat('%', :query, '%')) OR c.proveedor.identificadorFiscal LIKE concat('%', :query, '%'))")
    List<Compra> buscarPorProveedor(@Param("empresaId") Long empresaId, @Param("query") String query);
    
    // Filtrar por estado
    List<Compra> findByEmpresaIdAndEstadoOrderByFechaRegistroDesc(Long empresaId, String estado);
    
    // Buscar por rango de fechas
    @Query("SELECT c FROM Compra c WHERE c.empresa.id = :empresaId AND c.fechaEmision BETWEEN :fechaInicio AND :fechaFin ORDER BY c.fechaRegistro DESC")
    List<Compra> buscarPorRangoFechas(@Param("empresaId") Long empresaId, @Param("fechaInicio") java.time.LocalDate fechaInicio, @Param("fechaFin") java.time.LocalDate fechaFin);
    
    // Verificar si existe número de factura
    boolean existsByEmpresaIdAndNumeroFactura(Long empresaId, String numeroFactura);
}