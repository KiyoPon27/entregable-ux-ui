package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.models.Usuario;
import tienda.posbackend.repositories.UsuarioRepository;


import java.util.List;

/**
 * SERVICE: UsuarioService
 * 
 * LÓGICA DE NEGOCIO PARA USUARIOS
 * 
 * IMPORTANTE:
 * - Las contraseñas se hashean con BCrypt antes de guardar
 * - El correo debe ser único en todo el sistema
 * - El estado puede ser: ACTIVO, INACTIVO, BLOQUEADO
 */
@Service
@Transactional
public class UsuarioService {

    @Autowired
    private UsuarioRepository repository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * ============================================================
     * FUNCIÓN: mostrarusuarios
     * ============================================================
     * 
     * REPLICADA DE POSTGRESQL
     * 
     * Lista todos los usuarios ordenados alfabéticamente
     * 
     * FRONTEND:
     * const response = await axios.get("/api/usuarios/mostrar");
     * 
     * @return Lista de usuarios ordenados por nombres
     */
    public List<Usuario> mostrarUsuarios() {
        return repository.findAllByOrderByNombresAsc();
    }

    /**
     * ============================================================
     * FUNCIÓN: insertarusuario
     * ============================================================
     * 
     * REPLICADA DE POSTGRESQL
     * 
     * Inserta un nuevo usuario
     * 
     * VALIDACIONES:
     * 1. Correo único en todo el sistema
     * 2. Password debe ser hasheado
     * 3. Correo y password son obligatorios
     * 
     * POSTGRESQL ORIGINAL:
     * PERFORM 1 FROM usuarios WHERE correo = ?
     * IF FOUND THEN RAISE EXCEPTION 'Email ya registrado'
     * 
     * @param usuario - Datos del usuario (password en texto plano)
     * @return Usuario creado con password hasheado
     * @throws Exception si hay duplicados o validación falla
     */
    public Usuario insertarUsuario(Usuario usuario) throws Exception {
        
        // VALIDACIÓN 1: Correo obligatorio
        if (usuario.getCorreo() == null || usuario.getCorreo().trim().isEmpty()) {
            throw new Exception("El correo es obligatorio");
        }

        // VALIDACIÓN 2: Password obligatorio
        if (usuario.getPassword() == null || usuario.getPassword().trim().isEmpty()) {
            throw new Exception("La contraseña es obligatoria");
        }

        // VALIDACIÓN 3: Correo duplicado
        if (repository.existsByCorreo(usuario.getCorreo())) {
            throw new Exception("El correo ya está registrado en el sistema");
        }

        // VALIDACIÓN 4: Password mínimo 6 caracteres
        if (usuario.getPassword().length() < 6) {
            throw new Exception("La contraseña debe tener al menos 6 caracteres");
        }

        // Hashear contraseña con BCrypt
        String passwordHash = passwordEncoder.encode(usuario.getPassword());
        usuario.setPassword(passwordHash);
        
        // Estado inicial
        if (usuario.getEstado() == null) {
            usuario.setEstado("ACTIVO");
        }

        // Guardar usuario
        return repository.save(usuario);
    }

    /**
     * ============================================================
     * FUNCIÓN: editarusuario
     * ============================================================
     * 
     * REPLICADA DE POSTGRESQL
     * 
     * Edita un usuario existente
     * 
     * VALIDACIONES:
     * 1. Correo único (excluyendo usuario actual)
     * 2. Si se cambia password, debe ser hasheado
     * 
     * @param id - ID del usuario a editar
     * @param usuario - Nuevos datos
     * @throws Exception si hay duplicados o restricciones
     */
    public void editarUsuario(Long id, Usuario usuario) throws Exception {
        
        // Verificar que existe
        Usuario existente = repository.findById(id)
            .orElseThrow(() -> new Exception("Usuario no encontrado"));

        // VALIDACIÓN 1: Correo duplicado (excluyendo actual)
        if (repository.existsByCorreoAndIdNot(usuario.getCorreo(), id)) {
            throw new Exception("El correo ya está registrado por otro usuario");
        }

        // Actualizar campos
        existente.setNombres(usuario.getNombres());
        existente.setCorreo(usuario.getCorreo());
        existente.setTelefono(usuario.getTelefono());
        existente.setNroDoc(usuario.getNroDoc());
        existente.setIdRol(usuario.getIdRol());
        existente.setEstado(usuario.getEstado());
        existente.setTema(usuario.getTema());

        // Si se proporciona nueva contraseña, hashearla
        if (usuario.getPassword() != null && !usuario.getPassword().trim().isEmpty()) {
            if (usuario.getPassword().length() < 6) {
                throw new Exception("La contraseña debe tener al menos 6 caracteres");
            }
            String passwordHash = passwordEncoder.encode(usuario.getPassword());
            existente.setPassword(passwordHash);
        }

        // fechaRegistro NO se modifica

        repository.save(existente);
    }

