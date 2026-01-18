package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tienda.posbackend.entities.MovimientoStock;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MovimientoStockRepository extends JpaRepository<MovimientoStock, Long> {

    // Listar todos los movimientos de un producto
    List<MovimientoStock> findByProductoIdOrderByFechaDesc(Long productoId);

    // Listar todos los movimientos de un almacén
    List<MovimientoStock> findByAlmacenIdOrderByFechaDesc(Long almacenId);

    // Listar movimientos de un producto en un almacén específico
    List<MovimientoStock> findByProductoIdAndAlmacenIdOrderByFechaDesc(Long productoId, Long almacenId);

    // Listar movimientos por tipo
    List<MovimientoStock> findByTipoMovimientoOrderByFechaDesc(String tipoMovimiento);

    // Listar movimientos por rango de fechas
    @Query("SELECT m FROM MovimientoStock m WHERE m.fecha BETWEEN :fechaInicio AND :fechaFin ORDER BY m.fecha DESC")
    List<MovimientoStock> findByFechaBetween(@Param("fechaInicio") LocalDateTime fechaInicio, @Param("fechaFin") LocalDateTime fechaFin);

    // Listar movimientos por producto y rango de fechas
    @Query("SELECT m FROM MovimientoStock m WHERE m.producto.id = :productoId AND m.fecha BETWEEN :fechaInicio AND :fechaFin ORDER BY m.fecha DESC")
    List<MovimientoStock> findByProductoIdAndFechaBetween(@Param("productoId") Long productoId, @Param("fechaInicio") LocalDateTime fechaInicio, @Param("fechaFin") LocalDateTime fechaFin);

    // Listar movimientos por almacén y rango de fechas
    @Query("SELECT m FROM MovimientoStock m WHERE m.almacen.id = :almacenId AND m.fecha BETWEEN :fechaInicio AND :fechaFin ORDER BY m.fecha DESC")
    List<MovimientoStock> findByAlmacenIdAndFechaBetween(@Param("almacenId") Long almacenId, @Param("fechaInicio") LocalDateTime fechaInicio, @Param("fechaFin") LocalDateTime fechaFin);

    // Listar movimientos por empresa (a través del almacén -> sucursal -> empresa)
    @Query("SELECT m FROM MovimientoStock m WHERE m.almacen.sucursal.empresa.id = :empresaId ORDER BY m.fecha DESC")
    List<MovimientoStock> findByEmpresaId(@Param("empresaId") Long empresaId);
}
