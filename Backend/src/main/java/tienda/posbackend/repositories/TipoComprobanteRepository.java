package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tienda.posbackend.entities.TipoComprobante;

import java.util.List;
import java.util.Optional;

@Repository
public interface TipoComprobanteRepository extends JpaRepository<TipoComprobante, Long> {
    List<TipoComprobante> findByDestino(String destino);
    Optional<TipoComprobante> findByNombreIgnoreCase(String nombre);
}
