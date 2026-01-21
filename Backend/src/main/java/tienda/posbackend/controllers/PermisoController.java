package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.entities.Modulo;
import tienda.posbackend.entities.Permiso;
import tienda.posbackend.entities.PermisoDefault;
import tienda.posbackend.entities.Usuario;
import tienda.posbackend.repositories.ModuloRepository;
import tienda.posbackend.repositories.PermisoRepository;
import tienda.posbackend.repositories.PermisoDefaultRepository;
import tienda.posbackend.repositories.UsuarioRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/permisos")
@CrossOrigin(origins = "*")
@SuppressWarnings("null")
public class PermisoController {

    @Autowired
    private PermisoRepository permisoRepository;

    @Autowired
    private PermisoDefaultRepository permisoDefaultRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ModuloRepository moduloRepository;

    @GetMapping("/usuario/{idUsuario}")
    public List<Permiso> listarPorUsuario(@PathVariable Long idUsuario) {
        return permisoRepository.findByUsuarioId(idUsuario);
    }

    @GetMapping("/default")
    public ResponseEntity<List<PermisoDefault>> listarPermisosDefault() {
        List<PermisoDefault> permisosDefault = permisoDefaultRepository.findAll();
        return ResponseEntity.ok(permisosDefault);
    }

    @PostMapping
    public ResponseEntity<?> insertar(@RequestBody Map<String, Long> request) {
        try {
            Long idUsuario = request.get("id_usuario");
            Long idModulo = request.get("idmodulo");

            if (idUsuario == null || idModulo == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "id_usuario e idmodulo son requeridos");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            Usuario usuario = usuarioRepository.findById(idUsuario)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            Modulo modulo = moduloRepository.findById(idModulo)
                    .orElseThrow(() -> new RuntimeException("Módulo no encontrado"));

            Permiso permiso = new Permiso();
            permiso.setUsuario(usuario);
            permiso.setModulo(modulo);

            Permiso nuevoPermiso = permisoRepository.save(permiso);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoPermiso);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @DeleteMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> eliminarPorUsuario(@PathVariable Long idUsuario) {
        try {
            List<Permiso> permisos = permisoRepository.findByUsuarioId(idUsuario);
            permisoRepository.deleteAll(permisos);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}
