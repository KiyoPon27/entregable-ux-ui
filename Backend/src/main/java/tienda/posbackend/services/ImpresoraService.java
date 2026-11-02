package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.entities.Impresora;
import tienda.posbackend.entities.Usuario;
import tienda.posbackend.exceptions.ResourceNotFoundException;
import tienda.posbackend.repositories.ImpresoraRepository;
import tienda.posbackend.repositories.UsuarioRepository;

import java.util.Optional;

@Service
@SuppressWarnings("null")
public class ImpresoraService {

    @Autowired
    private ImpresoraRepository impresoraRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public Optional<Impresora> obtenerPorUsuario(Long usuarioId) {
        return impresoraRepository.findByUsuarioId(usuarioId);
    }

    public Impresora obtenerPorId(Long id) {
        return impresoraRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Impresora no encontrada con ID: " + id));
    }

    @Transactional
    public Impresora crear(Impresora impresora) {
        // Validar que venga el usuario
        if (impresora.getUsuario() == null || impresora.getUsuario().getId() == null) {
            throw new IllegalArgumentException("Debe especificar un usuario");
        }

        Long usuarioId = impresora.getUsuario().getId();
        
        // Buscar y asignar el usuario
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + usuarioId));
        
        impresora.setUsuario(usuario);

        // Establecer valores por defecto si no vienen
        if (impresora.getNombrePc() == null) {
            impresora.setNombrePc("-");
        }
        if (impresora.getIpLocal() == null) {
            impresora.setIpLocal("-");
        }
        if (impresora.getEstado() == null) {
            impresora.setEstado(false);
        }
        if (impresora.getNombre() == null) {
            impresora.setNombre("-");
        }

        return impresoraRepository.save(impresora);
    }

    @Transactional
    public Impresora editar(Long id, Impresora impresoraDetails) {
        // Buscar impresora existente
        Impresora impresora = impresoraRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Impresora no encontrada con ID: " + id));

        // Actualizar campos
        if (impresoraDetails.getNombrePc() != null) {
            impresora.setNombrePc(impresoraDetails.getNombrePc());
        }
        
        if (impresoraDetails.getIpLocal() != null) {
            impresora.setIpLocal(impresoraDetails.getIpLocal());
        }
        
        if (impresoraDetails.getEstado() != null) {
            impresora.setEstado(impresoraDetails.getEstado());
        }
        
        if (impresoraDetails.getNombre() != null) {
            impresora.setNombre(impresoraDetails.getNombre());
        }

        return impresoraRepository.save(impresora);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!impresoraRepository.existsById(id)) {
            throw new ResourceNotFoundException("Impresora no encontrada con ID: " + id);
        }
        impresoraRepository.deleteById(id);
    }
}
