package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.models.Modulo;
import tienda.posbackend.services.ModuloService;

import java.util.List;

/**
 * CONTROLLER: ModuloController
 * 
 * ENDPOINTS REST PARA MÓDULOS DEL SISTEMA
 * 
 * MIGRACIÓN FRONTEND:
 * ANTES: supabase.from("modulos").select().neq("etiquetas","#default")
 * AHORA: axios.get("/api/modulos/mostrar")
 */
@RestController
@RequestMapping("/api/modulos")
public class ModuloController {

    @Autowired
    private ModuloService moduloService;

    /**
     * ============================================================
     * ENDPOINT: Mostrar módulos (excluyendo #default)
     * ============================================================
     * 
     * GET /api/modulos/mostrar
     * 
     * Replica el query PostgreSQL que excluye módulos del sistema
     * 
     * FRONTEND:
     * const response = await axios.get("/api/modulos/mostrar");
     * 
     * USADO EN:
     * - PermisosUser.jsx: Lista módulos para asignar permisos
     * - ModulosStore.jsx: Carga módulos configurables
     */
    @GetMapping("/mostrar")
    public List<Modulo> mostrar() {
        return moduloService.mostrarModulos();
    }

    /**
     * ============================================================
     * ENDPOINT: Mostrar todos los módulos (INCLUYENDO #default)
     * ============================================================
     * 
     * GET /api/modulos/todos
     * 
     * Solo para uso administrativo interno
     */
    @GetMapping("/todos")
    public List<Modulo> mostrarTodos() {
        return moduloService.mostrarTodosModulos();
    }

    /**
     * ============================================================
     * ENDPOINT: Mostrar módulos por etiqueta
     * ============================================================
     * 
     * GET /api/modulos/poretiqueta?etiqueta=#configuracion
     * 
     * FRONTEND:
     * const response = await axios.get("/api/modulos/poretiqueta", {
     *   params: { etiqueta: "#configuracion" }
     * });
     */
    @GetMapping("/poretiqueta")
    public List<Modulo> mostrarPorEtiqueta(@RequestParam String etiqueta) {
        return moduloService.mostrarModulosPorEtiqueta(etiqueta);
    }

    /**
     * ============================================================
     * ENDPOINT: Buscar módulo por nombre
     * ============================================================
     * 
     * GET /api/modulos/buscar?nombre=Ventas
     * 
     * FRONTEND:
     * const response = await axios.get("/api/modulos/buscar", {
     *   params: { nombre: "Ventas" }
     * });
     */
    @GetMapping("/buscar")
    public ResponseEntity<?> buscarPorNombre(@RequestParam String nombre) {
        return moduloService.buscarPorNombre(nombre)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * ============================================================
     * ENDPOINT: Buscar módulo por ID
     * ============================================================
     * 
     * GET /api/modulos/1
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {
        try {
            Modulo modulo = moduloService.buscarPorId(id);
            return ResponseEntity.ok(modulo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * ============================================================
     * ENDPOINT: Insertar módulo
     * ============================================================
     * 
     * POST /api/modulos/insertarmodulo
     * Body: { nombre, descripcion, icono, ruta, etiquetas }
     * 
     * FRONTEND:
     * const response = await axios.post("/api/modulos/insertarmodulo", {
     *   nombre: "Reportes Avanzados",
     *   descripcion: "Generación de reportes personalizados",
     *   icono: "https://example.com/icon.png",
     *   ruta: "/reportes-avanzados",
     *   etiquetas: null
     * });
     */
    @PostMapping("/insertarmodulo")
    public ResponseEntity<?> insertar(@RequestBody Modulo modulo) {
        try {
            Modulo nuevoModulo = moduloService.insertarModulo(modulo);
            return ResponseEntity.ok(nuevoModulo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: Editar módulo
     * ============================================================
     * 
     * PUT /api/modulos/editarmodulo
     * Body: { id, nombre, descripcion, icono, ruta, etiquetas }
     * 
     * FRONTEND:
     * const response = await axios.put("/api/modulos/editarmodulo", {
     *   id: 5,
     *   nombre: "Reportes Actualizados",
     *   descripcion: "Nueva descripción"
     * });
     */
    @PutMapping("/editarmodulo")
    public ResponseEntity<?> editar(@RequestBody Modulo modulo) {
        try {
            if (modulo.getId() == null) {
                return ResponseEntity.badRequest().body("El campo 'id' es requerido");
            }
            Modulo moduloActualizado = moduloService.editarModulo(modulo.getId(), modulo);
            return ResponseEntity.ok(moduloActualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: Eliminar módulo
     * ============================================================
     * 
     * DELETE /api/modulos/eliminarmodulo/5
     * 
     * FRONTEND:
     * const response = await axios.delete("/api/modulos/eliminarmodulo/5");
     */
    @DeleteMapping("/eliminarmodulo/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            moduloService.eliminarModulo(id);
            return ResponseEntity.ok("Módulo eliminado correctamente");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT AUXILIAR: Contar módulos
     * ============================================================
     * 
     * GET /api/modulos/contar
     */
    @GetMapping("/contar")
    public long contar() {
        return moduloService.contarModulos();
    }
}
