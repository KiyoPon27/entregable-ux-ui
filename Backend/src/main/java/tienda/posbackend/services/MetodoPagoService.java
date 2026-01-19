package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.entities.Empresa;
import tienda.posbackend.entities.MetodoPago;
import tienda.posbackend.exceptions.DuplicateResourceException;
import tienda.posbackend.exceptions.ResourceNotFoundException;
import tienda.posbackend.repositories.EmpresaRepository;
import tienda.posbackend.repositories.MetodoPagoRepository;

import java.util.List;
import java.util.Optional;

@Service
public class MetodoPagoService {

    @Autowired
    private MetodoPagoRepository metodoPagoRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

    public List<MetodoPago> listarPorEmpresa(Long empresaId) {
        return metodoPagoRepository.findByEmpresaId(empresaId);
    }

    public List<MetodoPago> buscarPorNombre(Long empresaId, String query) {
        return metodoPagoRepository.buscarPorNombre(empresaId, query);
    }

    public MetodoPago obtenerPorId(Long id) {
        return metodoPagoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Método de pago no encontrado con ID: " + id));
    }

    @Transactional
    public MetodoPago crear(MetodoPago metodoPago) {
        // Validar que venga la empresa
        if (metodoPago.getEmpresa() == null || metodoPago.getEmpresa().getId() == null) {
            throw new IllegalArgumentException("Debe especificar una empresa");
        }

        Long empresaId = metodoPago.getEmpresa().getId();
        
        // Buscar y asignar la empresa
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new ResourceNotFoundException("Empresa no encontrada con ID: " + empresaId));
        
        metodoPago.setEmpresa(empresa);

        // Validar duplicados: nombre + empresa (case insensitive)
        Optional<MetodoPago> existente = metodoPagoRepository
                .findByNombreIgnoreCaseAndEmpresaId(metodoPago.getNombre(), empresaId);
        
        if (existente.isPresent()) {
            throw new DuplicateResourceException("Ya existe un método de pago con el nombre '" + metodoPago.getNombre() + "' en esta empresa");
        }

        return metodoPagoRepository.save(metodoPago);
    }

    @Transactional
    public MetodoPago editar(Long id, MetodoPago metodoPagoDetails) {
        // Buscar método de pago existente
        MetodoPago metodoPago = metodoPagoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Método de pago no encontrado con ID: " + id));

        Long empresaId = metodoPago.getEmpresa().getId();

        // Validar duplicados: nombre + empresa (excluyendo el método actual)
        Optional<MetodoPago> existente = metodoPagoRepository
                .findByNombreIgnoreCaseAndEmpresaId(metodoPagoDetails.getNombre(), empresaId);
        
        if (existente.isPresent() && !existente.get().getId().equals(id)) {
            throw new DuplicateResourceException("Ya existe otro método de pago con el nombre '" + metodoPagoDetails.getNombre() + "' en esta empresa");
        }

        // Actualizar campos
        metodoPago.setNombre(metodoPagoDetails.getNombre());
        
        if (metodoPagoDetails.getIcono() != null) {
            metodoPago.setIcono(metodoPagoDetails.getIcono());
        }
        
        if (metodoPagoDetails.getVerNombre() != null) {
            metodoPago.setVerNombre(metodoPagoDetails.getVerNombre());
        }
        
        if (metodoPagoDetails.getEliminarActualizar() != null) {
            metodoPago.setEliminarActualizar(metodoPagoDetails.getEliminarActualizar());
        }

        return metodoPagoRepository.save(metodoPago);
    }

    @Transactional
    public void eliminar(Long id) {
        // Verificar que el método de pago existe
        MetodoPago metodoPago = metodoPagoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Método de pago no encontrado con ID: " + id));
        
        // Validar que no sea un método protegido (eliminarActualizar = false)
        if (metodoPago.getEliminarActualizar() != null && !metodoPago.getEliminarActualizar()) {
            throw new IllegalStateException("Este método de pago es del sistema y no se puede eliminar");
        }
        
        // TODO: En futuro validar si tiene movimientos de caja asociados
        
        metodoPagoRepository.deleteById(id);
    }
}
