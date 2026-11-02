package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tienda.posbackend.entities.Empresa;
import java.util.List;
import java.util.Optional;

public interface EmpresaRepository extends JpaRepository<Empresa, Long> {
    Optional<Empresa> findByUsuarioId(Long idUsuario);
    Optional<Empresa> findFirstByOrderByIdAsc();
    Optional<Empresa> findByIdFiscal(String idFiscal);
    List<Empresa> findAllByHabilitada(Boolean habilitada);
}
