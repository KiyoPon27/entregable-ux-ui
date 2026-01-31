package tienda.posbackend.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.dto.ConfirmarVentaDTO;
import tienda.posbackend.dto.VentaConfirmadaDTO;
import tienda.posbackend.dto.VentaDetalleCompletoDTO;
import tienda.posbackend.dto.VentaConMetodoPagoDTO;
import tienda.posbackend.entities.Venta;
import tienda.posbackend.services.VentaService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VentaController {

    private final VentaService ventaService;

    @PostMapping("/{id}/confirmar")
    public ResponseEntity<VentaConfirmadaDTO> confirmarVenta(@PathVariable Long id, @RequestBody ConfirmarVentaDTO dto) {
        VentaConfirmadaDTO venta = ventaService.confirmarVenta(id, dto);
        return ResponseEntity.ok(venta);
    }

    @PostMapping
    public ResponseEntity<Venta> crear(@RequestBody Venta venta) {
        return ResponseEntity.ok(ventaService.guardar(venta));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        ventaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/incompletas")
    public ResponseEntity<Void> eliminarIncompletas(@RequestParam Long idUsuario, @RequestParam Long idCierreCaja) {
        ventaService.eliminarIncompletas(idUsuario, idCierreCaja);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/sucursal/{idSucursal}")
    public ResponseEntity<Venta> buscarPorSucursal(@PathVariable Long idSucursal, @RequestParam String estado) {
        Venta venta = ventaService.buscarPorSucursalYEstado(idSucursal, estado);
        if (venta == null) return ResponseEntity.notFound().build(); // Or empty OK? Frontend expects maybeSingle
        return ResponseEntity.ok(venta);
    }
    
    @GetMapping("/facturas")
    public ResponseEntity<List<VentaConMetodoPagoDTO>> filtrarFacturas(
            @RequestParam Long empresaId,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin,
            @RequestParam(required = false) String buscador) {
        List<VentaConMetodoPagoDTO> facturas = ventaService.filtrarFacturas(empresaId, tipo, fechaInicio, fechaFin, buscador);
        return ResponseEntity.ok(facturas);
    }
    
    @GetMapping("/facturas/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticasFacturas(
            @RequestParam Long empresaId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin) {
        Map<String, Object> estadisticas = ventaService.obtenerEstadisticasFacturas(empresaId, fechaInicio, fechaFin);
        return ResponseEntity.ok(estadisticas);
    }
    
    @GetMapping("/{id}/detalle-completo")
    public ResponseEntity<VentaDetalleCompletoDTO> obtenerDetalleCompleto(@PathVariable Long id) {
        System.out.println("🔍 GET /ventas/" + id + "/detalle-completo");
        VentaDetalleCompletoDTO detalle = ventaService.obtenerDetalleCompleto(id);
        System.out.println("✅ Detalle completo obtenido: " + detalle.getNombreComprobante());
        return ResponseEntity.ok(detalle);
    }
}
