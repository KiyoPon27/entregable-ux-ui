package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.entities.Caja;
import tienda.posbackend.services.CajaService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cajas")
@CrossOrigin(origins = "*")
public class CajaController {

    @Autowired
    private CajaService cajaService;

    @GetMapping("/sucursal/{sucursalId}")
    public ResponseEntity<List<Caja>> listarPorSucursal(@PathVariable Long sucursalId) {
        return ResponseEntity.ok(cajaService.listarPorSucursal(sucursalId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Caja> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(cajaService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Caja caja) {
        try {
            Caja nuevaCaja = cajaService.crear(caja);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaCaja);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Long id, @RequestBody Caja cajaDetails) {
        try {
            Caja cajaActualizada = cajaService.editar(id, cajaDetails);
            return ResponseEntity.ok(cajaActualizada);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            cajaService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error al eliminar la caja: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
