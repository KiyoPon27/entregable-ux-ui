package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tienda.posbackend.entities.Impresora;
import java.util.List;
import java.util.Optional;

public interface ImpresoraRepository extends JpaRepository<Impresora, Long> {
    List<Impresora> findByCajaId(Long cajaId);
    Optional<Impresora> findByCajaIdAndEstadoTrue(Long cajaId);
}
