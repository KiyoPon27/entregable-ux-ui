package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.models.MovimientoStock;
import tienda.posbackend.services.MovimientoStockService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * CONTROLLER: MovimientoStockController
 * 
 * ENDPOINTS REST PARA MOVIMIENTOS DE STOCK
 * 
 * IMPORTANTE:
 * - Los movimientos normalmente se crean automáticamente desde VentaService, CompraService
 * - Este controller es principalmente para CONSULTAS y reportes
 * - Incluye endpoints para ajustes manuales de inventario
 * 
 * MIGRACIÓN FRONTEND:
 * ANTES: const { data } = await supabase.rpc("mostrarmovimientosstock", {...})
 * AHORA: const { data } = await axios.get("/api/movimientos-stock/mostrar", {...})
 */
@RestController
@RequestMapping("/api/movimientos-stock")
public class MovimientoStockController {

    @Autowired
    private MovimientoStockService service;

    /**
     * ============================================================
     * ENDPOINT: mostrarmovimientosstock
     * ============================================================
     * 
     * GET /api/movimientos-stock/mostrar?idProducto=5&idAlmacen=1
     * 
     * POSTGRESQL RPC: mostrarmovimientosstock(p_id_producto, p_id_almacen)
     * 
     * FRONTEND:
     * const response = await axios.get("/api/movimientos-stock/mostrar", {
     *   params: { idProducto: 5, idAlmacen: 1 }
     * });
     * 
     * RESPUESTA:
     * [
     *   {
     *     id: 1,
     *     tipoMovimiento: "SALIDA",
     *     cantidad: 5,
     *     cantidadAnterior: 100,
     *     cantidadNueva: 95,
     *     motivo: "Venta #123",
     *     fechaMovimiento: "2026-01-15T14:30:00",
     *     usuario: "Juan Pérez"
     *   }
     * ]
     */
    @GetMapping("/mostrar")
    public List<Map<String, Object>> mostrar(
        @RequestParam Long idProducto,
        @RequestParam Long idAlmacen
    ) {
        return service.mostrarMovimientos(idProducto, idAlmacen);
    }

