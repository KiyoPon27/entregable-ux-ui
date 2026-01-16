package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.models.TipoDocumento;
import tienda.posbackend.repositories.TipoDocumentoRepository;

import java.util.List;

/**
 * SERVICE: TipoDocumentoService
 * 
 * LÓGICA DE NEGOCIO PARA TIPOS DE DOCUMENTO
 * 
 * MIGRACIÓN FRONTEND:
 * ANTES: await supabase.from("tipodocumento").select().eq("id_empresa", 1)
 * AHORA: await axios.get("/api/tipodocumentos/mostrar", { params: { idEmpresa: 1 } })
 * 
 * FUNCIONALIDADES:
 * 1. mostrarTipoDocumentos() - Listar tipos de documento de una empresa
 * 2. insertarTipoDocumento() - Crear nuevo tipo
 * 3. editarTipoDocumento() - Actualizar tipo
 * 4. eliminarTipoDocumento() - Eliminar tipo
 * 
 * DOCUMENTOS COMUNES:
 * - DNI: Documento Nacional de Identidad (8 dígitos)
 * - RUC: Registro Único de Contribuyentes (11 dígitos)
 * - Pasaporte: Pasaporte internacional
 * - CE: Carnet de Extranjería
 * - Libreta Electoral: Libreta Electoral (legacy)
 * 
 * VALIDACIONES:
 * - Nombre único por empresa (case-insensitive)
 * - No eliminar si está en uso en clientes/proveedores
 */
@Service
public class TipoDocumentoService {

    @Autowired
    private TipoDocumentoRepository tipoDocumentoRepository;

    /**
     * ============================================================
     * MÉTODO: mostrarTipoDocumentos
     * ============================================================
     * 
     * POSTGRESQL RPC: mostrartipodocumentos(p_id_empresa)
     * 
     * SELECT * FROM tipodocumento 
     * WHERE id_empresa = p_id_empresa 
     * ORDER BY nombre ASC
     * 
     * FRONTEND:
     * const response = await axios.get("/api/tipodocumentos/mostrar", {
     *   params: { idEmpresa: 1 }
     * });
     * 
     * RETORNA:
     * [
     *   { id: 1, nombre: "DNI", idEmpresa: 1, icono: "🪖" },
     *   { id: 2, nombre: "RUC", idEmpresa: 1, icono: "📋" },
     *   { id: 3, nombre: "Pasaporte", idEmpresa: 1, icono: "✈️" }
     * ]
     */
    public List<TipoDocumento> mostrarTipoDocumentos(Long idEmpresa) {
        return tipoDocumentoRepository.findByIdEmpresaOrderByNombreAsc(idEmpresa);
    }

    /**
     * ============================================================
     * MÉTODO: insertarTipoDocumento
     * ============================================================
     * 
     * POSTGRESQL RPC: insertartipodocumento(...)
     * 
     * INSERT INTO tipodocumento (nombre, id_empresa, icono) 
     * VALUES (p_nombre, p_id_empresa, p_icono)
     * 
     * VALIDACIONES:
     * 1. Nombre no debe existir en la empresa (case-insensitive)
     * 
     * FRONTEND:
     * const response = await axios.post("/api/tipodocumentos/insertartipodocumento", {
     *   nombre: "Carnet de Extranjería",
     *   idEmpresa: 1,
     *   icono: "🌍",
     *   descripcion: "Documento de extranjeros residentes"
     * });
     */
    @Transactional
    public TipoDocumento insertarTipoDocumento(TipoDocumento tipoDocumento) {
        // VALIDACIÓN: Nombre único por empresa (case-insensitive)
        if (tipoDocumentoRepository.existsByNombreIgnoreCaseAndIdEmpresa(
            tipoDocumento.getNombre(), 
            tipoDocumento.getIdEmpresa()
        )) {
            throw new RuntimeException("Ya existe un tipo de documento con el nombre: " + tipoDocumento.getNombre());
        }

        return tipoDocumentoRepository.save(tipoDocumento);
    }

    /**
     * ============================================================
     * MÉTODO: editarTipoDocumento
     * ============================================================
     * 
     * POSTGRESQL RPC: editartipodocumento(...)
     * 
     * UPDATE tipodocumento 
     * SET nombre = p_nombre, icono = p_icono, descripcion = p_descripcion
     * WHERE id = p_id
     * 
     * VALIDACIONES:
     * 1. Si cambia nombre, verificar que no exista otro con ese nombre
     * 
     * FRONTEND:
     * const response = await axios.put("/api/tipodocumentos/editartipodocumento", {
     *   id: 5,
     *   nombre: "CE",
     *   icono: "🌍",
     *   descripcion: "Carnet de Extranjería"
     * });
     */
    @Transactional
    public TipoDocumento editarTipoDocumento(Long id, TipoDocumento tipoDocumentoActualizado) {
        TipoDocumento tipoDocumentoExistente = tipoDocumentoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("No se encontró tipo de documento con id: " + id));

