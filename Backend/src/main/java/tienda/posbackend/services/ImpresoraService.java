package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.models.Impresora;
import tienda.posbackend.repositories.ImpresoraRepository;

import java.util.Optional;

/**
 * SERVICE: ImpresoraService
 * 
 * Lógica de negocio para gestión de impresoras
 * 
 * IMPORTANTE:
 * - Las impresoras se crean automáticamente con trigger insertarimpresora
 * - No hay método de insertar, solo mostrar y editar
 * - Se eliminan automáticamente al eliminar caja (CASCADE)
 * 
 * MÉTODOS DISPONIBLES:
 * - mostrarImpresoraXCaja() - Obtiene impresora de una caja
 * - editarImpresora() - Actualiza configuración (state, name, pcName, ipLocal)
 */
@Service
public class ImpresoraService {

    @Autowired
    private ImpresoraRepository impresoraRepository;

    /**
     * MOSTRAR IMPRESORA POR CAJA
     * 
     * Equivalente a PostgreSQL:
     * SELECT * FROM impresoras WHERE id_caja = p.id_caja
     * 
     * @param idCaja - ID de la caja
     * @return Optional con la impresora configurada
     */
    @Transactional(readOnly = true)
    public Optional<Impresora> mostrarImpresoraXCaja(Long idCaja) {
        return impresoraRepository.findByIdCaja(idCaja);
    }

    /**
     * EDITAR IMPRESORA
     * 
     * Actualiza configuración de impresora:
     * - state: Activar/desactivar impresión directa
     * - name: Nombre de la impresora
     * - pcName: Nombre del PC
     * - ipLocal: IP local del PC
     * 
     * VALIDACIONES:
     * 1. Impresora existe
     * 2. Solo actualiza campos no nulos
     * 
     * @param id - ID de la impresora a editar
     * @param impresoraActualizada - Datos actualizados
     * @return Impresora actualizada
     * @throws IllegalArgumentException si impresora no existe
     */
    @Transactional
    public Impresora editarImpresora(Long id, Impresora impresoraActualizada) {
        // Buscar impresora existente
        Impresora impresoraExistente = impresoraRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Impresora no encontrada con ID: " + id));

        // Actualizar campos solo si están presentes
        if (impresoraActualizada.getState() != null) {
            impresoraExistente.setState(impresoraActualizada.getState());
        }

        if (impresoraActualizada.getName() != null) {
            impresoraExistente.setName(impresoraActualizada.getName());
        }

        if (impresoraActualizada.getPcName() != null) {
            impresoraExistente.setPcName(impresoraActualizada.getPcName());
        }

        if (impresoraActualizada.getIpLocal() != null) {
            impresoraExistente.setIpLocal(impresoraActualizada.getIpLocal());
        }

        // Guardar cambios
        return impresoraRepository.save(impresoraExistente);
    }

    /**
     * BUSCAR IMPRESORA POR ID
     * 
     * @param id - ID de la impresora
     * @return Impresora encontrada
     * @throws IllegalArgumentException si no existe
     */
    @Transactional(readOnly = true)
    public Impresora buscarPorId(Long id) {
        return impresoraRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Impresora no encontrada con ID: " + id));
    }
}
