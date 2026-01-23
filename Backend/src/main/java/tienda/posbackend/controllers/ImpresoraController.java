package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.entities.Impresora;
import tienda.posbackend.services.ImpresoraService;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/impresoras")
@CrossOrigin(origins = "*")
public class ImpresoraController {

    @Autowired
    private ImpresoraService impresoraService;

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> obtenerPorUsuario(@PathVariable Long usuarioId) {
        Optional<Impresora> impresora = impresoraService.obtenerPorUsuario(usuarioId);
        if (impresora.isPresent()) {
            return ResponseEntity.ok(impresora.get());
        } else {
            return ResponseEntity.ok(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Impresora> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(impresoraService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Impresora impresora) {
        try {
            Impresora nuevaImpresora = impresoraService.crear(impresora);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaImpresora);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Long id, @RequestBody Impresora impresoraDetails) {
        try {
            Impresora impresoraActualizada = impresoraService.editar(id, impresoraDetails);
            return ResponseEntity.ok(impresoraActualizada);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            impresoraService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error al eliminar la impresora: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
