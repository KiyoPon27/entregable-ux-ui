package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.models.Impresora;
import tienda.posbackend.services.ImpresoraService;

/**
 * CONTROLLER: ImpresoraController
 * 
 * ENDPOINTS REST PARA IMPRESORAS
 * 
 * IMPORTANTE:
 * - No hay endpoint de insertar porque las impresoras se crean automáticamente
 *   con el trigger insertarimpresora al crear una caja
 * - No hay endpoint de eliminar porque se eliminan automáticamente
 *   al eliminar la caja (ON DELETE CASCADE)
 * 
 * MIGRACIÓN FRONTEND:
 * ANTES: supabase.from("impresoras").select().eq("id_caja", p.id_caja)
 * AHORA: axios.get("/api/impresoras/mostrarimpresoraxcaja?idCaja=1")
 */
@RestController
@RequestMapping("/api/impresoras")
public class ImpresoraController {

    @Autowired
    private ImpresoraService impresoraService;

    /**
     * ============================================================
     * ENDPOINT: Mostrar impresora por caja
     * ============================================================
     * 
     * GET /api/impresoras/mostrarimpresoraxcaja?idCaja=1
     * 
     * Replica el query PostgreSQL:
     * SELECT * FROM impresoras WHERE id_caja = p.id_caja
     * 
     * FRONTEND:
     * const response = await axios.get("/api/impresoras/mostrarimpresoraxcaja", {
     *   params: { idCaja: 1 }
     * });
     * 
     * USADO EN:
     * - ImpresorasTemplate.jsx: Carga configuración de impresora actual
     * - ImpresorasStore.jsx: Obtiene datos de impresora por caja
     */
    @GetMapping("/mostrarimpresoraxcaja")
    public ResponseEntity<?> mostrarImpresoraXCaja(@RequestParam Long idCaja) {
        return impresoraService.mostrarImpresoraXCaja(idCaja)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * ============================================================
     * ENDPOINT: Editar impresora
     * ============================================================
     * 
     * PUT /api/impresoras/editarimpresora
     * Body: { id, state, name, pcName, ipLocal }
     * 
     * FRONTEND:
     * const response = await axios.put("/api/impresoras/editarimpresora", {
     *   id: 1,
     *   state: true,          // Activar impresión directa
     *   name: "POS-80",      // Nombre de la impresora
     *   pcName: "CAJA-01",   // Nombre del PC
     *   ipLocal: "192.168.1.100"
     * });
     */
    @PutMapping("/editarimpresora")
    public ResponseEntity<?> editar(@RequestBody Impresora impresora) {
        try {
            if (impresora.getId() == null) {
                return ResponseEntity.badRequest().body("El campo 'id' es requerido");
            }
            Impresora impresoraActualizada = impresoraService.editarImpresora(
                impresora.getId(), 
                impresora
            );
            return ResponseEntity.ok(impresoraActualizada);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT AUXILIAR: Buscar impresora por ID
     * ============================================================
     * 
     * GET /api/impresoras/1
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {
        try {
            Impresora impresora = impresoraService.buscarPorId(id);
            return ResponseEntity.ok(impresora);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
