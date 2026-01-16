package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.models.Almacen;
import tienda.posbackend.repositories.AlmacenRepository;

import java.util.List;

/**
 * SERVICE: AlmacenService
 * 
 * LÓGICA DE NEGOCIO PARA ALMACENES
 * 
 * REGLAS DE NEGOCIO IMPORTANTES:
 * 1. Solo puede haber UN almacén por defecto (default=true) por sucursal
 * 2. Al crear el primer almacén de una sucursal, debe ser por defecto
 * 3. No se puede eliminar el almacén por defecto sin asignar otro
 * 4. No se puede eliminar si tiene stock asociado (validación por CASCADE)
 * 
 * TRIGGER RELACIONADO:
 * - insertpordefecto: Al crear empresa, crea sucursal y almacén principal
 */
@Service
@Transactional
public class AlmacenService {

    @Autowired
    private AlmacenRepository repository;

    /**
     * ============================================================
     * FUNCIÓN: Mostrar almacenes por sucursal
     * ============================================================
     * 
     * SELECT * FROM almacen WHERE id_sucursal = ? ORDER BY nombre ASC
     * 
     * @param idSucursal - ID de la sucursal
     * @return Lista de almacenes ordenados alfabéticamente
     */
    public List<Almacen> mostrarAlmacenesPorSucursal(Long idSucursal) {
        return repository.findByIdSucursalOrderByNombreAsc(idSucursal);
    }

    /**
     * ============================================================
     * FUNCIÓN: Obtener almacén por defecto
     * ============================================================
     * 
     * Se usa en el POS cuando no se especifica almacén
     * 
     * @param idSucursal - ID de la sucursal
     * @return Almacén por defecto o null
     */
    public Almacen obtenerAlmacenDefault(Long idSucursal) {
        return repository.findAlmacenDefaultPorSucursal(idSucursal).orElse(null);
    }

    /**
     * ============================================================
     * FUNCIÓN: Insertar almacén
     * ============================================================
     * 
     * VALIDACIONES:
     * 1. Nombre no duplicado en misma sucursal
     * 2. Si es el primer almacén, debe ser por defecto (isDefault=true)
     * 3. Si ya hay almacén por defecto y se intenta crear otro, lanzar error
     * 
     * @param almacen - Datos del almacén
     * @return Almacén guardado con ID generado
     * @throws Exception si hay duplicados o violación de reglas
     */
    public Almacen insertarAlmacen(Almacen almacen) throws Exception {
        
        // VALIDACIÓN 1: Nombre duplicado
        if (repository.existsByNombreIgnoreCaseAndIdSucursal(
            almacen.getNombre(), 
            almacen.getIdSucursal())
        ) {
            throw new Exception("Ya existe un almacén con ese nombre en esta sucursal");
        }

        // VALIDACIÓN 2: Si es el primer almacén de la sucursal, debe ser por defecto
        Long cantidadAlmacenes = repository.countByIdSucursal(almacen.getIdSucursal());
        if (cantidadAlmacenes == 0) {
            almacen.setIsDefault(true); // Forzar que sea por defecto
            almacen.setDeletable(false); // No se puede eliminar el almacén principal
        }

        // VALIDACIÓN 3: Si ya hay almacén por defecto y se intenta crear otro por defecto
        if (Boolean.TRUE.equals(almacen.getIsDefault())) {
            Long cantidadDefault = repository.countAlmacenesDefaultPorSucursal(almacen.getIdSucursal());
            if (cantidadDefault > 0) {
                throw new Exception("Ya existe un almacén por defecto en esta sucursal. " +
                                  "Debes desactivar el actual antes de crear uno nuevo.");
            }
        }

        // Guardar almacén
        return repository.save(almacen);
    }

