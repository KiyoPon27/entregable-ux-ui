package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tienda.posbackend.entities.DetalleCompra;
import java.util.List;

public interface DetalleCompraRepository extends JpaRepository<DetalleCompra, Long> {
    // Obtener detalles de una compra específica
    List<DetalleCompra> findByCompraId(Long compraId);
}