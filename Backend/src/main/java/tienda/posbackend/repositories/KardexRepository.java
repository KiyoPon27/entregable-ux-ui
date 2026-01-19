package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tienda.posbackend.entities.Kardex;
import java.util.List;

public interface KardexRepository extends JpaRepository<Kardex, Long> {
    List<Kardex> findByProductoId(Long productoId);
}
