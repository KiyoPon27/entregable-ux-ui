package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.models.MetodoPago;
import tienda.posbackend.repositories.MetodoPagoRepository;

import java.util.List;

/**
 * SERVICE: MetodoPagoService
 * 
 * LÓGICA DE NEGOCIO PARA MÉTODOS DE PAGO
 * 
 * IMPORTANTE:
 * - Nombre único por empresa (case-insensitive)
 * - Métodos predeterminados (delete_update=false) NO se pueden eliminar
 * - Al crear empresa, se insertan 4 métodos por defecto:
 *   1. Efectivo, 2. Tarjeta, 3. Crédito, 4. Mixto
 * 
 * POSTGRESQL ORIGINAL:
 * - Trigger insertpordefecto() crea métodos al insertar empresa
 * - CONSTRAINT unique_nombre_id_empresa
 */
@Service
@Transactional
public class MetodoPagoService {

    @Autowired
    private MetodoPagoRepository repository;

    /**
     * ============================================================
     * FUNCIÓN: mostrarmetodospago
     * ============================================================
     * 
     * REPLICADA DE POSTGRESQL
     * 
     * Lista métodos de pago de una empresa
     * 
     * FRONTEND:
     * const response = await axios.get("/api/metodospago/mostrar", {
     *   params: { idEmpresa: 1 }
     * });
     * 
     * @param idEmpresa - ID de la empresa
     * @return Lista ordenada alfabéticamente
     */
    public List<MetodoPago> mostrarMetodosPago(Long idEmpresa) {
        return repository.findByIdEmpresaOrderByNombreAsc(idEmpresa);
    }

    /**
     * ============================================================
     * FUNCIÓN: insertarmetodopago
     * ============================================================
     * 
     * REPLICADA DE POSTGRESQL
     * 
     * Inserta un nuevo método de pago
     * 
     * VALIDACIONES:
     * 1. Nombre único por empresa (case-insensitive)
     * 2. idEmpresa obligatorio
     * 
     * POSTGRESQL ORIGINAL:
     * PERFORM 1 FROM metodos_pago 
     * WHERE LOWER(nombre) = LOWER(?) AND id_empresa = ?
     * IF FOUND THEN RAISE EXCEPTION 'Datos duplicados'
     * 
     * @param metodoPago - Datos del método
     * @return Método creado
     * @throws Exception si hay duplicados
     */
    public MetodoPago insertarMetodoPago(MetodoPago metodoPago) throws Exception {
        
        // VALIDACIÓN 1: idEmpresa obligatorio
        if (metodoPago.getIdEmpresa() == null) {
            throw new Exception("El campo idEmpresa es obligatorio");
        }

        // VALIDACIÓN 2: Nombre obligatorio
        if (metodoPago.getNombre() == null || metodoPago.getNombre().trim().isEmpty()) {
            throw new Exception("El nombre del método de pago es obligatorio");
        }

        // VALIDACIÓN 3: Nombre duplicado en empresa
        if (repository.existsByNombreIgnoreCaseAndIdEmpresa(
            metodoPago.getNombre(), 
            metodoPago.getIdEmpresa())
        ) {
            throw new Exception("Ya existe un método de pago con ese nombre en esta empresa");
        }

        // Valores por defecto
        if (metodoPago.getIcono() == null) {
            metodoPago.setIcono("-");
        }
        if (metodoPago.getVerNombre() == null) {
            metodoPago.setVerNombre(true);
        }
        if (metodoPago.getDeleteUpdate() == null) {
            metodoPago.setDeleteUpdate(true); // Métodos personalizados SÍ editables
        }

        return repository.save(metodoPago);
    }

