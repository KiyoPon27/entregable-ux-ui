package tienda.posbackend.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.entities.MovimientoCaja;
import tienda.posbackend.repositories.MovimientoCajaRepository;
import tienda.posbackend.repositories.CierreCajaRepository;
import tienda.posbackend.repositories.MetodoPagoRepository;
import tienda.posbackend.repositories.UsuarioRepository;
import tienda.posbackend.repositories.VentaRepository;
import tienda.posbackend.exceptions.ResourceNotFoundException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/movimientos-caja")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@SuppressWarnings("null")
public class MovimientoCajaController {
    
    private final MovimientoCajaRepository movimientoCajaRepository;
    private final CierreCajaRepository cierreCajaRepository;
    private final MetodoPagoRepository metodoPagoRepository;
    private final UsuarioRepository usuarioRepository;
    private final VentaRepository ventaRepository;

    @GetMapping("/empresa/{idEmpresa}")
    public ResponseEntity<List<Map<String, Object>>> listarPorEmpresa(@PathVariable Long idEmpresa) {
        List<MovimientoCaja> movimientos = movimientoCajaRepository.findByEmpresaIdOrderByFechaDesc(idEmpresa);
        
        // Mapear a estructura esperada por frontend
        List<Map<String, Object>> response = new java.util.ArrayList<>();
        for (MovimientoCaja mc : movimientos) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", mc.getId());
            item.put("fecha_movimiento", mc.getFechaMovimiento());
            item.put("tipo_movimiento", mc.getTipoMovimiento());
            item.put("monto", mc.getMonto());
            item.put("descripcion", mc.getDescripcion());
            item.put("vuelto", mc.getVuelto());
            item.put("usuario_nombre", mc.getUsuario() != null ? mc.getUsuario().getNombres() : "Sin usuario");
            item.put("caja_nombre", mc.getCierreCaja() != null && mc.getCierreCaja().getCaja() != null 
                ? mc.getCierreCaja().getCaja().getDescripcion() : "Sin caja");
            item.put("sucursal_nombre", mc.getCierreCaja() != null && mc.getCierreCaja().getCaja() != null 
                && mc.getCierreCaja().getCaja().getSucursal() != null
                ? mc.getCierreCaja().getCaja().getSucursal().getNombre() : "Sin sucursal");
            item.put("metodo_pago", mc.getMetodoPago() != null ? mc.getMetodoPago().getNombre() : "Sin método");
            response.add(item);
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/cierre-caja/{idCierreCaja}")
    public ResponseEntity<List<MovimientoCaja>> listarPorCierreCaja(@PathVariable Long idCierreCaja) {
        return ResponseEntity.ok(movimientoCajaRepository.findByCierreCajaId(idCierreCaja));
    }

    @GetMapping("/cierre-caja/{idCierreCaja}/efectivo-sin-ventas")
    public ResponseEntity<?> obtenerEfectivoSinVentas(@PathVariable Long idCierreCaja) {
        // Query: SELECT tipo_movimiento, SUM(monto) FROM movimientos_caja 
        // WHERE id_cierre_caja = ? AND id_metodo_pago = (efectivo) AND id_ventas IS NULL
        // GROUP BY tipo_movimiento
        
        List<Object[]> resultados = movimientoCajaRepository.findEfectivoSinVentasPorCierre(idCierreCaja);
        
        // Transform to Map format expected by frontend
        List<Map<String, Object>> response = new java.util.ArrayList<>();
        for (Object[] row : resultados) {
            Map<String, Object> item = new HashMap<>();
            item.put("tipo_movimiento", row[0]);
            item.put("monto", row[1]);
            response.add(item);
        }
        
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Map<String, Object> payload) {
        try {
            MovimientoCaja movimiento = new MovimientoCaja();
            
            // Set basic fields
            if (payload.containsKey("descripcion")) {
                movimiento.setDescripcion(payload.get("descripcion").toString());
            }
            
            if (payload.containsKey("tipo_movimiento")) {
                movimiento.setTipoMovimiento(payload.get("tipo_movimiento").toString());
            }
            
            if (payload.containsKey("monto")) {
                movimiento.setMonto(new java.math.BigDecimal(payload.get("monto").toString()));
            }
            
            if (payload.containsKey("vuelto")) {
                movimiento.setVuelto(new java.math.BigDecimal(payload.get("vuelto").toString()));
            }
            
            if (payload.containsKey("fecha_movimiento")) {
                // Parse date string if needed, or use LocalDateTime.now()
                movimiento.setFechaMovimiento(java.time.LocalDateTime.now());
            } else {
                movimiento.setFechaMovimiento(java.time.LocalDateTime.now());
            }
            
            // Set foreign key relationships
            if (payload.containsKey("id_cierre_caja")) {
                Long idCierreCaja = Long.valueOf(payload.get("id_cierre_caja").toString());
                movimiento.setCierreCaja(cierreCajaRepository.findById(idCierreCaja)
                    .orElseThrow(() -> new ResourceNotFoundException("CierreCaja no encontrado")));
            }
            
            if (payload.containsKey("id_metodo_pago")) {
                Long idMetodoPago = Long.valueOf(payload.get("id_metodo_pago").toString());
                movimiento.setMetodoPago(metodoPagoRepository.findById(idMetodoPago)
                    .orElseThrow(() -> new ResourceNotFoundException("MetodoPago no encontrado")));
            }
            
            if (payload.containsKey("id_usuario")) {
                Long idUsuario = Long.valueOf(payload.get("id_usuario").toString());
                movimiento.setUsuario(usuarioRepository.findById(idUsuario)
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado")));
            }
            
            // Procesar id_ventas si viene en el payload
            if (payload.containsKey("id_ventas")) {
                Long idVenta = Long.valueOf(payload.get("id_ventas").toString());
                movimiento.setVenta(ventaRepository.findById(idVenta)
                    .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada")));
            }
            
            MovimientoCaja saved = movimientoCajaRepository.save(movimiento);
            
            // Retornar solo el ID para evitar problemas de serialización lazy
            Map<String, Object> response = new HashMap<>();
            response.put("id", saved.getId());
            response.put("message", "Movimiento de caja creado exitosamente");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}
