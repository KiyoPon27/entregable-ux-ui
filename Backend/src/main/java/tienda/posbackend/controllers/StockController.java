package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.models.Stock;
import tienda.posbackend.services.StockService;

import java.util.List;
import java.util.Map;

/**
 * CONTROLLER: StockController
 * 
 * ENDPOINTS REST PARA STOCK
 * 
 * MIGRACIÓN FRONTEND:
 * ANTES: const { data } = await supabase.rpc("mostrarstock", { p_id_almacen: 1 })
 * AHORA: const { data } = await axios.get("/api/stock/mostrar", { params: { idAlmacen: 1 } })
 */
@RestController
@RequestMapping("/api/stock")
public class StockController {

    @Autowired
    private StockService service;

    /**
     * ============================================================
     * ENDPOINT: mostrarstock
     * ============================================================
     * 
     * GET /api/stock/mostrar?idAlmacen=1
     * 
     * POSTGRESQL RPC: mostrarstock(p_id_almacen)
     * 
     * FRONTEND:
     * const response = await axios.get("/api/stock/mostrar", {
     *   params: { idAlmacen: 1 }
     * });
     * 
     * RESPUESTA:
     * [
     *   {
     *     id: 1,
     *     idProducto: 5,
     *     nombreProducto: "Coca Cola",
     *     codigoProducto: "CC001",
     *     cantidad: 100,
     *     fechaActualizacion: "2026-01-15T10:30:00"
     *   }
     * ]
     */
    @GetMapping("/mostrar")
    public List<Map<String, Object>> mostrar(@RequestParam Long idAlmacen) {
        return service.mostrarStock(idAlmacen);
    }

    /**
     * ============================================================
     * ENDPOINT: insertarstock
     * ============================================================
     * 
     * POST /api/stock/insertarstock
     * Body: { idProducto, idAlmacen, cantidad }
     * 
     * POSTGRESQL RPC: insertarstock(p_id_producto, p_id_almacen, p_cantidad)
     * 
     * FRONTEND:
     * const response = await axios.post("/api/stock/insertarstock", {
     *   idProducto: 5,
     *   idAlmacen: 1,
     *   cantidad: 100
     * });
     */
    @PostMapping("/insertarstock")
    public ResponseEntity<?> insertar(@RequestBody Stock stock) {
        try {
            Stock nuevo = service.insertarStock(stock);
            return ResponseEntity.ok(nuevo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: editarstock
     * ============================================================
     * 
     * PUT /api/stock/editarstock
     * Body: { id, cantidad }
     * 
     * POSTGRESQL RPC: editarstock(p_id, p_cantidad)
     * 
     * FRONTEND:
     * const response = await axios.put("/api/stock/editarstock", {
     *   id: 1,
     *   cantidad: 150
     * });
     */
    @PutMapping("/editarstock")
    public ResponseEntity<?> editar(@RequestBody Map<String, Object> body) {
        try {
            Long id = Long.valueOf(body.get("id").toString());
            Integer cantidad = Integer.valueOf(body.get("cantidad").toString());
            
            service.editarStock(id, cantidad);
            return ResponseEntity.ok("Stock actualizado");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: eliminarstock
     * ============================================================
     * 
     * DELETE /api/stock/eliminarstock/1
     * 
     * POSTGRESQL RPC: eliminarstock(p_id)
     * 
     * FRONTEND:
     * const response = await axios.delete("/api/stock/eliminarstock/1");
     */
    @DeleteMapping("/eliminarstock/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            service.eliminarStock(id);
            return ResponseEntity.ok("Stock eliminado");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: verificarstock
     * ============================================================
     * 
     * GET /api/stock/verificarstock?idProducto=5&idAlmacen=1&cantidad=10
     * 
     * POSTGRESQL RPC: verificarstock(p_id_producto, p_id_almacen, p_cantidad)
     * 
     * Retorna true si hay stock suficiente, error 400 si no hay
     * 
     * FRONTEND:
     * try {
     *   const response = await axios.get("/api/stock/verificarstock", {
     *     params: { idProducto: 5, idAlmacen: 1, cantidad: 10 }
     *   });
     *   console.log("Hay stock suficiente");
     * } catch (error) {
     *   console.error("Stock insuficiente:", error.response.data);
     * }
     */
    @GetMapping("/verificarstock")
    public ResponseEntity<?> verificar(
        @RequestParam Long idProducto,
        @RequestParam Long idAlmacen,
        @RequestParam Integer cantidad
    ) {
        try {
            boolean hayStock = service.verificarStock(idProducto, idAlmacen, cantidad);
            return ResponseEntity.ok(Map.of("disponible", hayStock));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: calcularstockprincipal
     * ============================================================
     * 
     * GET /api/stock/calcularstockprincipal/5
     * 
     * POSTGRESQL RPC: calcularstockprincipal(p_id_producto)
     * 
     * Retorna la cantidad en el almacén por defecto
     * 
     * FRONTEND:
     * const response = await axios.get("/api/stock/calcularstockprincipal/5");
     * console.log("Stock principal:", response.data); // Número
     */
    @GetMapping("/calcularstockprincipal/{idProducto}")
    public Integer calcularStockPrincipal(@PathVariable Long idProducto) {
        return service.calcularStockPrincipal(idProducto);
    }

    /**
     * ============================================================
     * ENDPOINT AUXILIAR: Calcular stock total
     * ============================================================
     * 
     * GET /api/stock/total/5
     * 
     * Suma stock de todos los almacenes
     */
    @GetMapping("/total/{idProducto}")
    public Integer calcularStockTotal(@PathVariable Long idProducto) {
        return service.calcularStockTotal(idProducto);
    }

    /**
     * ============================================================
     * ENDPOINT AUXILIAR: Obtener stock específico
     * ============================================================
     * 
     * GET /api/stock/obtener?idProducto=5&idAlmacen=1
     */
    @GetMapping("/obtener")
    public ResponseEntity<?> obtener(
        @RequestParam Long idProducto,
        @RequestParam Long idAlmacen
    ) {
        Stock stock = service.obtenerStock(idProducto, idAlmacen);
        
        if (stock == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(stock);
    }

    /**
     * ============================================================
     * ENDPOINT AUXILIAR: Stock bajo (alertas)
     * ============================================================
     * 
     * GET /api/stock/bajo?idAlmacen=1&minimo=10
     * 
     * Útil para dashboard y alertas de reabastecimiento
     */
    @GetMapping("/bajo")
    public List<Stock> stockBajo(
        @RequestParam Long idAlmacen,
        @RequestParam(defaultValue = "10") Integer minimo
    ) {
        return service.obtenerStockBajo(idAlmacen, minimo);
    }
}
