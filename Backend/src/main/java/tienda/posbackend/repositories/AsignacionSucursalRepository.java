package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tienda.posbackend.entities.AsignacionSucursal;
import java.util.List;

public interface AsignacionSucursalRepository extends JpaRepository<AsignacionSucursal, Long> {
    List<AsignacionSucursal> findByUsuarioId(Long usuarioId);
    List<AsignacionSucursal> findByCajaId(Long cajaId);
}
