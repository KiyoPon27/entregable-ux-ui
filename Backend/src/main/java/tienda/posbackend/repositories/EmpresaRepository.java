package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tienda.posbackend.entities.Empresa;
import java.util.Optional;

public interface EmpresaRepository extends JpaRepository<Empresa, Long> {
    Optional<Empresa> findByUsuarioId(Long idUsuario);
}
