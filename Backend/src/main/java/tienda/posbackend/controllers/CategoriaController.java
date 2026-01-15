package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.models.Categoria;
import tienda.posbackend.services.CategoriaService;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    @Autowired
    private CategoriaService service;

    // Mostrar categorías por empresa
    @GetMapping("/mostrar/{idEmpresa}")
    public List<Categoria> mostrar(@PathVariable Long idEmpresa) {
        return service.mostrarCategorias(idEmpresa);
    }

    // Insertar categoría
    @PostMapping("/insertar")
    public ResponseEntity<?> insertar(@RequestBody Categoria categoria) {
        try {
            Long id = service.insertarCategoria(categoria);
            return ResponseEntity.ok("Categoría insertada con ID: " + id);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Editar categoría
    @PutMapping("/editar/{id}")
    public ResponseEntity<?> editar(@PathVariable Long id, @RequestParam String nombre, @RequestParam Long idEmpresa, @RequestParam(required = false) String color) {
        try {
            service.editarCategoria(id, nombre, idEmpresa, color);
            return ResponseEntity.ok("Categoría actualizada");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Eliminar categoría
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        service.eliminarCategoria(id);
        return ResponseEntity.ok("Categoría eliminada");
    }
}