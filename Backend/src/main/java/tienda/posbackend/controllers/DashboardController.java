package tienda.posbackend.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.dto.*;
import tienda.posbackend.services.DashboardService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * Dashboard de cajas por sucursal con ventas
     * GET /api/dashboard/cajas/empresa/{idEmpresa}
     */
    @GetMapping("/cajas/empresa/{idEmpresa}")
    public ResponseEntity<List<DashboardCajaDTO>> cajasConVentas(@PathVariable Long idEmpresa) {
        return ResponseEntity.ok(dashboardService.cajasConVentasPorEmpresa(idEmpresa));
    }

    /**
     * Resumen de ventas (cantidad, ganancia, total)
     * GET /api/dashboard/resumen/empresa/{idEmpresa}
     */
    @GetMapping("/resumen/empresa/{idEmpresa}")
    public ResponseEntity<Map<String, BigDecimal>> resumenVentas(
            @PathVariable Long idEmpresa,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin) {
        
        Map<String, BigDecimal> resumen = new HashMap<>();
        resumen.put("cantidadProductos", dashboardService.sumarCantidadProductosVendidos(idEmpresa, fechaInicio, fechaFin));
        resumen.put("gananciaTotal", dashboardService.sumarGananciaDetalleVenta(idEmpresa, fechaInicio, fechaFin));
        resumen.put("totalVentas", dashboardService.sumarVentasPorEmpresa(idEmpresa, fechaInicio, fechaFin));
        
        return ResponseEntity.ok(resumen);
    }

    /**
     * Top 5 productos más vendidos por cantidad
     * GET /api/dashboard/top5-productos-cantidad/empresa/{idEmpresa}
     */
    @GetMapping("/top5-productos-cantidad/empresa/{idEmpresa}")
    public ResponseEntity<List<ProductoMasVendidoDTO>> top5ProductosCantidad(
            @PathVariable Long idEmpresa,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin) {
        
        return ResponseEntity.ok(dashboardService.top5ProductosMasVendidosPorCantidad(idEmpresa, fechaInicio, fechaFin));
    }

    /**
     * Top 10 productos más vendidos por monto
     * GET /api/dashboard/top10-productos-monto/empresa/{idEmpresa}
     */
    @GetMapping("/top10-productos-monto/empresa/{idEmpresa}")
    public ResponseEntity<List<ProductoMasVendidoDTO>> top10ProductosMonto(
            @PathVariable Long idEmpresa,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin) {
        
        return ResponseEntity.ok(dashboardService.top10ProductosMasVendidosPorMonto(idEmpresa, fechaInicio, fechaFin));
    }

    /**
     * Ventas por fecha (gráfico de línea)
     * GET /api/dashboard/ventas-por-fecha/empresa/{idEmpresa}
     */
    @GetMapping("/ventas-por-fecha/empresa/{idEmpresa}")
    public ResponseEntity<List<VentasPorFechaDTO>> ventasPorFecha(
            @PathVariable Long idEmpresa,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin) {
        
        return ResponseEntity.ok(dashboardService.totalVentasPorFecha(idEmpresa, fechaInicio, fechaFin));
    }

    /**
     * Ventas por método de pago
     * GET /api/dashboard/ventas-por-metodo-pago/empresa/{idEmpresa}
     */
    @GetMapping("/ventas-por-metodo-pago/empresa/{idEmpresa}")
    public ResponseEntity<List<VentasPorMetodoPagoDTO>> ventasPorMetodoPago(
            @PathVariable Long idEmpresa,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin) {
        
        return ResponseEntity.ok(dashboardService.totalVentasPorMetodoPago(idEmpresa, fechaInicio, fechaFin));
    }
}
