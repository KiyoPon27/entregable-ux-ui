package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.dto.CompraRequestDTO;
import tienda.posbackend.entities.Compra;
import tienda.posbackend.entities.DetalleCompra;
import tienda.posbackend.services.CompraService;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/compras")
@CrossOrigin(origins = "*")
public class CompraController {

    @Autowired
    private CompraService compraService;

    // Filtrar compras con múltiples criterios (filtra por fechaEmision)
    @GetMapping
    public ResponseEntity<List<Compra>> filtrarCompras(
            @RequestParam Long empresaId,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) Long id_proveedor,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false) String buscador) {
        List<Compra> compras = compraService.filtrarCompras(empresaId, estado, id_proveedor, fechaInicio, fechaFin, buscador);
        return ResponseEntity.ok(compras);
    }

    // Listar todas las compras de una empresa
    @GetMapping("/empresa/{empresaId}")
    public ResponseEntity<List<Compra>> listarPorEmpresa(@PathVariable Long empresaId) {
        return ResponseEntity.ok(compraService.listarPorEmpresa(empresaId));
    }

    // Obtener una compra por ID
    @GetMapping("/{id}")
    public ResponseEntity<Compra> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(compraService.obtenerPorId(id));
    }

    // Obtener detalles de una compra
    @GetMapping("/{id}/detalles")
    public ResponseEntity<List<DetalleCompra>> obtenerDetalles(@PathVariable Long id) {
        return ResponseEntity.ok(compraService.obtenerDetalles(id));
    }

    // Buscar por número de factura
    @GetMapping("/buscar/factura/{empresaId}")
    public ResponseEntity<List<Compra>> buscarPorFactura(
            @PathVariable Long empresaId,
            @RequestParam String numeroFactura) {
        return ResponseEntity.ok(compraService.buscarPorNumeroFactura(empresaId, numeroFactura));
    }

    // Buscar por proveedor (nombre o RUC)
    @GetMapping("/buscar/proveedor/{empresaId}")
    public ResponseEntity<List<Compra>> buscarPorProveedor(
            @PathVariable Long empresaId,
            @RequestParam String query) {
        return ResponseEntity.ok(compraService.buscarPorProveedor(empresaId, query));
    }

    // Filtrar por estado
    @GetMapping("/estado/{empresaId}")
    public ResponseEntity<List<Compra>> filtrarPorEstado(
            @PathVariable Long empresaId,
            @RequestParam String estado) {
        return ResponseEntity.ok(compraService.filtrarPorEstado(empresaId, estado));
    }

    // Filtrar por rango de fechas
    @GetMapping("/fechas/{empresaId}")
    public ResponseEntity<List<Compra>> filtrarPorFechas(
            @PathVariable Long empresaId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        return ResponseEntity.ok(compraService.filtrarPorRangoFechas(empresaId, fechaInicio, fechaFin));
    }

    // Crear nueva compra
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody CompraRequestDTO dto) {
        try {
            Compra nuevaCompra = compraService.crear(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaCompra);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error al crear la compra: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Actualizar compra completa
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody CompraRequestDTO dto) {
        try {
            Compra compraActualizada = compraService.actualizar(id, dto);
            return ResponseEntity.ok(compraActualizada);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error al actualizar la compra: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Actualizar estado de compra
    @PatchMapping("/{id}/estado")
    public ResponseEntity<Compra> actualizarEstado(
            @PathVariable Long id,
            @RequestParam String estado) {
        Compra compraActualizada = compraService.actualizarEstado(id, estado);
        return ResponseEntity.ok(compraActualizada);
    }

    // Eliminar compra
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            compraService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error al eliminar la compra: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}