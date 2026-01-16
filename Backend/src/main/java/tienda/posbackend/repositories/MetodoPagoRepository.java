package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import tienda.posbackend.models.MetodoPago;

import java.util.List;
import java.util.Optional;

/**
 * REPOSITORY: MetodoPagoRepository
 * 
 * MÉTODOS PERSONALIZADOS PARA MÉTODOS DE PAGO
 * 
 * REPLICACIÓN POSTGRESQL:
 * - Validación UNIQUE (nombre, id_empresa)
 * - Queries con LOWER() para case-insensitive
 */
public interface MetodoPagoRepository extends JpaRepository<MetodoPago, Long> {
    
    /**
     * LISTAR: Métodos de pago por empresa
     * Ordenados alfabéticamente
     * 
     * PostgreSQL: 
     * SELECT * FROM metodos_pago 
     * WHERE id_empresa = ? 
     * ORDER BY nombre ASC
     */
    List<MetodoPago> findByIdEmpresaOrderByNombreAsc(Long idEmpresa);
    
    /**
     * VALIDACIÓN: Nombre duplicado en empresa (case-insensitive)
     * 
     * PostgreSQL: 
     * PERFORM 1 FROM metodos_pago 
     * WHERE LOWER(nombre) = LOWER(?) 
     * AND id_empresa = ?
     */
    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END " +
           "FROM MetodoPago m " +
           "WHERE LOWER(m.nombre) = LOWER(?1) AND m.idEmpresa = ?2")
    boolean existsByNombreIgnoreCaseAndIdEmpresa(String nombre, Long idEmpresa);
    
    /**
     * VALIDACIÓN: Nombre duplicado excluyendo ID actual
     * 
     * Para editar sin colisión con sí mismo
     */
    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END " +
           "FROM MetodoPago m " +
           "WHERE LOWER(m.nombre) = LOWER(?1) AND m.idEmpresa = ?2 AND m.id != ?3")
    boolean existsByNombreIgnoreCaseAndIdEmpresaAndIdNot(String nombre, Long idEmpresa, Long id);
    
    /**
     * BUSCAR: Por nombre exacto (case-insensitive) en empresa
     * 
     * Para obtener método específico (ej: "Efectivo")
     */
    @Query("SELECT m FROM MetodoPago m " +
           "WHERE LOWER(m.nombre) = LOWER(?1) AND m.idEmpresa = ?2")
    Optional<MetodoPago> findByNombreIgnoreCaseAndIdEmpresa(String nombre, Long idEmpresa);
    
    /**
     * LISTAR: Métodos editables (delete_update = true)
     * 
     * Para mostrar solo los personalizados
     */
    List<MetodoPago> findByIdEmpresaAndDeleteUpdateTrue(Long idEmpresa);
    
    /**
     * CONTAR: Total por empresa
     */
    long countByIdEmpresa(Long idEmpresa);
}
