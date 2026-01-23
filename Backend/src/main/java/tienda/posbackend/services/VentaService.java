package tienda.posbackend.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import tienda.posbackend.dto.ConfirmarVentaDTO;
import tienda.posbackend.dto.VentaConfirmadaDTO;
import tienda.posbackend.entities.*;
import tienda.posbackend.repositories.*;
import tienda.posbackend.exceptions.ResourceNotFoundException;
import tienda.posbackend.exceptions.BusinessRuleException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class VentaService {

    private final VentaRepository ventaRepository;
    private final DetalleVentaRepository detalleVentaRepository;
    private final StockRepository stockRepository;
    private final SerializacionComprobanteService serializacionComprobanteService;
    private final UsuarioRepository usuarioRepository;
    private final ClienteProveedorRepository clienteProveedorRepository;
    private final TipoComprobanteRepository tipoComprobanteRepository; // ✅ AGREGADO

    @Transactional
    public void eliminar(Long id) {
        ventaRepository.deleteById(id);
    }

    @Transactional
    public void eliminarIncompletas(Long idUsuario, Long idCierreCaja) {
        ventaRepository.deleteByEstadoAndUsuarioIdAndCierreCajaId("pendiente", idUsuario, idCierreCaja);
    }
    
    @Transactional(readOnly = true)
    public Venta buscarPorSucursalYEstado(Long idSucursal, String estado) {
        return ventaRepository.findBySucursalIdAndEstado(idSucursal, estado).orElse(null);
    }
    
    @Transactional
    public Venta guardar(Venta venta) {
        // Ensure defaults
        if (venta.getEstado() == null) venta.setEstado("nueva"); 
        // Logic to set date if null, etc.
        if (venta.getFecha() == null) venta.setFecha(LocalDateTime.now());
        
        return ventaRepository.save(venta);
    }

    @Transactional
    public VentaConfirmadaDTO confirmarVenta(Long idVenta, ConfirmarVentaDTO dto) {
        Venta venta = ventaRepository.findById(idVenta)
                .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada con ID: " + idVenta));

        if ("confirmada".equalsIgnoreCase(venta.getEstado())) {
             throw new BusinessRuleException("La venta ya ha sido confirmada.");
        }

        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + dto.getIdUsuario()));
            
        ClienteProveedor cliente = null;
        if (dto.getIdCliente() != null) {
            cliente = clienteProveedorRepository.findById(dto.getIdCliente())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con ID: " + dto.getIdCliente()));
        } else {
            // TRIGGER: Si no se especifica cliente, asignar el cliente genérico (ID 1)
            cliente = clienteProveedorRepository.findById(1L)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente genérico no encontrado. Debe existir un cliente con ID 1."));
        }
        
        // ✅ OBTENER EL NOMBRE DEL TIPO DE COMPROBANTE
        TipoComprobante tipoComprobante = tipoComprobanteRepository.findById(dto.getIdTipoComprobante())
            .orElseThrow(() -> new ResourceNotFoundException("Tipo de comprobante no encontrado con ID: " + dto.getIdTipoComprobante()));

        // NOTA IMPORTANTE: El stock YA FUE DESCONTADO al insertar/editar cada detalle de venta
        // No se descuenta aquí para evitar doble deducción
        // Solo validamos que no haya stock negativo (verificación de consistencia)
        List<DetalleVenta> detalles = detalleVentaRepository.findByVentaId(idVenta);
        
        for (DetalleVenta detalle : detalles) {
            Producto producto = detalle.getProducto();
            
            // Validar consistencia: si maneja inventarios, verificar que el stock no sea negativo
            if (Boolean.TRUE.equals(producto.getManejaInventarios()) && detalle.getAlmacen() != null) {
                Stock stock = stockRepository.findByProductoIdAndAlmacenId(
                    producto.getId(), 
                    detalle.getAlmacen().getId()
                );
                
                if (stock == null) {
                    throw new BusinessRuleException(
                        "No existe registro de stock para " + producto.getNombre() + 
                        " en almacén " + detalle.getAlmacen().getNombre()
                    );
                }
                
                // Verificar que el stock no sea negativo (indica error en la lógica)
                if (stock.getStock().compareTo(BigDecimal.ZERO) < 0) {
                    throw new BusinessRuleException(
                        "Stock negativo detectado para " + producto.getNombre() + 
                        ". Stock actual: " + stock.getStock() + 
                        ". Esto indica un problema de consistencia."
                    );
                }
            }
        }

        // Usar número de comprobante del DTO si está presente, sino generar automáticamente
        String nuevoComprobante;
        if (dto.getNroComprobante() != null && !dto.getNroComprobante().trim().isEmpty()) {
            nuevoComprobante = dto.getNroComprobante();
        } else {
            nuevoComprobante = serializacionComprobanteService.generarNumero(
                dto.getIdTipoComprobante(),
                dto.getSerie(),
                dto.getIdSucursal()
            );
        }

        // Actualizar la venta
        venta.setEstado("confirmada");
        venta.setNroComprobante(nuevoComprobante);
        venta.setUsuario(usuario);
        venta.setVuelto(dto.getVuelto());
        venta.setCliente(cliente);
        venta.setFecha(dto.getFecha());
        venta.setMontoTotal(dto.getMontoTotal());
        venta.setRucDni(dto.getRucDni()); // Guardar RUC/DNI
        venta.setTipoComprobante(tipoComprobante.getNombre()); // ✅ GUARDAR TIPO DE COMPROBANTE (FACTURA, BOLETA, TICKET)
        
        Venta ventaGuardada = ventaRepository.save(venta);
        
        // Construir DTO para evitar problemas de serialización lazy
        return VentaConfirmadaDTO.builder()
            .id(ventaGuardada.getId())
            .estado(ventaGuardada.getEstado())
            .nroComprobante(ventaGuardada.getNroComprobante())
            .fecha(ventaGuardada.getFecha())
            .montoTotal(ventaGuardada.getMontoTotal())
            .vuelto(ventaGuardada.getVuelto())
            .idUsuario(ventaGuardada.getUsuario() != null ? ventaGuardada.getUsuario().getId() : null)
            .idCliente(ventaGuardada.getCliente() != null ? ventaGuardada.getCliente().getId() : null)
            .idSucursal(ventaGuardada.getSucursal() != null ? ventaGuardada.getSucursal().getId() : null)
            .build();
    }
    
    @Transactional(readOnly = true)
    public List<Venta> filtrarFacturas(Long empresaId, String tipo, LocalDateTime fechaInicio, LocalDateTime fechaFin, String buscador) {
        return ventaRepository.findFacturasConFiltros(empresaId, tipo, fechaInicio, fechaFin, buscador);
    }
    
    @Transactional(readOnly = true)
    public java.util.Map<String, Object> obtenerEstadisticasFacturas(Long empresaId, LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        // Totales generales
        BigDecimal totalVentas = ventaRepository.sumTotalVentas(empresaId, fechaInicio, fechaFin);
        if (totalVentas == null) totalVentas = BigDecimal.ZERO;
        
        // Facturas
        Long countFacturas = ventaRepository.countByTipoComprobante(empresaId, "FACTURA", fechaInicio, fechaFin);
        BigDecimal totalFacturas = ventaRepository.sumTotalByTipoComprobante(empresaId, "FACTURA", fechaInicio, fechaFin);
        if (totalFacturas == null) totalFacturas = BigDecimal.ZERO;
        
        // Boletas
        Long countBoletas = ventaRepository.countByTipoComprobante(empresaId, "BOLETA", fechaInicio, fechaFin);
        BigDecimal totalBoletas = ventaRepository.sumTotalByTipoComprobante(empresaId, "BOLETA", fechaInicio, fechaFin);
        if (totalBoletas == null) totalBoletas = BigDecimal.ZERO;
        
        // Tickets
        Long countTickets = ventaRepository.countByTipoComprobante(empresaId, "TICKET", fechaInicio, fechaFin);
        BigDecimal totalTickets = ventaRepository.sumTotalByTipoComprobante(empresaId, "TICKET", fechaInicio, fechaFin);
        if (totalTickets == null) totalTickets = BigDecimal.ZERO;
        
        return java.util.Map.of(
            "totalVentas", totalVentas,
            "facturas", java.util.Map.of("count", countFacturas, "total", totalFacturas),
            "boletas", java.util.Map.of("count", countBoletas, "total", totalBoletas),
            "tickets", java.util.Map.of("count", countTickets, "total", totalTickets)
        );
    }
}
