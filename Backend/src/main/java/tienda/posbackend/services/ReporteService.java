package tienda.posbackend.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.dto.*;
import tienda.posbackend.repositories.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReporteService {

    private final StockRepository stockRepository;
    private final VentaRepository ventaRepository;

    /**
     * Reporte de stock bajo mínimo
     * Equivalente a: report_stock_bajo_minimo(sucursal_id, almacen_id)
     */
    @Transactional(readOnly = true)
    public List<StockBajoMinimoDTO> reporteStockBajoMinimo(Long sucursalId, Long almacenId) {
        return stockRepository.findAll().stream()
            .filter(stock -> stock.getAlmacen() != null && stock.getAlmacen().getId().equals(almacenId))
            .filter(stock -> stock.getAlmacen().getSucursal() != null && stock.getAlmacen().getSucursal().getId().equals(sucursalId))
            .filter(stock -> stock.getStock() != null && stock.getStockMinimo() != null)
            .filter(stock -> stock.getStock().compareTo(stock.getStockMinimo()) <= 0)
            .map(stock -> {
                var producto = stock.getProducto();
                BigDecimal stockActual = stock.getStock() != null ? stock.getStock() : BigDecimal.ZERO;
                BigDecimal precioCompra = producto != null && producto.getPrecioCompra() != null 
                    ? producto.getPrecioCompra() : BigDecimal.ZERO;
                BigDecimal total = stockActual.multiply(precioCompra);
                
                return StockBajoMinimoDTO.builder()
                    .codigoArticulo(producto != null ? producto.getCodigoBarras() : "-")
                    .descripcionArticulo(producto != null ? producto.getNombre() : "-")
                    .stock(stockActual)
                    .stockMinimo(stock.getStockMinimo())
                    .precioCosto(precioCompra)
                    .total(total)
                    .build();
            })
            .collect(Collectors.toList());
    }

    /**
     * Reporte de stock por almacén y sucursal (inventario valorizado)
     * Equivalente a: report_stock_por_almacen_sucursal(sucursal_id, almacen_id)
     */
    @Transactional(readOnly = true)
    public List<StockPorAlmacenDTO> reporteStockPorAlmacen(Long sucursalId, Long almacenId) {
        return stockRepository.findAll().stream()
            .filter(stock -> stock.getAlmacen() != null && stock.getAlmacen().getId().equals(almacenId))
            .filter(stock -> stock.getAlmacen().getSucursal() != null && stock.getAlmacen().getSucursal().getId().equals(sucursalId))
            .filter(stock -> stock.getStock() != null && stock.getStock().compareTo(BigDecimal.ZERO) > 0)
            .map(stock -> {
                var producto = stock.getProducto();
                BigDecimal stockActual = stock.getStock() != null ? stock.getStock() : BigDecimal.ZERO;
                BigDecimal precioCompra = producto != null && producto.getPrecioCompra() != null 
                    ? producto.getPrecioCompra() : BigDecimal.ZERO;
                BigDecimal total = stockActual.multiply(precioCompra);
                
                return StockPorAlmacenDTO.builder()
                    .codigoArticulo(producto != null ? producto.getCodigoBarras() : "-")
                    .descripcionArticulo(producto != null ? producto.getNombre() : "-")
                    .stock(stockActual)
                    .precioCosto(precioCompra)
                    .total(total)
                    .build();
            })
            .collect(Collectors.toList());
    }

    /**
     * Reporte de ventas por sucursal y rango de fechas
     * Equivalente a: report_ventas_por_sucursal(sucursal_id, fecha_inicio, fecha_fin)
     */
    @Transactional(readOnly = true)
    public List<ReporteVentaSucursalDTO> reporteVentasPorSucursal(Long sucursalId, LocalDate fechaInicio, LocalDate fechaFin) {
        return ventaRepository.findAll().stream()
            .filter(v -> v.getSucursal() != null && v.getSucursal().getId().equals(sucursalId))
            .filter(v -> {
                LocalDate fechaVenta = v.getFecha().toLocalDate();
                return !fechaVenta.isBefore(fechaInicio) && !fechaVenta.isAfter(fechaFin);
            })
            .map(venta -> {
                var usuario = venta.getUsuario();
                String cajero = usuario != null ? usuario.getNombres() : "Sin usuario";
                
                return ReporteVentaSucursalDTO.builder()
                    .idVenta(venta.getId())
                    .fecha(venta.getFecha())
                    .montoTotal(venta.getMontoTotal())
                    .totalImpuestos(venta.getTotalImpuestos())
                    .subtotal(venta.getSubTotal())
                    .saldo(venta.getSaldo())
                    .cantidadProductos(venta.getCantidadProductos())
                    .idUsuario(venta.getUsuario() != null ? venta.getUsuario().getId() : null)
                    .cajero(cajero)
                    .idCliente(venta.getCliente() != null ? venta.getCliente().getId() : null)
                    .estado(venta.getEstado())
                    .build();
            })
            .collect(Collectors.toList());
    }
}
