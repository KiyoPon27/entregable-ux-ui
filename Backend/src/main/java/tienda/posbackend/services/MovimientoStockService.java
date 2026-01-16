package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.models.MovimientoStock;
import tienda.posbackend.models.Stock;
import tienda.posbackend.repositories.MovimientoStockRepository;
import tienda.posbackend.repositories.StockRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * SERVICE: MovimientoStockService
 * 
 * LÓGICA DE NEGOCIO PARA MOVIMIENTOS DE STOCK
 * 
 * IMPORTANTE:
 * - Los movimientos son INMUTABLES (no se editan, solo se crean)
 * - Cada movimiento debe actualizar la tabla "stock"
 * - Los movimientos se crean automáticamente desde otros Services (VentaService, CompraService)
 * 
 * FLUJO TÍPICO:
 * 1. VentaService llama a registrarMovimiento()
 * 2. Se crea el registro en movimientos_stock
 * 3. Se actualiza el stock en tabla "stock"
 */
@Service
@Transactional
public class MovimientoStockService {

    @Autowired
    private MovimientoStockRepository repository;

    @Autowired
    private StockRepository stockRepository;

    /**
     * ============================================================
     * FUNCIÓN: mostrarmovimientosstock
     * ============================================================
     * 
     * REPLICADA DE POSTGRESQL
     * 
     * Muestra historial de movimientos de un producto en un almacén
     * 
     * FRONTEND:
     * const response = await axios.get("/api/movimientos-stock/mostrar", {
     *   params: { idProducto: 5, idAlmacen: 1 }
     * });
     * 
     * @param idProducto - ID del producto
     * @param idAlmacen - ID del almacén
     * @return Lista con Maps { id, tipoMovimiento, cantidad, motivo, fechaMovimiento, usuario }
     */
    public List<Map<String, Object>> mostrarMovimientos(Long idProducto, Long idAlmacen) {
        return repository.mostrarMovimientosPorProductoAlmacen(idProducto, idAlmacen);
    }

    /**
     * ============================================================
     * FUNCIÓN: registrarmovimiento
     * ============================================================
     * 
     * FUNCIÓN PRINCIPAL: Registra un movimiento de stock
     * 
     * Esta función:
     * 1. Registra el movimiento en la tabla movimientos_stock
     * 2. Actualiza la cantidad en la tabla stock
     * 
     * POSTGRESQL ORIGINAL:
     * Trigger "registrar_movimiento_stock" que se dispara en INSERT/UPDATE de stock
     * 
     * PARÁMETROS:
     * @param idProducto - ID del producto
     * @param idAlmacen - ID del almacén
     * @param tipoMovimiento - ENTRADA, SALIDA, AJUSTE, TRANSFERENCIA
     * @param cantidad - Cantidad del movimiento (siempre positiva)
     * @param motivo - Descripción del movimiento
     * @param idUsuario - Usuario que realiza el movimiento (puede ser null)
     * @param idVenta - ID de venta asociada (puede ser null)
     * @param precioUnitario - Precio unitario (puede ser null)
     * 
     * @return MovimientoStock creado
     * @throws Exception si no existe el stock o hay error
     */
    @Transactional
    public MovimientoStock registrarMovimiento(
        Long idProducto,
        Long idAlmacen,
        String tipoMovimiento,
        Integer cantidad,
        String motivo,
        Long idUsuario,
        Long idVenta,
        java.math.BigDecimal precioUnitario
    ) throws Exception {

        // Buscar stock existente
        Stock stock = stockRepository.findByIdProductoAndIdAlmacen(idProducto, idAlmacen)
            .orElseThrow(() -> new Exception("No existe stock para este producto en el almacén especificado"));

        // Guardar cantidad anterior
        Integer cantidadAnterior = stock.getCantidad();
        Integer cantidadNueva;

        // Calcular nueva cantidad según tipo de movimiento
        switch (tipoMovimiento.toUpperCase()) {
            case "ENTRADA":
                cantidadNueva = cantidadAnterior + cantidad;
                break;
            case "SALIDA":
                cantidadNueva = cantidadAnterior - cantidad;
                // Validar que no quede negativo (opcional: permitir negativo para ventas pendientes)
                if (cantidadNueva < 0) {
                    throw new Exception(String.format(
                        "Stock insuficiente. Disponible: %d, Requerido: %d",
                        cantidadAnterior, cantidad
                    ));
                }
                break;
            case "AJUSTE":
                // Para ajustes, la cantidad es el nuevo valor absoluto
                cantidadNueva = cantidad;
                break;
            case "TRANSFERENCIA":
                // Las transferencias se manejan con dos movimientos:
                // SALIDA en almacén origen y ENTRADA en almacén destino
                cantidadNueva = cantidadAnterior - cantidad;
                break;
            default:
                throw new Exception("Tipo de movimiento no válido: " + tipoMovimiento);
        }

        // Actualizar stock
        stock.setCantidad(cantidadNueva);
        stockRepository.save(stock);

        // Crear registro de movimiento
        MovimientoStock movimiento = new MovimientoStock();
        movimiento.setIdStock(stock.getId());
        movimiento.setTipoMovimiento(tipoMovimiento.toUpperCase());
        movimiento.setCantidad(cantidad);
        movimiento.setCantidadAnterior(cantidadAnterior);
        movimiento.setCantidadNueva(cantidadNueva);
        movimiento.setMotivo(motivo);
        movimiento.setIdUsuario(idUsuario);
        movimiento.setIdVenta(idVenta);
        movimiento.setPrecioUnitario(precioUnitario);

        return repository.save(movimiento);
    }

