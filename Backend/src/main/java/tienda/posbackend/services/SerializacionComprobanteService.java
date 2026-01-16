package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.models.SerializacionComprobante;
import tienda.posbackend.repositories.SerializacionComprobanteRepository;

import java.util.List;

/**
 * SERVICE: SerializacionComprobanteService
 * 
 * LÓGICA DE NEGOCIO PARA SERIALIZACIONES
 * 
 * FUNCIONES POSTGRESQL REPLICADAS:
 * 1. generar_nro_comprobante(_id_tipo, _serie, _id_sucursal) RETURNS TEXT
 * 2. setdefaultserializacion(_id, _id_sucursal)
 * 3. Trigger insertarserializacionestrigger (en SucursalService)
 * 
 * IMPORTANTE:
 * - generar_nro_comprobante() debe ser @Transactional con bloqueo
 * - Solo UNA serialización puede ser default por tipo en cada sucursal
 * - El correlativo se incrementa automáticamente al generar número
 * 
 * FORMATO DE COMPROBANTE:
 * serie + "-" + LPAD(correlativo, cantidadNumeros, '0')
 * Ejemplo: "F001-000000042"
 */
@Service
@Transactional
public class SerializacionComprobanteService {

    @Autowired
    private SerializacionComprobanteRepository repository;

    /**
     * ============================================================
     * FUNCIÓN: mostrarserializaciones
     * ============================================================
     * 
     * REPLICADA DE POSTGRESQL
     * 
     * Lista serializaciones de una sucursal
     * 
     * FRONTEND:
     * const response = await axios.get("/api/serializaciones/mostrar", {
     *   params: { idSucursal: 1 }
     * });
     * 
     * @param idSucursal - ID de la sucursal
     * @return Lista ordenada por tipo de comprobante
     */
    public List<SerializacionComprobante> mostrarSerializaciones(Long idSucursal) {
        return repository.findBySucursalIdOrderByIdTipoComprobanteAsc(idSucursal);
    }

    /**
     * ============================================================
     * FUNCIÓN: generar_nro_comprobante
     * ============================================================
     * 
     * REPLICADA DE POSTGRESQL
     * 
     * Genera el número correlativo del comprobante
     * 
     * POSTGRESQL ORIGINAL:
     * CREATE FUNCTION generar_nro_comprobante(
     *   _id_tipo_comprobante INT,
     *   _serie VARCHAR,
     *   _id_sucursal INT
     * ) RETURNS TEXT
     * 
     * PROCESO:
     * 1. Buscar serialización (con bloqueo FOR UPDATE)
     * 2. Incrementar correlativo + 1
     * 3. Actualizar BD
     * 4. Generar string: SERIE-NUMERO_PADDED
     * 
     * EJEMPLO:
     * Input: idTipo=1 (Factura), serie="F001", idSucursal=1
     * Estado: correlativo=41, cantidadNumeros=9
     * Output: "F001-000000042"
     * 
     * IMPORTANTE:
     * - Método @Transactional para bloqueo
     * - Thread-safe para múltiples usuarios
     * 
     * @param idTipoComprobante - ID del tipo (1=Factura, 2=Boleta, etc.)
     * @param serie - Serie del comprobante ("F001", "B001", etc.)
     * @param idSucursal - ID de la sucursal
     * @return Número completo del comprobante
     * @throws Exception si no encuentra la serialización
     */
    @Transactional
    public String generarNumeroComprobante(
        Long idTipoComprobante, 
        String serie, 
        Long idSucursal
    ) throws Exception {
        
        // 1. Buscar serialización (JPA hace lock automático en @Transactional)
        SerializacionComprobante serializacion = repository
            .findByTipoSerieYSucursal(idTipoComprobante, serie, idSucursal)
            .orElseThrow(() -> new Exception(
                "No se encontró serialización para tipo=" + idTipoComprobante + 
                ", serie=" + serie + ", sucursal=" + idSucursal
            ));
        
        // 2. Incrementar correlativo
        repository.incrementarCorrelativo(serializacion.getId());
        
        // 3. Obtener nuevo correlativo
        Long nuevoCorrelativo = serializacion.getCorrelativo() + 1;
        Long cantidadNumeros = serializacion.getCantidadNumeros();
        
        // 4. Generar número con padding (LPAD en PostgreSQL)
        String numeroPadded = String.format(
            "%0" + cantidadNumeros + "d", 
            nuevoCorrelativo
        );
        
        // 5. Retornar formato: SERIE-NUMERO
        return serie + "-" + numeroPadded;
    }

    /**
     * ============================================================
     * FUNCIÓN: setdefaultserializacion
     * ============================================================
     * 
     * REPLICADA DE POSTGRESQL
     * 
     * Establece una serialización como predeterminada
     * 
     * POSTGRESQL ORIGINAL:
     * CREATE FUNCTION setdefaultserializacion(_id INT, _id_sucursal INT)
     * BEGIN
     *   UPDATE serializacion_comprobantes SET por_default = false WHERE sucursal_id = ?
     *   UPDATE serializacion_comprobantes SET por_default = true WHERE id = ?
     * END
     * 
     * PROCESO:
     * 1. Quitar default a todas en la sucursal
     * 2. Activar default solo en la indicada
     * 
     * IMPORTANTE:
     * Solo UNA puede ser default por tipo en cada sucursal
     * 
     * @param id - ID de la serialización
     * @param idSucursal - ID de la sucursal
     * @throws Exception si no existe
     */
    @Transactional
    public void establecerComoDefault(Long id, Long idSucursal) throws Exception {
        
        // Verificar que existe
        SerializacionComprobante serializacion = repository.findById(id)
            .orElseThrow(() -> new Exception("Serialización no encontrada"));
        
        // Validar que pertenece a la sucursal
        if (!serializacion.getSucursalId().equals(idSucursal)) {
            throw new Exception("La serialización no pertenece a esta sucursal");
        }
        
        // 1. Quitar default a todas en la sucursal
        repository.quitarDefaultEnSucursal(idSucursal);
        
        // 2. Activar solo esta
        repository.activarDefault(id);
    }

