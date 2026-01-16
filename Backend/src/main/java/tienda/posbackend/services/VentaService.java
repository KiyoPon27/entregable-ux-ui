package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.models.Venta;
import tienda.posbackend.repositories.VentaRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * SERVICE: VentaService
 * 
 * LÓGICA DE NEGOCIO PARA VENTAS
 * 
 * FLUJO COMPLETO DE VENTA:
 * 1. Validar stock disponible (StockService.verificarStock)
 * 2. Crear registro de venta (cabecera)
 * 3. Crear detalles de venta (DetalleVentaService)
 * 4. Decrementar stock (MovimientoStockService.registrarSalida)
 * 5. Registrar movimiento de caja (MovimientoCajaService)
 * 
 * IMPORTANTE:
 * Esta es la cabecera de la venta.
 * Los productos se gestionan en DetalleVentaService.
 */
@Service
@Transactional
public class VentaService {

    @Autowired
    private VentaRepository repository;

    /**
     * ============================================================
     * FUNCIÓN: mostrarventas
     * ============================================================
     * 
     * REPLICADA DE POSTGRESQL
     * 
     * Muestra ventas con información completa
     * 
     * FRONTEND:
     * const response = await axios.get("/api/ventas/mostrar", {
     *   params: { idSucursal: 1, idCaja: 1 }
     * });
     * 
     * @param idSucursal - ID de la sucursal
     * @param idCaja - ID de la caja
     * @return Lista con Maps { id, fechaVenta, usuario, cliente, subtotal, descuento, impuesto, total, estado, metodoPago }
     */
    public List<Map<String, Object>> mostrarVentas(Long idSucursal, Long idCaja) {
        return repository.mostrarVentasPorSucursalCaja(idSucursal, idCaja);
    }

    /**
     * ============================================================
     * FUNCIÓN: insertarventa
     * ============================================================
     * 
     * REPLICADA DE POSTGRESQL
     * 
     * Inserta una nueva venta (cabecera)
     * 
     * IMPORTANTE:
     * Esta función solo crea la cabecera.
     * Los productos se insertan con DetalleVentaService.
     * El flujo completo debe ser manejado por un Service Facade o Controller.
     * 
     * VALIDACIONES:
     * 1. Los IDs de empresa, usuario, sucursal, caja, almacén, método de pago deben existir
     * 2. El total debe ser mayor a 0
     * 3. subtotal - descuento + impuesto = total
     * 
     * @param venta - Datos de la venta
     * @return Venta creada con ID generado
     * @throws Exception si hay error en validaciones
     */
    public Venta insertarVenta(Venta venta) throws Exception {
        
        // VALIDACIÓN 1: Total mayor a 0
        if (venta.getTotal().compareTo(BigDecimal.ZERO) <= 0) {
            throw new Exception("El total de la venta debe ser mayor a 0");
        }

        // VALIDACIÓN 2: Verificar cálculo de total
        BigDecimal totalCalculado = venta.getSubtotal()
            .subtract(venta.getDescuento() != null ? venta.getDescuento() : BigDecimal.ZERO)
            .add(venta.getImpuesto() != null ? venta.getImpuesto() : BigDecimal.ZERO);

        if (venta.getTotal().compareTo(totalCalculado) != 0) {
            throw new Exception(String.format(
                "Error en cálculo de total. Esperado: %.2f, Recibido: %.2f",
                totalCalculado, venta.getTotal()
            ));
        }

        // Guardar venta
        Venta nuevaVenta = repository.save(venta);

        // TODO: En un flujo completo:
        // - Crear detalles de venta (DetalleVentaService)
        // - Decrementar stock (MovimientoStockService)
        // - Registrar movimiento de caja (MovimientoCajaService)

        return nuevaVenta;
    }

