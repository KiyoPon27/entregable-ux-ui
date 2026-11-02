package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tienda.posbackend.entities.CierreCaja;
import java.util.List;
import java.util.Optional;

public interface CierreCajaRepository extends JpaRepository<CierreCaja, Long> {
    List<CierreCaja> findByUsuarioId(Long usuarioId);
    Optional<CierreCaja> findTopByUsuarioIdOrderByFechaInicioDesc(Long usuarioId);
    
    // Find all cierres for a specific caja
    List<CierreCaja> findByCajaId(Long cajaId);
    
    // Find open session for specific caja (Status=0 often means open?)
    // Actually user SQL says "where cierrecaja.estado = 0".
    Optional<CierreCaja> findByCajaIdAndEstado(Long cajaId, Long estado);

    // Find all open sessions for company
    // "mostrarcajasabiertasporempresa" -> inner join sucursales on id = caja.id_sucursal ... where sucursales.id_empresa = :empresaId
    @org.springframework.data.jpa.repository.Query("SELECT cc FROM CierreCaja cc WHERE cc.estado = 0 AND cc.caja.sucursal.empresa.id = :empresaId")
    List<CierreCaja> findAbiertasPorEmpresa(Long empresaId);
    
    Optional<CierreCaja> findByUsuarioIdAndEstado(Long usuarioId, Long estado);
    
    // Count cierres for a specific caja
    long countByCajaId(Long cajaId);
}
