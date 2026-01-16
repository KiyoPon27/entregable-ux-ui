package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tienda.posbackend.models.Rol;

import java.util.List;
import java.util.Optional;

/**
 * REPOSITORY: RolRepository
 * 
 * DATA ACCESS LAYER PARA ROLES
 * 
 * REPLICACIÓN POSTGRESQL:
 * - mostraroles() → findAllExceptSuperadmin()
 * - mostrarrolesxnombre(p_nombre) → findByNombre()
 * 
 * IMPORTANTE:
 * - El rol "superadmin" NO se muestra en listados normales
 * - Los roles son catálogo de referencia para permisos
 */
@Repository
public interface RolRepository extends JpaRepository<Rol, Long> {

    /**
     * ============================================================
     * MÉTODO: findAllExceptSuperadmin
     * ============================================================
     * 
     * POSTGRESQL RPC: mostraroles()
     * 
     * SELECT * FROM roles 
     * WHERE nombre != 'superadmin'
     * ORDER BY nombre ASC
     * 
     * IMPORTANTE:
     * - Excluye "superadmin" para evitar que se asigne manualmente
     * - Se usa en dropdowns de selección de rol
     */
    @Query("SELECT r FROM Rol r WHERE r.nombre != 'superadmin' ORDER BY r.nombre ASC")
    List<Rol> findAllExceptSuperadmin();

    /**
     * ============================================================
     * MÉTODO: findByNombre
     * ============================================================
     * 
     * POSTGRESQL RPC: mostrarrolesxnombre(p_nombre)
     * 
     * SELECT * FROM roles WHERE nombre = ?
     * 
     * Buscar rol por nombre exacto
     */
    Optional<Rol> findByNombre(String nombre);

    /**
     * ============================================================
     * MÉTODO: existsByNombre
     * ============================================================
     * 
     * Verificar si existe un rol con el nombre dado
     */
    boolean existsByNombre(String nombre);

    /**
     * ============================================================
     * MÉTODO: countRoles
     * ============================================================
     * 
     * Contar total de roles (incluyendo superadmin)
     */
    @Query("SELECT COUNT(r) FROM Rol r")
    Long countRoles();
}