    /**
     * ============================================================
     * ENDPOINT: Registrar entrada manual
     * ============================================================
     * 
     * POST /api/movimientos-stock/entrada
     * Body: { idProducto, idAlmacen, cantidad, motivo, idUsuario }
     * 
     * USO: Entradas manuales, compras, devoluciones
     * 
     * FRONTEND:
     * const response = await axios.post("/api/movimientos-stock/entrada", {
     *   idProducto: 5,
     *   idAlmacen: 1,
     *   cantidad: 50,
     *   motivo: "Compra a proveedor XYZ",
     *   idUsuario: 1
     * });
     */
    @PostMapping("/entrada")
    public ResponseEntity<?> registrarEntrada(@RequestBody Map<String, Object> body) {
        try {
            Long idProducto = Long.valueOf(body.get("idProducto").toString());
            Long idAlmacen = Long.valueOf(body.get("idAlmacen").toString());
            Integer cantidad = Integer.valueOf(body.get("cantidad").toString());
            String motivo = body.get("motivo").toString();
            Long idUsuario = body.get("idUsuario") != null ? 
                Long.valueOf(body.get("idUsuario").toString()) : null;

            MovimientoStock movimiento = service.registrarEntrada(
                idProducto, idAlmacen, cantidad, motivo, idUsuario
            );

            return ResponseEntity.ok(movimiento);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: Registrar salida manual
     * ============================================================
     * 
     * POST /api/movimientos-stock/salida
     * Body: { idProducto, idAlmacen, cantidad, motivo, idUsuario }
     * 
     * USO: Salidas manuales, bajas, mermas
     * 
     * NOTA: Las ventas usan VentaService que llama automáticamente a este service
     */
    @PostMapping("/salida")
    public ResponseEntity<?> registrarSalida(@RequestBody Map<String, Object> body) {
        try {
            Long idProducto = Long.valueOf(body.get("idProducto").toString());
            Long idAlmacen = Long.valueOf(body.get("idAlmacen").toString());
            Integer cantidad = Integer.valueOf(body.get("cantidad").toString());
            String motivo = body.get("motivo").toString();
            Long idUsuario = body.get("idUsuario") != null ? 
                Long.valueOf(body.get("idUsuario").toString()) : null;

            MovimientoStock movimiento = service.registrarSalida(
                idProducto, idAlmacen, cantidad, motivo, idUsuario, null, null
            );

            return ResponseEntity.ok(movimiento);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: Registrar ajuste de inventario
     * ============================================================
     * 
     * POST /api/movimientos-stock/ajuste
     * Body: { idProducto, idAlmacen, nuevaCantidad, motivo, idUsuario }
     * 
     * USO: Correcciones después de inventario físico
     * 
     * FRONTEND:
     * const response = await axios.post("/api/movimientos-stock/ajuste", {
     *   idProducto: 5,
     *   idAlmacen: 1,
     *   nuevaCantidad: 95,
     *   motivo: "Ajuste por inventario físico",
     *   idUsuario: 1
     * });
     */
    @PostMapping("/ajuste")
    public ResponseEntity<?> registrarAjuste(@RequestBody Map<String, Object> body) {
        try {
            Long idProducto = Long.valueOf(body.get("idProducto").toString());
            Long idAlmacen = Long.valueOf(body.get("idAlmacen").toString());
            Integer nuevaCantidad = Integer.valueOf(body.get("nuevaCantidad").toString());
            String motivo = body.get("motivo").toString();
            Long idUsuario = body.get("idUsuario") != null ? 
                Long.valueOf(body.get("idUsuario").toString()) : null;

            MovimientoStock movimiento = service.registrarAjuste(
                idProducto, idAlmacen, nuevaCantidad, motivo, idUsuario
            );

            return ResponseEntity.ok(movimiento);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: Listar movimientos por stock
     * ============================================================
     * 
     * GET /api/movimientos-stock/por-stock/1
     */
    @GetMapping("/por-stock/{idStock}")
    public List<MovimientoStock> listarPorStock(@PathVariable Long idStock) {
        return service.listarPorStock(idStock);
    }

    /**
     * ============================================================
     * ENDPOINT: Listar movimientos por rango de fechas
     * ============================================================
     * 
     * GET /api/movimientos-stock/por-fechas?inicio=2026-01-01T00:00:00&fin=2026-01-31T23:59:59
     * 
     * FRONTEND:
     * const response = await axios.get("/api/movimientos-stock/por-fechas", {
     *   params: {
     *     inicio: "2026-01-01T00:00:00",
     *     fin: "2026-01-31T23:59:59"
     *   }
     * });
     */
    @GetMapping("/por-fechas")
    public List<MovimientoStock> listarPorFechas(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin
    ) {
        return service.listarPorFechas(inicio, fin);
    }

    /**
     * ============================================================
     * ENDPOINT: Listar movimientos por usuario
     * ============================================================
     * 
     * GET /api/movimientos-stock/por-usuario/1
     * 
     * Auditoría de acciones de un usuario
     */
    @GetMapping("/por-usuario/{idUsuario}")
    public List<MovimientoStock> listarPorUsuario(@PathVariable Long idUsuario) {
        return service.listarPorUsuario(idUsuario);
    }

    /**
     * ============================================================
     * ENDPOINT: Listar movimientos de una venta
     * ============================================================
     * 
     * GET /api/movimientos-stock/por-venta/123
     * 
     * Muestra todos los productos vendidos en una venta
     */
    @GetMapping("/por-venta/{idVenta}")
    public List<MovimientoStock> listarPorVenta(@PathVariable Long idVenta) {
        return service.listarPorVenta(idVenta);
    }

    /**
     * ============================================================
     * ENDPOINT: Calcular movimientos en un período
     * ============================================================
     * 
     * GET /api/movimientos-stock/calcular-periodo?idStock=1&inicio=...&fin=...
     * 
     * Retorna:
     * {
     *   "entradas": 100,
     *   "salidas": 50,
     *   "neto": 50
     * }
     */
    @GetMapping("/calcular-periodo")
    public Map<String, Integer> calcularPeriodo(
        @RequestParam Long idStock,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin
    ) {
        return service.calcularMovimientosPeriodo(idStock, inicio, fin);
    }
}
