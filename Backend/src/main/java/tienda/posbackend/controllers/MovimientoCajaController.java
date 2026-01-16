package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.models.MovimientoCaja;
import tienda.posbackend.services.MovimientoCajaService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * CONTROLLER: MovimientoCajaController
 * 
 * ENDPOINTS REST PARA MOVIMIENTOS DE CAJA
 * 
 * MIGRACIÓN FRONTEND:
 * ANTES: const { data } = await supabase.rpc("mostrarmovimientoscaja", { p_id_caja: 1 })
 * AHORA: const { data } = await axios.get("/api/movimientos-caja/mostrar", { params: { idCaja: 1 } })
 */
@RestController
@RequestMapping("/api/movimientos-caja")
public class MovimientoCajaController {

    @Autowired
    private MovimientoCajaService service;

    /**
     * ============================================================
     * ENDPOINT: mostrarmovimientoscaja
     * ============================================================
     * 
     * GET /api/movimientos-caja/mostrar?idCaja=1
     * 
     * POSTGRESQL RPC: mostrarmovimientoscaja(p_id_caja)
     * 
     * FRONTEND:
     * const response = await axios.get("/api/movimientos-caja/mostrar", {
     *   params: { idCaja: 1 }
     * });
     * 
     * RESPUESTA:
     * [
     *   {
     *     id: 1,
     *     tipoMovimiento: "APERTURA",
     *     monto: 100.00,
     *     saldoAnterior: 0.00,
     *     saldoNuevo: 100.00,
     *     descripcion: "Apertura de caja",
     *     fechaMovimiento: "2026-01-15T08:00:00",
     *     usuario: "Juan Pérez"
     *   },
     *   {
     *     id: 2,
     *     tipoMovimiento: "VENTA",
     *     monto: 50.00,
     *     saldoAnterior: 100.00,
     *     saldoNuevo: 150.00,
     *     descripcion: "Venta #123",
     *     fechaMovimiento: "2026-01-15T10:30:00",
     *     usuario: "Juan Pérez"
     *   }
     * ]
     */
    @GetMapping("/mostrar")
    public List<Map<String, Object>> mostrar(@RequestParam Long idCaja) {
        return service.mostrarMovimientos(idCaja);
    }

