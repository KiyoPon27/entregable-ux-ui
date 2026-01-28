package tienda.posbackend.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import tienda.posbackend.dto.ConfirmarVentaDTO;
import tienda.posbackend.dto.VentaConfirmadaDTO;
import tienda.posbackend.dto.VentaDetalleCompletoDTO;
import tienda.posbackend.dto.VentaDetalleCompletoDTO.*;
import tienda.posbackend.entities.*;
import tienda.posbackend.repositories.*;
import tienda.posbackend.exceptions.ResourceNotFoundException;
import tienda.posbackend.exceptions.BusinessRuleException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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
    private final TipoComprobanteRepository tipoComprobanteRepository;
    private final MovimientoCajaRepository movimientoCajaRepository;
    private final EmpresaRepository empresaRepository;
    private final MovimientoStockRepository movimientoStockRepository;

    @Transactional
    public void eliminar(Long id) {
        Venta venta = ventaRepository.findById(id).orElse(null);
        if (venta != null) {
            List<DetalleVenta> detalles = detalleVentaRepository.findByVentaId(id);
            System.out.println("Detalles encontrados para venta " + id + ": " + detalles.size());
            for (DetalleVenta detalle : detalles) {
                Producto producto = detalle.getProducto();
                if (Boolean.TRUE.equals(producto.getManejaInventarios()) && detalle.getAlmacen() != null) {
                    Stock stock = stockRepository.findByProductoIdAndAlmacenId(
                        producto.getId(),
                        detalle.getAlmacen().getId()
                    );
                    if (stock != null) {
                        System.out.println("Revirtiendo stock de producto " + producto.getNombre() +
                            " en almacén " + detalle.getAlmacen().getNombre() +
                            " cantidad: " + detalle.getCantidad());
                        stock.setStock(stock.getStock().add(detalle.getCantidad()));
                        stockRepository.save(stock);
                    } else {
                        System.out.println("No se encontró stock para producto " + producto.getNombre() +
                            " en almacén " + detalle.getAlmacen().getNombre());
                    }
                }
            }
        }
        ventaRepository.deleteById(id);
        System.out.println("Venta " + id + " eliminada correctamente.");
    }

    @Transactional
    public void eliminarIncompletas(Long idUsuario, Long idCierreCaja) {
        // Buscar ventas con estado 'nueva' para el usuario y cierreCaja
        List<Venta> ventasIncompletas = ventaRepository.findByEstadoAndUsuarioIdAndCierreCajaId("nueva", idUsuario, idCierreCaja);
        for (Venta venta : ventasIncompletas) {
            List<DetalleVenta> detalles = detalleVentaRepository.findByVentaId(venta.getId());
            System.out.println("Detalles encontrados para venta " + venta.getId() + ": " + detalles.size());
            for (DetalleVenta detalle : detalles) {
                Producto producto = detalle.getProducto();
                if (Boolean.TRUE.equals(producto.getManejaInventarios()) && detalle.getAlmacen() != null) {
                    Stock stock = stockRepository.findByProductoIdAndAlmacenId(
                        producto.getId(),
                        detalle.getAlmacen().getId()
                    );
                    if (stock != null) {
                        System.out.println("Revirtiendo stock de producto " + producto.getNombre() +
                            " en almacén " + detalle.getAlmacen().getNombre() +
                            " cantidad: " + detalle.getCantidad());
                        stock.setStock(stock.getStock().add(detalle.getCantidad()));
                        stockRepository.save(stock);
                    } else {
                        System.out.println("No se encontró stock para producto " + producto.getNombre() +
                            " en almacén " + detalle.getAlmacen().getNombre());
                    }
                }
            }
            ventaRepository.delete(venta); // Elimina en cascada los detalles
            System.out.println("Venta " + venta.getId() + " eliminada correctamente.");
        }
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
                // REGISTRAR MOVIMIENTOS AGRUPADOS POR PRODUCTO Y ALMACÉN SOLO AL CONFIRMAR LA VENTA
                java.util.List<DetalleVenta> detallesVenta = detalleVentaRepository.findByVentaId(idVenta);
                java.util.Map<String, BigDecimal> agrupados = new java.util.HashMap<>();
                java.util.Map<String, DetalleVenta> detalleReferencia = new java.util.HashMap<>();
                for (DetalleVenta d : detallesVenta) {
                    if (Boolean.TRUE.equals(d.getProducto().getManejaInventarios()) && d.getAlmacen() != null) {
                        String key = d.getProducto().getId() + "-" + d.getAlmacen().getId();
                        agrupados.put(key, agrupados.getOrDefault(key, BigDecimal.ZERO).add(d.getCantidad()));
                        detalleReferencia.put(key, d);
                    }
                }
                for (String key : agrupados.keySet()) {
                    DetalleVenta d = detalleReferencia.get(key);
                    MovimientoStock movimiento = new MovimientoStock();
                    movimiento.setAlmacen(d.getAlmacen());
                    movimiento.setProducto(d.getProducto());
                    movimiento.setTipoMovimiento("salida");
                    movimiento.setCantidad(agrupados.get(key));
                    movimiento.setFecha(LocalDateTime.now());
                    movimiento.setDetalle("Venta agrupada (ID venta: " + idVenta + ")");
                    movimiento.setOrigen("ventas");
                    movimientoStockRepository.save(movimiento);
                }
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
    
    /**
     * Obtener detalle completo de una venta para regenerar PDF
     * Incluye: empresa, venta, productos, cliente y métodos de pago
     */
    @Transactional(readOnly = true)
    public VentaDetalleCompletoDTO obtenerDetalleCompleto(Long idVenta) {
        // 1. Obtener venta con relaciones
        Venta venta = ventaRepository.findById(idVenta)
            .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada con ID: " + idVenta));
        
        // Force lazy loading
        if (venta.getSucursal() != null) {
            venta.getSucursal().getEmpresa().getNombre(); // Force load
        }
        if (venta.getCliente() != null) {
            venta.getCliente().getNombres(); // Force load
        }
        
        // 2. Obtener empresa
        Empresa empresa;
        if (venta.getSucursal() != null && venta.getSucursal().getEmpresa() != null) {
            empresa = venta.getSucursal().getEmpresa();
        } else if (venta.getEmpresa() != null) {
            empresa = venta.getEmpresa();
        } else {
            throw new ResourceNotFoundException("No se encontró empresa asociada a la venta");
        }
        
        // 3. Obtener detalles de venta (productos)
        List<DetalleVenta> detalles = detalleVentaRepository.findByVentaId(idVenta);
        
        // Force lazy loading of products
        detalles.forEach(detalle -> {
            if (detalle.getProducto() != null) {
                detalle.getProducto().getNombre(); // Force load
            }
        });
        
        // 4. Obtener movimientos de caja (métodos de pago)
        List<MovimientoCaja> movimientos = movimientoCajaRepository.findByVentaId(idVenta);
        
        // Force lazy loading of metodo pago
        movimientos.forEach(movimiento -> {
            if (movimiento.getMetodoPago() != null) {
                movimiento.getMetodoPago().getNombre(); // Force load
            }
        });
        
        // 5. Construir DTO de empresa
        EmpresaDTO empresaDTO = EmpresaDTO.builder()
            .id(empresa.getId())
            .nombre(empresa.getNombre())
            .logo(empresa.getLogo())
            .id_fiscal(empresa.getIdFiscal())
            .idFiscal(empresa.getIdFiscal())
            .direccion_fiscal(empresa.getDireccionFiscal())
            .direccionFiscal(empresa.getDireccionFiscal())
            .simbolo_moneda(empresa.getSimboloMoneda())
            .simboloMoneda(empresa.getSimboloMoneda())
            .nombre_moneda(empresa.getNombreMoneda())
            .nombreMoneda(empresa.getNombreMoneda())
            .pie_pagina_ticket(empresa.getPiePaginaTicket())
            .piePaginaTicket(empresa.getPiePaginaTicket())
            .impuesto(empresa.getImpuesto())
            .valor_impuesto(empresa.getValorImpuesto())
            .valorImpuesto(empresa.getValorImpuesto())
            .build();
        
        // 6. Construir DTO de venta (incluyendo usuario/cajero)
        UsuarioDTO usuarioDTO = null;
        if (venta.getUsuario() != null) {
            usuarioDTO = UsuarioDTO.builder()
                .id(venta.getUsuario().getId())
                .nombres(venta.getUsuario().getNombres())
                .build();
        }
        
        VentaDTO ventaDTO = VentaDTO.builder()
            .id(venta.getId())
            .nroComprobante(venta.getNroComprobante())
            .fecha(venta.getFecha())
            .montoTotal(venta.getMontoTotal())
            .subTotal(venta.getSubTotal())
            .totalImpuestos(venta.getTotalImpuestos())
            .tipoComprobante(venta.getTipoComprobante())
            .estado(venta.getEstado())
            .usuario(usuarioDTO)
            .build();
        
        // 7. Construir lista de productos
        List<ProductoVentaDTO> productosDTO = detalles.stream()
            .map(detalle -> ProductoVentaDTO.builder()
                .id(detalle.getId())
                .cantidad(detalle.getCantidad() != null ? detalle.getCantidad().intValue() : 1)
                .precio_venta(detalle.getPrecioVenta())
                .precioVenta(detalle.getPrecioVenta())
                .total(detalle.getTotal())
                .productos(ProductoSimpleDTO.builder()
                    .id(detalle.getProducto().getId())
                    .nombre(detalle.getProducto().getNombre())
                    .build())
                .build())
            .collect(Collectors.toList());
        
        // 8. Construir DTO de cliente
        ClienteProveedor cliente = venta.getCliente();
        ClienteDTO clienteDTO = null;
        if (cliente != null) {
            clienteDTO = ClienteDTO.builder()
                .id(cliente.getId())
                .nombres(cliente.getNombres())
                .identificador_fiscal(cliente.getIdentificadorFiscal())
                .identificadorFiscal(cliente.getIdentificadorFiscal())
                .build();
        }
        
        // 9. Construir lista de métodos de pago
        List<MetodoPagoDTO> metodosPagoDTO = movimientos.stream()
            .map(movimiento -> MetodoPagoDTO.builder()
                .tipo(movimiento.getMetodoPago() != null ? movimiento.getMetodoPago().getNombre() : "Efectivo")
                .monto(movimiento.getMonto())
                .vuelto(movimiento.getVuelto() != null ? movimiento.getVuelto() : BigDecimal.ZERO)
                .build())
            .collect(Collectors.toList());
        
        // 10. Construir DTO completo
        return VentaDetalleCompletoDTO.builder()
            .dataempresa(empresaDTO)
            .dataventas(ventaDTO)
            .productos(productosDTO)
            .dataCliente(clienteDTO)
            .metodosPago(metodosPagoDTO)
            .nombreComprobante(venta.getTipoComprobante() != null ? venta.getTipoComprobante().toUpperCase() : "TICKET")
            .build();
    }
}
