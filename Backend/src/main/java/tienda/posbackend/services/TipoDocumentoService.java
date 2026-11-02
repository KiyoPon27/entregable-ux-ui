package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.entities.TipoDocumento;
import tienda.posbackend.repositories.TipoDocumentoRepository;

import java.util.List;
import java.util.Optional;

@Service
public class TipoDocumentoService {
    
    @Autowired
    private TipoDocumentoRepository tipoDocumentoRepository;
    
    public List<TipoDocumento> listarTodos() {
        return tipoDocumentoRepository.findAll();
    }
    
    @SuppressWarnings("null")
    public Optional<TipoDocumento> buscarPorId(Long id) {
        return tipoDocumentoRepository.findById(id);
    }
    
    public List<TipoDocumento> listarPorEmpresa(Long empresaId) {
        return tipoDocumentoRepository.findByIdEmpresa(empresaId);
    }
    
    @Transactional
    @SuppressWarnings("null")
    public TipoDocumento crear(TipoDocumento tipoDocumento) {
        return tipoDocumentoRepository.save(tipoDocumento);
    }
    
    @Transactional
    @SuppressWarnings("null")
    public TipoDocumento actualizar(Long id, TipoDocumento tipoDocumentoActualizado) {
        return tipoDocumentoRepository.findById(id)
            .map(tipoDocumento -> {
                if (tipoDocumentoActualizado.getNombre() != null) {
                    tipoDocumento.setNombre(tipoDocumentoActualizado.getNombre());
                }
                if (tipoDocumentoActualizado.getIdEmpresa() != null) {
                    tipoDocumento.setIdEmpresa(tipoDocumentoActualizado.getIdEmpresa());
                }
                return tipoDocumentoRepository.save(tipoDocumento);
            })
            .orElseThrow(() -> new RuntimeException("Tipo de documento no encontrado con id: " + id));
    }
    
    @Transactional
    @SuppressWarnings("null")
    public void eliminar(Long id) {
        tipoDocumentoRepository.deleteById(id);
    }
}
