package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tienda.posbackend.entities.AsignacionSucursal;
import java.util.Optional;

public interface AsignacionSucursalRepository extends JpaRepository<AsignacionSucursal, Long> {
    Optional<AsignacionSucursal> findByUsuarioId(Long usuarioId);
}