    /**
     * ============================================================
     * ENDPOINT: Registrar apertura de caja
     * ============================================================
     * 
     * POST /api/movimientos-caja/apertura
     * Body: { idCaja, idUsuario, montoInicial }
     * 
     * FRONTEND:
     * const response = await axios.post("/api/movimientos-caja/apertura", {
     *   idCaja: 1,
     *   idUsuario: 1,
     *   montoInicial: 100.00
     * });
     */
    @PostMapping("/apertura")
    public ResponseEntity<?> registrarApertura(@RequestBody Map<String, Object> body) {
        try {
            Long idCaja = Long.valueOf(body.get("idCaja").toString());
            Long idUsuario = Long.valueOf(body.get("idUsuario").toString());
            BigDecimal montoInicial = new BigDecimal(body.get("montoInicial").toString());

            MovimientoCaja movimiento = service.registrarApertura(idCaja, idUsuario, montoInicial);
            return ResponseEntity.ok(movimiento);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: Registrar cierre de caja
     * ============================================================
     * 
     * POST /api/movimientos-caja/cierre
     * Body: { idCaja, idUsuario, montoFinal }
     * 
     * FRONTEND:
     * const response = await axios.post("/api/movimientos-caja/cierre", {
     *   idCaja: 1,
     *   idUsuario: 1,
     *   montoFinal: 500.00
     * });
     */
    @PostMapping("/cierre")
    public ResponseEntity<?> registrarCierre(@RequestBody Map<String, Object> body) {
        try {
            Long idCaja = Long.valueOf(body.get("idCaja").toString());
            Long idUsuario = Long.valueOf(body.get("idUsuario").toString());
            BigDecimal montoFinal = new BigDecimal(body.get("montoFinal").toString());

            MovimientoCaja movimiento = service.registrarCierre(idCaja, idUsuario, montoFinal);
            return ResponseEntity.ok(movimiento);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: Registrar ingreso
     * ============================================================
     * 
     * POST /api/movimientos-caja/ingreso
     * Body: { idCaja, idUsuario, monto, descripcion }
     * 
     * Para ingresos manuales (depósitos, abonos)
     */
    @PostMapping("/ingreso")
    public ResponseEntity<?> registrarIngreso(@RequestBody Map<String, Object> body) {
        try {
            Long idCaja = Long.valueOf(body.get("idCaja").toString());
            Long idUsuario = Long.valueOf(body.get("idUsuario").toString());
            BigDecimal monto = new BigDecimal(body.get("monto").toString());
            String descripcion = body.get("descripcion").toString();

            MovimientoCaja movimiento = service.registrarIngreso(idCaja, idUsuario, monto, descripcion);
            return ResponseEntity.ok(movimiento);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: Registrar egreso
     * ============================================================
     * 
     * POST /api/movimientos-caja/egreso
     * Body: { idCaja, idUsuario, monto, descripcion }
     * 
     * Para salidas de efectivo (gastos, retiros)
     */
    @PostMapping("/egreso")
    public ResponseEntity<?> registrarEgreso(@RequestBody Map<String, Object> body) {
        try {
            Long idCaja = Long.valueOf(body.get("idCaja").toString());
            Long idUsuario = Long.valueOf(body.get("idUsuario").toString());
            BigDecimal monto = new BigDecimal(body.get("monto").toString());
            String descripcion = body.get("descripcion").toString();

            MovimientoCaja movimiento = service.registrarEgreso(idCaja, idUsuario, monto, descripcion);
            return ResponseEntity.ok(movimiento);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: Calcular saldo actual
     * ============================================================
     * 
     * GET /api/movimientos-caja/saldo-actual/1
     * 
     * Retorna: { "saldo": 500.00 }
     */
    @GetMapping("/saldo-actual/{idCaja}")
    public Map<String, BigDecimal> calcularSaldo(@PathVariable Long idCaja) {
        BigDecimal saldo = service.calcularSaldoActual(idCaja);
        return Map.of("saldo", saldo);
    }

    /**
     * ============================================================
     * ENDPOINT: Movimientos por rango de fechas
     * ============================================================
     * 
     * GET /api/movimientos-caja/por-fechas?idCaja=1&inicio=...&fin=...
     */
    @GetMapping("/por-fechas")
    public List<MovimientoCaja> listarPorFechas(
        @RequestParam Long idCaja,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin
    ) {
        return service.listarPorFechas(idCaja, inicio, fin);
    }

    /**
     * ============================================================
     * ENDPOINT: Resumen del día (para cierre de caja)
     * ============================================================
     * 
     * GET /api/movimientos-caja/resumen-dia?idCaja=1&inicio=...&fin=...
     * 
     * Retorna:
     * {
     *   "ingresos": 500.00,
     *   "egresos": 50.00,
     *   "neto": 450.00
     * }
     */
    @GetMapping("/resumen-dia")
    public Map<String, BigDecimal> resumenDia(
        @RequestParam Long idCaja,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin
    ) {
        return service.calcularResumenDia(idCaja, inicio, fin);
    }

    /**
     * ============================================================
     * ENDPOINT: Contar ventas del día
     * ============================================================
     * 
     * GET /api/movimientos-caja/contar-ventas?idCaja=1&inicio=...&fin=...
     * 
     * Retorna: { "cantidad": 25 }
     */
    @GetMapping("/contar-ventas")
    public Map<String, Long> contarVentas(
        @RequestParam Long idCaja,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin
    ) {
        Long cantidad = service.contarVentasDia(idCaja, inicio, fin);
        return Map.of("cantidad", cantidad);
    }
}
