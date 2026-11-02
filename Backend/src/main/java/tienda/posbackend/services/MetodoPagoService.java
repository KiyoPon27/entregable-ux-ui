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

    private boolean esMetodoProtegido(Long id) {
        return id != null && id > 0L && id <= 4L;
    }

    public List<MetodoPago> listarPorEmpresa(Long empresaId) {
        return metodoPagoRepository.findByEmpresaId(empresaId);
    }

    public List<MetodoPago> buscarPorNombre(Long empresaId, String query) {
        return metodoPagoRepository.buscarPorNombre(empresaId, query);
    }

    @SuppressWarnings("null")
    public MetodoPago obtenerPorId(Long id) {
        return metodoPagoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Método de pago no encontrado con ID: " + id));
    }

    @Transactional
    @SuppressWarnings("null")
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
    @SuppressWarnings("null")
    public MetodoPago editar(Long id, MetodoPago metodoPagoDetails) {
        // Buscar método de pago existente
        MetodoPago metodoPago = metodoPagoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Método de pago no encontrado con ID: " + id));

        if (esMetodoProtegido(id)) {
            throw new IllegalStateException("Los métodos base del sistema no se pueden modificar");
        }

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

        if (metodoPagoDetails.getColor() != null) {
            metodoPago.setColor(metodoPagoDetails.getColor());
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
    @SuppressWarnings("null")
    public void eliminar(Long id) {
        // Verificar que el método de pago existe
        MetodoPago metodoPago = metodoPagoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Método de pago no encontrado con ID: " + id));
        
        // No permitir eliminar NINGÚN método de pago para evitar errores en ventas enlazadas
        throw new IllegalStateException("No se pueden eliminar métodos de pago para evitar errores en ventas enlazadas");
    }

    @Transactional
    @SuppressWarnings("null")
    public MetodoPago deshabilitar(Long id) {
        MetodoPago metodoPago = metodoPagoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Método de pago no encontrado con ID: " + id));

        if (esMetodoProtegido(id)) {
            throw new IllegalStateException("Los métodos base del sistema no se pueden deshabilitar");
        }

        metodoPago.setVerNombre(false);
        return metodoPagoRepository.save(metodoPago);
    }

    @Transactional
    @SuppressWarnings("null")
    public MetodoPago habilitar(Long id) {
        MetodoPago metodoPago = metodoPagoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Método de pago no encontrado con ID: " + id));

        if (esMetodoProtegido(id)) {
            throw new IllegalStateException("Los métodos base del sistema no se pueden cambiar de estado");
        }

        metodoPago.setVerNombre(true);
        return metodoPagoRepository.save(metodoPago);
    }
}
