package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.entities.SerializacionComprobante;
import tienda.posbackend.services.SerializacionComprobanteService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/serializaciones")
@CrossOrigin(origins = "*")
public class SerializacionComprobanteController {

    @Autowired
    private SerializacionComprobanteService serializacionService;

    @GetMapping("/sucursal/{sucursalId}")
    public ResponseEntity<List<SerializacionComprobante>> listarPorSucursal(@PathVariable Long sucursalId) {
        return ResponseEntity.ok(serializacionService.listarPorSucursal(sucursalId));
    }

    @GetMapping("/empresa/{empresaId}")
    public ResponseEntity<List<SerializacionComprobante>> listarPorEmpresa(@PathVariable Long empresaId) {
        return ResponseEntity.ok(serializacionService.listarPorEmpresa(empresaId));
    }

    @GetMapping("/sucursal/{sucursalId}/destino/{destino}")
    public ResponseEntity<List<SerializacionComprobante>> listarPorSucursalYDestino(
            @PathVariable Long sucursalId, 
            @PathVariable String destino) {
        return ResponseEntity.ok(serializacionService.listarPorSucursalYDestino(sucursalId, destino));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SerializacionComprobante> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(serializacionService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody SerializacionComprobante serializacion) {
        try {
            SerializacionComprobante nueva = serializacionService.crear(serializacion);
            return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Long id, @RequestBody SerializacionComprobante serializacionDetails) {
        try {
            SerializacionComprobante actualizada = serializacionService.editar(id, serializacionDetails);
            return ResponseEntity.ok(actualizada);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PutMapping("/{id}/establecer-defecto")
    public ResponseEntity<?> establecerPorDefecto(@PathVariable Long id) {
        try {
            serializacionService.establecerPorDefecto(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/{id}/siguiente-numero")
    public ResponseEntity<?> obtenerSiguienteNumero(@PathVariable Long id) {
        try {
            String numeroComprobante = serializacionService.obtenerSiguienteNumero(id);
            Map<String, String> response = new HashMap<>();
            response.put("numeroComprobante", numeroComprobante);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            serializacionService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}
