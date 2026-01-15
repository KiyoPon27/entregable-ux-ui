package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tienda.posbackend.models.Producto;
import tienda.posbackend.dto.ProductoDTO;

import java.util.List;
import java.util.Optional;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    // Equivalente a tu función 'mostrarproductos' (con JOIN y precios formateados)
    @Query("SELECT new tienda.posbackend.dto.ProductoDTO(" +
           "p.id, p.nombre, p.precioVenta, p.precioCompra, p.idCategoria, p.sevendePor, " +
           "p.codigoBarras, p.codigoInterno, p.idEmpresa, p.manejaInventarios, p.manejaMultiprecios, " +
           "CONCAT(e.simboloMoneda, ' ', p.precioVenta), " +
           "CONCAT(e.simboloMoneda, ' ', p.precioCompra), c.nombre) " +
           "FROM Producto p " +
           "INNER JOIN Empresa e ON e.id = p.idEmpresa " +
           "INNER JOIN Categoria c ON c.id = p.idCategoria " +
           "WHERE p.idEmpresa = :idEmpresa " +
           "ORDER BY p.nombre ASC")
    List<ProductoDTO> mostrarProductosConFormato(@Param("idEmpresa") Long idEmpresa);

    // Equivalente a tu función 'buscarproductos' (Buscador universal, con formato)
    @Query("SELECT new tienda.posbackend.dto.ProductoDTO(" +
           "p.id, p.nombre, p.precioVenta, p.precioCompra, p.idCategoria, p.sevendePor, " +
           "p.codigoBarras, p.codigoInterno, p.idEmpresa, p.manejaInventarios, p.manejaMultiprecios, " +
           "CONCAT(e.simboloMoneda, ' ', p.precioVenta), " +
           "CONCAT(e.simboloMoneda, ' ', p.precioCompra), c.nombre) " +
           "FROM Producto p " +
           "INNER JOIN Empresa e ON e.id = p.idEmpresa " +
           "INNER JOIN Categoria c ON c.id = p.idCategoria " +
           "WHERE p.idEmpresa = :idEmpresa AND " +
           "(LOWER(p.nombre) LIKE LOWER(CONCAT('%', :buscador, '%')) OR " +
           "LOWER(p.codigoBarras) LIKE LOWER(CONCAT('%', :buscador, '%')) OR " +
           "LOWER(p.codigoInterno) LIKE LOWER(CONCAT('%', :buscador, '%'))) " +
           "ORDER BY p.nombre ASC LIMIT 10")
    List<ProductoDTO> buscarProductosConFormato(@Param("idEmpresa") Long idEmpresa, @Param("buscador") String buscador);

    // Equivalente a 'buscarproductoslectora' (Búsqueda exacta por código)
    @Query("SELECT new tienda.posbackend.dto.ProductoDTO(" +
           "p.id, p.nombre, p.precioVenta, p.precioCompra, p.idCategoria, p.sevendePor, " +
           "p.codigoBarras, p.codigoInterno, p.idEmpresa, p.manejaInventarios, p.manejaMultiprecios, " +
           "CONCAT(e.simboloMoneda, ' ', p.precioVenta), " +
           "CONCAT(e.simboloMoneda, ' ', p.precioCompra), c.nombre) " +
           "FROM Producto p " +
           "INNER JOIN Empresa e ON e.id = p.idEmpresa " +
           "INNER JOIN Categoria c ON c.id = p.idCategoria " +
           "WHERE p.idEmpresa = :idEmpresa AND " +
           "(LOWER(p.codigoBarras) = LOWER(:buscador) OR LOWER(p.codigoInterno) = LOWER(:buscador))")
    List<ProductoDTO> buscarProductosLectora(@Param("idEmpresa") Long idEmpresa, @Param("buscador") String buscador);

    // Equivalente a 'contarproductosporauth'
    @Query("SELECT COUNT(p) FROM Producto p INNER JOIN Empresa e ON e.id = p.idEmpresa WHERE e.idAuth = :idAuth")
    Long contarProductosPorAuth(@Param("idAuth") String idAuth);

    // Validaciones para evitar duplicados (como tenías en los IF de Postgres)
    Optional<Producto> findByNombreAndIdEmpresa(String nombre, Long idEmpresa);
    Optional<Producto> findByCodigoBarrasAndIdEmpresa(String codigoBarras, Long idEmpresa);
    Optional<Producto> findByCodigoInternoAndIdEmpresa(String codigoInterno, Long idEmpresa);
}