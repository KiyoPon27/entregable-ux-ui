package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.models.Producto;
import tienda.posbackend.services.ProductoService;
import tienda.posbackend.dto.ProductoDTO;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    @Autowired
    private ProductoService service;

    // Equivalente a 'mostrarproductos' (con formato)
    @GetMapping("/mostrar/{idEmpresa}")
    public List<ProductoDTO> mostrar(@PathVariable Long idEmpresa) {
        return service.mostrarProductos(idEmpresa);
    }

    // Equivalente a 'buscarproductos' (con formato)
    @GetMapping("/buscar")
    public List<ProductoDTO> buscar(@RequestParam Long idEmpresa, @RequestParam String buscador) {
        return service.buscarProductos(idEmpresa, buscador);
    }

    // Equivalente a 'buscarproductoslectora'
    @GetMapping("/buscar-lectora")
    public List<ProductoDTO> buscarLectora(@RequestParam Long idEmpresa, @RequestParam String buscador) {
        return service.buscarProductosLectora(idEmpresa, buscador);
    }

    // Equivalente a 'contarproductosporauth'
    @GetMapping("/contar/{idAuth}")
    public Long contar(@PathVariable String idAuth) {
        return service.contarProductosPorAuth(idAuth);
    }

    @PostMapping("/insertar")
    public ResponseEntity<?> insertar(@RequestBody Producto producto) {
        try {
            Producto nuevo = service.insertarProducto(producto);
            return ResponseEntity.ok(nuevo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/editar/{id}")
    public ResponseEntity<?> editar(@PathVariable Long id, @RequestBody Producto producto) {
        try {
            service.editarProducto(id, producto);
            return ResponseEntity.ok("Producto actualizado");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        service.eliminarProducto(id);
        return ResponseEntity.ok("Producto eliminado");
    }
}