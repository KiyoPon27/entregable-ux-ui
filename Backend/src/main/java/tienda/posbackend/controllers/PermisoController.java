package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.entities.Permiso;
import tienda.posbackend.repositories.PermisoRepository;

import java.util.List;

@RestController
@RequestMapping("/api/permisos")
@CrossOrigin(origins = "*")
public class PermisoController {

    @Autowired
    private PermisoRepository permisoRepository;

    @GetMapping("/usuario/{idUsuario}")
    public List<Permiso> listarPorUsuario(@PathVariable Long idUsuario) {
        return permisoRepository.findByUsuarioId(idUsuario);
    }
}
