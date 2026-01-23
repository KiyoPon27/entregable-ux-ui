package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tienda.posbackend.entities.Impresora;
import java.util.Optional;

public interface ImpresoraRepository extends JpaRepository<Impresora, Long> {
    Optional<Impresora> findByUsuarioId(Long usuarioId);
}
