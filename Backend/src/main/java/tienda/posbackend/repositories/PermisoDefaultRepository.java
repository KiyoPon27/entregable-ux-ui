package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tienda.posbackend.entities.PermisoDefault;
import tienda.posbackend.entities.Rol;
import tienda.posbackend.entities.Modulo;

import java.util.List;
import java.util.Optional;

public interface PermisoDefaultRepository extends JpaRepository<PermisoDefault, Long> {
    List<PermisoDefault> findByRolId(Long rolId);
    Optional<PermisoDefault> findByRolAndModulo(Rol rol, Modulo modulo);
}
