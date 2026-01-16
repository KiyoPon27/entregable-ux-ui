package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import tienda.posbackend.models.Usuario;
import java.util.Optional;
import java.util.List;

/**
 * REPOSITORY: UsuarioRepository
 * 
 * MÉTODOS PERSONALIZADOS PARA GESTIÓN DE USUARIOS
 */
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    // LOGIN: Busca por correo (usado en CustomUserDetailsService)
    Optional<Usuario> findByCorreo(String correo);
    
    // LOGIN ACTIVO: Busca por correo y estado activo
    @Query("SELECT u FROM Usuario u WHERE u.correo = ?1 AND u.estado = 'ACTIVO'")
    Optional<Usuario> findByCorreoAndActivoTrue(String correo);
    
    // VALIDACIONES: Email duplicado
    boolean existsByCorreo(String correo);
    boolean existsByCorreoAndIdNot(String correo, Long id);
    
    // VALIDACIONES: Nombres duplicados por empresa (si tienes id_empresa, sino eliminar estos)
    // boolean existsByNombresIgnoreCaseAndIdEmpresa(String nombres, Long idEmpresa);
    // boolean existsByNombresIgnoreCaseAndIdEmpresaAndIdNot(String nombres, Long idEmpresa, Long id);
    
    // LISTAR: Usuarios por empresa (si tienes id_empresa)
    // List<Usuario> findByIdEmpresaOrderByNombresAsc(Long idEmpresa);
    // Long countByIdEmpresa(Long idEmpresa);
    // List<Usuario> findByIdEmpresaAndEstadoOrderByNombresAsc(Long idEmpresa, String estado);
    
    // LISTAR TODOS: Ordenados alfabéticamente
    List<Usuario> findAllByOrderByNombresAsc();
    
    // CONTAR ACTIVOS
    @Query("SELECT COUNT(u) FROM Usuario u WHERE u.estado = 'ACTIVO'")
    Long countActivos();
}