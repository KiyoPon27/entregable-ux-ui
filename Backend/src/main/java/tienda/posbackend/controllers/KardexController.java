package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.entities.Kardex;
import tienda.posbackend.services.KardexService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/kardex")
@CrossOrigin(origins = "*")
public class KardexController {
    
    @Autowired
    private KardexService kardexService;
    
    @GetMapping("/listar")
    public ResponseEntity<List<Kardex>> listarTodos() {
        try {
            List<Kardex> kardex = kardexService.listarTodos();
            return ResponseEntity.ok(kardex);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Kardex> buscarPorId(@PathVariable Long id) {
        try {
            return kardexService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/producto/{productoId}")
    public ResponseEntity<List<Kardex>> listarPorProducto(@PathVariable Long productoId) {
        try {
            List<Kardex> kardex = kardexService.listarPorProducto(productoId);
            return ResponseEntity.ok(kardex);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Kardex>> listarPorUsuario(@PathVariable Long usuarioId) {
        try {
            List<Kardex> kardex = kardexService.listarPorUsuario(usuarioId);
            return ResponseEntity.ok(kardex);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<Kardex>> listarPorTipo(@PathVariable String tipo) {
        try {
            List<Kardex> kardex = kardexService.listarPorTipo(tipo);
            return ResponseEntity.ok(kardex);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/fechas")
    public ResponseEntity<List<Kardex>> listarPorFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        try {
            List<Kardex> kardex = kardexService.listarPorFechas(fechaInicio, fechaFin);
            return ResponseEntity.ok(kardex);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/producto/{productoId}/fechas")
    public ResponseEntity<List<Kardex>> listarPorProductoYFechas(
            @PathVariable Long productoId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        try {
            List<Kardex> kardex = kardexService.listarPorProductoYFechas(productoId, fechaInicio, fechaFin);
            return ResponseEntity.ok(kardex);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/crear")
    public ResponseEntity<Kardex> crear(@RequestBody Kardex kardex) {
        try {
            Kardex nuevoKardex = kardexService.crear(kardex);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoKardex);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/registrar-movimiento")
    public ResponseEntity<Kardex> registrarMovimiento(
            @RequestParam Long productoId,
            @RequestParam Long usuarioId,
            @RequestParam String tipo,
            @RequestParam String motivo,
            @RequestParam Double cantidad,
            @RequestParam Double costo,
            @RequestParam Double stockAnterior,
            @RequestParam Double stockActual) {
        try {
            Kardex kardex = kardexService.registrarMovimiento(
                productoId, usuarioId, tipo, motivo, cantidad, 
                costo, stockAnterior, stockActual
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(kardex);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping("/actualizar/{id}")
    public ResponseEntity<Kardex> actualizar(@PathVariable Long id, @RequestBody Kardex kardex) {
        try {
            Kardex kardexActualizado = kardexService.actualizar(id, kardex);
            return ResponseEntity.ok(kardexActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        try {
            kardexService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
