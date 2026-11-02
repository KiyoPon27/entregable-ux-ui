package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.entities.Multiprecio;
import tienda.posbackend.services.MultiprecioService;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/multiprecios")
@CrossOrigin(origins = "*")
public class MultiprecioController {
    
    @Autowired
    private MultiprecioService multiprecioService;
    
    @GetMapping("/listar")
    public ResponseEntity<List<Multiprecio>> listarTodos() {
        try {
            List<Multiprecio> multiprecios = multiprecioService.listarTodos();
            return ResponseEntity.ok(multiprecios);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Multiprecio> buscarPorId(@PathVariable Long id) {
        try {
            return multiprecioService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/producto/{productoId}")
    public ResponseEntity<List<Multiprecio>> listarPorProducto(@PathVariable Long productoId) {
        try {
            List<Multiprecio> multiprecios = multiprecioService.listarPorProducto(productoId);
            return ResponseEntity.ok(multiprecios);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/precio-por-cantidad")
    public ResponseEntity<BigDecimal> obtenerPrecioPorCantidad(
            @RequestParam Long productoId,
            @RequestParam BigDecimal cantidad) {
        try {
            BigDecimal precio = multiprecioService.obtenerPrecioPorCantidad(productoId, cantidad);
            return ResponseEntity.ok(precio);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/crear")
    public ResponseEntity<Multiprecio> crear(@RequestBody Multiprecio multiprecio) {
        try {
            Multiprecio nuevoMultiprecio = multiprecioService.crear(multiprecio);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoMultiprecio);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping("/actualizar/{id}")
    public ResponseEntity<Multiprecio> actualizar(@PathVariable Long id, @RequestBody Multiprecio multiprecio) {
        try {
            Multiprecio multiprecioActualizado = multiprecioService.actualizar(id, multiprecio);
            return ResponseEntity.ok(multiprecioActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        try {
            multiprecioService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
