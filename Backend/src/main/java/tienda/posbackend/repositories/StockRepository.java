package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tienda.posbackend.models.Stock;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REPOSITORY: StockRepository
 * 
 * QUERIES PRINCIPALES:
 * 1. Mostrar stock por almacén con información del producto
 * 2. Verificar stock disponible antes de ventas
 * 3. Calcular stock total por producto en todos los almacenes
 * 4. Validaciones de duplicados
 */
public interface StockRepository extends JpaRepository<Stock, Long> {

    /**
     * ============================================================
     * FUNCIÓN: mostrarstock
     * ============================================================
     * 
     * Muestra el stock de un almacén con información del producto
     * 
     * POSTGRESQL ORIGINAL:
     * SELECT 
     *   s.id, 
     *   s.id_producto, 
     *   p.nombre AS nombre_producto,
     *   s.cantidad,
     *   s.fecha_actualizacion
     * FROM stock s
     * INNER JOIN productos p ON s.id_producto = p.id
     * WHERE s.id_almacen = ?
     * ORDER BY p.nombre ASC
     * 
     * @param idAlmacen - ID del almacén
     * @return Lista de Maps con información del stock y producto
     */
    @Query(value = "SELECT " +
           "s.id AS id, " +
           "s.id_producto AS idProducto, " +
           "p.nombre AS nombreProducto, " +
           "p.codigo AS codigoProducto, " +
           "s.cantidad AS cantidad, " +
           "s.fecha_actualizacion AS fechaActualizacion " +
           "FROM stock s " +
           "INNER JOIN productos p ON s.id_producto = p.id " +
           "WHERE s.id_almacen = :idAlmacen " +
           "ORDER BY p.nombre ASC", 
           nativeQuery = true)
    List<Map<String, Object>> mostrarStockPorAlmacen(@Param("idAlmacen") Long idAlmacen);

    /**
     * ============================================================
     * FUNCIÓN: verificarstock
     * ============================================================
     * 
     * Verifica si hay stock disponible de un producto en un almacén
     * 
     * POSTGRESQL ORIGINAL:
     * PERFORM 1 FROM stock 
     * WHERE id_producto = ? AND id_almacen = ? AND cantidad >= ?
     * IF NOT FOUND THEN
     *   RAISE EXCEPTION 'Stock insuficiente'
     * 
     * @param idProducto - ID del producto
     * @param idAlmacen - ID del almacén
     * @param cantidadRequerida - Cantidad necesaria
     * @return Stock si hay suficiente cantidad
     */
    @Query("SELECT s FROM Stock s WHERE s.idProducto = :idProducto " +
           "AND s.idAlmacen = :idAlmacen AND s.cantidad >= :cantidadRequerida")
    Optional<Stock> verificarStockDisponible(
        @Param("idProducto") Long idProducto,
        @Param("idAlmacen") Long idAlmacen,
        @Param("cantidadRequerida") Integer cantidadRequerida
    );

    /**
     * ============================================================
     * FUNCIÓN: calcularstockprincipal
     * ============================================================
     * 
     * Calcula la cantidad total de un producto en el almacén principal
     * 
     * POSTGRESQL ORIGINAL:
     * SELECT COALESCE(SUM(s.cantidad), 0)
     * FROM stock s
     * INNER JOIN almacen a ON s.id_almacen = a.id
     * WHERE s.id_producto = ? AND a.default = TRUE
     * 
     * @param idProducto - ID del producto
     * @return Cantidad total en almacén principal (0 si no hay)
     */
    @Query("SELECT COALESCE(SUM(s.cantidad), 0) FROM Stock s " +
           "INNER JOIN Almacen a ON s.idAlmacen = a.id " +
           "WHERE s.idProducto = :idProducto AND a.isDefault = true")
    Integer calcularStockAlmacenPrincipal(@Param("idProducto") Long idProducto);

    /**
     * CALCULAR STOCK TOTAL DE UN PRODUCTO (TODOS LOS ALMACENES)
     * 
     * @param idProducto - ID del producto
     * @return Suma de cantidades en todos los almacenes
     */
    @Query("SELECT COALESCE(SUM(s.cantidad), 0) FROM Stock s WHERE s.idProducto = :idProducto")
    Integer calcularStockTotal(@Param("idProducto") Long idProducto);

    /**
     * BUSCAR STOCK POR PRODUCTO Y ALMACÉN
     * 
     * IMPORTANTE: Solo puede haber UN registro por combinación (UNIQUE constraint)
     * 
     * @param idProducto - ID del producto
     * @param idAlmacen - ID del almacén
     * @return Stock si existe
     */
    Optional<Stock> findByIdProductoAndIdAlmacen(Long idProducto, Long idAlmacen);

    /**
     * VALIDACIÓN: Verificar si existe stock (para evitar duplicados)
     * 
     * @param idProducto - ID del producto
     * @param idAlmacen - ID del almacén
     * @return true si ya existe
     */
    boolean existsByIdProductoAndIdAlmacen(Long idProducto, Long idAlmacen);

    /**
     * LISTAR STOCK POR PRODUCTO (EN TODOS LOS ALMACENES)
     * 
     * Útil para ver distribución de un producto
     * 
     * @param idProducto - ID del producto
     * @return Lista de registros de stock
     */
    List<Stock> findByIdProducto(Long idProducto);

    /**
     * LISTAR TODO EL STOCK DE UN ALMACÉN
     * 
     * @param idAlmacen - ID del almacén
     * @return Lista de registros de stock
     */
    List<Stock> findByIdAlmacen(Long idAlmacen);

    /**
     * CONTAR PRODUCTOS EN STOCK DE UN ALMACÉN
     * 
     * @param idAlmacen - ID del almacén
     * @return Cantidad de productos diferentes
     */
    Long countByIdAlmacen(Long idAlmacen);

    /**
     * PRODUCTOS CON STOCK BAJO
     * 
     * Útil para alertas de reabastecimiento
     * 
     * @param idAlmacen - ID del almacén
     * @param cantidadMinima - Umbral de stock bajo
     * @return Stock por debajo del umbral
     */
    @Query("SELECT s FROM Stock s WHERE s.idAlmacen = :idAlmacen AND s.cantidad < :cantidadMinima")
    List<Stock> findStockBajo(@Param("idAlmacen") Long idAlmacen, @Param("cantidadMinima") Integer cantidadMinima);
}
