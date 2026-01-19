package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.entities.MetodoPago;
import tienda.posbackend.services.MetodoPagoService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/metodos-pago")
@CrossOrigin(origins = "*")
public class MetodoPagoController {

    @Autowired
    private MetodoPagoService metodoPagoService;

    @GetMapping("/empresa/{empresaId}")
    public ResponseEntity<List<MetodoPago>> listarPorEmpresa(@PathVariable Long empresaId) {
        return ResponseEntity.ok(metodoPagoService.listarPorEmpresa(empresaId));
    }
    
    @GetMapping("/buscar/{empresaId}")
    public ResponseEntity<List<MetodoPago>> buscar(@PathVariable Long empresaId, @RequestParam String q) {
        return ResponseEntity.ok(metodoPagoService.buscarPorNombre(empresaId, q));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MetodoPago> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(metodoPagoService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody MetodoPago metodoPago) {
        try {
            MetodoPago nuevoMetodoPago = metodoPagoService.crear(metodoPago);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoMetodoPago);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Long id, @RequestBody MetodoPago metodoPagoDetails) {
        try {
            MetodoPago metodoPagoActualizado = metodoPagoService.editar(id, metodoPagoDetails);
            return ResponseEntity.ok(metodoPagoActualizado);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            metodoPagoService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            // Método de pago protegido del sistema
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error al eliminar el método de pago: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
