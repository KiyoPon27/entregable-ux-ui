package tienda.posbackend.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import tienda.posbackend.dto.DetalleVentaDTO;
import tienda.posbackend.entities.*;
import tienda.posbackend.repositories.*;
import tienda.posbackend.exceptions.ResourceNotFoundException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DetalleVentaService {

    private final DetalleVentaRepository detalleVentaRepository;
    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;
    private final SucursalRepository sucursalRepository;
    private final AlmacenRepository almacenRepository;

    @Transactional
    public void insertarDetalle(DetalleVentaDTO dto) {
        // Find existing detail with same Venta, Producto, Almacen
        Optional<DetalleVenta> existing = detalleVentaRepository
                .findByVentaId(dto.getIdVenta()).stream()
                .filter(d -> d.getProducto().getId().equals(dto.getIdProducto()) && 
                             d.getAlmacen().getId().equals(dto.getIdAlmacen()))
                .findFirst();

        if (existing.isPresent()) {
            DetalleVenta detalle = existing.get();
            detalle.setCantidad(detalle.getCantidad().add(dto.getCantidad()));
            // Recalculate total: (OldQty + NewQty) * Price
            detalle.setTotal(detalle.getCantidad().multiply(dto.getPrecioVenta()));
            detalleVentaRepository.save(detalle);
        } else {
            DetalleVenta detalle = new DetalleVenta();
            
            Venta venta = ventaRepository.findById(dto.getIdVenta())
                .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada"));
            detalle.setVenta(venta);
            
            Producto producto = productoRepository.findById(dto.getIdProducto())
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
            detalle.setProducto(producto);
            
            if (dto.getIdSucursal() != null) {
                Sucursal sucursal = sucursalRepository.findById(dto.getIdSucursal())
                    .orElse(null);
                detalle.setSucursal(sucursal);
            }
            
            if (dto.getIdAlmacen() != null) {
                Almacen almacen = almacenRepository.findById(dto.getIdAlmacen())
                    .orElseThrow(() -> new ResourceNotFoundException("Almacen no encontrado"));
                detalle.setAlmacen(almacen);
            }

            detalle.setCantidad(dto.getCantidad());
            detalle.setPrecioVenta(dto.getPrecioVenta());
            detalle.setPrecioCompra(dto.getPrecioCompra());
            detalle.setDescripcion(dto.getDescripcion());
            detalle.setTotal(dto.getCantidad().multiply(dto.getPrecioVenta()));
            detalle.setEstado("nuevo"); // Default
            
            detalleVentaRepository.save(detalle);
        }
        
        actualizarTotalesVenta(dto.getIdVenta());
    }

    @Transactional
    public void editarCantidad(Long id, BigDecimal cantidad) {
        DetalleVenta detalle = detalleVentaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Detalle no encontrado"));
                
        detalle.setCantidad(cantidad);
        detalle.setTotal(cantidad.multiply(detalle.getPrecioVenta()));
        detalleVentaRepository.save(detalle);
        
        actualizarTotalesVenta(detalle.getVenta().getId());
    }

    @Transactional
    public void eliminar(Long id) {
        DetalleVenta detalle = detalleVentaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Detalle no encontrado"));
        Long idVenta = detalle.getVenta().getId();
        detalleVentaRepository.delete(detalle);
        actualizarTotalesVenta(idVenta);
    }
    
    private void actualizarTotalesVenta(Long idVenta) {
        List<DetalleVenta> detalles = detalleVentaRepository.findByVentaId(idVenta);
        
        BigDecimal montoTotal = detalles.stream()
                .map(DetalleVenta::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        BigDecimal cantidadProductos = detalles.stream()
                .map(DetalleVenta::getCantidad)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        Venta venta = ventaRepository.findById(idVenta).orElseThrow();
        venta.setMontoTotal(montoTotal);
        venta.setSubTotal(montoTotal); // Assuming subtotal matches total for now (no tax logic specified in simple rpc)
        venta.setCantidadProductos(cantidadProductos.longValue());
        
        ventaRepository.save(venta);
    }
    
    @Transactional(readOnly = true)
    public List<DetalleVenta> listarPorVenta(Long idVenta) {
        return detalleVentaRepository.findByVentaId(idVenta);
    }
}