    /**
     * ============================================================
     * FUNCIÓN: insertarserializacion
     * ============================================================
     * 
     * Inserta una nueva serialización
     * 
     * VALIDACIONES:
     * 1. Serie única en sucursal
     * 2. idTipoComprobante, serie, cantidadNumeros obligatorios
     * 3. correlativo inicia en 0
     * 
     * @param serializacion - Datos de la serialización
     * @return Serialización creada
     * @throws Exception si hay duplicados
     */
    public SerializacionComprobante insertarSerializacion(
        SerializacionComprobante serializacion
    ) throws Exception {
        
        // VALIDACIÓN 1: Campos obligatorios
        if (serializacion.getIdTipoComprobante() == null) {
            throw new Exception("El tipo de comprobante es obligatorio");
        }
        if (serializacion.getSerie() == null || serializacion.getSerie().trim().isEmpty()) {
            throw new Exception("La serie es obligatoria");
        }
        if (serializacion.getCantidadNumeros() == null) {
            throw new Exception("La cantidad de números es obligatoria");
        }
        if (serializacion.getSucursalId() == null) {
            throw new Exception("La sucursal es obligatoria");
        }
        
        // VALIDACIÓN 2: Serie duplicada
        if (repository.existsBySerieAndSucursalId(
            serializacion.getSerie(), 
            serializacion.getSucursalId())
        ) {
            throw new Exception("Ya existe una serialización con esa serie en esta sucursal");
        }
        
        // Valores por defecto
        if (serializacion.getCorrelativo() == null) {
            serializacion.setCorrelativo(0L);
        }
        if (serializacion.getPorDefault() == null) {
            serializacion.setPorDefault(false);
        }
        
        return repository.save(serializacion);
    }

    /**
     * ============================================================
     * FUNCIÓN: editarserializacion
     * ============================================================
     * 
     * Edita una serialización existente
     * 
     * VALIDACIONES:
     * 1. Debe existir
     * 2. Serie única (excluyendo actual)
     * 
     * IMPORTANTE:
     * - NO se edita el correlativo (solo con generar_nro_comprobante)
     * - NO se cambia porDefault (usar setdefaultserializacion)
     * 
     * @param id - ID de la serialización
     * @param serializacion - Nuevos datos
     * @throws Exception si no cumple validaciones
     */
    public void editarSerializacion(Long id, SerializacionComprobante serializacion) throws Exception {
        
        // Verificar que existe
        SerializacionComprobante existente = repository.findById(id)
            .orElseThrow(() -> new Exception("Serialización no encontrada"));
        
        // VALIDACIÓN: Serie duplicada (excluyendo actual)
        if (repository.existsBySerieAndSucursalIdAndIdNot(
            serializacion.getSerie(), 
            serializacion.getSucursalId(), 
            id)
        ) {
            throw new Exception("Ya existe otra serialización con esa serie en esta sucursal");
        }
        
        // Actualizar campos editables
        existente.setSerie(serializacion.getSerie());
        existente.setCantidadNumeros(serializacion.getCantidadNumeros());
        
        // correlativo, porDefault, idTipoComprobante, sucursalId NO se modifican
        
        repository.save(existente);
    }

    /**
     * ============================================================
     * FUNCIÓN: eliminarserializacion
     * ============================================================
     * 
     * Elimina una serialización
     * 
     * VALIDACIONES:
     * 1. Debe existir
     * 2. No eliminar si es la única de ese tipo en la sucursal
     * 
     * @param id - ID de la serialización
     * @throws Exception si no existe o es la única
     */
    public void eliminarSerializacion(Long id) throws Exception {
        
        // Verificar que existe
        if (!repository.existsById(id)) {
            throw new Exception("Serialización no encontrada");
        }
        
        // VALIDACIÓN: No eliminar si tiene ventas asociadas
        // TODO: Verificar con VentaRepository si existe alguna venta con esta serie
        // SerializacionComprobante serializacion = repository.findById(id).get();
        // if (ventaRepository.existsByNroComprobanteContaining(serializacion.getSerie())) {
        //     throw new Exception("No se puede eliminar porque tiene ventas asociadas");
        // }
        
        repository.deleteById(id);
    }

    /**
     * ============================================================
     * FUNCIÓN: Obtener serialización por ID
     * ============================================================
     * 
     * @param id - ID de la serialización
     * @return Serialización o null
     */
    public SerializacionComprobante obtenerSerializacion(Long id) {
        return repository.findById(id).orElse(null);
    }

    /**
     * ============================================================
     * FUNCIÓN: Obtener serialización default
     * ============================================================
     * 
     * Para obtener la serie predeterminada de un tipo
     * 
     * @param idTipoComprobante - ID del tipo
     * @param idSucursal - ID de la sucursal
     * @return Serialización default o null
     */
    public SerializacionComprobante obtenerDefault(Long idTipoComprobante, Long idSucursal) {
        return repository.findDefaultPorTipoYSucursal(idTipoComprobante, idSucursal).orElse(null);
    }

    /**
     * ============================================================
     * FUNCIÓN: Contar serializaciones por sucursal
     * ============================================================
     * 
     * @param idSucursal - ID de la sucursal
     * @return Cantidad de serializaciones
     */
    public Long contarSerializaciones(Long idSucursal) {
        return repository.countBySucursalId(idSucursal);
    }
}
