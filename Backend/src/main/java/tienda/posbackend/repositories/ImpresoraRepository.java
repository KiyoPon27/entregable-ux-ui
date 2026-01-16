package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tienda.posbackend.models.Impresora;

import java.util.Optional;

/**
 * REPOSITORY: ImpresoraRepository
 * 
 * Acceso a datos de la tabla "impresoras"
 * 
 * MÉTODOS DISPONIBLES:
 * 1. findByIdCaja() - Obtiene impresora configurada para una caja (1:1)
 * 
 * NOTA: No hay insertar ni eliminar porque:
 * - Las impresoras se crean automáticamente con trigger insertarimpresora
 * - Se eliminan automáticamente al eliminar la caja (CASCADE)
 */
@Repository
public interface ImpresoraRepository extends JpaRepository<Impresora, Long> {

    /**
     * MOSTRAR IMPRESORA POR CAJA
     * 
     * Relación 1:1: Una caja tiene una impresora
     * 
     * SQL:
     * SELECT * FROM impresoras WHERE id_caja = ?
     * 
     * @param idCaja - ID de la caja
     * @return Optional con la impresora configurada
     */
    Optional<Impresora> findByIdCaja(Long idCaja);

    /**
     * Verifica si existe impresora para una caja
     * 
     * @param idCaja - ID de la caja
     * @return true si existe configuración
     */
    boolean existsByIdCaja(Long idCaja);
}