    /**
     * ============================================================
     * FUNCIÓN AUXILIAR: Registrar entrada de stock
     * ============================================================
     * 
     * Simplifica el registro de entradas (compras, devoluciones)
     * 
     * @param idProducto - ID del producto
     * @param idAlmacen - ID del almacén
     * @param cantidad - Cantidad a ingresar
     * @param motivo - Motivo de la entrada
     * @param idUsuario - Usuario que registra
     * @return MovimientoStock creado
     */
    public MovimientoStock registrarEntrada(
        Long idProducto,
        Long idAlmacen,
        Integer cantidad,
        String motivo,
        Long idUsuario
    ) throws Exception {
        return registrarMovimiento(idProducto, idAlmacen, "ENTRADA", cantidad, motivo, idUsuario, null, null);
    }

    /**
     * ============================================================
     * FUNCIÓN AUXILIAR: Registrar salida de stock
     * ============================================================
     * 
     * Simplifica el registro de salidas (ventas, bajas)
     * 
     * @param idProducto - ID del producto
     * @param idAlmacen - ID del almacén
     * @param cantidad - Cantidad a retirar
     * @param motivo - Motivo de la salida
     * @param idUsuario - Usuario que registra
     * @param idVenta - ID de venta asociada (puede ser null)
     * @param precioUnitario - Precio de venta (puede ser null)
     * @return MovimientoStock creado
     */
    public MovimientoStock registrarSalida(
        Long idProducto,
        Long idAlmacen,
        Integer cantidad,
        String motivo,
        Long idUsuario,
        Long idVenta,
        java.math.BigDecimal precioUnitario
    ) throws Exception {
        return registrarMovimiento(idProducto, idAlmacen, "SALIDA", cantidad, motivo, idUsuario, idVenta, precioUnitario);
    }

    /**
     * ============================================================
     * FUNCIÓN AUXILIAR: Registrar ajuste de inventario
     * ============================================================
     * 
     * Para correcciones manuales de inventario
     * 
     * @param idProducto - ID del producto
     * @param idAlmacen - ID del almacén
     * @param nuevaCantidad - Nueva cantidad absoluta
     * @param motivo - Motivo del ajuste
     * @param idUsuario - Usuario que ajusta
     * @return MovimientoStock creado
     */
    public MovimientoStock registrarAjuste(
        Long idProducto,
        Long idAlmacen,
        Integer nuevaCantidad,
        String motivo,
        Long idUsuario
    ) throws Exception {
        return registrarMovimiento(idProducto, idAlmacen, "AJUSTE", nuevaCantidad, motivo, idUsuario, null, null);
    }

    /**
     * ============================================================
     * FUNCIÓN: Listar movimientos por stock
     * ============================================================
     * 
     * @param idStock - ID del registro de stock
     * @return Lista de movimientos
     */
    public List<MovimientoStock> listarPorStock(Long idStock) {
        return repository.findByIdStockOrderByFechaMovimientoDesc(idStock);
    }

    /**
     * ============================================================
     * FUNCIÓN: Listar movimientos por rango de fechas
     * ============================================================
     * 
     * Útil para reportes mensuales
     * 
     * @param fechaInicio - Fecha inicial
     * @param fechaFin - Fecha final
     * @return Lista de movimientos en el rango
     */
    public List<MovimientoStock> listarPorFechas(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return repository.findByFechaMovimientoBetween(fechaInicio, fechaFin);
    }

    /**
     * ============================================================
     * FUNCIÓN: Listar movimientos por usuario
     * ============================================================
     * 
     * Auditoría de acciones de un usuario
     * 
     * @param idUsuario - ID del usuario
     * @return Lista de movimientos del usuario
     */
    public List<MovimientoStock> listarPorUsuario(Long idUsuario) {
        return repository.findByIdUsuarioOrderByFechaMovimientoDesc(idUsuario);
    }

    /**
     * ============================================================
     * FUNCIÓN: Listar movimientos de una venta
     * ============================================================
     * 
     * Muestra todos los productos vendidos en una venta
     * 
     * @param idVenta - ID de la venta
     * @return Lista de movimientos de la venta
     */
    public List<MovimientoStock> listarPorVenta(Long idVenta) {
        return repository.findByIdVenta(idVenta);
    }

    /**
     * ============================================================
     * FUNCIÓN: Calcular entradas/salidas en un período
     * ============================================================
     * 
     * Para reportes de rotación de inventario
     * 
     * @param idStock - ID del stock
     * @param fechaInicio - Fecha inicial
     * @param fechaFin - Fecha final
     * @return Map con "entradas" y "salidas"
     */
    public Map<String, Integer> calcularMovimientosPeriodo(
        Long idStock,
        LocalDateTime fechaInicio,
        LocalDateTime fechaFin
    ) {
        Integer entradas = repository.calcularEntradasPeriodo(idStock, fechaInicio, fechaFin);
        Integer salidas = repository.calcularSalidasPeriodo(idStock, fechaInicio, fechaFin);
        
        return Map.of(
            "entradas", entradas,
            "salidas", salidas,
            "neto", entradas - salidas
        );
    }
}
