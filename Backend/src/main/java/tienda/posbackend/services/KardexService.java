package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.entities.Kardex;
import tienda.posbackend.entities.Producto;
import tienda.posbackend.entities.Usuario;
import tienda.posbackend.repositories.KardexRepository;
import tienda.posbackend.repositories.ProductoRepository;
import tienda.posbackend.repositories.UsuarioRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@SuppressWarnings("null")
public class KardexService {
    
    @Autowired
    private KardexRepository kardexRepository;
    
    @Autowired
    private ProductoRepository productoRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    public List<Kardex> listarTodos() {
        return kardexRepository.findAll();
    }
    
    public Optional<Kardex> buscarPorId(Long id) {
        return kardexRepository.findById(id);
    }
    
    public List<Kardex> listarPorProducto(Long productoId) {
        return kardexRepository.findByProductoIdOrderByFechaDesc(productoId);
    }
    
    public List<Kardex> listarPorUsuario(Long usuarioId) {
        return kardexRepository.findByUsuarioId(usuarioId);
    }
    
    public List<Kardex> listarPorTipo(String tipo) {
        return kardexRepository.findByTipo(tipo);
    }
    
    public List<Kardex> listarPorFechas(LocalDate fechaInicio, LocalDate fechaFin) {
        return kardexRepository.findByFechaBetween(fechaInicio, fechaFin);
    }
    
    public List<Kardex> listarPorProductoYFechas(Long productoId, LocalDate fechaInicio, LocalDate fechaFin) {
        return kardexRepository.findByProductoIdAndFechaBetween(productoId, fechaInicio, fechaFin);
    }
    
    @Transactional
    public Kardex crear(Kardex kardex) {
        if (kardex.getFecha() == null) {
            kardex.setFecha(LocalDate.now());
        }
        return kardexRepository.save(kardex);
    }
    
    @Transactional
    public Kardex registrarMovimiento(Long productoId, Long usuarioId, String tipo, 
                                      String motivo, Double cantidad, Double costo,
                                      Double stockAnterior, Double stockActual) {
        Optional<Producto> productoOpt = productoRepository.findById(productoId);
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(usuarioId);
        
        if (productoOpt.isEmpty() || usuarioOpt.isEmpty()) {
            throw new RuntimeException("Producto o usuario no encontrado");
        }
        
        Kardex kardex = new Kardex();
        kardex.setFecha(LocalDate.now());
        kardex.setProducto(productoOpt.get());
        kardex.setUsuario(usuarioOpt.get());
        kardex.setTipo(tipo);
        kardex.setMotivo(motivo);
        kardex.setCantidad(java.math.BigDecimal.valueOf(cantidad));
        kardex.setCosto(java.math.BigDecimal.valueOf(costo));
        kardex.setHabia(java.math.BigDecimal.valueOf(stockAnterior));
        kardex.setHay(java.math.BigDecimal.valueOf(stockActual));
        kardex.setTotal(java.math.BigDecimal.valueOf(cantidad * costo));
        kardex.setEstado("ACTIVO");
        
        return kardexRepository.save(kardex);
    }
    
    @Transactional
    public Kardex actualizar(Long id, Kardex kardexActualizado) {
        return kardexRepository.findById(id)
            .map(kardex -> {
                if (kardexActualizado.getFecha() != null) kardex.setFecha(kardexActualizado.getFecha());
                if (kardexActualizado.getMotivo() != null) kardex.setMotivo(kardexActualizado.getMotivo());
                if (kardexActualizado.getCantidad() != null) kardex.setCantidad(kardexActualizado.getCantidad());
                if (kardexActualizado.getTipo() != null) kardex.setTipo(kardexActualizado.getTipo());
                if (kardexActualizado.getEstado() != null) kardex.setEstado(kardexActualizado.getEstado());
                if (kardexActualizado.getTotal() != null) kardex.setTotal(kardexActualizado.getTotal());
                if (kardexActualizado.getCosto() != null) kardex.setCosto(kardexActualizado.getCosto());
                if (kardexActualizado.getHabia() != null) kardex.setHabia(kardexActualizado.getHabia());
                if (kardexActualizado.getHay() != null) kardex.setHay(kardexActualizado.getHay());
                return kardexRepository.save(kardex);
            })
            .orElseThrow(() -> new RuntimeException("Kardex no encontrado con id: " + id));
    }
    
    @Transactional
    public void eliminar(Long id) {
        kardexRepository.deleteById(id);
    }
}
