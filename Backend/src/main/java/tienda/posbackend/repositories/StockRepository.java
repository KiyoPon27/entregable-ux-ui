package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tienda.posbackend.entities.Stock;
import java.util.List;

public interface StockRepository extends JpaRepository<Stock, Long> {
    List<Stock> findByAlmacenId(Long idAlmacen);
    List<Stock> findByProductoId(Long idProducto);
    Stock findByProductoIdAndAlmacenId(Long idProducto, Long idAlmacen);
    void deleteByProductoId(Long idProducto);
}