    /**
     * ============================================================
     * FUNCIÓN: eliminarusuario
     * ============================================================
     * 
     * REPLICADA DE POSTGRESQL
     * 
     * Elimina un usuario
     * 
     * IMPORTANTE:
     * En producción, se recomienda desactivar (activo=false) en lugar de eliminar.
     * La eliminación física puede causar problemas si hay registros asociados.
     * 
     * @param id - ID del usuario a eliminar
     * @throws Exception si no existe
     */
    public void eliminarUsuario(Long id) throws Exception {
        
        if (!repository.existsById(id)) {
            throw new Exception("Usuario no encontrado");
        }

        // Verificar si tiene registros asociados
        // TODO: Validar si tiene ventas, movimientos, etc.
        // Si tiene, mejor desactivar en lugar de eliminar

        repository.deleteById(id);
    }

    /**
     * ============================================================
     * FUNCIÓN AUXILIAR: Desactivar usuario
     * ============================================================
     * 
     * Alternativa más segura que eliminar
     * 
     * @param id - ID del usuario
     * @throws Exception si no existe
     */
    public void desactivarUsuario(Long id) throws Exception {
        
        Usuario usuario = repository.findById(id)
            .orElseThrow(() -> new Exception("Usuario no encontrado"));

        usuario.setEstado("INACTIVO");
        repository.save(usuario);
    }

    /**
     * ============================================================
     * FUNCIÓN AUXILIAR: Activar usuario
     * ============================================================
     * 
     * @param id - ID del usuario
     * @throws Exception si no existe
     */
    public void activarUsuario(Long id) throws Exception {
        
        Usuario usuario = repository.findById(id)
            .orElseThrow(() -> new Exception("Usuario no encontrado"));

        usuario.setEstado("ACTIVO");
        repository.save(usuario);
    }

    /**
     * ============================================================
     * FUNCIÓN: Buscar usuario por correo (para login)
     * ============================================================
     * 
     * @param correo - Correo del usuario
     * @return Usuario si existe y está activo, null si no
     */
    public Usuario buscarPorCorreo(String correo) {
        return repository.findByCorreoAndActivoTrue(correo).orElse(null);
    }

    /**
     * ============================================================
     * FUNCIÓN: Verificar contraseña
     * ============================================================
     * 
     * Para login
     * 
     * @param passwordPlano - Contraseña en texto plano
     * @param passwordHash - Contraseña hasheada almacenada
     * @return true si coinciden
     */
    public boolean verificarPassword(String passwordPlano, String passwordHash) {
        return passwordEncoder.matches(passwordPlano, passwordHash);
    }

    /**
     * ============================================================
     * FUNCIÓN: Cambiar contraseña
     * ============================================================
     * 
     * @param id - ID del usuario
     * @param passwordActual - Contraseña actual (para validar)
     * @param passwordNueva - Nueva contraseña
     * @throws Exception si la contraseña actual no coincide
     */
    public void cambiarPassword(Long id, String passwordActual, String passwordNueva) throws Exception {
        
        Usuario usuario = repository.findById(id)
            .orElseThrow(() -> new Exception("Usuario no encontrado"));

        // Verificar contraseña actual
        if (!passwordEncoder.matches(passwordActual, usuario.getPassword())) {
            throw new Exception("La contraseña actual es incorrecta");
        }

        // Validar nueva contraseña
        if (passwordNueva.length() < 6) {
            throw new Exception("La contraseña debe tener al menos 6 caracteres");
        }

        // Hashear y guardar
        String passwordHash = passwordEncoder.encode(passwordNueva);
        usuario.setPassword(passwordHash);
        repository.save(usuario);
    }

    /**
     * ============================================================
     * FUNCIÓN: Obtener usuario por ID
     * ============================================================
     * 
     * @param id - ID del usuario
     * @return Usuario o null
     */
    public Usuario obtenerUsuario(Long id) {
        return repository.findById(id).orElse(null);
    }

    /**
     * ============================================================
     * FUNCIÓN: Contar usuarios activos
     * ============================================================
     * 
     * @return Cantidad de usuarios activos
     */
    public Long contarUsuarios() {
        return repository.countActivos();
    }

    /**
     * ============================================================
     * FUNCIÓN: Listar usuarios activos
     * ============================================================
     * 
     * @return Lista de usuarios activos
     */
    public List<Usuario> listarActivos() {
        return repository.findAllByOrderByNombresAsc()
            .stream()
            .filter(u -> "ACTIVO".equals(u.getEstado()))
            .toList();
    }
}
