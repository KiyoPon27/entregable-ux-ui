package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tienda.posbackend.entities.Usuario;
import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByCorreo(String correo);
    
    /**
     * Obtiene todos los usuarios que pertenecen a una empresa específica
     * Incluye: SuperAdmin (propietario de la empresa) y empleados asignados a sucursales de esa empresa
     */
        @Query("SELECT DISTINCT u FROM Usuario u " +
            "WHERE u.id IN (SELECT e.usuario.id FROM Empresa e WHERE e.id = :idEmpresa) " +
            "   OR u.id IN (SELECT a.usuario.id FROM AsignacionSucursal a WHERE a.sucursal.empresa.id = :idEmpresa)")
    List<Usuario> findByEmpresaId(@Param("idEmpresa") Long idEmpresa);
}
