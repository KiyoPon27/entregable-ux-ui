package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.entities.Rol;
import tienda.posbackend.entities.TipoDocumento;
import tienda.posbackend.entities.Usuario;
import tienda.posbackend.exceptions.DuplicateResourceException;
import tienda.posbackend.exceptions.ResourceNotFoundException;
import tienda.posbackend.repositories.RolRepository;
import tienda.posbackend.repositories.TipoDocumentoRepository;
import tienda.posbackend.repositories.UsuarioRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private TipoDocumentoRepository tipoDocumentoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Usuario obtenerPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
    }

    public Usuario obtenerPorCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con correo: " + correo));
    }

    @Transactional
    public Usuario crear(Usuario usuario) {
        // Validar que no exista el correo
        Optional<Usuario> existente = usuarioRepository.findByCorreo(usuario.getCorreo());
        if (existente.isPresent()) {
            throw new DuplicateResourceException("Ya existe un usuario con el correo: " + usuario.getCorreo());
        }

        // Validar y asignar rol
        if (usuario.getRol() != null && usuario.getRol().getId() != null) {
            Rol rol = rolRepository.findById(usuario.getRol().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado"));
            usuario.setRol(rol);
        }

        // Validar y asignar tipo de documento si viene
        if (usuario.getTipoDocumento() != null && usuario.getTipoDocumento().getId() != null) {
            TipoDocumento tipoDoc = tipoDocumentoRepository.findById(usuario.getTipoDocumento().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Tipo de documento no encontrado"));
            usuario.setTipoDocumento(tipoDoc);
        }

        // Encriptar contraseña
        if (usuario.getPassword() != null && !usuario.getPassword().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        }

        // Establecer valores por defecto
        if (usuario.getFechaRegistro() == null) {
            usuario.setFechaRegistro(LocalDateTime.now());
        }
        if (usuario.getEstado() == null) {
            usuario.setEstado("ACTIVO");
        }
        if (usuario.getTema() == null) {
            usuario.setTema("light");
        }
        if (usuario.getNroDoc() == null) {
            usuario.setNroDoc("-");
        }
        if (usuario.getTelefono() == null) {
            usuario.setTelefono("-");
        }

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario editar(Long id, Usuario usuarioDetails) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));

        // Validar correo duplicado (excluyendo el usuario actual)
        if (usuarioDetails.getCorreo() != null && !usuarioDetails.getCorreo().equals(usuario.getCorreo())) {
            Optional<Usuario> existente = usuarioRepository.findByCorreo(usuarioDetails.getCorreo());
            if (existente.isPresent() && !existente.get().getId().equals(id)) {
                throw new DuplicateResourceException("Ya existe un usuario con el correo: " + usuarioDetails.getCorreo());
            }
            usuario.setCorreo(usuarioDetails.getCorreo());
        }

        // Actualizar campos
        if (usuarioDetails.getNombres() != null) {
            usuario.setNombres(usuarioDetails.getNombres());
        }
        if (usuarioDetails.getNroDoc() != null) {
            usuario.setNroDoc(usuarioDetails.getNroDoc());
        }
        if (usuarioDetails.getTelefono() != null) {
            usuario.setTelefono(usuarioDetails.getTelefono());
        }
        if (usuarioDetails.getEstado() != null) {
            usuario.setEstado(usuarioDetails.getEstado());
        }
        if (usuarioDetails.getTema() != null) {
            usuario.setTema(usuarioDetails.getTema());
        }

        // Actualizar rol si viene
        if (usuarioDetails.getRol() != null && usuarioDetails.getRol().getId() != null) {
            Rol rol = rolRepository.findById(usuarioDetails.getRol().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado"));
            usuario.setRol(rol);
        }

        // Actualizar tipo documento si viene
        if (usuarioDetails.getTipoDocumento() != null && usuarioDetails.getTipoDocumento().getId() != null) {
            TipoDocumento tipoDoc = tipoDocumentoRepository.findById(usuarioDetails.getTipoDocumento().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Tipo de documento no encontrado"));
            usuario.setTipoDocumento(tipoDoc);
        }

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public void cambiarPassword(Long id, String nuevaPassword) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
        
        usuario.setPassword(passwordEncoder.encode(nuevaPassword));
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void eliminar(Long id) {
        // PROTECCIÓN: No permitir eliminar al super admin (ID 1)
        if (id == 1L) {
            throw new IllegalArgumentException("No se puede eliminar el usuario administrador principal");
        }
        
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));

        // TODO: Validar que no tenga ventas, movimientos, cierres, etc.
        usuarioRepository.delete(usuario);
    }
}
