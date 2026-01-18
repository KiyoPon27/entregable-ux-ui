package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.entities.Producto;
import tienda.posbackend.entities.Empresa;
import tienda.posbackend.entities.Categoria;
import tienda.posbackend.repositories.ProductoRepository;
import tienda.posbackend.repositories.EmpresaRepository;
import tienda.posbackend.repositories.CategoriaRepository;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @GetMapping("/empresa/{empresaId}")
    public List<Producto> listarPorEmpresa(@PathVariable Long empresaId) {
        return productoRepository.findByEmpresaId(empresaId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerPorId(@PathVariable Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        return ResponseEntity.ok(producto);
    }

    @GetMapping("/buscar/{empresaId}")
    public List<Producto> buscar(@PathVariable Long empresaId, @RequestParam String q) {
        return productoRepository.buscarProductos(empresaId, q);
    }

    @PostMapping
    public ResponseEntity<Producto> crear(@RequestBody Producto producto) {
         if (producto.getEmpresa() != null && producto.getEmpresa().getId() != null) {
            Empresa empresa = empresaRepository.findById(producto.getEmpresa().getId())
                    .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
            producto.setEmpresa(empresa);
        }
        if (producto.getCategoria() != null && producto.getCategoria().getId() != null) {
            Categoria categoria = categoriaRepository.findById(producto.getCategoria().getId())
                    .orElseThrow(() -> new RuntimeException("Categoria no encontrada"));
            producto.setCategoria(categoria);
        }
        
        // Valores por defecto si no se proporcionan
        if (producto.getSeVendePor() == null) {
            producto.setSeVendePor("unidad");
        }
        if (producto.getManejaInventarios() == null) {
            producto.setManejaInventarios(true);
        }
        if (producto.getManejaMultiprecios() == null) {
            producto.setManejaMultiprecios(false);
        }

        return ResponseEntity.ok(productoRepository.save(producto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> editar(@PathVariable Long id, @RequestBody Producto details) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        producto.setNombre(details.getNombre());
        producto.setPrecioVenta(details.getPrecioVenta());
        producto.setPrecioCompra(details.getPrecioCompra());
        producto.setCodigoBarras(details.getCodigoBarras());
        producto.setCodigoInterno(details.getCodigoInterno());
        
        // Valores con defaults si vienen null
        producto.setSeVendePor(details.getSeVendePor() != null ? details.getSeVendePor() : "unidad");
        producto.setManejaInventarios(details.getManejaInventarios() != null ? details.getManejaInventarios() : true);
        producto.setManejaMultiprecios(details.getManejaMultiprecios() != null ? details.getManejaMultiprecios() : false);
        
        if (details.getCategoria() != null && details.getCategoria().getId() != null) {
             Categoria categoria = categoriaRepository.findById(details.getCategoria().getId())
                    .orElseThrow(() -> new RuntimeException("Categoria no encontrada"));
            producto.setCategoria(categoria);
        }

        return ResponseEntity.ok(productoRepository.save(producto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        productoRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
