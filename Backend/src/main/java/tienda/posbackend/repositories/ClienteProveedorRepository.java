package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import tienda.posbackend.entities.ClienteProveedor;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteProveedorRepository extends JpaRepository<ClienteProveedor, Long> {
    
    // Listar por empresa
    List<ClienteProveedor> findByEmpresaIdOrderByFechaRegistroDesc(Long idEmpresa);
    
    // Listar por tipo (CLIENTE, PROVEEDOR, AMBOS)
    List<ClienteProveedor> findByEmpresaIdAndTipoOrderByNombresAsc(Long idEmpresa, String tipo);
    
    // Listar por estado
    List<ClienteProveedor> findByEmpresaIdAndEstadoOrderByNombresAsc(Long idEmpresa, String estado);
    
    // Buscar por nombre (like)
    @Query("SELECT cp FROM ClienteProveedor cp WHERE cp.empresa.id = :idEmpresa " +
           "AND LOWER(cp.nombres) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<ClienteProveedor> buscarPorNombre(@Param("idEmpresa") Long idEmpresa, @Param("query") String query);
    
    // Validaciones de duplicados para INSERT
    // Verifica si existe un cliente/proveedor con el mismo nombre Y mismo tipo en la empresa
    @Query("SELECT cp FROM ClienteProveedor cp WHERE cp.empresa.id = :idEmpresa " +
           "AND LOWER(cp.nombres) = LOWER(:nombres) AND cp.tipo = :tipo")
    Optional<ClienteProveedor> findByEmpresaIdAndNombresIgnoreCaseAndTipo(
        @Param("idEmpresa") Long idEmpresa, 
        @Param("nombres") String nombres, 
        @Param("tipo") String tipo
    );
    
    // Verifica si existe un cliente/proveedor con el mismo identificador fiscal Y mismo tipo
    @Query("SELECT cp FROM ClienteProveedor cp WHERE cp.empresa.id = :idEmpresa " +
           "AND LOWER(cp.identificadorFiscal) = LOWER(:identificadorFiscal) " +
           "AND cp.tipo = :tipo AND cp.identificadorFiscal != '-'")
    Optional<ClienteProveedor> findByEmpresaIdAndIdentificadorFiscalIgnoreCaseAndTipo(
        @Param("idEmpresa") Long idEmpresa, 
        @Param("identificadorFiscal") String identificadorFiscal, 
        @Param("tipo") String tipo
    );
    
    // Verifica si existe un cliente/proveedor con el mismo identificador nacional Y mismo tipo
    @Query("SELECT cp FROM ClienteProveedor cp WHERE cp.empresa.id = :idEmpresa " +
           "AND LOWER(cp.identificadorNacional) = LOWER(:identificadorNacional) " +
           "AND cp.tipo = :tipo AND cp.identificadorNacional != '-'")
    Optional<ClienteProveedor> findByEmpresaIdAndIdentificadorNacionalIgnoreCaseAndTipo(
        @Param("idEmpresa") Long idEmpresa, 
        @Param("identificadorNacional") String identificadorNacional, 
        @Param("tipo") String tipo
    );
    
    // Validaciones de duplicados para UPDATE (excluye el ID actual)
    @Query("SELECT cp FROM ClienteProveedor cp WHERE cp.empresa.id = :idEmpresa " +
           "AND LOWER(cp.nombres) = LOWER(:nombres) AND cp.tipo = :tipo AND cp.id != :id")
    Optional<ClienteProveedor> findByEmpresaIdAndNombresIgnoreCaseAndTipoExcludingId(
        @Param("idEmpresa") Long idEmpresa, 
        @Param("nombres") String nombres, 
        @Param("tipo") String tipo,
        @Param("id") Long id
    );
    
    @Query("SELECT cp FROM ClienteProveedor cp WHERE cp.empresa.id = :idEmpresa " +
           "AND LOWER(cp.identificadorFiscal) = LOWER(:identificadorFiscal) " +
           "AND cp.tipo = :tipo AND cp.identificadorFiscal != '-' AND cp.id != :id")
    Optional<ClienteProveedor> findByEmpresaIdAndIdentificadorFiscalIgnoreCaseAndTipoExcludingId(
        @Param("idEmpresa") Long idEmpresa, 
        @Param("identificadorFiscal") String identificadorFiscal, 
        @Param("tipo") String tipo,
        @Param("id") Long id
    );
    
    @Query("SELECT cp FROM ClienteProveedor cp WHERE cp.empresa.id = :idEmpresa " +
           "AND LOWER(cp.identificadorNacional) = LOWER(:identificadorNacional) " +
           "AND cp.tipo = :tipo AND cp.identificadorNacional != '-' AND cp.id != :id")
    Optional<ClienteProveedor> findByEmpresaIdAndIdentificadorNacionalIgnoreCaseAndTipoExcludingId(
        @Param("idEmpresa") Long idEmpresa, 
        @Param("identificadorNacional") String identificadorNacional, 
        @Param("tipo") String tipo,
        @Param("id") Long id
    );
}
