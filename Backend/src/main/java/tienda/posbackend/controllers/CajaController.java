package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.entities.Caja;
import tienda.posbackend.entities.Sucursal;
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
    public ResponseEntity<?> crear(@RequestBody Map<String, Object> payload) {
        try {
            // Extract idUsuarioCreador if present
            Long idUsuarioCreador = null;
            if (payload.containsKey("idUsuarioCreador") && payload.get("idUsuarioCreador") != null) {
                idUsuarioCreador = Long.valueOf(payload.get("idUsuarioCreador").toString());
            }
            
            // Build Caja from payload
            Caja caja = new Caja();
            caja.setDescripcion(payload.get("descripcion").toString());
            
            if (payload.containsKey("eliminar")) {
                caja.setEliminar(Boolean.valueOf(payload.get("eliminar").toString()));
            }
            if (payload.containsKey("imprimir")) {
                caja.setImprimir(Boolean.valueOf(payload.get("imprimir").toString()));
            }
            
            // Extract sucursal from nested object
            if (payload.containsKey("sucursal")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> sucursalMap = (Map<String, Object>) payload.get("sucursal");
                if (sucursalMap != null && sucursalMap.containsKey("id")) {
                    Sucursal s = new Sucursal();
                    s.setId(Long.valueOf(sucursalMap.get("id").toString()));
                    caja.setSucursal(s);
                }
            }

            Caja nuevaCaja = cajaService.crear(caja, idUsuarioCreador);
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
