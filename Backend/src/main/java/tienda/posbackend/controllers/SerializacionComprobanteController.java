package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.models.SerializacionComprobante;
import tienda.posbackend.services.SerializacionComprobanteService;

import java.util.List;
import java.util.Map;

/**
 * CONTROLLER: SerializacionComprobanteController
 * 
 * ENDPOINTS REST PARA SERIALIZACIONES DE COMPROBANTES
 * 
 * MIGRACIÓN FRONTEND:
 * ANTES: const { data } = await supabase.from("serializacion_comprobantes").select()
 * AHORA: const { data } = await axios.get("/api/serializaciones/mostrar", { params: { idSucursal: 1 } })
 * 
 * IMPORTANTE:
 * - generar_nro_comprobante() se usa en VentaController al confirmar venta
 * - setdefaultserializacion() establece serie predeterminada
 * - Cada sucursal tiene sus propias series (aisladas)
 * 
 * ENDPOINTS PRINCIPALES:
 * GET    /api/serializaciones/mostrar?idSucursal=1       → Listar serializaciones
 * POST   /api/serializaciones/insertarserializacion     → Crear serialización
 * PUT    /api/serializaciones/editarserializacion       → Editar serialización
 * DELETE /api/serializaciones/eliminarserializacion/:id → Eliminar serialización
 * PUT    /api/serializaciones/setdefault                → Establecer como default
 * POST   /api/serializaciones/generar-numero            → Generar número correlativo
 */
@RestController
@RequestMapping("/api/serializaciones")
@CrossOrigin(origins = "*")
public class SerializacionComprobanteController {

    @Autowired
    private SerializacionComprobanteService service;

