package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tienda.posbackend.models.Sucursal;

import java.util.List;

/**
 * REPOSITORY: SucursalRepository
 * 
 * QUERIES PRINCIPALES:
 * 1. Mostrar sucursales por empresa
 * 2. Mostrar sucursales asignadas a usuario (mostrarsucursalesasignadas)
 * 3. Obtener sucursales con sus cajas
 */
public interface SucursalRepository extends JpaRepository<Sucursal, Long> {

    /**
     * MOSTRAR SUCURSALES POR EMPRESA
     * 
     * SQL:
     * SELECT * FROM sucursales WHERE id_empresa = ? ORDER BY nombre ASC
     * 
     * @param idEmpresa - Filtro por empresa
     * @return Lista de sucursales ordenadas alfabéticamente
     */
    List<Sucursal> findByIdEmpresaOrderByNombreAsc(Long idEmpresa);

    /**
     * MOSTRAR SUCURSALES ASIGNADAS A UN USUARIO
     * 
     * Replica función PostgreSQL:
     * CREATE FUNCTION mostrarsucursalesasignadas(_id_usuario integer)
     * RETURNS TABLE(id_sucursal integer, sucursal text, id_usuario integer, id_asignacion_sucursal integer)
     * 
     * SQL:
     * select s.id as id_sucursal, s.nombre as sucursal, a.id_usuario, a.id as id_asignacion_sucursal  
     * from asignacion_sucursal as a 
     * inner join sucursales as s on s.id = a.id_sucursal
     * where a.id_usuario = _id_usuario;
     * 
     * NOTA: Retorna un DTO personalizado con los campos específicos
     * 
     * @param idUsuario - ID del usuario
     * @return Lista de sucursales asignadas con datos de asignación
     */
    @Query("SELECT new map(" +
           "s.id as idSucursal, " +
           "s.nombre as sucursal, " +
           "a.idUsuario as idUsuario, " +
           "a.id as idAsignacionSucursal) " +
           "FROM AsignacionSucursal a " +
           "INNER JOIN Sucursal s ON s.id = a.idSucursal " +
           "WHERE a.idUsuario = :idUsuario")
    List<Object> mostrarSucursalesAsignadas(@Param("idUsuario") Long idUsuario);

    /**
     * CONTAR SUCURSALES POR EMPRESA
     * 
     * Útil para validar límites o estadísticas
     * 
     * @param idEmpresa - ID de la empresa
     * @return Cantidad de sucursales
     */
    Long countByIdEmpresa(Long idEmpresa);

    /**
     * VALIDACIÓN: Nombre duplicado en misma empresa
     * 
     * Para evitar sucursales con mismo nombre
     * 
     * @param nombre - Nombre a validar
     * @param idEmpresa - Empresa
     * @return true si ya existe
     */
    boolean existsByNombreIgnoreCaseAndIdEmpresa(String nombre, Long idEmpresa);

    /**
     * VALIDACIÓN: Nombre duplicado excluyendo registro actual (para EDIT)
     * 
     * @param nombre - Nombre a validar
     * @param idEmpresa - Empresa
     * @param id - ID del registro que se está editando
     * @return true si existe otro con ese nombre
     */
    boolean existsByNombreIgnoreCaseAndIdEmpresaAndIdNot(String nombre, Long idEmpresa, Long id);
}
