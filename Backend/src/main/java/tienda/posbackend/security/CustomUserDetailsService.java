package tienda.posbackend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import tienda.posbackend.entities.AsignacionSucursal;
import tienda.posbackend.entities.Empresa;
import tienda.posbackend.entities.Usuario;
import tienda.posbackend.repositories.AsignacionSucursalRepository;
import tienda.posbackend.repositories.EmpresaRepository;
import tienda.posbackend.repositories.UsuarioRepository;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private AsignacionSucursalRepository asignacionSucursalRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // En nuestro caso el "username" es el correo
        Usuario user = repository.findByCorreo(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con correo: " + username));

        String rolNombre = user.getRol() != null && user.getRol().getNombre() != null
                ? user.getRol().getNombre().trim()
                : "";
        boolean esOg = "OG".equalsIgnoreCase(rolNombre);

        if (esOg) {
            return buildSecurityUser(user);
        }

        if (user.getEstado() != null && !"ACTIVO".equalsIgnoreCase(user.getEstado().trim())) {
            throw new DisabledException("Cuenta deshabilitada. Comunicarse con el administrador");
        }

        boolean tieneEmpresaActiva = empresaRepository.findByUsuarioId(user.getId())
                .map(empresa -> Boolean.TRUE.equals(empresa.getHabilitada()))
                .orElse(false);

        if (!tieneEmpresaActiva) {
            List<AsignacionSucursal> asignaciones = asignacionSucursalRepository.findByUsuarioId(user.getId());
            for (AsignacionSucursal asignacion : asignaciones) {
                Empresa empresa = asignacion.getSucursal() != null ? asignacion.getSucursal().getEmpresa() : null;
                if (empresa != null && Boolean.TRUE.equals(empresa.getHabilitada())) {
                    tieneEmpresaActiva = true;
                    break;
                }
            }
        }

        if (!tieneEmpresaActiva) {
            throw new DisabledException("Cuenta deshabilitada. Comunicarse con el administrador");
        }

        return buildSecurityUser(user);
    }

    private org.springframework.security.core.userdetails.User buildSecurityUser(Usuario user) {
        // Obtener autoridades del usuario
        Collection<SimpleGrantedAuthority> authorities = new ArrayList<>();
        
        // Agregar el rol del usuario con el prefijo ROLE_
        if (user.getRol() != null && user.getRol().getNombre() != null) {
            String rolNombre = user.getRol().getNombre().toUpperCase();
            // Spring Security espera que los roles tengan el prefijo "ROLE_"
            if (!rolNombre.startsWith("ROLE_")) {
                rolNombre = "ROLE_" + rolNombre;
            }
            authorities.add(new SimpleGrantedAuthority(rolNombre));
        }
        
        return new org.springframework.security.core.userdetails.User(
                user.getCorreo(), 
                user.getPassword(), 
                authorities
        );
    }
}