    /**
     * ============================================================
     * ENDPOINT: mostrarserializaciones
     * ============================================================
     * 
     * GET /api/serializaciones/mostrar?idSucursal=1
     * 
     * POSTGRESQL RPC: mostrarserializaciones(p_id_sucursal)
     * 
     * FRONTEND:
     * const response = await axios.get("/api/serializaciones/mostrar", {
     *   params: { idSucursal: 1 }
     * });
     * 
     * RESPUESTA:
     * [
     *   {
     *     id: 1,
     *     idTipoComprobante: 1,  // Factura
     *     serie: "F001",
     *     cantidadNumeros: 9,
     *     correlativo: 42,
     *     sucursalId: 1,
     *     porDefault: true  // ← Serie predeterminada
     *   },
     *   {
     *     id: 2,
     *     idTipoComprobante: 2,  // Boleta
     *     serie: "B001",
     *     cantidadNumeros: 8,
     *     correlativo: 150,
     *     sucursalId: 1,
     *     porDefault: true
     *   }
     * ]
     */
    @GetMapping("/mostrar")
    public ResponseEntity<?> mostrar(@RequestParam Long idSucursal) {
        try {
            List<SerializacionComprobante> serializaciones = service.mostrarSerializaciones(idSucursal);
            return ResponseEntity.ok(serializaciones);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: generar_nro_comprobante
     * ============================================================
     * 
     * POST /api/serializaciones/generar-numero
     * Body: { idTipoComprobante, serie, idSucursal }
     * 
     * POSTGRESQL RPC: generar_nro_comprobante(p_id_tipo, p_serie, p_id_sucursal)
     * 
     * IMPORTANTE:
     * - Este endpoint se llama desde VentaController al confirmar venta
     * - Incrementa automáticamente el correlativo
     * - Thread-safe (múltiples usuarios simultáneos)
     * 
     * FRONTEND (usado por confirmar_venta):
     * const response = await axios.post("/api/serializaciones/generar-numero", {
     *   idTipoComprobante: 5,  // Ticket
     *   serie: "T001",
     *   idSucursal: 1
     * });
     * // response.data = "T001-000000043"
     * 
     * RESPUESTA:
     * "F001-000000042"  // String del número completo
     */
    @PostMapping("/generar-numero")
    public ResponseEntity<?> generarNumero(@RequestBody Map<String, Object> body) {
        try {
            Long idTipoComprobante = Long.valueOf(body.get("idTipoComprobante").toString());
            String serie = body.get("serie").toString();
            Long idSucursal = Long.valueOf(body.get("idSucursal").toString());
            
            String numeroComprobante = service.generarNumeroComprobante(
                idTipoComprobante, 
                serie, 
                idSucursal
            );
            
            return ResponseEntity.ok(numeroComprobante);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: setdefaultserializacion
     * ============================================================
     * 
     * PUT /api/serializaciones/setdefault
     * Body: { id, idSucursal }
     * 
     * POSTGRESQL RPC: setdefaultserializacion(p_id, p_id_sucursal)
     * 
     * PROCESO:
     * 1. Quita default a todas las serializaciones de la sucursal
     * 2. Establece esta como default
     * 
     * FRONTEND:
     * const response = await axios.put("/api/serializaciones/setdefault", {
     *   id: 5,
     *   idSucursal: 1
     * });
     */
    @PutMapping("/setdefault")
    public ResponseEntity<?> establecerDefault(@RequestBody Map<String, Object> body) {
        try {
            Long id = Long.valueOf(body.get("id").toString());
            Long idSucursal = Long.valueOf(body.get("idSucursal").toString());
            
            service.establecerComoDefault(id, idSucursal);
            return ResponseEntity.ok("Serialización establecida como predeterminada");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: insertarserializacion
     * ============================================================
     * 
     * POST /api/serializaciones/insertarserializacion
     * Body: { idTipoComprobante, serie, cantidadNumeros, sucursalId }
     * 
     * POSTGRESQL RPC: insertarserializacion(...)
     * 
     * FRONTEND:
     * const response = await axios.post("/api/serializaciones/insertarserializacion", {
     *   idTipoComprobante: 1,  // Factura
     *   serie: "F002",
     *   cantidadNumeros: 9,
     *   sucursalId: 1,
     *   porDefault: false
     * });
     * 
     * VALIDACIONES:
     * - Serie única por sucursal
     * - correlativo inicia automáticamente en 0
     */
    @PostMapping("/insertarserializacion")
    public ResponseEntity<?> insertar(@RequestBody SerializacionComprobante serializacion) {
        try {
            SerializacionComprobante nueva = service.insertarSerializacion(serializacion);
            return ResponseEntity.ok(nueva);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: editarserializacion
     * ============================================================
     * 
     * PUT /api/serializaciones/editarserializacion
     * Body: { id, serie, cantidadNumeros, sucursalId }
     * 
     * POSTGRESQL RPC: editarserializacion(...)
     * 
     * IMPORTANTE:
     * - NO se edita el correlativo (solo crece con generar_nro_comprobante)
     * - NO se cambia porDefault (usar setdefaultserializacion)
     * 
     * FRONTEND:
     * const response = await axios.put("/api/serializaciones/editarserializacion", {
     *   id: 2,
     *   serie: "F003",
     *   cantidadNumeros: 10,
     *   sucursalId: 1
     * });
     */
    @PutMapping("/editarserializacion")
    public ResponseEntity<?> editar(@RequestBody SerializacionComprobante serializacion) {
        try {
            if (serializacion.getId() == null) {
                return ResponseEntity.badRequest().body("El campo 'id' es requerido");
            }
            
            service.editarSerializacion(serializacion.getId(), serializacion);
            return ResponseEntity.ok("Serialización actualizada correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: eliminarserializacion
     * ============================================================
     * 
     * DELETE /api/serializaciones/eliminarserializacion/5
     * 
     * POSTGRESQL RPC: eliminarserializacion(p_id)
     * 
     * VALIDACIONES:
     * - No eliminar si tiene ventas asociadas
     * 
     * FRONTEND:
     * const response = await axios.delete("/api/serializaciones/eliminarserializacion/5");
     */
    @DeleteMapping("/eliminarserializacion/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            service.eliminarSerializacion(id);
            return ResponseEntity.ok("Serialización eliminada correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT AUXILIAR: Obtener por ID
     * ============================================================
     * 
     * GET /api/serializaciones/5
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(@PathVariable Long id) {
        SerializacionComprobante serializacion = service.obtenerSerializacion(id);
        
        if (serializacion == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(serializacion);
    }

    /**
     * ============================================================
     * ENDPOINT AUXILIAR: Obtener default por tipo
     * ============================================================
     * 
     * GET /api/serializaciones/default?idTipoComprobante=1&idSucursal=1
     * 
     * Útil para obtener la serie predeterminada de Factura, Boleta, etc.
     */
    @GetMapping("/default")
    public ResponseEntity<?> obtenerDefault(
        @RequestParam Long idTipoComprobante,
        @RequestParam Long idSucursal
    ) {
        SerializacionComprobante serializacion = service.obtenerDefault(
            idTipoComprobante, 
            idSucursal
        );
        
        if (serializacion == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(serializacion);
    }

    /**
     * ============================================================
     * ENDPOINT: Contar serializaciones por sucursal
     * ============================================================
     * 
     * GET /api/serializaciones/contar?idSucursal=1
     */
    @GetMapping("/contar")
    public ResponseEntity<?> contar(@RequestParam Long idSucursal) {
        Long cantidad = service.contarSerializaciones(idSucursal);
        return ResponseEntity.ok(Map.of("cantidad", cantidad));
    }
}
