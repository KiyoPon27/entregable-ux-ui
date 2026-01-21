package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.entities.Multiprecio;
import tienda.posbackend.entities.Producto;
import tienda.posbackend.repositories.MultiprecioRepository;
import tienda.posbackend.repositories.ProductoRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@SuppressWarnings("null")
public class MultiprecioService {
    
    @Autowired
    private MultiprecioRepository multiprecioRepository;
    
    @Autowired
    private ProductoRepository productoRepository;
    
    public List<Multiprecio> listarTodos() {
        return multiprecioRepository.findAll();
    }
    
    public Optional<Multiprecio> buscarPorId(Long id) {
        return multiprecioRepository.findById(id);
    }
    
    public List<Multiprecio> listarPorProducto(Long productoId) {
        return multiprecioRepository.findByProducto_IdOrderByCantidadAsc(productoId);
    }
    
    public BigDecimal obtenerPrecioPorCantidad(Long productoId, BigDecimal cantidad) {
        List<Multiprecio> multiprecios = multiprecioRepository.findByProducto_IdOrderByCantidadAsc(productoId);
        
        // Retornar el precio del rango que aplique
        for (int i = multiprecios.size() - 1; i >= 0; i--) {
            Multiprecio mp = multiprecios.get(i);
            if (cantidad.compareTo(mp.getCantidad()) >= 0) {
                return mp.getPrecioVenta();
            }
        }
        
        // Si no hay multiprecio aplicable, retornar precio base del producto
        Optional<Producto> producto = productoRepository.findById(productoId);
        return producto.map(Producto::getPrecioVenta).orElse(BigDecimal.ZERO);
    }
    
    @Transactional
    public Multiprecio crear(Multiprecio multiprecio) {
        return multiprecioRepository.save(multiprecio);
    }
    
    @Transactional
    public Multiprecio actualizar(Long id, Multiprecio multiprecioActualizado) {
        return multiprecioRepository.findById(id)
            .map(multiprecio -> {
                if (multiprecioActualizado.getPrecioVenta() != null) {
                    multiprecio.setPrecioVenta(multiprecioActualizado.getPrecioVenta());
                }
                if (multiprecioActualizado.getCantidad() != null) {
                    multiprecio.setCantidad(multiprecioActualizado.getCantidad());
                }
                if (multiprecioActualizado.getProducto() != null) {
                    multiprecio.setProducto(multiprecioActualizado.getProducto());
                }
                return multiprecioRepository.save(multiprecio);
            })
            .orElseThrow(() -> new RuntimeException("Multiprecio no encontrado con id: " + id));
    }
    
    @Transactional
    public void eliminar(Long id) {
        multiprecioRepository.deleteById(id);
    }
}
