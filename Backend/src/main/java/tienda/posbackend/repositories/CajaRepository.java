package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tienda.posbackend.entities.Caja;
import java.util.List;

public interface CajaRepository extends JpaRepository<Caja, Long> {
    List<Caja> findBySucursalId(Long sucursalId);
}
