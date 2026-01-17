package tienda.posbackend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import tienda.posbackend.entities.Usuario;
import tienda.posbackend.repositories.UsuarioRepository;

import java.util.ArrayList;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsuarioRepository repository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // En nuestro caso el "username" es el correo
        Usuario user = repository.findByCorreo(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con correo: " + username));
        
        // Aquí podríamos mapear los roles y permisos si fuera necesario.
        // Por ahora, devolvemos un usuario de Spring Security básico.
        return new org.springframework.security.core.userdetails.User(
                user.getCorreo(), 
                user.getPassword(), 
                new ArrayList<>() // roles vacíos por ahora
        );
    }
}
