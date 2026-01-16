package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.models.Sucursal;
import tienda.posbackend.services.SucursalService;

import java.util.List;

/**
 * CONTROLLER: SucursalController
 * 
 * ENDPOINTS REST PARA SUCURSALES
 * 
 * MIGRACIÓN FRONTEND:
 * ANTES: supabase.from("sucursales").select()
 * AHORA: axios.get("/api/sucursales/mostrar")
 */
@RestController
@RequestMapping("/api/sucursales")
public class SucursalController {

    @Autowired
    private SucursalService service;

    /**
     * ============================================================
     * ENDPOINT: Mostrar sucursales por empresa
     * ============================================================
     * 
     * GET /api/sucursales/mostrar?idEmpresa=1
     * 
     * FRONTEND:
     * const response = await axios.get("/api/sucursales/mostrar", {
     *   params: { idEmpresa: 1 }
     * });
     */
    @GetMapping("/mostrar")
    public List<Sucursal> mostrar(@RequestParam Long idEmpresa) {
        return service.mostrarSucursales(idEmpresa);
    }

    /**
     * ============================================================
     * ENDPOINT: mostrarsucursalesasignadas
     * ============================================================
     * 
     * GET /api/sucursales/mostrarsucursalesasignadas?idUsuario=5
     * 
     * Nombre exacto de la función PostgreSQL para facilitar migración
     * 
     * FRONTEND:
     * const response = await axios.get("/api/sucursales/mostrarsucursalesasignadas", {
     *   params: { idUsuario: 5 }
     * });
     * 
     * RETORNA: [{ idSucursal, sucursal, idUsuario, idAsignacionSucursal }]
     */
    @GetMapping("/mostrarsucursalesasignadas")
    public List<Object> mostrarSucursalesAsignadas(@RequestParam Long idUsuario) {
        return service.mostrarSucursalesAsignadas(idUsuario);
    }

    /**
     * ============================================================
     * ENDPOINT: Insertar sucursal
     * ============================================================
     * 
     * POST /api/sucursales/insertar
     * Body: { nombre, direccionFiscal, idEmpresa, deletable }
     * 
     * FRONTEND:
     * const response = await axios.post("/api/sucursales/insertar", {
     *   nombre: "Sucursal Centro",
     *   direccionFiscal: "Av. Principal 123",
     *   idEmpresa: 1,
     *   deletable: true
     * });
     */
    @PostMapping("/insertar")
    public ResponseEntity<?> insertar(@RequestBody Sucursal sucursal) {
        try {
            Sucursal nueva = service.insertarSucursal(sucursal);
            return ResponseEntity.ok(nueva);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: Editar sucursal
     * ============================================================
     * 
     * PUT /api/sucursales/editar
     * Body: { id, nombre, direccionFiscal, idEmpresa }
     * 
     * FRONTEND:
     * const response = await axios.put("/api/sucursales/editar", {
     *   id: 2,
     *   nombre: "Sucursal Centro - Actualizado",
     *   direccionFiscal: "Av. Principal 456",
     *   idEmpresa: 1
     * });
     */
    @PutMapping("/editar")
    public ResponseEntity<?> editar(@RequestBody Sucursal sucursal) {
        try {
            if (sucursal.getId() == null) {
                return ResponseEntity.badRequest().body("El campo 'id' es requerido");
            }
            service.editarSucursal(sucursal.getId(), sucursal);
            return ResponseEntity.ok("Sucursal actualizada");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: Eliminar sucursal
     * ============================================================
     * 
     * DELETE /api/sucursales/eliminar/2
     * 
     * FRONTEND:
     * const response = await axios.delete("/api/sucursales/eliminar/2");
     */
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            service.eliminarSucursal(id);
            return ResponseEntity.ok("Sucursal eliminada");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT AUXILIAR: Contar sucursales
     * ============================================================
     * 
     * GET /api/sucursales/contar/1
     */
    @GetMapping("/contar/{idEmpresa}")
    public Long contar(@PathVariable Long idEmpresa) {
        return service.contarSucursales(idEmpresa);
    }
}
