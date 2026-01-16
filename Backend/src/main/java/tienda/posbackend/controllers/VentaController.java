package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.models.Venta;
import tienda.posbackend.services.VentaService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * CONTROLLER: VentaController
 * 
 * ENDPOINTS REST PARA VENTAS
 * 
 * MIGRACIÓN FRONTEND:
 * ANTES: const { data } = await supabase.rpc("mostrarventas", {...})
 * AHORA: const { data } = await axios.get("/api/ventas/mostrar", {...})
 * 
 * IMPORTANTE:
 * Para crear una venta completa (con productos), se recomienda un endpoint
 * que coordine la creación de venta + detalles + stock + caja.
 * Ver endpoint /api/ventas/procesar al final.
 */
@RestController
@RequestMapping("/api/ventas")
public class VentaController {

    @Autowired
    private VentaService service;

    /**
     * ============================================================
     * ENDPOINT: mostrarventas
     * ============================================================
     * 
     * GET /api/ventas/mostrar?idSucursal=1&idCaja=1
     * 
     * POSTGRESQL RPC: mostrarventas(p_id_sucursal, p_id_caja)
     * 
     * FRONTEND:
     * const response = await axios.get("/api/ventas/mostrar", {
     *   params: { idSucursal: 1, idCaja: 1 }
     * });
     * 
     * RESPUESTA:
     * [
     *   {
     *     id: 1,
     *     fechaVenta: "2026-01-15T14:30:00",
     *     usuario: "Juan Pérez",
     *     cliente: "María González",
     *     subtotal: 100.00,
     *     descuento: 10.00,
     *     impuesto: 18.00,
     *     total: 108.00,
     *     estado: "COMPLETADA",
     *     metodoPago: "Efectivo"
     *   }
     * ]
     */
    @GetMapping("/mostrar")
    public List<Map<String, Object>> mostrar(
        @RequestParam Long idSucursal,
        @RequestParam Long idCaja
    ) {
        return service.mostrarVentas(idSucursal, idCaja);
    }

