package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.models.Usuario;
import tienda.posbackend.services.UsuarioService;

import java.util.List;
import java.util.Map;

/**
 * CONTROLLER: UsuarioController
 * 
 * ENDPOINTS REST PARA USUARIOS
 * 
 * MIGRACIÓN FRONTEND:
 * ANTES: const { data } = await supabase.from("usuarios").select()
 * AHORA: const { data } = await axios.get("/api/usuarios/mostrar", { params: { idEmpresa: 1 } })
 * 
 * IMPORTANTE:
 * - Las contraseñas se envían en texto plano, se hashean en el backend
 * - NUNCA retornar el hash de password al frontend
 * - El login se maneja en AuthController
 */
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService service;

    /**
     * ============================================================
     * ENDPOINT: mostrarusuarios
     * ============================================================
     * 
     * GET /api/usuarios/mostrar
     * 
     * POSTGRESQL RPC: mostrarusuarios()
     * 
     * FRONTEND:
     * const response = await axios.get("/api/usuarios/mostrar");
     * 
     * RESPUESTA:
     * [
     *   {
     *     id: 1,
     *     nombres: "Juan Pérez",
     *     correo: "juan@empresa.com",
     *     telefono: "123456789",
     *     estado: "ACTIVO",
     *     fechaRegistro: "2026-01-01T10:00:00"
     *   }
     * ]
     * 
     * NOTA: NO se retorna el campo "password"
     */
    @GetMapping("/mostrar")
    public List<Usuario> mostrar() {
        List<Usuario> usuarios = service.mostrarUsuarios();
        
        // Limpiar passwords antes de retornar (seguridad)
        usuarios.forEach(u -> u.setPassword(null));
        
        return usuarios;
    }

    /**
     * ============================================================
     * ENDPOINT: insertarusuario
     * ============================================================
     * 
     * POST /api/usuarios/insertarusuario
     * Body: { nombres, correo, password, telefono, nroDoc, idRol }
     * 
     * POSTGRESQL RPC: insertarusuario(...)
     * 
     * FRONTEND:
     * const response = await axios.post("/api/usuarios/insertarusuario", {
     *   nombres: "María González",
     *   correo: "maria@empresa.com",
     *   password: "123456", // En texto plano, se hashea en backend
     *   telefono: "987654321",
     *   nroDoc: "12345678",
     *   idRol: 2
     * });
     */
    @PostMapping("/insertarusuario")
    public ResponseEntity<?> insertar(@RequestBody Usuario usuario) {
        try {
            Usuario nuevo = service.insertarUsuario(usuario);
            
            // NO retornar password
            nuevo.setPassword(null);
            
            return ResponseEntity.ok(nuevo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: editarusuario
     * ============================================================
     * 
     * PUT /api/usuarios/editarusuario
     * Body: { id, nombres, correo, password (opcional), telefono, nroDoc, idRol, estado }
     * 
     * POSTGRESQL RPC: editarusuario(...)
     * 
     * IMPORTANTE:
     * - Si NO se quiere cambiar password, NO enviar el campo "password"
     * - Si se envía "password", debe ser en texto plano (se hasheará)
     * 
     * FRONTEND:
     * // Sin cambiar password:
     * const response = await axios.put("/api/usuarios/editarusuario", {
     *   id: 2,
     *   nombres: "María González Actualizada",
     *   correo: "maria@empresa.com",
     *   idRol: 3,
     *   estado: "ACTIVO"
     * });
     * 
     * // Cambiando password:
     * const response = await axios.put("/api/usuarios/editarusuario", {
     *   id: 2,
     *   nombres: "María González",
     *   correo: "maria@empresa.com",
     *   password: "nuevaPassword123", // Opcional
     *   idRol: 3,
     *   estado: "ACTIVO"
     * });
     */
    @PutMapping("/editarusuario")
    public ResponseEntity<?> editar(@RequestBody Usuario usuario) {
        try {
            if (usuario.getId() == null) {
                return ResponseEntity.badRequest().body("El campo 'id' es requerido");
            }
            
            service.editarUsuario(usuario.getId(), usuario);
            return ResponseEntity.ok("Usuario actualizado");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: eliminarusuario
     * ============================================================
     * 
     * DELETE /api/usuarios/eliminarusuario/2
     * 
     * POSTGRESQL RPC: eliminarusuario(p_id)
     * 
     * FRONTEND:
     * const response = await axios.delete("/api/usuarios/eliminarusuario/2");
     */
    @DeleteMapping("/eliminarusuario/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            service.eliminarUsuario(id);
            return ResponseEntity.ok("Usuario eliminado");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: Desactivar usuario
     * ============================================================
     * 
     * PUT /api/usuarios/desactivar/2
     * 
     * Alternativa más segura que eliminar
     */
    @PutMapping("/desactivar/{id}")
    public ResponseEntity<?> desactivar(@PathVariable Long id) {
        try {
            service.desactivarUsuario(id);
            return ResponseEntity.ok("Usuario desactivado");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: Activar usuario
     * ============================================================
     * 
     * PUT /api/usuarios/activar/2
     */
    @PutMapping("/activar/{id}")
    public ResponseEntity<?> activar(@PathVariable Long id) {
        try {
            service.activarUsuario(id);
            return ResponseEntity.ok("Usuario activado");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: Obtener usuario por ID
     * ============================================================
     * 
     * GET /api/usuarios/1
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(@PathVariable Long id) {
        Usuario usuario = service.obtenerUsuario(id);
        
        if (usuario == null) {
            return ResponseEntity.notFound().build();
        }
        
        // NO retornar password
        usuario.setPassword(null);
        
        return ResponseEntity.ok(usuario);
    }

    /**
     * ============================================================
     * ENDPOINT: Cambiar contraseña
     * ============================================================
     * 
     * PUT /api/usuarios/cambiar-password
     * Body: { id, passwordActual, passwordNueva }
     * 
     * FRONTEND:
     * const response = await axios.put("/api/usuarios/cambiar-password", {
     *   id: 1,
     *   passwordActual: "passwordViejo",
     *   passwordNueva: "passwordNuevo123"
     * });
     */
    @PutMapping("/cambiar-password")
    public ResponseEntity<?> cambiarPassword(@RequestBody Map<String, Object> body) {
        try {
            Long id = Long.valueOf(body.get("id").toString());
            String passwordActual = body.get("passwordActual").toString();
            String passwordNueva = body.get("passwordNueva").toString();
            
            service.cambiarPassword(id, passwordActual, passwordNueva);
            return ResponseEntity.ok("Contraseña actualizada");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: Contar usuarios activos
     * ============================================================
     * 
     * GET /api/usuarios/contar
     */
    @GetMapping("/contar")
    public Map<String, Long> contar() {
        Long cantidad = service.contarUsuarios();
        return Map.of("cantidad", cantidad);
    }

    /**
     * ============================================================
     * ENDPOINT: Listar usuarios activos
     * ============================================================
     * 
     * GET /api/usuarios/activos
     */
    @GetMapping("/activos")
    public List<Usuario> listarActivos() {
        List<Usuario> usuarios = service.listarActivos();
        
        // Limpiar passwords
        usuarios.forEach(u -> u.setPassword(null));
        
        return usuarios;
    }
}
