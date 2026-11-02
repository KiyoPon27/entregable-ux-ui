package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.entities.TipoComprobante;
import tienda.posbackend.services.TipoComprobanteService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tipo-comprobantes")
@CrossOrigin(origins = "*")
public class TipoComprobanteController {

    @Autowired
    private TipoComprobanteService tipoComprobanteService;

    @GetMapping
    public ResponseEntity<List<TipoComprobante>> listarTodos() {
        return ResponseEntity.ok(tipoComprobanteService.listarTodos());
    }

    @GetMapping("/destino/{destino}")
    public ResponseEntity<List<TipoComprobante>> listarPorDestino(@PathVariable String destino) {
        return ResponseEntity.ok(tipoComprobanteService.listarPorDestino(destino));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TipoComprobante> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(tipoComprobanteService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody TipoComprobante tipoComprobante) {
        try {
            TipoComprobante nuevo = tipoComprobanteService.crear(tipoComprobante);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Long id, @RequestBody TipoComprobante tipoComprobanteDetails) {
        try {
            TipoComprobante actualizado = tipoComprobanteService.editar(id, tipoComprobanteDetails);
            return ResponseEntity.ok(actualizado);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            tipoComprobanteService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}
