package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import tienda.posbackend.dto.AuthResponse;
import tienda.posbackend.dto.ForgotPasswordRequest;
import tienda.posbackend.dto.LoginRequest;
import tienda.posbackend.dto.ResetPasswordRequest;
import tienda.posbackend.dto.VerifyResetCodeRequest;
import tienda.posbackend.dto.UserContextDTO;
import tienda.posbackend.entities.Usuario;
import tienda.posbackend.repositories.UsuarioRepository;
import tienda.posbackend.repositories.EmpresaRepository;
import tienda.posbackend.repositories.AsignacionSucursalRepository;
import tienda.posbackend.repositories.PermisoRepository;
import tienda.posbackend.security.JwtUtil;
import tienda.posbackend.services.EmailService;
import tienda.posbackend.services.PasswordResetCodeService;
import java.util.stream.Collectors;
import java.util.List;
import java.util.Map;

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

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordResetCodeService passwordResetCodeService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest authRequest) {
        try {
            // Limpiar espacios del email
            String correo = authRequest.getCorreo().trim();

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(correo, authRequest.getPassword())
            );

            if (authentication.isAuthenticated()) {
                // Generar Token
                String token = jwtService.generateToken(correo);

                // Buscar datos extra del usuario para la respuesta
                Usuario usuario = usuarioRepository.findByCorreo(correo)
                        .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado")); // No debería pasar si autenticó

                String rolNombre = (usuario.getRol() != null) ? usuario.getRol().getNombre() : "SIN_ROL";

                return ResponseEntity.ok(new AuthResponse(
                        token,
                        usuario.getId(),
                        usuario.getNombres(),
                        rolNombre
                ));
            } else {
                return ResponseEntity.status(401).body(null);
            }
        } catch (Exception e) {
            System.err.println("❌ Error en login: " + e.getMessage());
            e.printStackTrace();
            if (e instanceof DisabledException) {
                return ResponseEntity.status(403)
                        .body(Map.of("message", e.getMessage()));
            }
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Credenciales invalidas"));
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
        
        if (context.getEmpresa() == null) {
             asignacionSucursalRepository.findByUsuarioId(usuario.getId()).stream()
                .findFirst()
                .map(asign -> asign.getSucursal().getEmpresa())
                .ifPresent(context::setEmpresa);
        }

        asignacionSucursalRepository.findByUsuarioId(usuario.getId()).stream()
                .findFirst()
                .ifPresent(context::setAsignacion);

        List<Long> permisosIds = permisoRepository.findByUsuarioId(usuario.getId())
                .stream()
                .map(p -> p.getModulo().getId())
                .collect(Collectors.toList());
        context.setPermisos(permisosIds);

        return ResponseEntity.ok(context);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String correo = request.getCorreo().trim().toLowerCase();

        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElse(null);

        if (usuario == null) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "El correo no existe en el sistema"));
        }

        try {
            String code = passwordResetCodeService.generateAndStoreCode(correo);
            emailService.sendPasswordResetCode(correo, code);

            return ResponseEntity.ok(Map.of(
                    "message", "Codigo enviado al correo correctamente",
                    "correo", correo
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "No se pudo enviar el correo. Revisa la configuracion SMTP de Gmail"));
        }
    }

    @PostMapping("/verify-reset-code")
    public ResponseEntity<?> verifyResetCode(@Valid @RequestBody VerifyResetCodeRequest request) {
        String correo = request.getCorreo().trim().toLowerCase();
        String codigo = request.getCodigo().trim();

        boolean valido = passwordResetCodeService.isCodeValid(correo, codigo);
        if (!valido) {
            return ResponseEntity.status(400)
                    .body(Map.of("message", "El codigo no es valido o ya expiro"));
        }

        return ResponseEntity.ok(Map.of(
                "message", "Codigo valido",
                "correo", correo
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        String correo = request.getCorreo().trim().toLowerCase();
        String codigo = request.getCodigo().trim();
        String nuevaContrasena = request.getNuevaContrasena();

        boolean codigoConsumido = passwordResetCodeService.consumeCodeIfValid(correo, codigo);
        if (!codigoConsumido) {
            return ResponseEntity.status(400)
                    .body(Map.of("message", "El codigo no es valido, ya fue usado o expiro"));
        }

        Usuario usuario = usuarioRepository.findByCorreo(correo).orElse(null);
        if (usuario == null) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "El correo no existe en el sistema"));
        }

        usuario.setPassword(passwordEncoder.encode(nuevaContrasena));
        usuarioRepository.save(usuario);

        return ResponseEntity.ok(Map.of("message", "Contrasena actualizada correctamente"));
    }
}
