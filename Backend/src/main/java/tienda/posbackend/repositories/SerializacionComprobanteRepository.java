package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import tienda.posbackend.models.SerializacionComprobante;

import java.util.List;
import java.util.Optional;

/**
 * REPOSITORY: SerializacionComprobanteRepository
 * 
 * MÉTODOS PERSONALIZADOS PARA SERIALIZACIONES
 * 
 * FUNCIONES POSTGRESQL REPLICADAS:
 * 1. generar_nro_comprobante() → generarNumeroComprobante()
 * 2. setdefaultserializacion() → establecerComoDefault()
 */
public interface SerializacionComprobanteRepository extends JpaRepository<SerializacionComprobante, Long> {
    
    /**
     * LISTAR: Serializaciones por sucursal
     * Ordenadas por tipo de comprobante
     * 
     * PostgreSQL: 
     * SELECT * FROM serializacion_comprobantes 
     * WHERE sucursal_id = ? 
     * ORDER BY id_tipo_comprobante
     */
    List<SerializacionComprobante> findBySucursalIdOrderByIdTipoComprobanteAsc(Long sucursalId);
    
    /**
     * BUSCAR: Serialización específica por tipo, serie y sucursal
     * 
     * Usado en generar_nro_comprobante()
     */
    @Query("SELECT s FROM SerializacionComprobante s " +
           "WHERE s.idTipoComprobante = ?1 " +
           "AND s.serie = ?2 " +
           "AND s.sucursalId = ?3")
    Optional<SerializacionComprobante> findByTipoSerieYSucursal(
        Long idTipoComprobante, 
        String serie, 
        Long sucursalId
    );
    
    /**
     * BUSCAR: Serialización predeterminada por tipo y sucursal
     * 
     * Obtiene la serie default para un tipo de comprobante
     */
    @Query("SELECT s FROM SerializacionComprobante s " +
           "WHERE s.idTipoComprobante = ?1 " +
           "AND s.sucursalId = ?2 " +
           "AND s.porDefault = true")
    Optional<SerializacionComprobante> findDefaultPorTipoYSucursal(
        Long idTipoComprobante, 
        Long sucursalId
    );
    
    /**
     * INCREMENTAR: Correlativo (con bloqueo para evitar duplicados)
     * 
     * PostgreSQL usa FOR UPDATE para bloqueo
     * JPA usa @Lock(LockModeType.PESSIMISTIC_WRITE) implícito
     * 
     * IMPORTANTE: Llamar dentro de @Transactional
     */
    @Modifying
    @Query("UPDATE SerializacionComprobante s " +
           "SET s.correlativo = s.correlativo + 1 " +
           "WHERE s.id = ?1")
    void incrementarCorrelativo(Long id);
    
    /**
     * ESTABLECER DEFAULT: Quitar default a todas en sucursal
     * 
     * PostgreSQL setdefaultserializacion():
     * UPDATE serializacion_comprobantes SET por_default = false WHERE sucursal_id = ?
     */
    @Modifying
    @Query("UPDATE SerializacionComprobante s " +
           "SET s.porDefault = false " +
           "WHERE s.sucursalId = ?1")
    void quitarDefaultEnSucursal(Long sucursalId);
    
    /**
     * ESTABLECER DEFAULT: Activar default para una serialización
     */
    @Modifying
    @Query("UPDATE SerializacionComprobante s " +
           "SET s.porDefault = true " +
           "WHERE s.id = ?1")
    void activarDefault(Long id);
    
    /**
     * LISTAR: Serializaciones por tipo de comprobante
     * 
     * Para filtrar solo facturas, boletas, etc.
     */
    List<SerializacionComprobante> findByIdTipoComprobanteAndSucursalId(
        Long idTipoComprobante, 
        Long sucursalId
    );
    
    /**
     * VALIDAR: Si existe serialización con misma serie en sucursal
     * 
     * Para prevenir duplicados al crear
     */
    boolean existsBySerieAndSucursalId(String serie, Long sucursalId);
    
    /**
     * VALIDAR: Si existe serialización con misma serie (excluyendo ID actual)
     * 
     * Para editar sin colisión con sí mismo
     */
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END " +
           "FROM SerializacionComprobante s " +
           "WHERE s.serie = ?1 " +
           "AND s.sucursalId = ?2 " +
           "AND s.id != ?3")
    boolean existsBySerieAndSucursalIdAndIdNot(String serie, Long sucursalId, Long id);
    
    /**
     * CONTAR: Total por sucursal
     */
    long countBySucursalId(Long sucursalId);
    
    /**
     * ELIMINAR: Todas las serializaciones de una sucursal
     * 
     * Se usa al eliminar sucursal (aunque CASCADE ya lo hace)
     */
    void deleteBySucursalId(Long sucursalId);
}
