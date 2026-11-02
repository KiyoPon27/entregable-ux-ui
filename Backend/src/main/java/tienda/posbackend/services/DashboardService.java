package tienda.posbackend.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.dto.*;
import tienda.posbackend.entities.Venta;
import tienda.posbackend.repositories.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CajaRepository cajaRepository;
    private final VentaRepository ventaRepository;
    private final DetalleVentaRepository detalleVentaRepository;
    private final CierreCajaRepository cierreCajaRepository;
    private final MovimientoCajaRepository movimientoCajaRepository;

    private BigDecimal calcularMontoNetoVenta(Venta venta) {
        // ✅ montoTotal ahora se guarda CON descuento aplicado
        // No restar montoDescuento aquí, solo retornar montoTotal directo
        return venta.getMontoTotal() != null ? venta.getMontoTotal() : BigDecimal.ZERO;
    }

    /**
     * Dashboard de cajas por sucursal con ventas
     * Equivalente a: dashboardcajasporsucursalyventas(_id_empresa)
     */
    @Transactional(readOnly = true)
    public List<DashboardCajaDTO> cajasConVentasPorEmpresa(Long idEmpresa) {
        return cajaRepository.findAll().stream()
            .filter(caja -> caja.getSucursal() != null && 
                          caja.getSucursal().getEmpresa() != null && 
                          caja.getSucursal().getEmpresa().getId().equals(idEmpresa))
            .map(caja -> {
                // Obtener último cierre de caja
                var ultimoCierre = cierreCajaRepository.findByCajaId(caja.getId())
                    .stream()
                    .max((c1, c2) -> c1.getId().compareTo(c2.getId()))
                    .orElse(null);
                
                // Calcular total de ventas si hay cierre activo
                BigDecimal totalVentas = BigDecimal.ZERO;
                if (ultimoCierre != null && ultimoCierre.getEstado() == 0) {
                    totalVentas = ventaRepository.findByCierreCajaId(ultimoCierre.getId())
                        .stream()
                        .map(this::calcularMontoNetoVenta)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                }
                
                return DashboardCajaDTO.builder()
                    .sucursalNombre(caja.getSucursal().getNombre())
                    .cajaDescripcion(caja.getDescripcion())
                    .fechaCreacion(caja.getFechaCreacion())
                    .totalVentas(totalVentas)
                    .estadoCaja(ultimoCierre != null ? ultimoCierre.getEstado().intValue() : 1)
                    .direccionFiscal(caja.getSucursal().getDireccionFiscal())
                    .idCaja(caja.getId())
                    .idSucursal(caja.getSucursal().getId())
                    .eliminar(caja.getEliminar())
                    .build();
            })
            .collect(Collectors.toList());
    }

    /**
     * Sumar cantidad total de productos vendidos
     * Equivalente a: dashboardsumarcantidaddetalleventa(_id_empresa, _fecha_inicio, _fecha_fin)
     */
    @Transactional(readOnly = true)
    public BigDecimal sumarCantidadProductosVendidos(Long idEmpresa, LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return ventaRepository.findAll().stream()
            .filter(v -> v.getEmpresa() != null && v.getEmpresa().getId().equals(idEmpresa))
            .filter(v -> !v.getFecha().isBefore(fechaInicio) && !v.getFecha().isAfter(fechaFin))
            .filter(v -> !"pendiente".equals(v.getEstado()))
            .map(v -> v.getCantidadProductos() != null ? BigDecimal.valueOf(v.getCantidadProductos()) : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Sumar ganancia de detalles de venta
     * Equivalente a: dashboardsumargananciadetalleventa(_id_empresa, _fecha_inicio, _fecha_fin)
     */
    @Transactional(readOnly = true)
    public BigDecimal sumarGananciaDetalleVenta(Long idEmpresa, LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return ventaRepository.findAll().stream()
            .filter(v -> v.getEmpresa() != null && v.getEmpresa().getId().equals(idEmpresa))
            .filter(v -> !v.getFecha().isBefore(fechaInicio) && !v.getFecha().isAfter(fechaFin))
            .filter(v -> !"pendiente".equals(v.getEstado()))
            .flatMap(v -> detalleVentaRepository.findByVentaId(v.getId()).stream())
            .map(detalle -> {
                BigDecimal precioVenta = detalle.getPrecioVenta() != null ? detalle.getPrecioVenta() : BigDecimal.ZERO;
                BigDecimal precioCompra = detalle.getPrecioCompra() != null ? detalle.getPrecioCompra() : BigDecimal.ZERO;
                BigDecimal cantidad = detalle.getCantidad() != null ? detalle.getCantidad() : BigDecimal.ZERO;
                return precioVenta.subtract(precioCompra).multiply(cantidad);
            })
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Sumar total de ventas por empresa
     * Equivalente a: dashboardsumarventasporempresa(_id_empresa, _fecha_inicio, _fecha_fin)
     */
    @Transactional(readOnly = true)
    public BigDecimal sumarVentasPorEmpresa(Long idEmpresa, LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return ventaRepository.findAll().stream()
            .filter(v -> v.getEmpresa() != null && v.getEmpresa().getId().equals(idEmpresa))
            .filter(v -> !v.getFecha().isBefore(fechaInicio) && !v.getFecha().isAfter(fechaFin))
            .filter(v -> !"pendiente".equals(v.getEstado()))
            .map(this::calcularMontoNetoVenta)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Top 5 productos más vendidos (por cantidad)
     * Equivalente a: dashboardtop5productosmasvendidos(_id_empresa, _fecha_inicio, _fecha_fin)
     */
    @Transactional(readOnly = true)
    public List<ProductoMasVendidoDTO> top5ProductosMasVendidosPorCantidad(Long idEmpresa, LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        var ventas = ventaRepository.findAll().stream()
            .filter(v -> v.getEmpresa() != null && v.getEmpresa().getId().equals(idEmpresa))
            .filter(v -> !v.getFecha().isBefore(fechaInicio) && !v.getFecha().isAfter(fechaFin))
            .filter(v -> !"pendiente".equals(v.getEstado()))
            .collect(Collectors.toList());
        
        var totalGeneral = ventas.stream()
            .flatMap(v -> detalleVentaRepository.findByVentaId(v.getId()).stream())
            .map(d -> d.getCantidad() != null ? d.getCantidad() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return ventas.stream()
            .flatMap(v -> detalleVentaRepository.findByVentaId(v.getId()).stream())
            .collect(Collectors.groupingBy(
                detalle -> detalle.getProducto().getId(),
                Collectors.reducing(BigDecimal.ZERO, 
                    detalle -> detalle.getCantidad() != null ? detalle.getCantidad() : BigDecimal.ZERO,
                    BigDecimal::add)
            ))
            .entrySet().stream()
            .map(entry -> {
                var producto = ventas.stream()
                    .flatMap(v -> detalleVentaRepository.findByVentaId(v.getId()).stream())
                    .filter(d -> d.getProducto().getId().equals(entry.getKey()))
                    .findFirst()
                    .map(d -> d.getProducto())
                    .orElse(null);
                
                BigDecimal porcentaje = totalGeneral.compareTo(BigDecimal.ZERO) > 0 
                    ? entry.getValue().multiply(BigDecimal.valueOf(100)).divide(totalGeneral, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
                
                return ProductoMasVendidoDTO.builder()
                    .idProducto(entry.getKey())
                    .nombreProducto(producto != null ? producto.getNombre() : "")
                    .totalVendido(entry.getValue())
                    .porcentaje(porcentaje)
                    .build();
            })
            .sorted((p1, p2) -> p2.getTotalVendido().compareTo(p1.getTotalVendido()))
            .limit(5)
            .collect(Collectors.toList());
    }

    /**
     * Top 10 productos más vendidos (por monto)
     * Equivalente a: mostrartop10productosmasvendidosxmonto(_id_empresa, _fecha_inicio, _fecha_fin)
     */
    @Transactional(readOnly = true)
    public List<ProductoMasVendidoDTO> top10ProductosMasVendidosPorMonto(Long idEmpresa, LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        var ventas = ventaRepository.findAll().stream()
            .filter(v -> v.getEmpresa() != null && v.getEmpresa().getId().equals(idEmpresa))
            .filter(v -> !v.getFecha().isBefore(fechaInicio) && !v.getFecha().isAfter(fechaFin))
            .filter(v -> !"pendiente".equals(v.getEstado()))
            .collect(Collectors.toList());
        
        var totalGeneral = ventas.stream()
            .flatMap(v -> detalleVentaRepository.findByVentaId(v.getId()).stream())
            .map(d -> d.getTotal() != null ? d.getTotal() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return ventas.stream()
            .flatMap(v -> detalleVentaRepository.findByVentaId(v.getId()).stream())
            .collect(Collectors.groupingBy(
                detalle -> detalle.getProducto().getId(),
                Collectors.reducing(BigDecimal.ZERO, 
                    detalle -> detalle.getTotal() != null ? detalle.getTotal() : BigDecimal.ZERO,
                    BigDecimal::add)
            ))
            .entrySet().stream()
            .map(entry -> {
                var producto = ventas.stream()
                    .flatMap(v -> detalleVentaRepository.findByVentaId(v.getId()).stream())
                    .filter(d -> d.getProducto().getId().equals(entry.getKey()))
                    .findFirst()
                    .map(d -> d.getProducto())
                    .orElse(null);
                
                BigDecimal porcentaje = totalGeneral.compareTo(BigDecimal.ZERO) > 0 
                    ? entry.getValue().multiply(BigDecimal.valueOf(100)).divide(totalGeneral, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
                
                return ProductoMasVendidoDTO.builder()
                    .idProducto(entry.getKey())
                    .nombreProducto(producto != null ? producto.getNombre() : "")
                    .totalVendido(entry.getValue())
                    .porcentaje(porcentaje)
                    .build();
            })
            .sorted((p1, p2) -> p2.getTotalVendido().compareTo(p1.getTotalVendido()))
            .limit(10)
            .collect(Collectors.toList());
    }

    /**
     * Total de ventas por fecha
     * Equivalente a: dashboartotalventasconfechas(_id_empresa, _fecha_inicio, _fecha_fin)
     */
    @Transactional(readOnly = true)
    public List<VentasPorFechaDTO> totalVentasPorFecha(Long idEmpresa, LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return ventaRepository.findAll().stream()
            .filter(v -> v.getEmpresa() != null && v.getEmpresa().getId().equals(idEmpresa))
            .filter(v -> !v.getFecha().isBefore(fechaInicio) && !v.getFecha().isAfter(fechaFin))
            .filter(v -> !"pendiente".equals(v.getEstado()))
            .collect(Collectors.groupingBy(
                v -> v.getFecha().toLocalDate(),
                Collectors.reducing(BigDecimal.ZERO,
                    this::calcularMontoNetoVenta,
                    BigDecimal::add)
            ))
            .entrySet().stream()
            .map(entry -> VentasPorFechaDTO.builder()
                .fecha(entry.getKey())
                .totalVentas(entry.getValue())
                .build())
            .sorted((v1, v2) -> v1.getFecha().compareTo(v2.getFecha()))
            .collect(Collectors.toList());
    }

    /**
     * Total de ventas por método de pago y fecha
     * Equivalente a: dashboartotalventasxmetodopago(_id_empresa, _fecha_inicio, _fecha_fin)
     */
    @Transactional(readOnly = true)
    public List<VentasPorMetodoPagoDTO> totalVentasPorMetodoPago(Long idEmpresa, LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        var cierres = cierreCajaRepository.findAll().stream()
            .filter(cc -> cc.getCaja() != null && 
                         cc.getCaja().getSucursal() != null && 
                         cc.getCaja().getSucursal().getEmpresa() != null &&
                         cc.getCaja().getSucursal().getEmpresa().getId().equals(idEmpresa))
            .collect(Collectors.toList());
        
        return movimientoCajaRepository.findAll().stream()
            .filter(mc -> cierres.stream().anyMatch(cc -> cc.getId().equals(mc.getCierreCaja().getId())))
            .filter(mc -> !mc.getFechaMovimiento().isBefore(fechaInicio) && !mc.getFechaMovimiento().isAfter(fechaFin))
            .filter(mc -> mc.getVenta() != null)
            .collect(Collectors.groupingBy(
                mc -> new Object[] {
                    mc.getFechaMovimiento().toLocalDate(),
                    mc.getMetodoPago() != null ? mc.getMetodoPago().getNombre() : "Sin método"
                },
                Collectors.reducing(BigDecimal.ZERO,
                    mc -> mc.getMonto() != null ? mc.getMonto() : BigDecimal.ZERO,
                    BigDecimal::add)
            ))
            .entrySet().stream()
            .map(entry -> {
                Object[] key = (Object[]) entry.getKey();
                return VentasPorMetodoPagoDTO.builder()
                    .fecha((LocalDate) key[0])
                    .metodoPago((String) key[1])
                    .totalVentas(entry.getValue())
                    .build();
            })
            .sorted((v1, v2) -> v1.getFecha().compareTo(v2.getFecha()))
            .collect(Collectors.toList());
    }
}
