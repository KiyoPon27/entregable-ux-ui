package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.models.Rol;
import tienda.posbackend.services.RolService;

import java.util.List;
import java.util.Map;

/**
 * CONTROLLER: RolController
 * 
 * ENDPOINTS REST PARA ROLES DE USUARIO
 * 
 * MIGRACIÓN FRONTEND:
 * ANTES: const { data } = await supabase.from("roles").select().neq("nombre", "superadmin")
 * AHORA: const { data } = await axios.get("/api/roles/mostrar")
 * 
 * USADO EN:
 * - RegistrarUsuarios.jsx (SelectList de roles)
 * - PermisosUser.jsx (asignar rol y permisos)
 * - Usuarios.jsx (mostrar rol en tabla)
 * - MiPerfil.jsx (mostrar rol del usuario)
 * 
 * STORE ZUSTAND:
 * RolesStore.jsx:
 * - mostrarRoles() → GET /mostrar
 * - rolesItemSelect (rol seleccionado en dropdown)
 * 
 * ENDPOINTS PRINCIPALES:
 * GET    /api/roles/mostrar               → Listar roles (sin superadmin)
 * GET    /api/roles/buscar?nombre=cajero  → Buscar por nombre
 * POST   /api/roles/insertarrol           → Crear rol
 * PUT    /api/roles/editarrol             → Editar rol
 * DELETE /api/roles/eliminarrol/:id       → Eliminar rol
 */
@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "*")
public class RolController {

    @Autowired
    private RolService rolService;

    /**
     * ============================================================
     * ENDPOINT: mostraroles
     * ============================================================
     * 
     * GET /api/roles/mostrar
     * 
     * POSTGRESQL RPC: mostraroles()
     * 
     * FRONTEND (RolesStore.jsx):
     * const mostrarRoles = async () => {
     *   const response = await axios.get("/api/roles/mostrar");
     *   set({ dataroles: response.data, rolesItemSelect: response.data[0] });
     * };
     * 
     * USADO EN:
     * - PermisosUser.jsx (SelectList de roles)
     * - RegistrarUsuarios.jsx (dropdown rol)
     * - Usuarios.jsx (cargar roles al montar página)
     * 
     * RESPUESTA:
     * [
     *   { id: 2, nombre: "administrador", descripcion: "Gestión completa", icono: "👑" },
     *   { id: 4, nombre: "cajero", descripcion: "Operaciones de caja", icono: "💰" },
     *   { id: 3, nombre: "empleado", descripcion: "Ventas y caja", icono: "🪖" },
     *   { id: 5, nombre: "vendedor", descripcion: "Solo ventas", icono: "🛒" }
     * ]
     * 
     * IMPORTANTE:
     * - NO incluye "superadmin" (excluido con neq filter)
     * - Se usa en dropdowns de selección de rol
     */
    @GetMapping("/mostrar")
    public ResponseEntity<?> mostrar() {
        List<Rol> roles = rolService.mostrarRoles();
        return ResponseEntity.ok(roles);
    }

