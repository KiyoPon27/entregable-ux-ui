package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.models.MetodoPago;
import tienda.posbackend.services.MetodoPagoService;

import java.util.List;
import java.util.Map;

/**
 * CONTROLLER: MetodoPagoController
 * 
 * ENDPOINTS REST PARA MÉTODOS DE PAGO
 * 
 * MIGRACIÓN FRONTEND:
 * ANTES: const { data } = await supabase.from("metodos_pago").select()
 * AHORA: const { data } = await axios.get("/api/metodospago/mostrar", { params: { idEmpresa: 1 } })
 * 
 * IMPORTANTE:
 * - Los métodos predeterminados (Efectivo, Tarjeta, Crédito, Mixto) NO se pueden eliminar
 * - Validar deleteUpdate antes de editar/eliminar
 * - Nombre único por empresa (case-insensitive)
 * 
 * ENDPOINTS PRINCIPALES:
 * GET    /api/metodospago/mostrar?idEmpresa=1    → Listar métodos
 * POST   /api/metodospago/insertarmetodopago     → Crear método
 * PUT    /api/metodospago/editarmetodopago       → Editar método
 * DELETE /api/metodospago/eliminarmetodopago/:id → Eliminar método
 */
@RestController
@RequestMapping("/api/metodospago")
@CrossOrigin(origins = "*")
public class MetodoPagoController {

    @Autowired
    private MetodoPagoService service;

    /**
     * ============================================================
     * ENDPOINT: mostrarmetodospago
     * ============================================================
     * 
     * GET /api/metodospago/mostrar?idEmpresa=1
     * 
     * POSTGRESQL RPC: mostrarmetodospago(p_id_empresa)
     * 
     * FRONTEND:
     * const response = await axios.get("/api/metodospago/mostrar", {
     *   params: { idEmpresa: 1 }
     * });
     * 
     * RESPUESTA:
     * [
     *   {
     *     id: 1,
     *     nombre: "Efectivo",
     *     idEmpresa: 1,
     *     icono: "fa-money-bill",
     *     verNombre: true,
     *     deleteUpdate: false  // ← NO editable (predeterminado)
     *   },
     *   {
     *     id: 5,
     *     nombre: "Yape",
     *     idEmpresa: 1,
     *     icono: "https://...",
     *     verNombre: true,
     *     deleteUpdate: true  // ← SÍ editable (personalizado)
     *   }
     * ]
     */
    @GetMapping("/mostrar")
    public ResponseEntity<?> mostrar(@RequestParam Long idEmpresa) {
        try {
            List<MetodoPago> metodos = service.mostrarMetodosPago(idEmpresa);
            return ResponseEntity.ok(metodos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: insertarmetodopago
     * ============================================================
     * 
     * POST /api/metodospago/insertarmetodopago
     * Body: { idEmpresa, nombre, icono, verNombre }
     * 
     * POSTGRESQL RPC: insertarmetodopago(...)
     * 
     * FRONTEND:
     * const response = await axios.post("/api/metodospago/insertarmetodopago", {
     *   idEmpresa: 1,
     *   nombre: "Yape",
     *   icono: "https://yape.com/logo.png",
     *   verNombre: true
     * });
     * 
     * VALIDACIONES:
     * - Nombre único por empresa (case-insensitive)
     * - idEmpresa obligatorio
     */
    @PostMapping("/insertarmetodopago")
    public ResponseEntity<?> insertar(@RequestBody MetodoPago metodoPago) {
        try {
            MetodoPago nuevo = service.insertarMetodoPago(metodoPago);
            return ResponseEntity.ok(nuevo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: editarmetodopago
     * ============================================================
     * 
     * PUT /api/metodospago/editarmetodopago
     * Body: { id, nombre, icono, verNombre, idEmpresa }
     * 
     * POSTGRESQL RPC: editarmetodopago(...)
     * 
     * IMPORTANTE:
     * - Solo se pueden editar métodos con deleteUpdate = true
     * - No editar métodos predeterminados (Efectivo, Tarjeta, etc.)
     * 
     * FRONTEND:
     * const response = await axios.put("/api/metodospago/editarmetodopago", {
     *   id: 5,
     *   nombre: "Yape Actualizado",
     *   icono: "https://...",
     *   verNombre: false,
     *   idEmpresa: 1
     * });
     */
    @PutMapping("/editarmetodopago")
    public ResponseEntity<?> editar(@RequestBody MetodoPago metodoPago) {
        try {
            if (metodoPago.getId() == null) {
                return ResponseEntity.badRequest().body("El campo 'id' es requerido");
            }
            
            service.editarMetodoPago(metodoPago.getId(), metodoPago);
            return ResponseEntity.ok("Método de pago actualizado correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: eliminarmetodopago
     * ============================================================
     * 
     * DELETE /api/metodospago/eliminarmetodopago/5
     * 
     * POSTGRESQL RPC: eliminarmetodopago(p_id)
     * 
     * IMPORTANTE:
     * - Solo eliminar métodos con deleteUpdate = true
     * - No eliminar métodos predeterminados
     * - Validar que no tenga movimientos asociados
     * 
     * FRONTEND:
     * const response = await axios.delete("/api/metodospago/eliminarmetodopago/5");
     */
    @DeleteMapping("/eliminarmetodopago/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            service.eliminarMetodoPago(id);
            return ResponseEntity.ok("Método de pago eliminado correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT AUXILIAR: Obtener por ID
     * ============================================================
     * 
     * GET /api/metodospago/5
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(@PathVariable Long id) {
        MetodoPago metodoPago = service.obtenerMetodoPago(id);
        
        if (metodoPago == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(metodoPago);
    }

    /**
     * ============================================================
     * ENDPOINT AUXILIAR: Obtener por nombre
     * ============================================================
     * 
     * GET /api/metodospago/buscar?nombre=Efectivo&idEmpresa=1
     * 
     * Útil para obtener ID de métodos específicos
     */
    @GetMapping("/buscar")
    public ResponseEntity<?> buscarPorNombre(
        @RequestParam String nombre,
        @RequestParam Long idEmpresa
    ) {
        MetodoPago metodoPago = service.obtenerPorNombre(nombre, idEmpresa);
        
        if (metodoPago == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(metodoPago);
    }

    /**
     * ============================================================
     * ENDPOINT: Contar métodos por empresa
     * ============================================================
     * 
     * GET /api/metodospago/contar?idEmpresa=1
     */
    @GetMapping("/contar")
    public ResponseEntity<?> contar(@RequestParam Long idEmpresa) {
        Long cantidad = service.contarMetodosPago(idEmpresa);
        return ResponseEntity.ok(Map.of("cantidad", cantidad));
    }

    /**
     * ============================================================
     * ENDPOINT: Listar métodos editables
     * ============================================================
     * 
     * GET /api/metodospago/editables?idEmpresa=1
     * 
     * Solo métodos personalizados (deleteUpdate = true)
     */
    @GetMapping("/editables")
    public ResponseEntity<?> listarEditables(@RequestParam Long idEmpresa) {
        try {
            List<MetodoPago> metodos = service.listarEditables(idEmpresa);
            return ResponseEntity.ok(metodos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
