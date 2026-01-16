package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tienda.posbackend.models.Caja;

import java.util.List;

/**
 * REPOSITORY: CajaRepository
 * 
 * QUERIES PRINCIPALES:
 * 1. Mostrar cajas por sucursal
 * 2. Mostrar cajas asignadas a usuario (mostrarcajasasignadas)
 * 3. Validaciones de duplicados
 */
public interface CajaRepository extends JpaRepository<Caja, Long> {

    /**
     * MOSTRAR CAJAS POR SUCURSAL
     * 
     * SQL:
     * SELECT * FROM caja WHERE id_sucursal = ? ORDER BY descripcion ASC
     * 
     * @param idSucursal - Filtro por sucursal
     * @return Lista de cajas ordenadas por descripción
     */
    List<Caja> findByIdSucursalOrderByDescripcionAsc(Long idSucursal);

    /**
     * MOSTRAR CAJAS ASIGNADAS A UN USUARIO
     * 
     * Replica función PostgreSQL:
     * CREATE FUNCTION mostrarcajasasignadas(_id_usuario integer)
     * RETURNS TABLE(id integer, sucursal_caja text, id_caja text, id_sucursal integer)
     * 
     * SQL:
     * SELECT ac.id, 
     *        CONCAT(s.nombre, ' - ', c.descripcion) AS sucursal_caja,
     *        ac.id_caja, 
     *        ac.id_sucursal
     * FROM asignacion_sucursal ac 
     * INNER JOIN caja c ON ac.id_caja = c.id
     * INNER JOIN sucursales s ON s.id = ac.id_sucursal 
     * WHERE ac.id_usuario = _id_usuario;
     * 
     * NOTA: Retorna un Map con los campos concatenados
     * 
     * @param idUsuario - ID del usuario
     * @return Lista de cajas asignadas con formato "Sucursal - Caja"
     */
    @Query("SELECT new map(" +
           "a.id as id, " +
           "CONCAT(s.nombre, ' - ', c.descripcion) as sucursalCaja, " +
           "a.idCaja as idCaja, " +
           "a.idSucursal as idSucursal) " +
           "FROM AsignacionSucursal a " +
           "INNER JOIN Caja c ON a.idCaja = c.id " +
           "INNER JOIN Sucursal s ON s.id = a.idSucursal " +
           "WHERE a.idUsuario = :idUsuario")
    List<Object> mostrarCajasAsignadas(@Param("idUsuario") Long idUsuario);

    /**
     * CONTAR CAJAS POR SUCURSAL
     * 
     * Útil para validar límites o estadísticas
     * 
     * @param idSucursal - ID de la sucursal
     * @return Cantidad de cajas
     */
    Long countByIdSucursal(Long idSucursal);

    /**
     * VALIDACIÓN: Descripción duplicada en misma sucursal
     * 
     * Para evitar cajas con misma descripción en una sucursal
     * 
     * @param descripcion - Descripción a validar
     * @param idSucursal - Sucursal
     * @return true si ya existe
     */
    boolean existsByDescripcionIgnoreCaseAndIdSucursal(String descripcion, Long idSucursal);

    /**
     * VALIDACIÓN: Descripción duplicada excluyendo registro actual (para EDIT)
     * 
     * @param descripcion - Descripción a validar
     * @param idSucursal - Sucursal
     * @param id - ID del registro que se está editando
     * @return true si existe otra con esa descripción
     */
    boolean existsByDescripcionIgnoreCaseAndIdSucursalAndIdNot(String descripcion, Long idSucursal, Long id);
}