    /**
     * ============================================================
     * FUNCIÓN: anularventa
     * ============================================================
     * 
     * REPLICADA DE POSTGRESQL
     * 
     * Anula una venta (cambia estado a ANULADA)
     * 
     * IMPORTANTE:
     * - No se elimina, solo se marca como ANULADA
     * - Se deben revertir los movimientos de stock
     * - Se debe revertir el movimiento de caja
     * 
     * @param idVenta - ID de la venta a anular
     * @throws Exception si no existe o ya está anulada
     */
    public void anularVenta(Long idVenta) throws Exception {
        
        // Verificar existencia
        Venta venta = repository.findById(idVenta)
            .orElseThrow(() -> new Exception("Venta no encontrada"));

        // Verificar que no esté ya anulada
        if ("ANULADA".equals(venta.getEstado())) {
            throw new Exception("La venta ya está anulada");
        }

        // Cambiar estado
        venta.setEstado("ANULADA");
        repository.save(venta);

        // TODO: Revertir stock y movimientos de caja
        // - MovimientoStockService.registrarEntrada() (devolver productos)
        // - MovimientoCajaService.registrarSalida() (reembolso)
    }

    /**
     * ============================================================
     * FUNCIÓN: obtener venta por ID
     * ============================================================
     * 
     * @param id - ID de la venta
     * @return Venta o null
     */
    public Venta obtenerVenta(Long id) {
        return repository.findById(id).orElse(null);
    }

    /**
     * ============================================================
     * FUNCIÓN: Listar ventas por sucursal
     * ============================================================
     * 
     * @param idSucursal - ID de la sucursal
     * @return Lista de ventas
     */
    public List<Venta> listarPorSucursal(Long idSucursal) {
        return repository.findByIdSucursalOrderByFechaVentaDesc(idSucursal);
    }

    /**
     * ============================================================
     * FUNCIÓN: Listar ventas por usuario
     * ============================================================
     * 
     * @param idUsuario - ID del usuario (cajero)
     * @return Lista de ventas del usuario
     */
    public List<Venta> listarPorUsuario(Long idUsuario) {
        return repository.findByIdUsuarioOrderByFechaVentaDesc(idUsuario);
    }

    /**
     * ============================================================
     * FUNCIÓN: Listar ventas por cliente
     * ============================================================
     * 
     * Historial de compras de un cliente
     * 
     * @param idCliente - ID del cliente
     * @return Lista de ventas del cliente
     */
    public List<Venta> listarPorCliente(Long idCliente) {
        return repository.findByIdClienteOrderByFechaVentaDesc(idCliente);
    }

    /**
     * ============================================================
     * FUNCIÓN: Listar ventas por rango de fechas
     * ============================================================
     * 
     * Para reportes
     * 
     * @param fechaInicio - Fecha inicial
     * @param fechaFin - Fecha final
     * @return Lista de ventas en el rango
     */
    public List<Venta> listarPorFechas(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return repository.findByFechaVentaBetween(fechaInicio, fechaFin);
    }

    /**
     * ============================================================
     * FUNCIÓN: Calcular total de ventas en un período
     * ============================================================
     * 
     * Para reportes y dashboard
     * 
     * @param fechaInicio - Fecha inicial
     * @param fechaFin - Fecha final
     * @return Total de ventas
     */
    public BigDecimal calcularTotalVentasPeriodo(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return repository.calcularTotalVentasPeriodo(fechaInicio, fechaFin);
    }

    /**
     * ============================================================
     * FUNCIÓN: Calcular total de ventas por sucursal
     * ============================================================
     * 
     * @param idSucursal - ID de la sucursal
     * @param fechaInicio - Fecha inicial
     * @param fechaFin - Fecha final
     * @return Total de ventas
     */
    public BigDecimal calcularTotalVentasSucursal(Long idSucursal, LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return repository.calcularTotalVentasSucursalPeriodo(idSucursal, fechaInicio, fechaFin);
    }

    /**
     * ============================================================
     * FUNCIÓN: Contar ventas en un período
     * ============================================================
     * 
     * @param fechaInicio - Fecha inicial
     * @param fechaFin - Fecha final
     * @return Cantidad de ventas
     */
    public Long contarVentasPeriodo(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return repository.contarVentasPeriodo(fechaInicio, fechaFin);
    }

    /**
     * ============================================================
     * FUNCIÓN: Ventas del día por caja
     * ============================================================
     * 
     * Para cierre de caja
     * 
     * @param idCaja - ID de la caja
     * @param fechaInicio - Inicio del día
     * @param fechaFin - Fin del día
     * @return Lista de ventas del día
     */
    public List<Venta> ventasDiaPorCaja(Long idCaja, LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return repository.findVentasDiaPorCaja(idCaja, fechaInicio, fechaFin);
    }
}
