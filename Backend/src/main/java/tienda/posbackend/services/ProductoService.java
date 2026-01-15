package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tienda.posbackend.models.Producto;
import tienda.posbackend.repositories.ProductoRepository;
import tienda.posbackend.dto.ProductoDTO;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository repository;

    // Equivalente a 'mostrarproductos' (con formato)
    public List<ProductoDTO> mostrarProductos(Long idEmpresa) {
        return repository.mostrarProductosConFormato(idEmpresa);
    }

    // Equivalente a 'buscarproductos' (con formato)
    public List<ProductoDTO> buscarProductos(Long idEmpresa, String buscador) {
        return repository.buscarProductosConFormato(idEmpresa, buscador);
    }

    // Equivalente a 'buscarproductoslectora'
    public List<ProductoDTO> buscarProductosLectora(Long idEmpresa, String buscador) {
        return repository.buscarProductosLectora(idEmpresa, buscador);
    }

    // Equivalente a 'contarproductosporauth'
    public Long contarProductosPorAuth(String idAuth) {
        return repository.contarProductosPorAuth(idAuth);
    }

    public Producto insertarProducto(Producto p) throws Exception {
        // Validaciones (Se mantienen igual)
        if (repository.findByNombreAndIdEmpresa(p.getNombre(), p.getIdEmpresa()).isPresent()) {
            throw new Exception("Nombre de producto duplicado");
        }
        if (p.getCodigoBarras() != null && !p.getCodigoBarras().isEmpty() && 
            repository.findByCodigoBarrasAndIdEmpresa(p.getCodigoBarras(), p.getIdEmpresa()).isPresent()) {
            throw new Exception("Código de barras duplicado");
        }
        if (p.getCodigoInterno() != null && !p.getCodigoInterno().isEmpty() &&
            repository.findByCodigoInternoAndIdEmpresa(p.getCodigoInterno(), p.getIdEmpresa()).isPresent()) {
            throw new Exception("Código interno duplicado");
        }
        
        return repository.save(p);
    }

    @SuppressWarnings("null") // Suprimir warnings de null safety para evitar falsos positivos en análisis estático
    public Producto editarProducto(Long id, Producto p) throws Exception {
        Optional<Producto> nombreDuplicado = repository.findByNombreAndIdEmpresa(p.getNombre(), p.getIdEmpresa());
        if (nombreDuplicado.isPresent() && !nombreDuplicado.get().getId().equals(id)) {
            throw new Exception("Nombre de producto duplicado");
        }

        Optional<Producto> barrasDuplicado = null;
        if (p.getCodigoBarras() != null && !p.getCodigoBarras().isEmpty()) {
            barrasDuplicado = repository.findByCodigoBarrasAndIdEmpresa(p.getCodigoBarras(), p.getIdEmpresa());
            if (barrasDuplicado.isPresent() && !barrasDuplicado.get().getId().equals(id)) {
                throw new Exception("Código de barras duplicado");
            }
        }

        Optional<Producto> internoDuplicado = null;
        if (p.getCodigoInterno() != null && !p.getCodigoInterno().isEmpty()) {
            internoDuplicado = repository.findByCodigoInternoAndIdEmpresa(p.getCodigoInterno(), p.getIdEmpresa());
            if (internoDuplicado.isPresent() && !internoDuplicado.get().getId().equals(id)) {
                throw new Exception("Código interno duplicado");
            }
        }

        return repository.findById(id).map(prod -> {
            // Actualizamos SOLO las columnas que existen en tu BD
            prod.setNombre(p.getNombre());
            prod.setPrecioVenta(p.getPrecioVenta());
            prod.setPrecioCompra(p.getPrecioCompra());
            prod.setIdCategoria(p.getIdCategoria());
            prod.setCodigoBarras(p.getCodigoBarras());
            prod.setCodigoInterno(p.getCodigoInterno());
            prod.setSevendePor(p.getSevendePor()); // Actualizado
            prod.setManejaInventarios(p.getManejaInventarios());
            prod.setManejaMultiprecios(p.getManejaMultiprecios());
            
            // ELIMINADO: prod.setStock(...) porque la tabla no tiene stock.
            
            return repository.save(prod);
        }).orElseThrow(() -> new Exception("Producto no encontrado"));
    }

    @SuppressWarnings("null") // Suprimir warnings de null safety para evitar falsos positivos en análisis estático
    public void eliminarProducto(Long id) {
        repository.deleteById(id);
    }
}