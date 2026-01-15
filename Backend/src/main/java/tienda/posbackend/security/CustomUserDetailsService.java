package tienda.posbackend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import tienda.posbackend.models.Usuario;
import tienda.posbackend.repositories.UsuarioRepository;

import java.util.ArrayList;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsuarioRepository repository;

    @Override
    public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {
        Usuario usuario = repository.findByCorreo(correo)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con correo: " + correo));

        // Aquí convertimos TU usuario al formato que entiende Spring Security
        // "new ArrayList<>()" son los roles, luego los configuraremos mejor si es
        // necesario
        return new org.springframework.security.core.userdetails.User(usuario.getCorreo(), usuario.getPassword(),
                new ArrayList<>());
    }
}