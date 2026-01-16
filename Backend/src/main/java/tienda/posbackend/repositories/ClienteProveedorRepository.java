package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tienda.posbackend.models.ClienteProveedor;

import java.util.List;
import java.util.Optional;

/**
 * REPOSITORY: ClienteProveedorRepository
 * 
 * Interface que extiende JpaRepository para operaciones CRUD automáticas.
 * Spring Data JPA genera la implementación automáticamente.
 * 
 * FUNCIONES PRINCIPALES:
 * 1. Métodos CRUD heredados: save(), findById(), findAll(), deleteById()
 * 2. Queries personalizados para replicar funciones PostgreSQL
 * 3. Validaciones de duplicados (PERFORM 1 FROM... de PostgreSQL)
 */
public interface ClienteProveedorRepository extends JpaRepository<ClienteProveedor, Long> {

    /**
     * MOSTRAR CLIENTES/PROVEEDORES POR EMPRESA Y TIPO
     * 
     * SQL Equivalente:
     * SELECT * FROM clientes_proveedores 
     * WHERE id_empresa = ? AND tipo = ?
     * ORDER BY nombres ASC
     * 
     * @param idEmpresa - Filtro por empresa
     * @param tipo - 'cliente', 'proveedor' o '-' (genérico)
     * @return Lista de clientes/proveedores ordenados alfabéticamente
     */
    @Query("SELECT c FROM ClienteProveedor c " +
           "WHERE c.idEmpresa = :idEmpresa AND c.tipo = :tipo " +
           "ORDER BY c.nombres ASC")
    List<ClienteProveedor> findByIdEmpresaAndTipo(
        @Param("idEmpresa") Long idEmpresa, 
        @Param("tipo") String tipo
    );

    /**
     * BUSCAR CLIENTES/PROVEEDORES CON FILTRO DE TEXTO
     * 
     * Replica función PostgreSQL: No existe una específica, pero se usa en frontend
     * Búsqueda por nombre, identificador nacional o fiscal
     * 
     * LOWER() hace la búsqueda case-insensitive (como PostgreSQL)
     * 
     * @param idEmpresa - Filtro por empresa
     * @param buscador - Texto a buscar (puede ser nombre, DNI, RUC, etc.)
     * @return Lista de coincidencias
     */
    @Query("SELECT c FROM ClienteProveedor c " +
           "WHERE c.idEmpresa = :idEmpresa AND " +
           "(LOWER(c.nombres) LIKE LOWER(CONCAT('%', :buscador, '%')) OR " +
           "LOWER(c.identificadorNacional) LIKE LOWER(CONCAT('%', :buscador, '%')) OR " +
           "LOWER(c.identificadorFiscal) LIKE LOWER(CONCAT('%', :buscador, '%'))) " +
           "ORDER BY c.nombres ASC")
    List<ClienteProveedor> buscarClientesProveedores(
        @Param("idEmpresa") Long idEmpresa, 
        @Param("buscador") String buscador
    );

    // ========================================================================
    // VALIDACIONES DE DUPLICADOS (Replicando PERFORM 1 FROM... de PostgreSQL)
    // ========================================================================

    /**
     * VALIDACIÓN 1: Nombres duplicados
     * 
     * PostgreSQL:
     * PERFORM 1 FROM clientes_proveedores 
     * WHERE LOWER(nombres) = LOWER(_nombres) AND tipo = _tipo AND id_empresa = _id_empresa
     * 
     * IgnoreCase = LOWER() en PostgreSQL
     * 
     * @param nombres - Nombre a validar
     * @param tipo - Tipo (cliente/proveedor)
     * @param idEmpresa - Empresa a la que pertenece
     * @return Optional con el registro si existe (para INSERT)
     */
    Optional<ClienteProveedor> findByNombresIgnoreCaseAndTipoAndIdEmpresa(
        String nombres, 
        String tipo, 
        Long idEmpresa
    );

    /**
     * VALIDACIÓN 2: Identificador Fiscal duplicado
     * 
     * PostgreSQL:
     * PERFORM 1 FROM clientes_proveedores 
     * WHERE LOWER(identificador_fiscal) = LOWER(_identificador_fiscal) AND tipo = _tipo
     * 
     * @param identificadorFiscal - RUC, CUIT, RFC, etc.
     * @param tipo - Tipo (cliente/proveedor)
     * @return Optional con el registro si existe
     */
    Optional<ClienteProveedor> findByIdentificadorFiscalIgnoreCaseAndTipo(
        String identificadorFiscal, 
        String tipo
    );

    /**
     * VALIDACIÓN 3: Identificador Nacional duplicado
     * 
     * PostgreSQL:
     * PERFORM 1 FROM clientes_proveedores 
     * WHERE LOWER(identificador_nacional) = LOWER(_identificador_nacional) AND tipo = _tipo
     * 
     * @param identificadorNacional - DNI, RUT, CI, etc.
     * @param tipo - Tipo (cliente/proveedor)
     * @return Optional con el registro si existe
     */
    Optional<ClienteProveedor> findByIdentificadorNacionalIgnoreCaseAndTipo(
        String identificadorNacional, 
        String tipo
    );

    /**
     * VALIDACIÓN 4: Para EDITAR - Excluir el registro actual (id != _id)
     * 
     * PostgreSQL:
     * PERFORM 1 FROM clientes_proveedores 
     * WHERE LOWER(nombres) = LOWER(_nombres) AND tipo = _tipo AND id != _id AND id_empresa = _id_empresa
     * 
     * @param nombres - Nombre a validar
     * @param tipo - Tipo (cliente/proveedor)
     * @param id - ID del registro que se está editando (para excluirlo)
     * @param idEmpresa - Empresa
     * @return Optional con el registro duplicado si existe
     */
    Optional<ClienteProveedor> findByNombresIgnoreCaseAndTipoAndIdNotAndIdEmpresa(
        String nombres, 
        String tipo, 
        Long id, 
        Long idEmpresa
    );

    /**
     * VALIDACIÓN 5: Para EDITAR - Identificador Fiscal (excluyendo ID actual)
     */
    Optional<ClienteProveedor> findByIdentificadorFiscalIgnoreCaseAndTipoAndIdNot(
        String identificadorFiscal, 
        String tipo, 
        Long id
    );

    /**
     * VALIDACIÓN 6: Para EDITAR - Identificador Nacional (excluyendo ID actual)
     */
    Optional<ClienteProveedor> findByIdentificadorNacionalIgnoreCaseAndTipoAndIdNot(
        String identificadorNacional, 
        String tipo, 
        Long id
    );

    /**
     * BUSCAR CLIENTE GENÉRICO POR EMPRESA
     * 
     * Se usa en el trigger asignarclientegenerico de PostgreSQL
     * Busca el cliente con tipo = '-' (genérico) para asignar a ventas sin cliente
     * 
     * @param idEmpresa - ID de la empresa
     * @return Cliente genérico de la empresa
     */
    @Query("SELECT c FROM ClienteProveedor c " +
           "WHERE c.idEmpresa = :idEmpresa AND c.tipo = '-'")
    Optional<ClienteProveedor> findClienteGenericoPorEmpresa(@Param("idEmpresa") Long idEmpresa);
}
