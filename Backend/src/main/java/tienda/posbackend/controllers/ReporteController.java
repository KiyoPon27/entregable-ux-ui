package tienda.posbackend.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.dto.*;
import tienda.posbackend.services.ReporteService;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReporteController {

    private final ReporteService reporteService;

    /**
     * Reporte de productos con stock bajo mínimo
     * GET /api/reportes/stock-bajo-minimo
     * Params: sucursalId, almacenId
     */
    @GetMapping("/stock-bajo-minimo")
    public ResponseEntity<List<StockBajoMinimoDTO>> stockBajoMinimo(
            @RequestParam Long sucursalId,
            @RequestParam Long almacenId) {
        
        return ResponseEntity.ok(reporteService.reporteStockBajoMinimo(sucursalId, almacenId));
    }

    /**
     * Reporte de inventario valorizado por almacén
     * GET /api/reportes/stock-por-almacen
     * Params: sucursalId, almacenId
     */
    @GetMapping("/stock-por-almacen")
    public ResponseEntity<List<StockPorAlmacenDTO>> stockPorAlmacen(
            @RequestParam Long sucursalId,
            @RequestParam Long almacenId) {
        
        return ResponseEntity.ok(reporteService.reporteStockPorAlmacen(sucursalId, almacenId));
    }

    /**
     * Reporte de ventas por sucursal y rango de fechas
     * GET /api/reportes/ventas-por-sucursal/{sucursalId}
     * Params: fechaInicio, fechaFin
     */
    @GetMapping("/ventas-por-sucursal/{sucursalId}")
    public ResponseEntity<List<ReporteVentaSucursalDTO>> ventasPorSucursal(
            @PathVariable Long sucursalId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        
        return ResponseEntity.ok(reporteService.reporteVentasPorSucursal(sucursalId, fechaInicio, fechaFin));
    }
}
