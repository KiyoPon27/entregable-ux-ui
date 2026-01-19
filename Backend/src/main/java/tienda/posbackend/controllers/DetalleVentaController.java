package tienda.posbackend.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.dto.DetalleVentaDTO;
import tienda.posbackend.entities.DetalleVenta;
import tienda.posbackend.services.DetalleVentaService;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/detalle-ventas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DetalleVentaController {

    private final DetalleVentaService detalleVentaService;

    @PostMapping
    public ResponseEntity<Void> insertar(@RequestBody DetalleVentaDTO dto) {
        detalleVentaService.insertarDetalle(dto);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/cantidad")
    public ResponseEntity<Void> editarCantidad(@PathVariable Long id, @RequestBody Map<String, BigDecimal> payload) {
        BigDecimal cantidad = payload.get("cantidad");
        detalleVentaService.editarCantidad(id, cantidad);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        detalleVentaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/venta/{idVenta}")
    public ResponseEntity<List<DetalleVenta>> listarPorVenta(@PathVariable Long idVenta) {
        return ResponseEntity.ok(detalleVentaService.listarPorVenta(idVenta));
    }
}
