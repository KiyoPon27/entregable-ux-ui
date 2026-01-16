package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.models.Sucursal;
import tienda.posbackend.repositories.SucursalRepository;

import java.util.List;

/**
 * SERVICE: SucursalService
 * 
 * LÓGICA DE NEGOCIO PARA SUCURSALES
 * 
 * IMPORTANTE: En PostgreSQL, al crear una sucursal se ejecuta el trigger
 * "insertarserializaciones" que crea automáticamente registros en 
 * serializacion_comprobantes (F001, B001, NC01, ND01, T001).
 * 
 * En Java, esta lógica se debe implementar en el service o en un @PostPersist.
 * Por ahora, lo dejamos pendiente y lo implementaremos cuando hagamos
 * el módulo de Serializaciones.
 */
@Service
@Transactional
public class SucursalService {

    @Autowired
    private SucursalRepository repository;

    /**
     * ============================================================
     * FUNCIÓN: Mostrar sucursales por empresa
     * ============================================================
     * 
     * SELECT * FROM sucursales WHERE id_empresa = ? ORDER BY nombre ASC
     * 
     * @param idEmpresa - ID de la empresa
     * @return Lista de sucursales ordenadas alfabéticamente
     */
    public List<Sucursal> mostrarSucursales(Long idEmpresa) {
        return repository.findByIdEmpresaOrderByNombreAsc(idEmpresa);
    }

    /**
     * ============================================================
     * FUNCIÓN: mostrarsucursalesasignadas
     * ============================================================
     * 
     * Replica función PostgreSQL que retorna sucursales asignadas a un usuario
     * con datos de la tabla asignacion_sucursal
     * 
     * @param idUsuario - ID del usuario
     * @return Lista de Maps con: idSucursal, sucursal, idUsuario, idAsignacionSucursal
     */
    public List<Object> mostrarSucursalesAsignadas(Long idUsuario) {
        return repository.mostrarSucursalesAsignadas(idUsuario);
    }

    /**
     * ============================================================
     * FUNCIÓN: Insertar sucursal
     * ============================================================
     * 
     * VALIDACIONES:
     * 1. Nombre no duplicado en misma empresa
     * 
     * TRIGGER PENDIENTE:
     * - insertarserializaciones (crear comprobantes por defecto)
     * Se implementará en el módulo de Serializaciones
     * 
     * @param sucursal - Datos de la sucursal
     * @return Sucursal guardada con ID generado
     * @throws Exception si hay duplicados
     */
    public Sucursal insertarSucursal(Sucursal sucursal) throws Exception {
        
        // VALIDACIÓN: Nombre duplicado
        if (repository.existsByNombreIgnoreCaseAndIdEmpresa(
            sucursal.getNombre(), 
            sucursal.getIdEmpresa())
        ) {
            throw new Exception("Ya existe una sucursal con ese nombre");
        }

        // Guardar sucursal
        Sucursal nueva = repository.save(sucursal);

        // TODO: Implementar trigger insertarserializaciones
        // Crear registros en serializacion_comprobantes (F001, B001, etc.)
        // Se hará en el módulo de Serializaciones

        return nueva;
    }

    /**
     * ============================================================
     * FUNCIÓN: Editar sucursal
     * ============================================================
     * 
     * VALIDACIONES:
     * 1. Nombre no duplicado (excluyendo registro actual)
     * 2. No se puede editar si deletable = false (sucursal principal)
     * 
     * @param id - ID de la sucursal a editar
     * @param sucursal - Nuevos datos
     * @throws Exception si hay duplicados o restricciones
     */
    public void editarSucursal(Long id, Sucursal sucursal) throws Exception {
        
        // Verificar que existe
        Sucursal existente = repository.findById(id)
            .orElseThrow(() -> new Exception("Sucursal no encontrada"));

        // VALIDACIÓN: Nombre duplicado (excluyendo actual)
        if (repository.existsByNombreIgnoreCaseAndIdEmpresaAndIdNot(
            sucursal.getNombre(), 
            sucursal.getIdEmpresa(), 
            id)
        ) {
            throw new Exception("Ya existe otra sucursal con ese nombre");
        }

        // Actualizar campos
        existente.setNombre(sucursal.getNombre());
        existente.setDireccionFiscal(sucursal.getDireccionFiscal());
        // idEmpresa y deletable generalmente no se modifican

        repository.save(existente);
    }

    /**
     * ============================================================
     * FUNCIÓN: Eliminar sucursal
     * ============================================================
     * 
     * VALIDACIONES:
     * 1. No se puede eliminar si deletable = false
     * 2. Si tiene relaciones (cajas, almacenes), se eliminarán en CASCADE
     * 
     * @param id - ID de la sucursal a eliminar
     * @throws Exception si no se puede eliminar
     */
    public void eliminarSucursal(Long id) throws Exception {
        
        // Verificar que existe
        Sucursal sucursal = repository.findById(id)
            .orElseThrow(() -> new Exception("Sucursal no encontrada"));

        // VALIDACIÓN: No eliminar sucursal principal
        if (sucursal.getDeletable() != null && !sucursal.getDeletable()) {
            throw new Exception("No se puede eliminar la sucursal principal");
        }

        // Eliminar (CASCADE eliminará cajas, almacenes, etc.)
        repository.deleteById(id);
    }

    /**
     * ============================================================
     * FUNCIÓN AUXILIAR: Contar sucursales
     * ============================================================
     * 
     * @param idEmpresa - ID de la empresa
     * @return Cantidad de sucursales
     */
    public Long contarSucursales(Long idEmpresa) {
        return repository.countByIdEmpresa(idEmpresa);
    }
}
