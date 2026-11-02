package tienda.posbackend.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.dto.DetalleVentaDTO;
import tienda.posbackend.dto.DetalleVentaResponseDTO;
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

    @PutMapping("/{id}/multiprecio")
    public ResponseEntity<Void> cambiarMultiprecio(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        BigDecimal cantidad = new BigDecimal(payload.get("cantidad").toString());
        BigDecimal precioVenta = new BigDecimal(payload.get("precioVenta").toString());
        String descripcion = (String) payload.get("descripcion");
        detalleVentaService.cambiarMultiprecio(id, cantidad, precioVenta, descripcion);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        detalleVentaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/venta/{idVenta}")
    public ResponseEntity<List<DetalleVentaResponseDTO>> listarPorVenta(@PathVariable Long idVenta) {
        System.out.println("🔍 GET /detalle-ventas/venta/" + idVenta);
        try {
            List<DetalleVentaResponseDTO> detalles = detalleVentaService.listarPorVentaDTO(idVenta);
            System.out.println("✅ Encontrados " + detalles.size() + " detalles");
            return ResponseEntity.ok(detalles);
        } catch (Exception e) {
            System.err.println("❌ ERROR en listarPorVenta: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
