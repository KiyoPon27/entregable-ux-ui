package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tienda.posbackend.entities.Producto;
import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByEmpresaId(Long empresaId);
    
    // Listar solo activos
    List<Producto> findByEmpresaIdAndEstado(Long empresaId, String estado);

    // Buscar productos por nombre o código de barras (solo activos)
    @Query("SELECT p FROM Producto p WHERE p.empresa.id = :empresaId AND p.estado = 'ACTIVO' AND (lower(p.nombre) LIKE lower(concat('%', :query, '%')) OR p.codigoBarras LIKE concat('%', :query, '%') OR p.codigoInterno LIKE concat('%', :query, '%'))")
    List<Producto> buscarProductos(@Param("empresaId") Long empresaId, @Param("query") String query);

    @Query("SELECT p FROM Producto p WHERE p.empresa.id = :empresaId AND p.estado = 'ACTIVO' AND (lower(p.codigoBarras) = lower(:query) OR lower(p.codigoInterno) = lower(:query))")
    List<Producto> buscarProductosLectora(@Param("empresaId") Long empresaId, @Param("query") String query);
    
    // Contar productos por categoría
    long countByCategoriaId(Long categoriaId);
}
