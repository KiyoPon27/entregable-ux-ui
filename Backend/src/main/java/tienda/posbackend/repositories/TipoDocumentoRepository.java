package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tienda.posbackend.models.TipoDocumento;

import java.util.List;
import java.util.Optional;

/**
 * REPOSITORY: TipoDocumentoRepository
 * 
 * DATA ACCESS LAYER PARA TIPOS DE DOCUMENTO
 * 
 * REPLICACIÓN POSTGRESQL:
 * - mostrartipodocumentos(p_id_empresa) → findByIdEmpresaOrderByNombreAsc()
 * 
 * IMPORTANTE:
 * - Cada empresa tiene sus propios tipos de documento
 * - Catálogo de referencia para validar documentos
 */
@Repository
public interface TipoDocumentoRepository extends JpaRepository<TipoDocumento, Long> {

    /**
     * ============================================================
     * MÉTODO: findByIdEmpresaOrderByNombreAsc
     * ============================================================
     * 
     * POSTGRESQL RPC: mostrartipodocumentos(p_id_empresa)
     * 
     * SELECT * FROM tipodocumento 
     * WHERE id_empresa = ? 
     * ORDER BY nombre ASC
     */
    List<TipoDocumento> findByIdEmpresaOrderByNombreAsc(Long idEmpresa);

    /**
     * ============================================================
     * MÉTODO: existsByNombreIgnoreCaseAndIdEmpresa
     * ============================================================
     * 
     * Verificar si ya existe un tipo de documento con el mismo nombre
     * (case-insensitive) en la empresa
     */
    boolean existsByNombreIgnoreCaseAndIdEmpresa(String nombre, Long idEmpresa);

    /**
     * ============================================================
     * MÉTODO: findByNombreIgnoreCaseAndIdEmpresa
     * ============================================================
     * 
     * Buscar tipo de documento por nombre exacto (case-insensitive)
     */
    Optional<TipoDocumento> findByNombreIgnoreCaseAndIdEmpresa(String nombre, Long idEmpresa);

    /**
     * ============================================================
     * MÉTODO: countByIdEmpresa
     * ============================================================
     * 
     * Contar tipos de documento de una empresa
     */
    @Query("SELECT COUNT(t) FROM TipoDocumento t WHERE t.idEmpresa = :idEmpresa")
    Long countByIdEmpresa(Long idEmpresa);
}
