package tienda.posbackend.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.dto.ConfirmarVentaDTO;
import tienda.posbackend.entities.Venta;
import tienda.posbackend.services.VentaService;

@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VentaController {

    private final VentaService ventaService;

    @PostMapping("/{id}/confirmar")
    public ResponseEntity<Venta> confirmarVenta(@PathVariable Long id, @RequestBody ConfirmarVentaDTO dto) {
        Venta venta = ventaService.confirmarVenta(id, dto);
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
}
