package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.entities.MovimientoStock;
import tienda.posbackend.services.MovimientoStockService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/movimientos-stock")
@CrossOrigin(origins = "*")
public class MovimientoStockController {

    @Autowired
    private MovimientoStockService movimientoStockService;

    /**
     * Registrar un nuevo movimiento de stock manualmente
     * POST /api/movimientos-stock
     */
    @PostMapping
    public ResponseEntity<MovimientoStock> registrarMovimiento(@RequestBody MovimientoStock movimiento) {
        MovimientoStock nuevoMovimiento = movimientoStockService.registrarMovimiento(movimiento);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoMovimiento);
    }

    /**
     * Listar todos los movimientos
     * GET /api/movimientos-stock
     */
    @GetMapping
    public ResponseEntity<List<MovimientoStock>> listarTodos() {
        return ResponseEntity.ok(movimientoStockService.listarTodos());
    }

    /**
     * Listar movimientos por producto
     * GET /api/movimientos-stock/producto/{productoId}
     */
    @GetMapping("/producto/{productoId}")
    public ResponseEntity<List<MovimientoStock>> listarPorProducto(@PathVariable Long productoId) {
        return ResponseEntity.ok(movimientoStockService.listarPorProducto(productoId));
    }

    /**
     * Listar movimientos por almacén
     * GET /api/movimientos-stock/almacen/{almacenId}
     */
    @GetMapping("/almacen/{almacenId}")
    public ResponseEntity<List<MovimientoStock>> listarPorAlmacen(@PathVariable Long almacenId) {
        return ResponseEntity.ok(movimientoStockService.listarPorAlmacen(almacenId));
    }

    /**
     * Listar movimientos por producto y almacén
     * GET /api/movimientos-stock/producto/{productoId}/almacen/{almacenId}
     */
    @GetMapping("/producto/{productoId}/almacen/{almacenId}")
    public ResponseEntity<List<MovimientoStock>> listarPorProductoYAlmacen(
            @PathVariable Long productoId,
            @PathVariable Long almacenId) {
        return ResponseEntity.ok(movimientoStockService.listarPorProductoYAlmacen(productoId, almacenId));
    }

    /**
     * Listar movimientos por tipo
     * GET /api/movimientos-stock/tipo/{tipo}
     */
    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<MovimientoStock>> listarPorTipo(@PathVariable String tipo) {
        return ResponseEntity.ok(movimientoStockService.listarPorTipo(tipo));
    }

    /**
     * Listar movimientos por rango de fechas
     * GET /api/movimientos-stock/fechas?inicio=2026-01-01T00:00:00&fin=2026-01-31T23:59:59
     */
    @GetMapping("/fechas")
    public ResponseEntity<List<MovimientoStock>> listarPorRangoFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        return ResponseEntity.ok(movimientoStockService.listarPorRangoFechas(inicio, fin));
    }

    /**
     * Listar movimientos por producto y rango de fechas
     * GET /api/movimientos-stock/producto/{productoId}/fechas?inicio=...&fin=...
     */
    @GetMapping("/producto/{productoId}/fechas")
    public ResponseEntity<List<MovimientoStock>> listarPorProductoYFechas(
            @PathVariable Long productoId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        return ResponseEntity.ok(movimientoStockService.listarPorProductoYFechas(productoId, inicio, fin));
    }

    /**
     * Listar movimientos por almacén y rango de fechas
     * GET /api/movimientos-stock/almacen/{almacenId}/fechas?inicio=...&fin=...
     */
    @GetMapping("/almacen/{almacenId}/fechas")
    public ResponseEntity<List<MovimientoStock>> listarPorAlmacenYFechas(
            @PathVariable Long almacenId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        return ResponseEntity.ok(movimientoStockService.listarPorAlmacenYFechas(almacenId, inicio, fin));
    }

    /**
     * Listar movimientos por empresa
     * GET /api/movimientos-stock/empresa/{empresaId}
     */
    @GetMapping("/empresa/{empresaId}")
    public ResponseEntity<List<MovimientoStock>> listarPorEmpresa(@PathVariable Long empresaId) {
        return ResponseEntity.ok(movimientoStockService.listarPorEmpresa(empresaId));
    }

    /**
     * Obtener un movimiento por ID
     * GET /api/movimientos-stock/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<MovimientoStock> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(movimientoStockService.obtenerPorId(id));
    }
}
