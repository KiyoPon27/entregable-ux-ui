package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tienda.posbackend.entities.ProductoCodigo;

public interface ProductoCodigoRepository extends JpaRepository<ProductoCodigo, Long> {
    // Eliminar todos los códigos asociados a un producto
    void deleteByProducto_Id(Long productoId);
}
