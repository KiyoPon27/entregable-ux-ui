package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tienda.posbackend.models.Almacen;

import java.util.List;
import java.util.Optional;

/**
 * REPOSITORY: AlmacenRepository
 * 
 * QUERIES PRINCIPALES:
 * 1. Mostrar almacenes por sucursal
 * 2. Obtener almacén por defecto de una sucursal
 * 3. Validaciones de duplicados y reglas de negocio
 */
public interface AlmacenRepository extends JpaRepository<Almacen, Long> {

    /**
     * MOSTRAR ALMACENES POR SUCURSAL
     * 
     * SQL:
     * SELECT * FROM almacen WHERE id_sucursal = ? ORDER BY nombre ASC
     * 
     * @param idSucursal - Filtro por sucursal
     * @return Lista de almacenes ordenados alfabéticamente
     */
    List<Almacen> findByIdSucursalOrderByNombreAsc(Long idSucursal);

    /**
     * OBTENER ALMACÉN POR DEFECTO DE UNA SUCURSAL
     * 
     * SQL:
     * SELECT * FROM almacen WHERE id_sucursal = ? AND `default` = 1 LIMIT 1
     * 
     * IMPORTANTE: Solo debe haber UN almacén por defecto por sucursal
     * 
     * @param idSucursal - ID de la sucursal
     * @return Almacén por defecto (si existe)
     */
    @Query("SELECT a FROM Almacen a WHERE a.idSucursal = :idSucursal AND a.isDefault = true")
    Optional<Almacen> findAlmacenDefaultPorSucursal(@Param("idSucursal") Long idSucursal);

    /**
     * CONTAR ALMACENES POR SUCURSAL
     * 
     * Útil para validar límites o estadísticas
     * 
     * @param idSucursal - ID de la sucursal
     * @return Cantidad de almacenes
     */
    Long countByIdSucursal(Long idSucursal);

    /**
     * CONTAR ALMACENES POR DEFECTO EN UNA SUCURSAL
     * 
     * Debe ser siempre 0 o 1
     * Usado para validar antes de crear otro almacén por defecto
     * 
     * @param idSucursal - ID de la sucursal
     * @return Cantidad de almacenes por defecto (debe ser 0 o 1)
     */
    @Query("SELECT COUNT(a) FROM Almacen a WHERE a.idSucursal = :idSucursal AND a.isDefault = true")
    Long countAlmacenesDefaultPorSucursal(@Param("idSucursal") Long idSucursal);

    /**
     * VALIDACIÓN: Nombre duplicado en misma sucursal
     * 
     * Para evitar almacenes con mismo nombre en una sucursal
     * 
     * @param nombre - Nombre a validar
     * @param idSucursal - Sucursal
     * @return true si ya existe
     */
    boolean existsByNombreIgnoreCaseAndIdSucursal(String nombre, Long idSucursal);

    /**
     * VALIDACIÓN: Nombre duplicado excluyendo registro actual (para EDIT)
     * 
     * @param nombre - Nombre a validar
     * @param idSucursal - Sucursal
     * @param id - ID del registro que se está editando
     * @return true si existe otro con ese nombre
     */
    boolean existsByNombreIgnoreCaseAndIdSucursalAndIdNot(String nombre, Long idSucursal, Long id);

    /**
     * BUSCAR ALMACÉN POR ID Y SUCURSAL
     * 
     * Útil para validar que un almacén pertenece a una sucursal específica
     * 
     * @param id - ID del almacén
     * @param idSucursal - ID de la sucursal
     * @return Almacén si existe y pertenece a esa sucursal
     */
    Optional<Almacen> findByIdAndIdSucursal(Long id, Long idSucursal);
}
