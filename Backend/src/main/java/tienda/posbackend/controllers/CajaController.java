package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.models.Caja;
import tienda.posbackend.services.CajaService;

import java.util.List;

/**
 * CONTROLLER: CajaController
 * 
 * ENDPOINTS REST PARA CAJAS
 * 
 * MIGRACIÓN FRONTEND:
 * ANTES: supabase.from("caja").select()
 * AHORA: axios.get("/api/cajas/mostrar")
 */
@RestController
@RequestMapping("/api/cajas")
public class CajaController {

    @Autowired
    private CajaService service;

    /**
     * ============================================================
     * ENDPOINT: Mostrar cajas por sucursal
     * ============================================================
     * 
     * GET /api/cajas/mostrar?idSucursal=1
     * 
     * FRONTEND:
     * const response = await axios.get("/api/cajas/mostrar", {
     *   params: { idSucursal: 1 }
     * });
     */
    @GetMapping("/mostrar")
    public List<Caja> mostrar(@RequestParam Long idSucursal) {
        return service.mostrarCajasPorSucursal(idSucursal);
    }

    /**
     * ============================================================
     * ENDPOINT: mostrarcajasasignadas
     * ============================================================
     * 
     * GET /api/cajas/mostrarcajasasignadas?idUsuario=5
     * 
     * Nombre exacto de la función PostgreSQL
     * 
     * FRONTEND:
     * const response = await axios.get("/api/cajas/mostrarcajasasignadas", {
     *   params: { idUsuario: 5 }
     * });
     * 
     * RETORNA: [{ id, sucursalCaja, idCaja, idSucursal }]
     * Donde sucursalCaja = "Nombre Sucursal - Descripción Caja"
     */
    @GetMapping("/mostrarcajasasignadas")
    public List<Object> mostrarCajasAsignadas(@RequestParam Long idUsuario) {
        return service.mostrarCajasAsignadas(idUsuario);
    }

    /**
     * ============================================================
     * ENDPOINT: Insertar caja
     * ============================================================
     * 
     * POST /api/cajas/insertar
     * Body: { descripcion, idSucursal, deletable, print }
     * 
     * FRONTEND:
     * const response = await axios.post("/api/cajas/insertar", {
     *   descripcion: "Caja 1",
     *   idSucursal: 1,
     *   deletable: true,
     *   print: false
     * });
     */
    @PostMapping("/insertar")
    public ResponseEntity<?> insertar(@RequestBody Caja caja) {
        try {
            Caja nueva = service.insertarCaja(caja);
            return ResponseEntity.ok(nueva);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: Editar caja
     * ============================================================
     * 
     * PUT /api/cajas/editar
     * Body: { id, descripcion, idSucursal, print }
     * 
     * FRONTEND:
     * const response = await axios.put("/api/cajas/editar", {
     *   id: 2,
     *   descripcion: "Caja 1 - Actualizada",
     *   idSucursal: 1,
     *   print: true
     * });
     */
    @PutMapping("/editar")
    public ResponseEntity<?> editar(@RequestBody Caja caja) {
        try {
            if (caja.getId() == null) {
                return ResponseEntity.badRequest().body("El campo 'id' es requerido");
            }
            service.editarCaja(caja.getId(), caja);
            return ResponseEntity.ok("Caja actualizada");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: Eliminar caja
     * ============================================================
     * 
     * DELETE /api/cajas/eliminar/2
     * 
     * FRONTEND:
     * const response = await axios.delete("/api/cajas/eliminar/2");
     */
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            service.eliminarCaja(id);
            return ResponseEntity.ok("Caja eliminada");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT AUXILIAR: Contar cajas por sucursal
     * ============================================================
     * 
     * GET /api/cajas/contar/1
     */
    @GetMapping("/contar/{idSucursal}")
    public Long contar(@PathVariable Long idSucursal) {
        return service.contarCajas(idSucursal);
    }
}
