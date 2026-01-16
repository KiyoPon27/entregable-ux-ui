package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.models.Caja;
import tienda.posbackend.repositories.CajaRepository;

import java.util.List;

/**
 * SERVICE: CajaService
 * 
 * LÓGICA DE NEGOCIO PARA CAJAS
 * 
 * IMPORTANTE: En PostgreSQL, al crear una caja se ejecuta el trigger
 * "insertarimpresora" que crea automáticamente un registro en tabla impresoras:
 * 
 * CREATE FUNCTION insertarimpresora() RETURNS trigger AS $$
 * begin
 *   insert into impresoras (id_caja) values(new.id);
 *   return new;
 * end $$;
 * 
 * En Java, esta lógica se implementará cuando hagamos el módulo de Impresoras.
 * Por ahora lo dejamos como TODO.
 */
@Service
@Transactional
public class CajaService {

    @Autowired
    private CajaRepository repository;

    /**
     * ============================================================
     * FUNCIÓN: Mostrar cajas por sucursal
     * ============================================================
     * 
     * SELECT * FROM caja WHERE id_sucursal = ? ORDER BY descripcion ASC
     * 
     * @param idSucursal - ID de la sucursal
     * @return Lista de cajas ordenadas por descripción
     */
    public List<Caja> mostrarCajasPorSucursal(Long idSucursal) {
        return repository.findByIdSucursalOrderByDescripcionAsc(idSucursal);
    }

    /**
     * ============================================================
     * FUNCIÓN: mostrarcajasasignadas
     * ============================================================
     * 
     * Replica función PostgreSQL que retorna cajas asignadas a un usuario
     * con formato "Sucursal - Caja"
     * 
     * @param idUsuario - ID del usuario
     * @return Lista de Maps con: id, sucursalCaja, idCaja, idSucursal
     */
    public List<Object> mostrarCajasAsignadas(Long idUsuario) {
        return repository.mostrarCajasAsignadas(idUsuario);
    }

    /**
     * ============================================================
     * FUNCIÓN: Insertar caja
     * ============================================================
     * 
     * VALIDACIONES:
     * 1. Descripción no duplicada en misma sucursal
     * 
     * TRIGGER PENDIENTE:
     * - insertarimpresora (crear registro en tabla impresoras)
     * Se implementará en el módulo de Impresoras
     * 
     * @param caja - Datos de la caja
     * @return Caja guardada con ID generado
     * @throws Exception si hay duplicados
     */
    public Caja insertarCaja(Caja caja) throws Exception {
        
        // VALIDACIÓN: Descripción duplicada
        if (repository.existsByDescripcionIgnoreCaseAndIdSucursal(
            caja.getDescripcion(), 
            caja.getIdSucursal())
        ) {
            throw new Exception("Ya existe una caja con esa descripción en esta sucursal");
        }

        // Guardar caja
        Caja nueva = repository.save(caja);

        // TODO: Implementar trigger insertarimpresora
        // INSERT INTO impresoras (id_caja) VALUES (nueva.getId())
        // Se hará en el módulo de Impresoras

        return nueva;
    }

    /**
     * ============================================================
     * FUNCIÓN: Editar caja
     * ============================================================
     * 
     * VALIDACIONES:
     * 1. Descripción no duplicada (excluyendo registro actual)
     * 2. No se puede editar si deletable = false (caja principal)
     * 
     * @param id - ID de la caja a editar
     * @param caja - Nuevos datos
     * @throws Exception si hay duplicados o restricciones
     */
    public void editarCaja(Long id, Caja caja) throws Exception {
        
        // Verificar que existe
        Caja existente = repository.findById(id)
            .orElseThrow(() -> new Exception("Caja no encontrada"));

        // VALIDACIÓN: Descripción duplicada (excluyendo actual)
        if (repository.existsByDescripcionIgnoreCaseAndIdSucursalAndIdNot(
            caja.getDescripcion(), 
            caja.getIdSucursal(), 
            id)
        ) {
            throw new Exception("Ya existe otra caja con esa descripción en esta sucursal");
        }

        // Actualizar campos
        existente.setDescripcion(caja.getDescripcion());
        existente.setPrint(caja.getPrint());
        // idSucursal, fechaCreacion y deletable no se modifican

        repository.save(existente);
    }

    /**
     * ============================================================
     * FUNCIÓN: Eliminar caja
     * ============================================================
     * 
     * VALIDACIONES:
     * 1. No se puede eliminar si deletable = false
     * 2. Si tiene relaciones (cierres de caja, impresoras), se eliminarán en CASCADE
     * 
     * @param id - ID de la caja a eliminar
     * @throws Exception si no se puede eliminar
     */
    public void eliminarCaja(Long id) throws Exception {
        
        // Verificar que existe
        Caja caja = repository.findById(id)
            .orElseThrow(() -> new Exception("Caja no encontrada"));

        // VALIDACIÓN: No eliminar caja principal
        if (caja.getDeletable() != null && !caja.getDeletable()) {
            throw new Exception("No se puede eliminar la caja principal");
        }

        // Eliminar (CASCADE eliminará impresoras, cierres, etc.)
        repository.deleteById(id);
    }

    /**
     * ============================================================
     * FUNCIÓN AUXILIAR: Contar cajas por sucursal
     * ============================================================
     * 
     * @param idSucursal - ID de la sucursal
     * @return Cantidad de cajas
     */
    public Long contarCajas(Long idSucursal) {
        return repository.countByIdSucursal(idSucursal);
    }
}