        // VALIDACIÓN: Si cambia nombre, verificar unicidad
        if (tipoDocumentoActualizado.getNombre() != null && 
            !tipoDocumentoActualizado.getNombre().equalsIgnoreCase(tipoDocumentoExistente.getNombre())) {
            
            if (tipoDocumentoRepository.existsByNombreIgnoreCaseAndIdEmpresa(
                tipoDocumentoActualizado.getNombre(), 
                tipoDocumentoExistente.getIdEmpresa()
            )) {
                throw new RuntimeException("Ya existe un tipo de documento con el nombre: " + tipoDocumentoActualizado.getNombre());
            }
            
            tipoDocumentoExistente.setNombre(tipoDocumentoActualizado.getNombre());
        }

        // ACTUALIZAR CAMPOS
        if (tipoDocumentoActualizado.getIcono() != null) {
            tipoDocumentoExistente.setIcono(tipoDocumentoActualizado.getIcono());
        }
        if (tipoDocumentoActualizado.getDescripcion() != null) {
            tipoDocumentoExistente.setDescripcion(tipoDocumentoActualizado.getDescripcion());
        }

        return tipoDocumentoRepository.save(tipoDocumentoExistente);
    }

    /**
     * ============================================================
     * MÉTODO: eliminarTipoDocumento
     * ============================================================
     * 
     * POSTGRESQL RPC: eliminartipodocumento(p_id)
     * 
     * DELETE FROM tipodocumento WHERE id = p_id
     * 
     * VALIDACIONES:
     * - En PostgreSQL se valida con FK constraint
     * - Aquí se podría agregar validación con clientes_proveedores
     * 
     * FRONTEND:
     * const response = await axios.delete("/api/tipodocumentos/eliminartipodocumento/5");
     */
    @Transactional
    public void eliminarTipoDocumento(Long id) {
        TipoDocumento tipoDocumento = tipoDocumentoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("No se encontró tipo de documento con id: " + id));

        // TODO: Agregar validación si está en uso en clientes_proveedores
        // if (clienteProveedorRepository.existsByIdTipoDocumento(id)) {
        //     throw new RuntimeException("No se puede eliminar porque está en uso");
        // }

        tipoDocumentoRepository.delete(tipoDocumento);
    }

    /**
     * ============================================================
     * MÉTODO AUXILIAR: obtenerTipoDocumento
     * ============================================================
     */
    public TipoDocumento obtenerTipoDocumento(Long id) {
        return tipoDocumentoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("No se encontró tipo de documento con id: " + id));
    }

    /**
     * ============================================================
     * MÉTODO AUXILIAR: buscarPorNombre
     * ============================================================
     */
    public TipoDocumento buscarPorNombre(String nombre, Long idEmpresa) {
        return tipoDocumentoRepository.findByNombreIgnoreCaseAndIdEmpresa(nombre, idEmpresa)
            .orElseThrow(() -> new RuntimeException("No se encontró tipo de documento con nombre: " + nombre));
    }

    /**
     * ============================================================
     * MÉTODO AUXILIAR: contarTipoDocumentos
     * ============================================================
     */
    public Long contarTipoDocumentos(Long idEmpresa) {
        return tipoDocumentoRepository.countByIdEmpresa(idEmpresa);
    }

    /**
     * ============================================================
     * MÉTODO AUXILIAR: crearTiposDocumentoDefault
     * ============================================================
     * 
     * Crear tipos de documento por defecto al crear empresa
     * 
     * Se llama desde EmpresaService.insertarEmpresa() después de crear empresa
     * 
     * TIPOS DEFAULT:
     * - DNI (Documento Nacional de Identidad)
     * - RUC (Registro Único de Contribuyentes)
     * - Pasaporte
     */
    @Transactional
    public void crearTiposDocumentoDefault(Long idEmpresa) {
        // DNI
        TipoDocumento dni = new TipoDocumento();
        dni.setNombre("DNI");
        dni.setIdEmpresa(idEmpresa);
        dni.setIcono("🪖");
        dni.setDescripcion("Documento Nacional de Identidad");
        tipoDocumentoRepository.save(dni);

        // RUC
        TipoDocumento ruc = new TipoDocumento();
        ruc.setNombre("RUC");
        ruc.setIdEmpresa(idEmpresa);
        ruc.setIcono("📋");
        ruc.setDescripcion("Registro Único de Contribuyentes");
        tipoDocumentoRepository.save(ruc);

        // Pasaporte
        TipoDocumento pasaporte = new TipoDocumento();
        pasaporte.setNombre("Pasaporte");
        pasaporte.setIdEmpresa(idEmpresa);
        pasaporte.setIcono("✈️");
        pasaporte.setDescripcion("Pasaporte internacional");
        tipoDocumentoRepository.save(pasaporte);
    }
}
