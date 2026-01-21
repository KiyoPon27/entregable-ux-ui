package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.entities.Producto;
import tienda.posbackend.entities.Empresa;
import tienda.posbackend.entities.Categoria;
import tienda.posbackend.entities.Stock;
import tienda.posbackend.repositories.ProductoRepository;
import tienda.posbackend.repositories.EmpresaRepository;
import tienda.posbackend.repositories.CategoriaRepository;

import java.math.BigDecimal;
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
    
    @Autowired
    private tienda.posbackend.repositories.StockRepository stockRepository;

    @GetMapping("/empresa/{empresaId}")
    public List<Producto> listarPorEmpresa(@PathVariable Long empresaId) {
        // Solo listar productos activos
        List<Producto> productos = productoRepository.findByEmpresaIdAndEstado(empresaId, "ACTIVO");
        // Calcular stock total para cada producto
        for (Producto producto : productos) {
            List<Stock> stocks = stockRepository.findByProductoId(producto.getId());
            BigDecimal total = stocks.stream()
                .map(Stock::getStock)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            producto.setStockTotal(total);
        }
        return productos;
    }

    @GetMapping("/{id}")
    @SuppressWarnings("null")
    public ResponseEntity<Producto> obtenerPorId(@PathVariable Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        return ResponseEntity.ok(producto);
    }

    @GetMapping("/buscar/{empresaId}")
    public List<Producto> buscar(@PathVariable Long empresaId, @RequestParam String q) {
        return productoRepository.buscarProductos(empresaId, q);
    }

    @GetMapping("/buscar-lectora/{empresaId}")
    public List<Producto> buscarLectora(@PathVariable Long empresaId, @RequestParam String q) {
        return productoRepository.buscarProductosLectora(empresaId, q);
    }

    @PostMapping
    @SuppressWarnings("null")
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
    @SuppressWarnings("null")
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
    @Transactional
    @SuppressWarnings("null")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        // Verificar que el producto existe
        Producto producto = productoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        // Soft delete: Cambiar estado a ELIMINADO en lugar de borrar físicamente
        producto.setEstado("ELIMINADO");
        producto.setManejaInventarios(false);
        productoRepository.save(producto);
        
        return ResponseEntity.ok().build();
    }

}
