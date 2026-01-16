package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.models.DetalleVenta;
import tienda.posbackend.services.DetalleVentaService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * CONTROLLER: DetalleVentaController
 * 
 * ENDPOINTS REST PARA DETALLE DE VENTAS
 * 
 * MIGRACIÓN FRONTEND:
 * ANTES: const { data } = await supabase.rpc("mostrardetalleventa", { p_id_venta: 123 })
 * AHORA: const { data } = await axios.get("/api/detalle-venta/mostrar", { params: { idVenta: 123 } })
 */
@RestController
@RequestMapping("/api/detalle-venta")
public class DetalleVentaController {

    @Autowired
    private DetalleVentaService service;

    /**
     * ============================================================
     * ENDPOINT: mostrardetalleventa
     * ============================================================
     * 
     * GET /api/detalle-venta/mostrar?idVenta=123
     * 
     * POSTGRESQL RPC: mostrardetalleventa(p_id_venta)
     * 
     * FRONTEND:
     * const response = await axios.get("/api/detalle-venta/mostrar", {
     *   params: { idVenta: 123 }
     * });
     * 
     * RESPUESTA:
     * [
     *   {
     *     id: 1,
     *     producto: "Coca Cola",
     *     codigoProducto: "CC001",
     *     cantidad: 5,
     *     precioUnitario: 2.50,
     *     subtotal: 12.50
     *   },
     *   {
     *     id: 2,
     *     producto: "Pepsi",
     *     codigoProducto: "PP001",
     *     cantidad: 3,
     *     precioUnitario: 2.00,
     *     subtotal: 6.00
     *   }
     * ]
     */
    @GetMapping("/mostrar")
    public List<Map<String, Object>> mostrar(@RequestParam Long idVenta) {
        return service.mostrarDetalle(idVenta);
    }

    /**
     * ============================================================
     * ENDPOINT: insertardetalleventa
     * ============================================================
     * 
     * POST /api/detalle-venta/insertardetalleventa
     * Body: { idVenta, idProducto, idAlmacen, cantidad, precioUnitario }
     * 
     * POSTGRESQL RPC: insertardetalleventa(...)
     * 
     * NOTA: Normalmente los detalles se crean desde /api/ventas/procesar
     * Este endpoint es para casos especiales o correcciones.
     * 
     * FRONTEND:
     * const response = await axios.post("/api/detalle-venta/insertardetalleventa", {
     *   idVenta: 123,
     *   idProducto: 5,
     *   idAlmacen: 1,
     *   cantidad: 5,
     *   precioUnitario: 2.50
     * });
     */
    @PostMapping("/insertardetalleventa")
    public ResponseEntity<?> insertar(@RequestBody DetalleVenta detalle) {
        try {
            DetalleVenta nuevo = service.insertarDetalle(detalle);
            return ResponseEntity.ok(nuevo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: Listar detalles por venta
     * ============================================================
     * 
     * GET /api/detalle-venta/por-venta/123
     * 
     * Retorna objetos DetalleVenta completos (no el JOIN con productos)
     */
    @GetMapping("/por-venta/{idVenta}")
    public List<DetalleVenta> listarPorVenta(@PathVariable Long idVenta) {
        return service.listarPorVenta(idVenta);
    }

    /**
     * ============================================================
     * ENDPOINT: Calcular total de una venta
     * ============================================================
     * 
     * GET /api/detalle-venta/calcular-total/123
     * 
     * Suma los subtotales de todos los productos
     * 
     * Retorna: { "total": 18.50 }
     */
    @GetMapping("/calcular-total/{idVenta}")
    public Map<String, BigDecimal> calcularTotal(@PathVariable Long idVenta) {
        BigDecimal total = service.calcularTotalVenta(idVenta);
        return Map.of("total", total);
    }

    /**
     * ============================================================
     * ENDPOINT: Contar productos en una venta
     * ============================================================
     * 
     * GET /api/detalle-venta/contar/123
     * 
     * Retorna: { "cantidad": 5 }
     */
    @GetMapping("/contar/{idVenta}")
    public Map<String, Long> contar(@PathVariable Long idVenta) {
        Long cantidad = service.contarProductosVenta(idVenta);
        return Map.of("cantidad", cantidad);
    }

    /**
     * ============================================================
     * ENDPOINT: Productos más vendidos (TOP N)
     * ============================================================
     * 
     * GET /api/detalle-venta/top-vendidos?limite=10
     * 
     * Para reportes y dashboard
     * 
     * RESPUESTA:
     * [
     *   {
     *     idProducto: 5,
     *     producto: "Coca Cola",
     *     codigo: "CC001",
     *     cantidadVendida: 150,
     *     totalVendido: 375.00
     *   }
     * ]
     */
    @GetMapping("/top-vendidos")
    public List<Map<String, Object>> topVendidos(
        @RequestParam(defaultValue = "10") int limite
    ) {
        return service.productosTopVendidos(limite);
    }

    /**
     * ============================================================
     * ENDPOINT: Productos vendidos en un período
     * ============================================================
     * 
     * GET /api/detalle-venta/vendidos-periodo?fechaInicio=2026-01-01 00:00:00&fechaFin=2026-01-31 23:59:59&limite=10
     * 
     * Para reportes mensuales
     */
    @GetMapping("/vendidos-periodo")
    public List<Map<String, Object>> vendidosPeriodo(
        @RequestParam String fechaInicio,
        @RequestParam String fechaFin,
        @RequestParam(defaultValue = "10") int limite
    ) {
        return service.productosVendidosPeriodo(fechaInicio, fechaFin, limite);
    }

    /**
     * ============================================================
     * ENDPOINT: Verificar si un producto fue vendido
     * ============================================================
     * 
     * GET /api/detalle-venta/fue-vendido/5
     * 
     * Útil antes de eliminar productos
     * 
     * Retorna: { "fueVendido": true }
     */
    @GetMapping("/fue-vendido/{idProducto}")
    public Map<String, Boolean> fueVendido(@PathVariable Long idProducto) {
        boolean vendido = service.productoFueVendido(idProducto);
        return Map.of("fueVendido", vendido);
    }

    /**
     * ============================================================
     * ENDPOINT: Total vendido de un producto
     * ============================================================
     * 
     * GET /api/detalle-venta/total-vendido/5
     * 
     * Retorna la cantidad total de unidades vendidas
     * 
     * Retorna: { "totalVendido": 150 }
     */
    @GetMapping("/total-vendido/{idProducto}")
    public Map<String, Integer> totalVendido(@PathVariable Long idProducto) {
        Integer total = service.totalVendidoProducto(idProducto);
        return Map.of("totalVendido", total);
    }
}
