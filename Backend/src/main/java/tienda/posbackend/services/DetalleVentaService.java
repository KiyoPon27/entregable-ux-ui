package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.models.DetalleVenta;
import tienda.posbackend.repositories.DetalleVentaRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * SERVICE: DetalleVentaService
 * 
 * LÓGICA DE NEGOCIO PARA DETALLE DE VENTAS
 * 
 * IMPORTANTE:
 * Los detalles se crean automáticamente al procesar una venta.
 * Este Service es principalmente para consultas y reportes.
 * 
 * FLUJO TÍPICO:
 * 1. VentaController.procesarVenta() recibe productos
 * 2. Se valida stock de cada producto
 * 3. Se crea la venta (cabecera)
 * 4. Se crean los detalles → insertarDetalle()
 * 5. Se decrementa stock → MovimientoStockService
 * 6. Se registra en caja → MovimientoCajaService
 */
@Service
@Transactional
public class DetalleVentaService {

    @Autowired
    private DetalleVentaRepository repository;

    /**
     * ============================================================
     * FUNCIÓN: mostrardetalleventa
     * ============================================================
     * 
     * REPLICADA DE POSTGRESQL
     * 
     * Muestra los productos de una venta
     * 
     * FRONTEND:
     * const response = await axios.get("/api/detalle-venta/mostrar", {
     *   params: { idVenta: 123 }
     * });
     * 
     * @param idVenta - ID de la venta
     * @return Lista con Maps { id, producto, codigoProducto, cantidad, precioUnitario, subtotal }
     */
    public List<Map<String, Object>> mostrarDetalle(Long idVenta) {
        return repository.mostrarDetallePorVenta(idVenta);
    }

    /**
     * ============================================================
     * FUNCIÓN: insertardetalleventa
     * ============================================================
     * 
     * REPLICADA DE POSTGRESQL
     * 
     * Inserta un detalle de venta
     * 
     * VALIDACIONES:
     * 1. La cantidad debe ser mayor a 0
     * 2. El precio unitario debe ser mayor a 0
     * 3. El subtotal se calcula automáticamente (cantidad * precio_unitario)
     * 
     * IMPORTANTE:
     * Esta función solo crea el detalle.
     * El stock debe ser decrementado por MovimientoStockService.
     * 
     * @param detalle - Datos del detalle
     * @return DetalleVenta creado
     * @throws Exception si hay error en validaciones
     */
    public DetalleVenta insertarDetalle(DetalleVenta detalle) throws Exception {
        
        // VALIDACIÓN 1: Cantidad mayor a 0
        if (detalle.getCantidad() <= 0) {
            throw new Exception("La cantidad debe ser mayor a 0");
        }

        // VALIDACIÓN 2: Precio mayor a 0
        if (detalle.getPrecioUnitario().compareTo(BigDecimal.ZERO) <= 0) {
            throw new Exception("El precio unitario debe ser mayor a 0");
        }

        // El subtotal se calcula automáticamente en @PrePersist
        // subtotal = cantidad * precio_unitario

        return repository.save(detalle);
    }

    /**
     * ============================================================
     * FUNCIÓN: Listar detalles por venta
     * ============================================================
     * 
     * @param idVenta - ID de la venta
     * @return Lista de detalles
     */
    public List<DetalleVenta> listarPorVenta(Long idVenta) {
        return repository.findByIdVenta(idVenta);
    }

    /**
     * ============================================================
     * FUNCIÓN: Calcular total de una venta
     * ============================================================
     * 
     * Suma los subtotales de todos los detalles
     * 
     * @param idVenta - ID de la venta
     * @return Total de la venta
     */
    public BigDecimal calcularTotalVenta(Long idVenta) {
        return repository.calcularTotalVenta(idVenta);
    }

    /**
     * ============================================================
     * FUNCIÓN: Contar productos en una venta
     * ============================================================
     * 
     * @param idVenta - ID de la venta
     * @return Cantidad de productos diferentes
     */
    public Long contarProductosVenta(Long idVenta) {
        return repository.countByIdVenta(idVenta);
    }

    /**
     * ============================================================
     * FUNCIÓN: Productos más vendidos (TOP N)
     * ============================================================
     * 
     * Para reportes y análisis
     * 
     * @param limite - Cantidad de resultados (ej: 10)
     * @return Lista con productos y cantidades vendidas
     */
    public List<Map<String, Object>> productosTopVendidos(int limite) {
        return repository.productosTopVendidos(limite);
    }

    /**
     * ============================================================
     * FUNCIÓN: Productos vendidos en un período
     * ============================================================
     * 
     * @param fechaInicio - Fecha inicial (formato: yyyy-MM-dd HH:mm:ss)
     * @param fechaFin - Fecha final
     * @param limite - Cantidad de resultados
     * @return Lista de productos vendidos
     */
    public List<Map<String, Object>> productosVendidosPeriodo(String fechaInicio, String fechaFin, int limite) {
        return repository.productosVendidosPeriodo(fechaInicio, fechaFin, limite);
    }

    /**
     * ============================================================
     * FUNCIÓN: Verificar si un producto fue vendido
     * ============================================================
     * 
     * Útil antes de eliminar productos
     * 
     * @param idProducto - ID del producto
     * @return true si tiene ventas
     */
    public boolean productoFueVendido(Long idProducto) {
        return repository.existsByIdProducto(idProducto);
    }

    /**
     * ============================================================
     * FUNCIÓN: Total vendido de un producto
     * ============================================================
     * 
     * @param idProducto - ID del producto
     * @return Cantidad total vendida
     */
    public Integer totalVendidoProducto(Long idProducto) {
        return repository.calcularTotalVendidoProducto(idProducto);
    }

    /**
     * ============================================================
     * FUNCIÓN AUXILIAR: Insertar múltiples detalles
     * ============================================================
     * 
     * Para procesar una venta completa con varios productos
     * 
     * @param detalles - Lista de detalles a insertar
     * @return Lista de detalles creados
     * @throws Exception si hay error en algún detalle
     */
    @Transactional
    public List<DetalleVenta> insertarMultiplesDetalles(List<DetalleVenta> detalles) throws Exception {
        
        // Validar todos los detalles
        for (DetalleVenta detalle : detalles) {
            if (detalle.getCantidad() <= 0) {
                throw new Exception("Cantidad inválida en uno de los productos");
            }
            if (detalle.getPrecioUnitario().compareTo(BigDecimal.ZERO) <= 0) {
                throw new Exception("Precio inválido en uno de los productos");
            }
        }

        // Guardar todos
        return repository.saveAll(detalles);
    }
}
