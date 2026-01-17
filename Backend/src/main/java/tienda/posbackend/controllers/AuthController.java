package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.dto.AuthResponse;
import tienda.posbackend.dto.LoginRequest;
import tienda.posbackend.dto.UserContextDTO;
import tienda.posbackend.entities.Usuario;
import tienda.posbackend.entities.Permiso;
import tienda.posbackend.entities.Rol;
import tienda.posbackend.entities.Modulo;
import tienda.posbackend.repositories.UsuarioRepository;
import tienda.posbackend.repositories.EmpresaRepository;
import tienda.posbackend.repositories.AsignacionSucursalRepository;
import tienda.posbackend.repositories.PermisoRepository;
import tienda.posbackend.security.JwtUtil;
import java.util.stream.Collectors;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Para facilitar desarrollo frontend
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private AsignacionSucursalRepository asignacionSucursalRepository;

    @Autowired
    private PermisoRepository permisoRepository;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest authRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getCorreo(), authRequest.getPassword())
        );

        if (authentication.isAuthenticated()) {
            // Generar Token
            String token = jwtService.generateToken(authRequest.getCorreo());
            
            // Buscar datos extra del usuario para la respuesta
            Usuario usuario = usuarioRepository.findByCorreo(authRequest.getCorreo())
                    .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado")); // No debería pasar si autenticó

            String rolNombre = (usuario.getRol() != null) ? usuario.getRol().getNombre() : "SIN_ROL";

            return ResponseEntity.ok(new AuthResponse(
                    token, 
                    usuario.getId(), 
                    usuario.getNombres(), 
                    rolNombre
            ));
        } else {
            throw new UsernameNotFoundException("Solicitud de acceso invalida");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UserContextDTO> getCurrentUserContext() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = null;
        
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            currentEmail = ((UserDetails) authentication.getPrincipal()).getUsername();
        } else if (authentication != null) {
            currentEmail = authentication.getName();
        }

        if (currentEmail == null) {
            return ResponseEntity.status(401).build();
        }

        Usuario usuario = usuarioRepository.findByCorreo(currentEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        UserContextDTO context = new UserContextDTO();
        context.setUsuario(usuario);

        empresaRepository.findByUsuarioId(usuario.getId()).ifPresent(context::setEmpresa);
        // Si no encuentra por usuario, intentar buscar la primera empresa (caso empleado)
        // Por ahora lo dejamos simple: solo si es dueño. 
        // TODO: Mejorar lógica para empleados que pertenecen a una empresa pero no son dueños directos (usar asignacion_sucursal -> sucursal -> empresa)
        
        if (context.getEmpresa() == null) {
             asignacionSucursalRepository.findByUsuarioId(usuario.getId())
                .map(asign -> asign.getSucursal().getEmpresa())
                .ifPresent(context::setEmpresa);
        }

        asignacionSucursalRepository.findByUsuarioId(usuario.getId()).ifPresent(context::setAsignacion);

        List<Long> permisosIds = permisoRepository.findByUsuarioId(usuario.getId())
                .stream()
                .map(p -> p.getModulo().getId())
                .collect(Collectors.toList());
        context.setPermisos(permisosIds);

        return ResponseEntity.ok(context);
    }
}
