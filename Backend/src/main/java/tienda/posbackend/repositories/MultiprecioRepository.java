package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tienda.posbackend.entities.Multiprecio;
import java.util.List;

public interface MultiprecioRepository extends JpaRepository<Multiprecio, Long> {
    List<Multiprecio> findByProducto_Id(Long productoId);
    
    List<Multiprecio> findByProducto_IdOrderByCantidadAsc(Long productoId);
}
