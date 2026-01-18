package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.entities.Categoria;
import tienda.posbackend.services.CategoriaService;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "*")
public class CategoriaController {

    @Autowired
    private CategoriaService categoriaService;

    @GetMapping("/empresa/{empresaId}")
    public ResponseEntity<List<Categoria>> listarPorEmpresa(@PathVariable Long empresaId) {
        return ResponseEntity.ok(categoriaService.listarPorEmpresa(empresaId));
    }
    
    @GetMapping("/buscar/{empresaId}")
    public ResponseEntity<List<Categoria>> buscar(@PathVariable Long empresaId, @RequestParam String q) {
        return ResponseEntity.ok(categoriaService.buscarPorNombre(empresaId, q));
    }

    @PostMapping
    public ResponseEntity<Categoria> crear(@RequestBody Categoria categoria) {
        Categoria nuevaCategoria = categoriaService.crear(categoria);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaCategoria);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Categoria> editar(@PathVariable Long id, @RequestBody Categoria categoriaDetails) {
        Categoria categoriaActualizada = categoriaService.editar(id, categoriaDetails);
        return ResponseEntity.ok(categoriaActualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        categoriaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
