package tienda.posbackend.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import tienda.posbackend.dto.ConfirmarVentaDTO;
import tienda.posbackend.entities.*;
import tienda.posbackend.repositories.*;
import tienda.posbackend.exceptions.ResourceNotFoundException;
import tienda.posbackend.exceptions.BusinessRuleException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VentaService {

    private final VentaRepository ventaRepository;
    private final DetalleVentaRepository detalleVentaRepository;
    private final StockRepository stockRepository;
    private final MovimientoStockRepository movimientoStockRepository;
    private final SerializacionComprobanteService serializacionComprobanteService;
    private final UsuarioRepository usuarioRepository;
    private final ClienteProveedorRepository clienteProveedorRepository;

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
    public Venta confirmarVenta(Long idVenta, ConfirmarVentaDTO dto) {
        Venta venta = ventaRepository.findById(idVenta)
                .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada con ID: " + idVenta));

        if ("confirmada".equalsIgnoreCase(venta.getEstado())) {
             throw new BusinessRuleException("La venta ya ha sido confirmada.");
        }

        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + dto.getIdUsuario()));
            
        ClienteProveedor cliente = clienteProveedorRepository.findById(dto.getIdCliente())
            .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con ID: " + dto.getIdCliente()));

        // 1. Process Stock Logic (Mimicking Trigger logic + Confirmation)
        List<DetalleVenta> detalles = detalleVentaRepository.findByVentaId(idVenta);
        
        for (DetalleVenta detalle : detalles) {
            Producto producto = detalle.getProducto();
            
            // Only handle inventory if product is managed and ACTIVE
            if (Boolean.TRUE.equals(producto.getManejaInventarios())) {
                Almacen almacen = detalle.getAlmacen();
                if (almacen == null) {
                     throw new BusinessRuleException("Detalle de venta " + detalle.getId() + " sin almacén asignado para producto: " + producto.getNombre());
                }
                
                Stock stock = stockRepository.findByProductoIdAndAlmacenId(producto.getId(), almacen.getId());
                if (stock == null) {
                    throw new BusinessRuleException("No existe registro de stock para " + producto.getNombre() + " en almacén " + almacen.getNombre());
                }
                
                if (stock.getStock().compareTo(detalle.getCantidad()) < 0) {
                     throw new BusinessRuleException("Stock insuficiente para " + producto.getNombre() + ". Solicita: " + detalle.getCantidad() + ", Disponible: " + stock.getStock());
                }
                
                // Deduct Stock
                stock.setStock(stock.getStock().subtract(detalle.getCantidad()));
                stockRepository.save(stock);
                
                // Record Movement
                MovimientoStock movimiento = new MovimientoStock();
                movimiento.setAlmacen(almacen);
                movimiento.setProducto(producto);
                movimiento.setTipoMovimiento("salida");
                movimiento.setCantidad(detalle.getCantidad());
                movimiento.setFecha(LocalDateTime.now());
                movimiento.setDetalle("Venta confirmada #" + venta.getId());
                movimiento.setOrigen("ventas");
                movimientoStockRepository.save(movimiento);
            }
        }

        // 2. Generate Number
        // Note: The SQL function takes _id_sucursal from params.
        String nuevoComprobante = serializacionComprobanteService.generarNumero(
            dto.getIdTipoComprobante(),
            dto.getSerie(),
            dto.getIdSucursal()
        );

        // 3. Update Venta
        venta.setEstado("confirmada");
        venta.setNroComprobante(nuevoComprobante);
        venta.setUsuario(usuario);
        venta.setVuelto(dto.getVuelto());
        venta.setCliente(cliente);
        venta.setFecha(dto.getFecha());
        venta.setMontoTotal(dto.getMontoTotal());
        
        return ventaRepository.save(venta);
    }
}
