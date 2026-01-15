package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.dto.AuthRequest;
import tienda.posbackend.dto.AuthResponse;
import tienda.posbackend.models.Usuario;
import tienda.posbackend.repositories.UsuarioRepository;
import tienda.posbackend.security.JwtUtil;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // LOGIN: http://localhost:8080/api/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest) {
        try {
            // 1. Intentar autenticar (Spring hace la magia de comparar hashes)
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword()));

            // 2. Si pasa, generar token
            if (authentication.isAuthenticated()) {
                String token = jwtUtil.generateToken(authRequest.getEmail());
                return ResponseEntity.ok(new AuthResponse(token));
            } else {
                return ResponseEntity.status(401).body("Credenciales inválidas");
            }
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Error de autenticación: " + e.getMessage());
        }
    }

    // REGISTRO TEMPORAL (Solo para que puedas crear tu primer usuario real con
    // contraseña encriptada)
    // POST: http://localhost:8080/api/auth/register-temp
// REGISTRO TEMPORAL (Modificado para diagnóstico)
    @PostMapping("/register-temp")
    public ResponseEntity<?> registrarUsuarioTemporal(@RequestBody Usuario usuario) {
        try {
            // Encriptamos la contraseña antes de guardar
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
            usuarioRepository.save(usuario);
            return ResponseEntity.ok("Usuario creado con éxito");
        } catch (Exception e) {
            // ESTO ES LO QUE NECESITAMOS: Imprimir el error real en la consola
            e.printStackTrace(); 
            // Y devolverlo a Postman para leerlo
// Obtener la causa original del error
Throwable causa = e.getCause();
String mensajeCausa = (causa != null) ? causa.getMessage() : "Desconocida";
return ResponseEntity.status(500).body("Error: " + e.getMessage() + " \n >>> CAUSA REAL: " + mensajeCausa);        }
    }
}