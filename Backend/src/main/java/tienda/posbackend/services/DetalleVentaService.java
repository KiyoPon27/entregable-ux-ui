package tienda.posbackend.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import tienda.posbackend.dto.DetalleVentaDTO;
import tienda.posbackend.entities.*;
import tienda.posbackend.repositories.*;
import tienda.posbackend.exceptions.ResourceNotFoundException;
import tienda.posbackend.exceptions.BusinessRuleException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class DetalleVentaService {

    private final DetalleVentaRepository detalleVentaRepository;
    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;
    private final SucursalRepository sucursalRepository;
    private final AlmacenRepository almacenRepository;
    private final StockRepository stockRepository;
    private final MovimientoStockRepository movimientoStockRepository;

    @Transactional
    public void insertarDetalle(DetalleVentaDTO dto) {
        // Obtener el producto para validaciones
        Producto producto = productoRepository.findById(dto.getIdProducto())
            .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
        
        // Buscar si ya existe un detalle con el mismo producto y almacén en esta venta
        Optional<DetalleVenta> existing = detalleVentaRepository
                .findByVentaId(dto.getIdVenta()).stream()
                .filter(d -> d.getProducto().getId().equals(dto.getIdProducto()) && 
                             // Safe comparison for almacen (both could be null)
                             ((d.getAlmacen() == null && dto.getIdAlmacen() == null) ||
                              (d.getAlmacen() != null && dto.getIdAlmacen() != null && 
                               d.getAlmacen().getId().equals(dto.getIdAlmacen()))))
                .findFirst();

        BigDecimal cantidadNecesaria = dto.getCantidad();
        
        // Si ya existe el detalle, la cantidad necesaria es la adicional
        if (existing.isPresent()) {
            cantidadNecesaria = dto.getCantidad(); // Cantidad adicional que se quiere agregar
        }
        
        // 1️⃣ VALIDAR Y DESCONTAR STOCK SI EL PRODUCTO MANEJA INVENTARIOS
        if (Boolean.TRUE.equals(producto.getManejaInventarios())) {
            if (dto.getIdAlmacen() == null) {
                throw new BusinessRuleException(
                    "El producto '" + producto.getNombre() + "' maneja inventarios. Debe especificar un almacén"
                );
            }
            
            // Obtener el stock actual
            Stock stock = stockRepository.findByProductoIdAndAlmacenId(
                dto.getIdProducto(), 
                dto.getIdAlmacen()
            );
            
            if (stock == null) {
                throw new BusinessRuleException(
                    "No existe registro de stock para '" + producto.getNombre() + 
                    "' en el almacén especificado"
                );
            }
            
            // Validar que haya stock suficiente
            if (stock.getStock().compareTo(cantidadNecesaria) < 0) {
                throw new BusinessRuleException(
                    "Stock insuficiente para '" + producto.getNombre() + "'. " +
                    "Solicita: " + cantidadNecesaria + ", " +
                    "Disponible: " + stock.getStock()
                );
            }
            
            // Descontar el stock inmediatamente
            stock.setStock(stock.getStock().subtract(cantidadNecesaria));
            stockRepository.save(stock);
            
            // Registrar movimiento de stock
            MovimientoStock movimiento = new MovimientoStock();
            movimiento.setAlmacen(stock.getAlmacen());
            movimiento.setProducto(producto);
            movimiento.setTipoMovimiento("salida");
            movimiento.setCantidad(cantidadNecesaria);
            movimiento.setFecha(LocalDateTime.now());
            movimiento.setDetalle("Agregado a detalle de venta (ID venta: " + dto.getIdVenta() + ")");
            movimiento.setOrigen("ventas");
            movimientoStockRepository.save(movimiento);
        }
        
        // 2️⃣ INSERTAR O ACTUALIZAR EL DETALLE DE VENTA
        if (existing.isPresent()) {
            // Actualizar cantidad del detalle existente
            DetalleVenta detalle = existing.get();
            detalle.setCantidad(detalle.getCantidad().add(dto.getCantidad()));
            // Recalculate total: (OldQty + NewQty) * Price
            detalle.setTotal(detalle.getCantidad().multiply(dto.getPrecioVenta()));
            detalleVentaRepository.save(detalle);
        } else {
            // Crear nuevo detalle
            DetalleVenta detalle = new DetalleVenta();
            
            Venta venta = ventaRepository.findById(dto.getIdVenta())
                .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada"));
            detalle.setVenta(venta);
            
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
        
        // 3️⃣ ACTUALIZAR TOTALES DE LA VENTA
        actualizarTotalesVenta(dto.getIdVenta());
    }

    @Transactional
    public void editarCantidad(Long id, BigDecimal cantidad) {
        DetalleVenta detalle = detalleVentaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Detalle no encontrado"));
        
        // 1️⃣ SI CANTIDAD ES 0, ELIMINAR EL DETALLE (devuelve stock automáticamente)
        if (cantidad.compareTo(BigDecimal.ZERO) == 0) {
            eliminar(id);
            return;
        }
        
        // 2️⃣ SI HAY CAMBIO EN LA CANTIDAD, AJUSTAR STOCK
        BigDecimal diferencia = cantidad.subtract(detalle.getCantidad());
        
        if (diferencia.compareTo(BigDecimal.ZERO) != 0 && 
            Boolean.TRUE.equals(detalle.getProducto().getManejaInventarios()) &&
            detalle.getAlmacen() != null) {
            
            Stock stock = stockRepository.findByProductoIdAndAlmacenId(
                detalle.getProducto().getId(),
                detalle.getAlmacen().getId()
            );
            
            if (stock != null) {
                if (diferencia.compareTo(BigDecimal.ZERO) > 0) {
                    // Incremento de cantidad: validar y descontar más stock
                    if (stock.getStock().compareTo(diferencia) < 0) {
                        throw new BusinessRuleException(
                            "Stock insuficiente para '" + detalle.getProducto().getNombre() + "'. " +
                            "Incremento solicitado: " + diferencia + ", " +
                            "Disponible: " + stock.getStock()
                        );
                    }
                    stock.setStock(stock.getStock().subtract(diferencia));
                    
                    // Registrar movimiento de salida
                    MovimientoStock movimiento = new MovimientoStock();
                    movimiento.setAlmacen(stock.getAlmacen());
                    movimiento.setProducto(detalle.getProducto());
                    movimiento.setTipoMovimiento("salida");
                    movimiento.setCantidad(diferencia);
                    movimiento.setFecha(LocalDateTime.now());
                    movimiento.setDetalle("Incremento de cantidad en detalle de venta");
                    movimiento.setOrigen("ventas");
                    movimientoStockRepository.save(movimiento);
                } else {
                    // Decremento de cantidad: devolver al stock
                    BigDecimal cantidadDevolver = diferencia.abs();
                    stock.setStock(stock.getStock().add(cantidadDevolver));
                    
                    // Registrar movimiento de entrada
                    MovimientoStock movimiento = new MovimientoStock();
                    movimiento.setAlmacen(stock.getAlmacen());
                    movimiento.setProducto(detalle.getProducto());
                    movimiento.setTipoMovimiento("entrada");
                    movimiento.setCantidad(cantidadDevolver);
                    movimiento.setFecha(LocalDateTime.now());
                    movimiento.setDetalle("Decremento de cantidad en detalle de venta");
                    movimiento.setOrigen("ventas");
                    movimientoStockRepository.save(movimiento);
                }
                stockRepository.save(stock);
            }
        }
        
        // 3️⃣ ACTUALIZAR CANTIDAD Y TOTAL
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
        Producto producto = detalle.getProducto();
        
        // 1️⃣ SI EL PRODUCTO MANEJA INVENTARIOS, DEVOLVER STOCK
        if (Boolean.TRUE.equals(producto.getManejaInventarios()) && detalle.getAlmacen() != null) {
            Stock stock = stockRepository.findByProductoIdAndAlmacenId(
                producto.getId(), 
                detalle.getAlmacen().getId()
            );
            
            if (stock != null) {
                // Incrementar stock (devolver lo que se había descontado)
                stock.setStock(stock.getStock().add(detalle.getCantidad()));
                stockRepository.save(stock);
                
                // Registrar movimiento de entrada
                MovimientoStock movimiento = new MovimientoStock();
                movimiento.setAlmacen(detalle.getAlmacen());
                movimiento.setProducto(producto);
                movimiento.setTipoMovimiento("entrada");
                movimiento.setCantidad(detalle.getCantidad());
                movimiento.setFecha(LocalDateTime.now());
                movimiento.setDetalle("Devolución por eliminación de detalle venta (ID venta: " + idVenta + ")");
                movimiento.setOrigen("ventas");
                movimientoStockRepository.save(movimiento);
            }
        }
        
        // 2️⃣ ELIMINAR DETALLE
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
    
    @Transactional(readOnly = true)
    public List<tienda.posbackend.dto.DetalleVentaResponseDTO> listarPorVentaDTO(Long idVenta) {
        List<DetalleVenta> detalles = detalleVentaRepository.findByVentaId(idVenta);
        return detalles.stream()
            .map(this::convertirADTO)
            .toList();
    }
    
    private tienda.posbackend.dto.DetalleVentaResponseDTO convertirADTO(DetalleVenta detalle) {
        // Crear DTO simplificado del producto para evitar lazy loading issues
        tienda.posbackend.dto.DetalleVentaResponseDTO.ProductoSimpleDTO productoDTO = null;
        if (detalle.getProducto() != null) {
            productoDTO = tienda.posbackend.dto.DetalleVentaResponseDTO.ProductoSimpleDTO.builder()
                .id(detalle.getProducto().getId())
                .nombre(detalle.getProducto().getNombre())
                .precioVenta(detalle.getProducto().getPrecioVenta())
                .precioCompra(detalle.getProducto().getPrecioCompra())
                .codigoBarras(detalle.getProducto().getCodigoBarras())
                .codigoInterno(detalle.getProducto().getCodigoInterno())
                .build();
        }
        
        return tienda.posbackend.dto.DetalleVentaResponseDTO.builder()
            .id(detalle.getId())
            .id_venta(detalle.getVenta() != null ? detalle.getVenta().getId() : null)
            .producto(productoDTO)
            .cantidad(detalle.getCantidad())
            .precio_venta(detalle.getPrecioVenta())
            .precio_compra(detalle.getPrecioCompra())
            .total(detalle.getTotal())
            .descripcion(detalle.getDescripcion())
            .estado(detalle.getEstado())
            .id_almacen(detalle.getAlmacen() != null ? detalle.getAlmacen().getId() : null)
            .id_sucursal(detalle.getSucursal() != null ? detalle.getSucursal().getId() : null)
            .build();
    }
}