    /**
     * ============================================================
     * FUNCIÓN: Editar almacén
     * ============================================================
     * 
     * VALIDACIONES:
     * 1. Nombre no duplicado (excluyendo registro actual)
     * 2. No se puede desactivar isDefault si es el único almacén
     * 3. No se puede activar isDefault si ya hay otro
     * 4. No se puede editar si deletable = false (almacén principal)
     * 
     * @param id - ID del almacén a editar
     * @param almacen - Nuevos datos
     * @throws Exception si hay duplicados o restricciones
     */
    public void editarAlmacen(Long id, Almacen almacen) throws Exception {
        
        // Verificar que existe
        Almacen existente = repository.findById(id)
            .orElseThrow(() -> new Exception("Almacén no encontrado"));

        // VALIDACIÓN 1: Nombre duplicado (excluyendo actual)
        if (repository.existsByNombreIgnoreCaseAndIdSucursalAndIdNot(
            almacen.getNombre(), 
            almacen.getIdSucursal(), 
            id)
        ) {
            throw new Exception("Ya existe otro almacén con ese nombre en esta sucursal");
        }

        // VALIDACIÓN 2: Si se intenta desactivar isDefault
        if (Boolean.TRUE.equals(existente.getIsDefault()) && !Boolean.TRUE.equals(almacen.getIsDefault())) {
            // Verificar si es el único almacén
            Long cantidadAlmacenes = repository.countByIdSucursal(almacen.getIdSucursal());
            if (cantidadAlmacenes == 1) {
                throw new Exception("No se puede desactivar el almacén por defecto si es el único");
            }
        }

        // VALIDACIÓN 3: Si se intenta activar isDefault
        if (!Boolean.TRUE.equals(existente.getIsDefault()) && Boolean.TRUE.equals(almacen.getIsDefault())) {
            // Verificar que no hay otro por defecto
            Long cantidadDefault = repository.countAlmacenesDefaultPorSucursal(almacen.getIdSucursal());
            if (cantidadDefault > 0) {
                throw new Exception("Ya existe un almacén por defecto en esta sucursal. " +
                                  "Debes desactivar el actual primero.");
            }
        }

        // Actualizar campos
        existente.setNombre(almacen.getNombre());
        existente.setIsDefault(almacen.getIsDefault());
        // idSucursal, fechaCreacion y deletable no se modifican

        repository.save(existente);
    }

    /**
     * ============================================================
     * FUNCIÓN: Eliminar almacén
     * ============================================================
     * 
     * VALIDACIONES:
     * 1. No se puede eliminar si deletable = false
     * 2. No se puede eliminar si es el único almacén de la sucursal
     * 3. No se puede eliminar si tiene stock asociado (MySQL lo rechazará por FK)
     * 4. Si se elimina el almacén por defecto, se debe asignar otro
     * 
     * @param id - ID del almacén a eliminar
     * @throws Exception si no se puede eliminar
     */
    public void eliminarAlmacen(Long id) throws Exception {
        
        // Verificar que existe
        Almacen almacen = repository.findById(id)
            .orElseThrow(() -> new Exception("Almacén no encontrado"));

        // VALIDACIÓN 1: No eliminar almacén principal
        if (almacen.getDeletable() != null && !almacen.getDeletable()) {
            throw new Exception("No se puede eliminar el almacén principal");
        }

        // VALIDACIÓN 2: No eliminar si es el único almacén
        Long cantidadAlmacenes = repository.countByIdSucursal(almacen.getIdSucursal());
        if (cantidadAlmacenes == 1) {
            throw new Exception("No se puede eliminar el único almacén de la sucursal");
        }

        // VALIDACIÓN 3: Si es el almacén por defecto, advertir
        if (Boolean.TRUE.equals(almacen.getIsDefault())) {
            throw new Exception("No se puede eliminar el almacén por defecto. " +
                              "Primero asigna otro almacén como predeterminado.");
        }

        // Eliminar (CASCADE eliminará stock y movimientos si los hay)
        // MySQL lanzará error si hay FK violations
        repository.deleteById(id);
    }

    /**
     * ============================================================
     * FUNCIÓN AUXILIAR: Contar almacenes por sucursal
     * ============================================================
     * 
     * @param idSucursal - ID de la sucursal
     * @return Cantidad de almacenes
     */
    public Long contarAlmacenes(Long idSucursal) {
        return repository.countByIdSucursal(idSucursal);
    }

    /**
     * ============================================================
     * FUNCIÓN AUXILIAR: Cambiar almacén por defecto
     * ============================================================
     * 
     * Desactiva el actual y activa el nuevo
     * 
     * @param idNuevoDefault - ID del nuevo almacén por defecto
     * @throws Exception si el almacén no existe
     */
    @Transactional
    public void cambiarAlmacenDefault(Long idNuevoDefault) throws Exception {
        
        // Verificar que el nuevo almacén existe
        Almacen nuevoDefault = repository.findById(idNuevoDefault)
            .orElseThrow(() -> new Exception("Almacén no encontrado"));

        // Desactivar el actual almacén por defecto de esa sucursal
        Almacen actualDefault = repository.findAlmacenDefaultPorSucursal(nuevoDefault.getIdSucursal())
            .orElse(null);
        
        if (actualDefault != null && !actualDefault.getId().equals(idNuevoDefault)) {
            actualDefault.setIsDefault(false);
            repository.save(actualDefault);
        }

        // Activar el nuevo
        nuevoDefault.setIsDefault(true);
        repository.save(nuevoDefault);
    }
}
