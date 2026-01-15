package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tienda.posbackend.models.Usuario;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Método mágico de JPA: Busca automáticamente por la columna "correo"
    Optional<Usuario> findByCorreo(String correo);
}