    /**
     * ============================================================
     * ENDPOINT: mostrarrolesxnombre
     * ============================================================
     * 
     * GET /api/roles/buscar?nombre=administrador
     * 
     * POSTGRESQL RPC: mostrarrolesxnombre(p_nombre)
     * 
     * FRONTEND:
     * const response = await axios.get("/api/roles/buscar", {
     *   params: { nombre: "administrador" }
     * });
     * 
     * USADO PARA:
     * - Validar rol al crear usuario
     * - Buscar rol específico por nombre
     */
    @GetMapping("/buscar")
    public ResponseEntity<?> buscarPorNombre(@RequestParam String nombre) {
        try {
            Rol rol = rolService.buscarPorNombre(nombre);
            return ResponseEntity.ok(rol);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: insertarrol
     * ============================================================
     * 
     * POST /api/roles/insertarrol
     * Body: { nombre, descripcion, icono }
     * 
     * POSTGRESQL RPC: insertarrol(...)
     * 
     * FRONTEND:
     * const response = await axios.post("/api/roles/insertarrol", {
     *   nombre: "supervisor",
     *   descripcion: "Supervisión de operaciones",
     *   icono: "🔍"
     * });
     * 
     * VALIDACIONES:
     * - Nombre único
     * - No puede ser "superadmin" (reservado)
     */
    @PostMapping("/insertarrol")
    public ResponseEntity<?> insertar(@RequestBody Rol rol) {
        try {
            Rol nuevoRol = rolService.insertarRol(rol);
            return ResponseEntity.ok(nuevoRol);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: editarrol
     * ============================================================
     * 
     * PUT /api/roles/editarrol
     * Body: { id, nombre, descripcion, icono }
     * 
     * POSTGRESQL RPC: editarrol(...)
     * 
     * FRONTEND:
     * const response = await axios.put("/api/roles/editarrol", {
     *   id: 5,
     *   nombre: "vendedor",
     *   descripcion: "Operaciones de venta exclusivamente",
     *   icono: "🛒"
     * });
     * 
     * VALIDACIONES:
     * - No editar "superadmin"
     * - Si cambia nombre, verificar unicidad
     */
    @PutMapping("/editarrol")
    public ResponseEntity<?> editar(@RequestBody Rol rol) {
        try {
            if (rol.getId() == null) {
                return ResponseEntity.badRequest().body("El campo 'id' es requerido");
            }
            
            Rol rolActualizado = rolService.editarRol(rol.getId(), rol);
            return ResponseEntity.ok(rolActualizado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: eliminarrol
     * ============================================================
     * 
     * DELETE /api/roles/eliminarrol/5
     * 
     * POSTGRESQL RPC: eliminarrol(p_id)
     * 
     * FRONTEND:
     * const response = await axios.delete("/api/roles/eliminarrol/5");
     * 
     * VALIDACIONES:
     * - No eliminar "superadmin"
     * - No eliminar si tiene usuarios asignados
     */
    @DeleteMapping("/eliminarrol/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            rolService.eliminarRol(id);
            return ResponseEntity.ok("Rol eliminado correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT AUXILIAR: Obtener por ID
     * ============================================================
     * 
     * GET /api/roles/5
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(@PathVariable Long id) {
        try {
            Rol rol = rolService.obtenerRol(id);
            return ResponseEntity.ok(rol);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT AUXILIAR: Listar todos (incluyendo superadmin)
     * ============================================================
     * 
     * GET /api/roles/todos
     * 
     * Solo para administración interna
     */
    @GetMapping("/todos")
    public ResponseEntity<?> mostrarTodos() {
        List<Rol> roles = rolService.mostrarTodosRoles();
        return ResponseEntity.ok(roles);
    }

    /**
     * ============================================================
     * ENDPOINT: Contar roles
     * ============================================================
     * 
     * GET /api/roles/contar
     */
    @GetMapping("/contar")
    public ResponseEntity<?> contar() {
        Long cantidad = rolService.contarRoles();
        return ResponseEntity.ok(Map.of("cantidad", cantidad));
    }

    /**
     * ============================================================
     * ENDPOINT: Crear roles predefinidos
     * ============================================================
     * 
     * POST /api/roles/crear-predefinidos
     * 
     * IMPORTANTE:
     * - Se llama en setup inicial del sistema
     * - Crea: superadmin, administrador, empleado, cajero, vendedor
     * - Solo crea si no existen (idempotente)
     * 
     * FRONTEND:
     * const response = await axios.post("/api/roles/crear-predefinidos");
     */
    @PostMapping("/crear-predefinidos")
    public ResponseEntity<?> crearPredefinidos() {
        try {
            rolService.crearRolesPredefinidos();
            return ResponseEntity.ok("Roles predefinidos creados correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
