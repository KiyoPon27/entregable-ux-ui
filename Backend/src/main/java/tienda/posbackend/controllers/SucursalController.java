package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.entities.Sucursal;
import tienda.posbackend.services.SucursalService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sucursales")
@CrossOrigin(origins = "*")
public class SucursalController {

    @Autowired
    private SucursalService sucursalService;

    @GetMapping("/empresa/{empresaId}")
    public ResponseEntity<List<Sucursal>> listarPorEmpresa(@PathVariable Long empresaId) {
        return ResponseEntity.ok(sucursalService.listarPorEmpresa(empresaId));
    }

    @GetMapping("/empresa/{empresaId}/con-cajas")
    public ResponseEntity<?> listarConCajasPorEmpresa(@PathVariable Long empresaId) {
        return ResponseEntity.ok(sucursalService.listarConCajasPorEmpresa(empresaId));
    }

    @GetMapping("/empresa/{empresaId}/con-almacenes")
    public ResponseEntity<?> listarConAlmacenesPorEmpresa(@PathVariable Long empresaId) {
        return ResponseEntity.ok(sucursalService.listarConAlmacenesPorEmpresa(empresaId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sucursal> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(sucursalService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Sucursal sucursal) {
        try {
            Sucursal nuevaSucursal = sucursalService.crear(sucursal);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaSucursal);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Long id, @RequestBody Sucursal sucursalDetails) {
        try {
            Sucursal sucursalActualizada = sucursalService.editar(id, sucursalDetails);
            return ResponseEntity.ok(sucursalActualizada);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            sucursalService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error al eliminar la sucursal: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
