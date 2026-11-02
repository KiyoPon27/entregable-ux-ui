package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.entities.Producto;
import tienda.posbackend.entities.Empresa;
import tienda.posbackend.entities.Categoria;
import tienda.posbackend.entities.Stock;
import tienda.posbackend.entities.ProductoCodigo;
import tienda.posbackend.repositories.ProductoRepository;
import tienda.posbackend.repositories.EmpresaRepository;
import tienda.posbackend.repositories.CategoriaRepository;
import tienda.posbackend.repositories.ProductoCodigoRepository;

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
    
    @Autowired
    private ProductoCodigoRepository productoCodigoRepository;
    
    @Autowired
    private tienda.posbackend.repositories.DetalleVentaRepository detalleVentaRepository;

    @GetMapping("/empresa/{empresaId}")
    public List<Producto> listarPorEmpresa(@PathVariable Long empresaId) {
        // Listar todos los productos de la empresa, sin filtrar por estado
        List<Producto> productos = productoRepository.findByEmpresaId(empresaId);
        // Calcular stock total y stock inicial para cada producto
        for (Producto producto : productos) {
            List<Stock> stocks = stockRepository.findByProductoId(producto.getId());
            BigDecimal total = stocks.stream()
                .map(Stock::getStock)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            producto.setStockTotal(total);
            
            // Obtener stock inicial (primer registro)
            if (!stocks.isEmpty()) {
                Stock firstStock = stocks.get(0);
                producto.setStockInitial(firstStock.getStock());
            } else {
                producto.setStockInitial(BigDecimal.ZERO);
            }
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
        List<Producto> productos = productoRepository.buscarProductos(empresaId, q);
        
        // Optimización: evitar problema N+1 - procesar solo si hay productos
        if (productos.isEmpty()) {
            return productos;
        }
        
        // Batch processing: calcular stock total, stock inicial y total vendido para cada producto
        for (Producto producto : productos) {
            try {
                List<Stock> stocks = stockRepository.findByProductoId(producto.getId());
                
                BigDecimal total = stocks.stream()
                    .map(Stock::getStock)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                producto.setStockTotal(total);
                
                // Obtener stock inicial (primer registro)
                if (!stocks.isEmpty()) {
                    Stock firstStock = stocks.get(0);
                    producto.setStockInitial(firstStock.getStock());
                } else {
                    producto.setStockInitial(BigDecimal.ZERO);
                }
                
                // Calcular total vendido
                BigDecimal totalVendido = detalleVentaRepository.sumCantidadVendidaPorProducto(producto.getId());
                producto.setTotalVendido(totalVendido != null ? totalVendido : BigDecimal.ZERO);
            } catch (Exception e) {
                // Evitar que un error en un producto rompa toda la respuesta
                producto.setStockTotal(BigDecimal.ZERO);
                producto.setStockInitial(BigDecimal.ZERO);
                producto.setTotalVendido(BigDecimal.ZERO);
            }
        }
        return productos;
    }

    @GetMapping("/buscar-lectora/{empresaId}")
    public List<Producto> buscarLectora(@PathVariable Long empresaId, @RequestParam String q) {
        List<Producto> productos = productoRepository.buscarProductosLectora(empresaId, q);
        
        // Optimización: evitar problema N+1 - procesar solo si hay productos
        if (productos.isEmpty()) {
            return productos;
        }
        
        // Batch processing: calcular stock total y total vendido para cada producto
        for (Producto producto : productos) {
            try {
                List<Stock> stocks = stockRepository.findByProductoId(producto.getId());
                BigDecimal total = stocks.stream()
                    .map(Stock::getStock)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                producto.setStockTotal(total);
                
                // Obtener stock inicial (primer registro)
                if (!stocks.isEmpty()) {
                    Stock firstStock = stocks.get(0);
                    producto.setStockInitial(firstStock.getStock());
                } else {
                    producto.setStockInitial(BigDecimal.ZERO);
                }
                
                // Calcular total vendido
                BigDecimal totalVendido = detalleVentaRepository.sumCantidadVendidaPorProducto(producto.getId());
                producto.setTotalVendido(totalVendido != null ? totalVendido : BigDecimal.ZERO);
            } catch (Exception e) {
                // Evitar que un error en un producto rompa toda la respuesta
                producto.setStockTotal(BigDecimal.ZERO);
                producto.setStockInitial(BigDecimal.ZERO);
                producto.setTotalVendido(BigDecimal.ZERO);
            }
        }
        return productos;
    }

    @PostMapping
    @SuppressWarnings("null")
    public ResponseEntity<Producto> crear(@RequestBody Producto producto) {
         System.out.println("[ProductoController] CREAR - payload.codigoBarras='" + producto.getCodigoBarras() + "' codigos_present=" + (producto.getCodigos() != null ? producto.getCodigos().size() : 0));
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
        if (producto.getTipoComprobante() == null) {
            producto.setTipoComprobante("FACTURADO");
        }
        // imagen puede venir vacía o null — se persiste tal cual
        if (producto.getImagen() != null && producto.getImagen().trim().isEmpty()) {
            producto.setImagen(null);
        }

        System.out.println("[ProductoController] CREAR - imagen entrante: '" + producto.getImagen() + "'");
        Producto saved = productoRepository.save(producto);
        System.out.println("[ProductoController] CREAR - imagen guardada en BD: '" + saved.getImagen() + "'");

        // Si vino un array de codigos en el payload, guardarlos (mayor prioridad que codigoBarras individual)
        try {
            if (producto.getCodigos() != null && !producto.getCodigos().isEmpty()) {
                System.out.println("[ProductoController] CREAR - guardando codigos array size=" + producto.getCodigos().size());
                for (ProductoCodigo incoming : producto.getCodigos()) {
                    if (incoming != null && incoming.getCodigoBarras() != null && !incoming.getCodigoBarras().trim().isEmpty()) {
                        ProductoCodigo pc = new ProductoCodigo();
                        pc.setCodigoBarras(incoming.getCodigoBarras().trim());
                        pc.setProducto(saved);
                        ProductoCodigo savedPc = productoCodigoRepository.save(pc);
                        System.out.println("[ProductoController] CREAR - saved producto_codigo id=" + savedPc.getId() + " codigo=" + savedPc.getCodigoBarras());
                    }
                }
            } else {
                // Compatibilidad antigua: si no vino array, usar producto.codigoBarras
                if (producto.getCodigoBarras() != null && !producto.getCodigoBarras().trim().isEmpty()) {
                    ProductoCodigo pc = new ProductoCodigo();
                    pc.setCodigoBarras(producto.getCodigoBarras().trim());
                    pc.setProducto(saved);
                    ProductoCodigo savedPc = productoCodigoRepository.save(pc);
                    System.out.println("[ProductoController] CREAR - saved producto_codigo (single) id=" + savedPc.getId());
                }
            }
        } catch (Exception e) {
            System.err.println("[ProductoController] WARNING: error saving producto_codigos array/single: " + e.getMessage());
            e.printStackTrace();
        }

        return ResponseEntity.ok(saved);
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
        
        // imagen (permite null para indicar sin imagen)
        producto.setImagen(details.getImagen());
        
        // Valores con defaults si vienen null
        producto.setSeVendePor(details.getSeVendePor() != null ? details.getSeVendePor() : "unidad");
        producto.setManejaInventarios(details.getManejaInventarios() != null ? details.getManejaInventarios() : true);
        producto.setManejaMultiprecios(details.getManejaMultiprecios() != null ? details.getManejaMultiprecios() : false);
        producto.setTipoComprobante(details.getTipoComprobante() != null ? details.getTipoComprobante() : "FACTURADO");
        
        if (details.getCategoria() != null && details.getCategoria().getId() != null) {
             Categoria categoria = categoriaRepository.findById(details.getCategoria().getId())
                    .orElseThrow(() -> new RuntimeException("Categoria no encontrada"));
            producto.setCategoria(categoria);
        }

        // Guardar cambios básicos del producto primero
        Producto saved = productoRepository.save(producto);

        // Si el payload incluye un array 'codigos', sincronizar la tabla producto_codigos
        if (details.getCodigos() != null) {
            try {
                System.out.println("[ProductoController] EDIT - incoming codigos size=" + (details.getCodigos() != null ? details.getCodigos().size() : 0));
                // Borrar códigos existentes del producto
                productoCodigoRepository.deleteByProducto_Id(saved.getId());
                System.out.println("[ProductoController] EDIT - deleted existing codigos for producto id=" + saved.getId());
                // Insertar los nuevos códigos
                for (ProductoCodigo incoming : details.getCodigos()) {
                    if (incoming != null && incoming.getCodigoBarras() != null && !incoming.getCodigoBarras().trim().isEmpty()) {
                        ProductoCodigo pc = new ProductoCodigo();
                        pc.setCodigoBarras(incoming.getCodigoBarras().trim());
                        pc.setProducto(saved);
                        ProductoCodigo savedPc = productoCodigoRepository.save(pc);
                        System.out.println("[ProductoController] EDIT - saved producto_codigo id=" + savedPc.getId() + " codigo=" + savedPc.getCodigoBarras());
                    }
                }
            } catch (Exception e) {
                System.err.println("[ProductoController] WARNING: error syncing producto_codigos on edit: " + e.getMessage());
                e.printStackTrace();
            }
            // Refrescar la entidad saved para incluir codigos nuevos
            saved = productoRepository.findById(saved.getId()).orElse(saved);
        }

        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    @Transactional
    @SuppressWarnings("null")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        // Verificar que el producto existe
        Producto producto = productoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        // Soft delete: Cambiar estado a DESHABILITADO en lugar de borrar físicamente
        producto.setEstado("DESHABILITADO");
        producto.setManejaInventarios(false);
        productoRepository.save(producto);
        
        return ResponseEntity.ok().build();
    }

    // Endpoint para sincronizar (reemplazar) códigos de barras de un producto
    @PostMapping("/{id}/codigos/sync")
    @Transactional
    public ResponseEntity<Void> syncCodigos(@PathVariable Long id, @RequestBody List<String> codigos) {
        Producto producto = productoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        try {
            // Eliminar códigos existentes
            productoCodigoRepository.deleteByProducto_Id(producto.getId());
            System.out.println("[ProductoController] SYNC - deleted existing codigos for producto id=" + producto.getId());

            // Insertar nuevos códigos
            if (codigos != null) {
                for (String c : codigos) {
                    if (c != null && !c.trim().isEmpty()) {
                        ProductoCodigo pc = new ProductoCodigo();
                        pc.setCodigoBarras(c.trim());
                        pc.setProducto(producto);
                        ProductoCodigo savedPc = productoCodigoRepository.save(pc);
                        System.out.println("[ProductoController] SYNC - saved producto_codigo id=" + savedPc.getId() + " codigo=" + savedPc.getCodigoBarras());
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("[ProductoController] ERROR syncing codigos: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }

        return ResponseEntity.ok().build();
    }

}