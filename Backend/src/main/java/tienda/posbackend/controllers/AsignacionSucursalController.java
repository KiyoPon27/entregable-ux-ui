package tienda.posbackend.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.entities.AsignacionSucursal;
import tienda.posbackend.repositories.AsignacionSucursalRepository;
import java.util.List;

@RestController
@RequestMapping("/api/asignacion-sucursal")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AsignacionSucursalController {

    private final AsignacionSucursalRepository asignacionSucursalRepository;

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<AsignacionSucursal>> mostrarPorUsuario(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(asignacionSucursalRepository.findByUsuarioId(idUsuario));
    }
}
