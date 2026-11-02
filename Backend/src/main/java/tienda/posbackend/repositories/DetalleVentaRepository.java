package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tienda.posbackend.entities.DetalleVenta;
import java.math.BigDecimal;
import java.util.List;

public interface DetalleVentaRepository extends JpaRepository<DetalleVenta, Long> {
    List<DetalleVenta> findByVentaId(Long ventaId);
    List<DetalleVenta> findByProductoId(Long productoId);
    
    @Query("SELECT COALESCE(SUM(dv.cantidad), 0) FROM DetalleVenta dv WHERE dv.producto.id = :idProducto AND dv.venta.estado != 'pendiente'")
    BigDecimal sumCantidadVendidaPorProducto(@Param("idProducto") Long idProducto);
}
