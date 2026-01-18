package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.entities.MovimientoStock;
import tienda.posbackend.repositories.MovimientoStockRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MovimientoStockService {

    @Autowired
    private MovimientoStockRepository movimientoStockRepository;

    /**
     * Registrar un nuevo movimiento de stock
     */
    @Transactional
    public MovimientoStock registrarMovimiento(MovimientoStock movimiento) {
        return movimientoStockRepository.save(movimiento);
    }

    /**
     * Listar todos los movimientos
     */
    public List<MovimientoStock> listarTodos() {
        return movimientoStockRepository.findAll();
    }

    /**
     * Listar movimientos por producto
     */
    public List<MovimientoStock> listarPorProducto(Long productoId) {
        return movimientoStockRepository.findByProductoIdOrderByFechaDesc(productoId);
    }

    /**
     * Listar movimientos por almacén
     */
    public List<MovimientoStock> listarPorAlmacen(Long almacenId) {
        return movimientoStockRepository.findByAlmacenIdOrderByFechaDesc(almacenId);
    }

    /**
     * Listar movimientos por producto y almacén
     */
    public List<MovimientoStock> listarPorProductoYAlmacen(Long productoId, Long almacenId) {
        return movimientoStockRepository.findByProductoIdAndAlmacenIdOrderByFechaDesc(productoId, almacenId);
    }

    /**
     * Listar movimientos por tipo
     */
    public List<MovimientoStock> listarPorTipo(String tipoMovimiento) {
        return movimientoStockRepository.findByTipoMovimientoOrderByFechaDesc(tipoMovimiento);
    }

    /**
     * Listar movimientos por rango de fechas
     */
    public List<MovimientoStock> listarPorRangoFechas(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return movimientoStockRepository.findByFechaBetween(fechaInicio, fechaFin);
    }

    /**
     * Listar movimientos por producto y rango de fechas
     */
    public List<MovimientoStock> listarPorProductoYFechas(Long productoId, LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return movimientoStockRepository.findByProductoIdAndFechaBetween(productoId, fechaInicio, fechaFin);
    }

    /**
     * Listar movimientos por almacén y rango de fechas
     */
    public List<MovimientoStock> listarPorAlmacenYFechas(Long almacenId, LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return movimientoStockRepository.findByAlmacenIdAndFechaBetween(almacenId, fechaInicio, fechaFin);
    }

    /**
     * Listar movimientos por empresa
     */
    public List<MovimientoStock> listarPorEmpresa(Long empresaId) {
        return movimientoStockRepository.findByEmpresaId(empresaId);
    }

    /**
     * Obtener un movimiento por ID
     */
    public MovimientoStock obtenerPorId(Long id) {
        return movimientoStockRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movimiento no encontrado con ID: " + id));
    }
}
