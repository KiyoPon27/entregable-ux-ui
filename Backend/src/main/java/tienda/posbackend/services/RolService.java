package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.models.Rol;
import tienda.posbackend.repositories.RolRepository;

import java.util.List;

/**
 * SERVICE: RolService
 * 
 * LÓGICA DE NEGOCIO PARA ROLES DE USUARIO
 * 
 * MIGRACIÓN FRONTEND:
 * ANTES: await supabase.from("roles").select().neq("nombre", "superadmin")
 * AHORA: await axios.get("/api/roles/mostrar")
 * 
 * FUNCIONALIDADES:
 * 1. mostrarRoles() - Listar roles (sin superadmin)
 * 2. insertarRol() - Crear nuevo rol
 * 3. editarRol() - Actualizar rol
 * 4. eliminarRol() - Eliminar rol
 * 5. buscarPorNombre() - Buscar rol específico
 * 
 * ROLES PREDEFINIDOS:
 * - superadmin: Acceso total (creado en setup inicial)
 * - administrador: Gestión completa de empresa
 * - empleado: Operaciones de venta y caja
 * - cajero: Solo caja
 * - vendedor: Solo ventas
 * 
 * IMPORTANTE:
 * - El rol "superadmin" NO aparece en listados normales
 * - Cada rol tiene permisos asociados en permisos_default
 * - No eliminar roles con usuarios asignados
 */
@Service
public class RolService {

    @Autowired
    private RolRepository rolRepository;

    /**
     * ============================================================
     * MÉTODO: mostrarRoles
     * ============================================================
     * 
     * POSTGRESQL RPC: mostraroles()
     * 
     * SELECT * FROM roles 
     * WHERE nombre != 'superadmin' 
     * ORDER BY nombre ASC
     * 
     * FRONTEND:
     * const response = await axios.get("/api/roles/mostrar");
     * 
     * RETORNA:
     * [
     *   { id: 2, nombre: "administrador", descripcion: "Gestión completa", icono: "👑" },
     *   { id: 4, nombre: "cajero", descripcion: "Operaciones de caja", icono: "💰" },
     *   { id: 3, nombre: "empleado", descripcion: "Ventas y caja", icono: "🪖" }
     * ]
     */
    public List<Rol> mostrarRoles() {
        return rolRepository.findAllExceptSuperadmin();
    }

    /**
     * ============================================================
     * MÉTODO: mostrarTodosRoles
     * ============================================================
     * 
     * Listar TODOS los roles (incluyendo superadmin)
     * Solo para administración interna
     */
    public List<Rol> mostrarTodosRoles() {
        return rolRepository.findAll();
    }

    /**
     * ============================================================
     * MÉTODO: buscarPorNombre
     * ============================================================
     * 
     * POSTGRESQL RPC: mostrarrolesxnombre(p_nombre)
     * 
     * SELECT * FROM roles WHERE nombre = p_nombre
     * 
     * FRONTEND:
     * const response = await axios.get("/api/roles/buscar?nombre=administrador");
     */
    public Rol buscarPorNombre(String nombre) {
        return rolRepository.findByNombre(nombre)
            .orElseThrow(() -> new RuntimeException("No se encontró rol con nombre: " + nombre));
    }

    /**
     * ============================================================
     * MÉTODO: insertarRol
     * ============================================================
     * 
     * POSTGRESQL RPC: insertarrol(...)
     * 
     * INSERT INTO roles (nombre, descripcion, icono) 
     * VALUES (p_nombre, p_descripcion, p_icono)
     * 
     * VALIDACIONES:
     * 1. Nombre único (no debe existir otro rol con ese nombre)
     * 2. Nombre no puede ser "superadmin" (reservado)
     * 
     * FRONTEND:
     * const response = await axios.post("/api/roles/insertarrol", {
     *   nombre: "vendedor",
     *   descripcion: "Solo operaciones de venta",
     *   icono: "🛒"
     * });
     */
    @Transactional
    public Rol insertarRol(Rol rol) {
        // VALIDACIÓN: Nombre "superadmin" reservado
        if ("superadmin".equalsIgnoreCase(rol.getNombre())) {
            throw new RuntimeException("El nombre 'superadmin' está reservado");
        }

        // VALIDACIÓN: Nombre único
        if (rolRepository.existsByNombre(rol.getNombre())) {
            throw new RuntimeException("Ya existe un rol con el nombre: " + rol.getNombre());
        }

        return rolRepository.save(rol);
    }

    /**
     * ============================================================
     * MÉTODO: editarRol
     * ============================================================
     * 
     * POSTGRESQL RPC: editarrol(...)
     * 
     * UPDATE roles 
     * SET nombre = p_nombre, descripcion = p_descripcion, icono = p_icono
     * WHERE id = p_id
     * 
     * VALIDACIONES:
     * 1. No editar rol "superadmin"
     * 2. Si cambia nombre, verificar unicidad
     * 
     * FRONTEND:
     * const response = await axios.put("/api/roles/editarrol", {
     *   id: 3,
     *   nombre: "empleado",
     *   descripcion: "Operaciones de venta y caja",
     *   icono: "🪖"
     * });
     */
    @Transactional
    public Rol editarRol(Long id, Rol rolActualizado) {
        Rol rolExistente = rolRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("No se encontró rol con id: " + id));

