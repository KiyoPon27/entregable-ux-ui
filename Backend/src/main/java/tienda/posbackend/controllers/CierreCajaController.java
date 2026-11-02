package tienda.posbackend.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.entities.*;
import tienda.posbackend.repositories.*;
import tienda.posbackend.exceptions.ResourceNotFoundException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cierre-caja")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@SuppressWarnings("null")
public class CierreCajaController {
    
    private final CierreCajaRepository cierreCajaRepository;
    private final CajaRepository cajaRepository;
    private final UsuarioRepository usuarioRepository;

    @GetMapping("/caja/{idCaja}/aperturada")
    public ResponseEntity<CierreCaja> mostrarCierreCajaAperturada(@PathVariable Long idCaja) {
        return cierreCajaRepository.findByCajaIdAndEstado(idCaja, 0L)
            .map(ResponseEntity::ok)
            // returning null body if not found instead of 404 might be better for frontend 'maybeSingle' behavior
            // but usually 200 with empty body or 204 or 404. 
            // The frontend logic often expects data or null.
            .orElse(ResponseEntity.ok(null));
    }
    
    @GetMapping("/empresa/{idEmpresa}/abiertas")
    public ResponseEntity<List<CierreCaja>> mostrarAbiertasPorEmpresa(@PathVariable Long idEmpresa) {
        return ResponseEntity.ok(cierreCajaRepository.findAbiertasPorEmpresa(idEmpresa));
    }
    
    @GetMapping("/usuario/{idUsuario}/abierta")
    public ResponseEntity<CierreCaja> mostrarAbiertaPorUsuario(@PathVariable Long idUsuario) {
        var result = cierreCajaRepository.findByUsuarioIdAndEstado(idUsuario, 0L);
        if (result.isPresent()) {
            CierreCaja cc = result.get();
            System.out.println("📦 CierreCaja encontrado - ID: " + cc.getId());
            System.out.println("📦 Caja: " + (cc.getCaja() != null ? cc.getCaja().getId() : "null"));
            System.out.println("📦 Sucursal: " + (cc.getCaja() != null && cc.getCaja().getSucursal() != null ? cc.getCaja().getSucursal().getId() : "null"));
        }
        return result
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.ok(null));
    }

    @PostMapping("/aperturar")
    @Transactional
    public ResponseEntity<?> aperturarCaja(@RequestBody Map<String, Object> payload) {
        try {
            if (!payload.containsKey("id_caja") || payload.get("id_caja") == null) {
                return ResponseEntity.badRequest().body("Falta el id_caja");
            }
            if (!payload.containsKey("id_usuario") || payload.get("id_usuario") == null) {
                return ResponseEntity.badRequest().body("Falta el id_usuario");
            }

            Long idCaja = Long.valueOf(payload.get("id_caja").toString());
            Long idUsuario = Long.valueOf(payload.get("id_usuario").toString());
            
            // Check if this caja is already open
            if (cierreCajaRepository.findByCajaIdAndEstado(idCaja, 0L).isPresent()) {
                 return ResponseEntity.badRequest().body("Caja ya está aperturada");
            }
            
            // CRITICAL: Check if this user already has another caja open
            var cajaAbiertaUsuario = cierreCajaRepository.findByUsuarioIdAndEstado(idUsuario, 0L);
            if (cajaAbiertaUsuario.isPresent()) {
                return ResponseEntity.badRequest().body("Usuario ya tiene otra caja abierta (ID: " + cajaAbiertaUsuario.get().getId() + ")");
            }
            
            Caja caja = cajaRepository.findById(idCaja)
                .orElseThrow(() -> new ResourceNotFoundException("Caja no encontrada"));
            Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
            
            CierreCaja cc = new CierreCaja();
            cc.setCaja(caja);
            cc.setUsuario(usuario);
            cc.setFechaInicio(LocalDateTime.now());
            cc.setEstado(0L); // 0 = Abierta
            cc.setTotalEfectivoCalculado(BigDecimal.ZERO); 
            cc.setTotalEfectivoReal(BigDecimal.ZERO);
            cc.setDiferenciaEfectivo(BigDecimal.ZERO);
            
            if (payload.containsKey("saldo_inicial")) {
                // handle saldo inicial logic if any
            }
            
            return ResponseEntity.ok(cierreCajaRepository.save(cc));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al aperturar caja: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}/cerrar")
    @Transactional
    public ResponseEntity<CierreCaja> cerrarCaja(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        CierreCaja cc = cierreCajaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("CierreCaja no encontrado"));
            
        cc.setFechaCierre(LocalDateTime.now());
        cc.setEstado(1L); // 1 = Cerrada
        
        if (payload.containsKey("total_efectivo_real")) {
             cc.setTotalEfectivoReal(new BigDecimal(payload.get("total_efectivo_real").toString()));
        }
        if (payload.containsKey("total_efectivo_calculado")) {
             cc.setTotalEfectivoCalculado(new BigDecimal(payload.get("total_efectivo_calculado").toString()));
        }
         if (payload.containsKey("diferencia_efectivo")) {
             cc.setDiferenciaEfectivo(new BigDecimal(payload.get("diferencia_efectivo").toString()));
        }
        
        return ResponseEntity.ok(cierreCajaRepository.save(cc));
    }
}
