package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tienda.posbackend.entities.Venta;
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
}
