package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.entities.Rol;
import tienda.posbackend.entities.TipoDocumento;
import tienda.posbackend.entities.Usuario;
import tienda.posbackend.entities.Permiso;
import tienda.posbackend.entities.Modulo;
import tienda.posbackend.entities.AsignacionSucursal;
import tienda.posbackend.entities.Sucursal;
import tienda.posbackend.entities.Empresa;
import tienda.posbackend.exceptions.DuplicateResourceException;
import tienda.posbackend.exceptions.ResourceNotFoundException;
import tienda.posbackend.repositories.RolRepository;
import tienda.posbackend.repositories.TipoDocumentoRepository;
import tienda.posbackend.repositories.UsuarioRepository;
import tienda.posbackend.repositories.PermisoRepository;
import tienda.posbackend.repositories.ModuloRepository;
import tienda.posbackend.repositories.AsignacionSucursalRepository;
import tienda.posbackend.repositories.SucursalRepository;
import tienda.posbackend.repositories.EmpresaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@SuppressWarnings("null")
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private TipoDocumentoRepository tipoDocumentoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PermisoRepository permisoRepository;

    @Autowired
    private ModuloRepository moduloRepository;

    @Autowired
    private AuditoriaService auditoriaService;

    @Autowired
    private AsignacionSucursalRepository asignacionSucursalRepository;

    @Autowired
    private SucursalRepository sucursalRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

    public List<Usuario> listarTodos() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        
        // Agregar información de empresa a cada usuario
        for (Usuario usuario : usuarios) {
            try {
                // Primero intentar obtener empresa donde el usuario es propietario
                Optional<Empresa> empresaOptional = empresaRepository.findByUsuarioId(usuario.getId());
                if (empresaOptional.isPresent()) {
                    usuario.setEmpresaId(empresaOptional.get().getId());
                } else {
                    // Si no es propietario, buscar empresa a través de AsignacionSucursal
                    List<AsignacionSucursal> asignaciones = asignacionSucursalRepository.findByUsuarioId(usuario.getId());
                    if (!asignaciones.isEmpty()) {
                        Sucursal sucursal = asignaciones.get(0).getSucursal();
                        if (sucursal != null && sucursal.getEmpresa() != null) {
                            usuario.setEmpresaId(sucursal.getEmpresa().getId());
                        }
                    }
                }
            } catch (Exception e) {
                // Si hay error, simplemente no asignamos empresa
                usuario.setEmpresaId(null);
            }
        }
        
        return usuarios;
    }

    public List<Usuario> listarPorEmpresa(Long idEmpresa) {
        return usuarioRepository.findByEmpresaId(idEmpresa);
    }

    public Usuario obtenerPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
    }

    public Usuario obtenerPorCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con correo: " + correo));
    }

    @Transactional
    public Usuario crear(Usuario usuario, Long idSucursal) {
        // Limpiar espacios del correo
        if (usuario.getCorreo() != null) {
            usuario.setCorreo(usuario.getCorreo().trim());
        }

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

        Usuario nuevoUsuario = usuarioRepository.save(usuario);

        // TRIGGER: Crear AsignacionSucursal si se proporciona idSucursal
        if (idSucursal != null && idSucursal > 0) {
            Sucursal sucursal = sucursalRepository.findById(idSucursal)
                    .orElseThrow(() -> new ResourceNotFoundException("Sucursal no encontrada con ID: " + idSucursal));
            
            AsignacionSucursal asignacion = new AsignacionSucursal();
            asignacion.setUsuario(nuevoUsuario);
            asignacion.setSucursal(sucursal);
            asignacionSucursalRepository.save(asignacion);
        }

        // TRIGGER: Asignar automáticamente el módulo "Home" (ID 22, enlace="/") al nuevo usuario
        Modulo moduloHome = moduloRepository.findById(22L).orElse(null);

        if (moduloHome != null) {
            Permiso permisoHome = new Permiso();
            permisoHome.setUsuario(nuevoUsuario);
            permisoHome.setModulo(moduloHome);

            permisoRepository.save(permisoHome);
        }

        // Registrar en auditoría
        auditoriaService.registrarCreacion(nuevoUsuario, null, "USUARIO",
            nuevoUsuario.getId(), nuevoUsuario, "Usuario creado: " + nuevoUsuario.getNombres() + " (" + nuevoUsuario.getCorreo() + ")");

        return nuevoUsuario;
    }

    @Transactional
    public Usuario editar(Long id, Usuario usuarioDetails) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));

        // PROTECCIÓN: No permitir editar usuarios con rol SuperAdmin u OG
        if (usuario.getRol() != null && usuario.getRol().getNombre() != null) {
            String rolNombre = usuario.getRol().getNombre().toLowerCase();
            if ("superadmin".equals(rolNombre) || "og".equals(rolNombre)) {
                throw new IllegalArgumentException("No se puede editar un usuario con rol " + usuario.getRol().getNombre());
            }
        }

        // Guardar estado anterior para auditoría
        Usuario usuarioAnterior = new Usuario();
        usuarioAnterior.setId(usuario.getId());
        usuarioAnterior.setNombres(usuario.getNombres());
        usuarioAnterior.setCorreo(usuario.getCorreo());
        usuarioAnterior.setNroDoc(usuario.getNroDoc());
        usuarioAnterior.setTelefono(usuario.getTelefono());
        usuarioAnterior.setEstado(usuario.getEstado());

        // Validar correo duplicado (excluyendo el usuario actual)
        if (usuarioDetails.getCorreo() != null) {
            String correoLimpio = usuarioDetails.getCorreo().trim();
            if (!correoLimpio.equals(usuario.getCorreo())) {
                Optional<Usuario> existente = usuarioRepository.findByCorreo(correoLimpio);
                if (existente.isPresent() && !existente.get().getId().equals(id)) {
                    throw new DuplicateResourceException("Ya existe un usuario con el correo: " + correoLimpio);
                }
                usuario.setCorreo(correoLimpio);
            }
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

        Usuario usuarioActualizado = usuarioRepository.save(usuario);

        // Registrar en auditoría
        auditoriaService.registrarActualizacion(usuarioActualizado, null, "USUARIO",
            usuarioActualizado.getId(), usuarioAnterior, usuarioActualizado, "Usuario actualizado: " + usuarioActualizado.getNombres());

        return usuarioActualizado;
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

        // PROTECCIÓN: No permitir eliminar usuarios con rol SuperAdmin u OG
        if (usuario.getRol() != null && usuario.getRol().getNombre() != null) {
            String rolNombre = usuario.getRol().getNombre().toLowerCase();
            if ("superadmin".equals(rolNombre) || "og".equals(rolNombre)) {
                throw new IllegalArgumentException("No se puede eliminar un usuario con rol " + usuario.getRol().getNombre());
            }
        }

        // Registrar en auditoría antes de eliminar
        auditoriaService.registrarEliminacion(usuario, null, "USUARIO",
            usuario.getId(), usuario, "Usuario eliminado: " + usuario.getNombres());

        usuarioRepository.delete(usuario);
    }
}
