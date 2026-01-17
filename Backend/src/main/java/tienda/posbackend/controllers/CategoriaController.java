package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.entities.Categoria;
import tienda.posbackend.entities.Empresa;
import tienda.posbackend.repositories.CategoriaRepository;
import tienda.posbackend.repositories.EmpresaRepository;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "*")
public class CategoriaController {

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

    @GetMapping("/empresa/{empresaId}")
    public List<Categoria> listarPorEmpresa(@PathVariable Long empresaId) {
        return categoriaRepository.findByEmpresaId(empresaId);
    }
    
    @GetMapping("/buscar/{empresaId}")
    public List<Categoria> buscar(@PathVariable Long empresaId, @RequestParam String q) {
        return categoriaRepository.buscarPorNombre(empresaId, q);
    }

    @PostMapping
    public ResponseEntity<Categoria> crear(@RequestBody Categoria categoria) {
        // Asegurar que la relación empresa se establezca correctamente si viene solo el ID
        if (categoria.getEmpresa() != null && categoria.getEmpresa().getId() != null) {
            Empresa empresa = empresaRepository.findById(categoria.getEmpresa().getId())
                    .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
            categoria.setEmpresa(empresa);
        }
        return ResponseEntity.ok(categoriaRepository.save(categoria));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Categoria> editar(@PathVariable Long id, @RequestBody Categoria categoriaDetails) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria no encontrada"));
        
        categoria.setNombre(categoriaDetails.getNombre());
        categoria.setColor(categoriaDetails.getColor());
        categoria.setIcono(categoriaDetails.getIcono());
        
        return ResponseEntity.ok(categoriaRepository.save(categoria));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        categoriaRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