        // VALIDACIÓN: No editar "superadmin"
        if ("superadmin".equalsIgnoreCase(rolExistente.getNombre())) {
            throw new RuntimeException("No se puede editar el rol 'superadmin'");
        }

        // VALIDACIÓN: Si cambia nombre, verificar unicidad
        if (rolActualizado.getNombre() != null && 
            !rolActualizado.getNombre().equalsIgnoreCase(rolExistente.getNombre())) {
            
            // No permitir cambiar a "superadmin"
            if ("superadmin".equalsIgnoreCase(rolActualizado.getNombre())) {
                throw new RuntimeException("El nombre 'superadmin' está reservado");
            }
            
            if (rolRepository.existsByNombre(rolActualizado.getNombre())) {
                throw new RuntimeException("Ya existe un rol con el nombre: " + rolActualizado.getNombre());
            }
            
            rolExistente.setNombre(rolActualizado.getNombre());
        }

        // ACTUALIZAR CAMPOS
        if (rolActualizado.getDescripcion() != null) {
            rolExistente.setDescripcion(rolActualizado.getDescripcion());
        }
        if (rolActualizado.getIcono() != null) {
            rolExistente.setIcono(rolActualizado.getIcono());
        }

        return rolRepository.save(rolExistente);
    }

    /**
     * ============================================================
     * MÉTODO: eliminarRol
     * ============================================================
     * 
     * POSTGRESQL RPC: eliminarrol(p_id)
     * 
     * DELETE FROM roles WHERE id = p_id
     * 
     * VALIDACIONES:
     * - No eliminar "superadmin"
     * - No eliminar si tiene usuarios asignados (FK constraint)
     * 
     * FRONTEND:
     * const response = await axios.delete("/api/roles/eliminarrol/5");
     */
    @Transactional
    public void eliminarRol(Long id) {
        Rol rol = rolRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("No se encontró rol con id: " + id));

        // VALIDACIÓN: No eliminar "superadmin"
        if ("superadmin".equalsIgnoreCase(rol.getNombre())) {
            throw new RuntimeException("No se puede eliminar el rol 'superadmin'");
        }

        // TODO: Agregar validación de usuarios asignados
        // if (usuarioRepository.existsByIdRol(id)) {
        //     throw new RuntimeException("No se puede eliminar porque hay usuarios con este rol");
        // }

        rolRepository.delete(rol);
    }

    /**
     * ============================================================
     * MÉTODO AUXILIAR: obtenerRol
     * ============================================================
     */
    public Rol obtenerRol(Long id) {
        return rolRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("No se encontró rol con id: " + id));
    }

    /**
     * ============================================================
     * MÉTODO AUXILIAR: contarRoles
     * ============================================================
     */
    public Long contarRoles() {
        return rolRepository.countRoles();
    }

    /**
     * ============================================================
     * MÉTODO AUXILIAR: crearRolesPredefinidos
     * ============================================================
     * 
     * Crear roles predefinidos del sistema
     * Se llama en setup inicial de la aplicación
     * 
     * ROLES:
     * 1. superadmin (acceso total)
     * 2. administrador (gestión completa)
     * 3. empleado (ventas + caja)
     * 4. cajero (solo caja)
     * 5. vendedor (solo ventas)
     */
    @Transactional
    public void crearRolesPredefinidos() {
        // 1. Superadmin (solo si no existe)
        if (!rolRepository.existsByNombre("superadmin")) {
            Rol superadmin = new Rol();
            superadmin.setNombre("superadmin");
            superadmin.setDescripcion("Acceso total al sistema");
            superadmin.setIcono("⭐");
            rolRepository.save(superadmin);
        }

        // 2. Administrador
        if (!rolRepository.existsByNombre("administrador")) {
            Rol administrador = new Rol();
            administrador.setNombre("administrador");
            administrador.setDescripcion("Gestión completa de la empresa");
            administrador.setIcono("👑");
            rolRepository.save(administrador);
        }

        // 3. Empleado
        if (!rolRepository.existsByNombre("empleado")) {
            Rol empleado = new Rol();
            empleado.setNombre("empleado");
            empleado.setDescripcion("Operaciones de venta y caja");
            empleado.setIcono("🪖");
            rolRepository.save(empleado);
        }

        // 4. Cajero
        if (!rolRepository.existsByNombre("cajero")) {
            Rol cajero = new Rol();
            cajero.setNombre("cajero");
            cajero.setDescripcion("Solo operaciones de caja");
            cajero.setIcono("💰");
            rolRepository.save(cajero);
        }

        // 5. Vendedor
        if (!rolRepository.existsByNombre("vendedor")) {
            Rol vendedor = new Rol();
            vendedor.setNombre("vendedor");
            vendedor.setDescripcion("Solo operaciones de venta");
            vendedor.setIcono("🛒");
            rolRepository.save(vendedor);
        }
    }
}
