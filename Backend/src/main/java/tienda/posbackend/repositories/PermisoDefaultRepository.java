package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tienda.posbackend.entities.PermisoDefault;

import java.util.List;

public interface PermisoDefaultRepository extends JpaRepository<PermisoDefault, Long> {
    List<PermisoDefault> findByRolId(Long rolId);
}
