package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tienda.posbackend.entities.Modulo;

public interface ModuloRepository extends JpaRepository<Modulo, Long> {
}
