package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tienda.posbackend.entities.SerializacionComprobante;

import java.util.List;
import java.util.Optional;

@Repository
public interface SerializacionComprobanteRepository extends JpaRepository<SerializacionComprobante, Long> {
    List<SerializacionComprobante> findBySucursalId(Long sucursalId);
    
    @Query("SELECT s FROM SerializacionComprobante s WHERE s.sucursal.empresa.id = :empresaId ORDER BY s.sucursal.id, s.id ASC")
    List<SerializacionComprobante> findByEmpresaId(@Param("empresaId") Long empresaId);
    
    @Query("SELECT s FROM SerializacionComprobante s WHERE s.sucursal.id = :sucursalId AND s.tipoComprobante.destino = :destino ORDER BY s.porDefecto DESC, s.id ASC")
    List<SerializacionComprobante> findBySucursalIdAndDestino(@Param("sucursalId") Long sucursalId, @Param("destino") String destino);
    
    Optional<SerializacionComprobante> findBySucursalIdAndPorDefectoTrue(Long sucursalId);
    
    Optional<SerializacionComprobante> findBySerieAndSucursalId(String serie, Long sucursalId);

    Optional<SerializacionComprobante> findByTipoComprobanteIdAndSerieAndSucursalId(Long tipoComprobanteId, String serie, Long sucursalId);
    
    @Modifying
    @Query("UPDATE SerializacionComprobante s SET s.porDefecto = false WHERE s.sucursal.id = :sucursalId")
    void desmarcarTodosPorDefecto(@Param("sucursalId") Long sucursalId);
}