    /**
     * ============================================================
     * FUNCIÓN: editarmetodopago
     * ============================================================
     * 
     * REPLICADA DE POSTGRESQL
     * 
     * Edita un método de pago existente
     * 
     * VALIDACIONES:
     * 1. Debe existir
     * 2. Nombre único (excluyendo actual)
     * 3. Solo editar si deleteUpdate = true (proteger predeterminados)
     * 
     * @param id - ID del método
     * @param metodoPago - Nuevos datos
     * @throws Exception si no cumple validaciones
     */
    public void editarMetodoPago(Long id, MetodoPago metodoPago) throws Exception {
        
        // Verificar que existe
        MetodoPago existente = repository.findById(id)
            .orElseThrow(() -> new Exception("Método de pago no encontrado"));

        // VALIDACIÓN 1: Solo editar métodos personalizados
        if (!existente.getDeleteUpdate()) {
            throw new Exception("No se puede editar un método de pago predeterminado del sistema");
        }

        // VALIDACIÓN 2: Nombre duplicado (excluyendo actual)
        if (repository.existsByNombreIgnoreCaseAndIdEmpresaAndIdNot(
            metodoPago.getNombre(), 
            metodoPago.getIdEmpresa(), 
            id)
        ) {
            throw new Exception("Ya existe otro método de pago con ese nombre en esta empresa");
        }

        // Actualizar campos
        existente.setNombre(metodoPago.getNombre());
        existente.setIcono(metodoPago.getIcono());
        existente.setVerNombre(metodoPago.getVerNombre());
        
        // idEmpresa y deleteUpdate NO se modifican

        repository.save(existente);
    }

    /**
     * ============================================================
     * FUNCIÓN: eliminarmetodopago
     * ============================================================
     * 
     * REPLICADA DE POSTGRESQL
     * 
     * Elimina un método de pago
     * 
     * VALIDACIONES:
     * 1. Debe existir
     * 2. Solo eliminar si deleteUpdate = true
     * 
     * IMPORTANTE:
     * No eliminar métodos predeterminados (Efectivo, Tarjeta, etc.)
     * 
     * @param id - ID del método
     * @throws Exception si es predeterminado o tiene movimientos asociados
     */
    public void eliminarMetodoPago(Long id) throws Exception {
        
        MetodoPago metodoPago = repository.findById(id)
            .orElseThrow(() -> new Exception("Método de pago no encontrado"));

        // VALIDACIÓN 1: Solo eliminar personalizados
        if (!metodoPago.getDeleteUpdate()) {
            throw new Exception("No se puede eliminar un método de pago predeterminado del sistema");
        }

        // VALIDACIÓN 2: Verificar si tiene movimientos de caja asociados
        // TODO: Validar con MovimientoCajaRepository si existe algún registro
        // if (movimientoCajaRepository.existsByIdMetodoPago(id)) {
        //     throw new Exception("No se puede eliminar porque tiene movimientos asociados");
        // }

        repository.deleteById(id);
    }

    /**
     * ============================================================
     * FUNCIÓN AUXILIAR: Obtener método por nombre
     * ============================================================
     * 
     * Para búsquedas específicas (ej: obtener ID de "Efectivo")
     * 
     * @param nombre - Nombre del método (case-insensitive)
     * @param idEmpresa - ID de la empresa
     * @return Método o null
     */
    public MetodoPago obtenerPorNombre(String nombre, Long idEmpresa) {
        return repository.findByNombreIgnoreCaseAndIdEmpresa(nombre, idEmpresa).orElse(null);
    }

    /**
     * ============================================================
     * FUNCIÓN: Obtener método por ID
     * ============================================================
     * 
     * @param id - ID del método
     * @return Método o null
     */
    public MetodoPago obtenerMetodoPago(Long id) {
        return repository.findById(id).orElse(null);
    }

    /**
     * ============================================================
     * FUNCIÓN: Contar métodos por empresa
     * ============================================================
     * 
     * @param idEmpresa - ID de la empresa
     * @return Cantidad de métodos
     */
    public Long contarMetodosPago(Long idEmpresa) {
        return repository.countByIdEmpresa(idEmpresa);
    }

    /**
     * ============================================================
     * FUNCIÓN: Listar métodos editables
     * ============================================================
     * 
     * Solo métodos personalizados (deleteUpdate = true)
     * 
     * @param idEmpresa - ID de la empresa
     * @return Lista de métodos editables
     */
    public List<MetodoPago> listarEditables(Long idEmpresa) {
        return repository.findByIdEmpresaAndDeleteUpdateTrue(idEmpresa);
    }
}