    /**
     * ============================================================
     * ENDPOINT: insertarventa
     * ============================================================
     * 
     * POST /api/ventas/insertarventa
     * Body: { idEmpresa, idUsuario, idCliente, idSucursal, idCaja, idAlmacen, idMetodoPago, subtotal, descuento, impuesto, total, observaciones }
     * 
     * POSTGRESQL RPC: insertarventa(...)
     * 
     * NOTA: Este endpoint solo crea la cabecera.
     * Para una venta completa con productos, usar /api/ventas/procesar
     * 
     * FRONTEND:
     * const response = await axios.post("/api/ventas/insertarventa", {
     *   idEmpresa: 1,
     *   idUsuario: 1,
     *   idCliente: null, // Opcional
     *   idSucursal: 1,
     *   idCaja: 1,
     *   idAlmacen: 1,
     *   idMetodoPago: 1,
     *   subtotal: 100.00,
     *   descuento: 10.00,
     *   impuesto: 18.00,
     *   total: 108.00,
     *   observaciones: "Venta al contado"
     * });
     */
    @PostMapping("/insertarventa")
    public ResponseEntity<?> insertar(@RequestBody Venta venta) {
        try {
            Venta nueva = service.insertarVenta(venta);
            return ResponseEntity.ok(nueva);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: anularventa
     * ============================================================
     * 
     * PUT /api/ventas/anularventa/1
     * 
     * POSTGRESQL RPC: anularventa(p_id_venta)
     * 
     * Cambia el estado de la venta a ANULADA
     * 
     * FRONTEND:
     * const response = await axios.put("/api/ventas/anularventa/1");
     */
    @PutMapping("/anularventa/{id}")
    public ResponseEntity<?> anular(@PathVariable Long id) {
        try {
            service.anularVenta(id);
            return ResponseEntity.ok("Venta anulada");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: Obtener venta por ID
     * ============================================================
     * 
     * GET /api/ventas/1
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(@PathVariable Long id) {
        Venta venta = service.obtenerVenta(id);
        
        if (venta == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(venta);
    }

    /**
     * ============================================================
     * ENDPOINT: Listar ventas por sucursal
     * ============================================================
     * 
     * GET /api/ventas/por-sucursal/1
     */
    @GetMapping("/por-sucursal/{idSucursal}")
    public List<Venta> listarPorSucursal(@PathVariable Long idSucursal) {
        return service.listarPorSucursal(idSucursal);
    }

    /**
     * ============================================================
     * ENDPOINT: Listar ventas por usuario
     * ============================================================
     * 
     * GET /api/ventas/por-usuario/1
     */
    @GetMapping("/por-usuario/{idUsuario}")
    public List<Venta> listarPorUsuario(@PathVariable Long idUsuario) {
        return service.listarPorUsuario(idUsuario);
    }

    /**
     * ============================================================
     * ENDPOINT: Listar ventas por cliente
     * ============================================================
     * 
     * GET /api/ventas/por-cliente/5
     * 
     * Historial de compras del cliente
     */
    @GetMapping("/por-cliente/{idCliente}")
    public List<Venta> listarPorCliente(@PathVariable Long idCliente) {
        return service.listarPorCliente(idCliente);
    }

    /**
     * ============================================================
     * ENDPOINT: Listar ventas por rango de fechas
     * ============================================================
     * 
     * GET /api/ventas/por-fechas?inicio=2026-01-01T00:00:00&fin=2026-01-31T23:59:59
     */
    @GetMapping("/por-fechas")
    public List<Venta> listarPorFechas(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin
    ) {
        return service.listarPorFechas(inicio, fin);
    }

    /**
     * ============================================================
     * ENDPOINT: Calcular total de ventas en un período
     * ============================================================
     * 
     * GET /api/ventas/total-periodo?inicio=2026-01-01T00:00:00&fin=2026-01-31T23:59:59
     * 
     * Retorna: { "total": 12500.50 }
     */
    @GetMapping("/total-periodo")
    public Map<String, BigDecimal> calcularTotalPeriodo(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin
    ) {
        BigDecimal total = service.calcularTotalVentasPeriodo(inicio, fin);
        return Map.of("total", total);
    }

    /**
     * ============================================================
     * ENDPOINT: Calcular total por sucursal
     * ============================================================
     * 
     * GET /api/ventas/total-sucursal?idSucursal=1&inicio=...&fin=...
     */
    @GetMapping("/total-sucursal")
    public Map<String, BigDecimal> calcularTotalSucursal(
        @RequestParam Long idSucursal,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin
    ) {
        BigDecimal total = service.calcularTotalVentasSucursal(idSucursal, inicio, fin);
        return Map.of("total", total);
    }

    /**
     * ============================================================
     * ENDPOINT: Contar ventas en un período
     * ============================================================
     * 
     * GET /api/ventas/contar-periodo?inicio=...&fin=...
     * 
     * Retorna: { "cantidad": 150 }
     */
    @GetMapping("/contar-periodo")
    public Map<String, Long> contarPeriodo(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin
    ) {
        Long cantidad = service.contarVentasPeriodo(inicio, fin);
        return Map.of("cantidad", cantidad);
    }

    /**
     * ============================================================
     * ENDPOINT: Ventas del día por caja
     * ============================================================
     * 
     * GET /api/ventas/dia-caja?idCaja=1&inicio=...&fin=...
     * 
     * Para cierre de caja
     */
    @GetMapping("/dia-caja")
    public List<Venta> ventasDiaCaja(
        @RequestParam Long idCaja,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin
    ) {
        return service.ventasDiaPorCaja(idCaja, inicio, fin);
    }

    /**
     * ============================================================
     * TODO: ENDPOINT COMPLETO PARA PROCESAR VENTA
     * ============================================================
     * 
     * POST /api/ventas/procesar
     * Body: {
     *   venta: { ...datos de venta... },
     *   productos: [
     *     { idProducto, cantidad, precio },
     *     ...
     *   ]
     * }
     * 
     * Este endpoint debería:
     * 1. Validar stock de todos los productos
     * 2. Crear la venta (cabecera)
     * 3. Crear los detalles de venta
     * 4. Decrementar stock
     * 5. Registrar movimiento de caja
     * 6. Retornar la venta completa
     * 
     * Se implementará después de crear DetalleVentaService y MovimientoCajaService
     */
}
