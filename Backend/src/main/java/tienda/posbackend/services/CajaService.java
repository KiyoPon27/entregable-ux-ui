package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.entities.Caja;
import tienda.posbackend.entities.Sucursal;
import tienda.posbackend.exceptions.DuplicateResourceException;
import tienda.posbackend.exceptions.ResourceNotFoundException;
import tienda.posbackend.repositories.CajaRepository;
import tienda.posbackend.repositories.SucursalRepository;

import java.util.List;
import java.util.Optional;

@Service
public class CajaService {

    @Autowired
    private CajaRepository cajaRepository;

    @Autowired
    private SucursalRepository sucursalRepository;

    public List<Caja> listarPorSucursal(Long sucursalId) {
        return cajaRepository.findBySucursalId(sucursalId);
    }

    public Caja obtenerPorId(Long id) {
        return cajaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Caja no encontrada con ID: " + id));
    }

    @Transactional
    public Caja crear(Caja caja) {
        // Validar que venga la sucursal
        if (caja.getSucursal() == null || caja.getSucursal().getId() == null) {
            throw new IllegalArgumentException("Debe especificar una sucursal");
        }

        Long sucursalId = caja.getSucursal().getId();
        
        // Buscar y asignar la sucursal
        Sucursal sucursal = sucursalRepository.findById(sucursalId)
                .orElseThrow(() -> new ResourceNotFoundException("Sucursal no encontrada con ID: " + sucursalId));
        
        caja.setSucursal(sucursal);

        // Validar duplicados: descripción + sucursal
        Optional<Caja> existente = cajaRepository.findBySucursalId(sucursalId).stream()
                .filter(c -> c.getDescripcion().equalsIgnoreCase(caja.getDescripcion()))
                .findFirst();
        
        if (existente.isPresent()) {
            throw new DuplicateResourceException("Ya existe una caja con la descripción '" + caja.getDescripcion() + "' en esta sucursal");
        }

        // Establecer valores por defecto si no vienen
        if (caja.getEliminar() == null) {
            caja.setEliminar(true);
        }
        if (caja.getImprimir() == null) {
            caja.setImprimir(false);
        }

        return cajaRepository.save(caja);
    }

    @Transactional
    public Caja editar(Long id, Caja cajaDetails) {
        // Buscar caja existente
        Caja caja = cajaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Caja no encontrada con ID: " + id));

        Long sucursalId = caja.getSucursal().getId();

        // Validar duplicados: descripción + sucursal (excluyendo la caja actual)
        Optional<Caja> existente = cajaRepository.findBySucursalId(sucursalId).stream()
                .filter(c -> !c.getId().equals(id)) // Excluir la caja actual
                .filter(c -> c.getDescripcion().equalsIgnoreCase(cajaDetails.getDescripcion()))
                .findFirst();
        
        if (existente.isPresent()) {
            throw new DuplicateResourceException("Ya existe otra caja con la descripción '" + cajaDetails.getDescripcion() + "' en esta sucursal");
        }

        // Actualizar campos
        caja.setDescripcion(cajaDetails.getDescripcion());
        
        if (cajaDetails.getEliminar() != null) {
            caja.setEliminar(cajaDetails.getEliminar());
        }
        
        if (cajaDetails.getImprimir() != null) {
            caja.setImprimir(cajaDetails.getImprimir());
        }

        return cajaRepository.save(caja);
    }

    @Transactional
    public void eliminar(Long id) {
        // Verificar que la caja existe
        Caja caja = cajaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Caja no encontrada con ID: " + id));
        
        // TODO: Agregar validación si tiene asignaciones de usuarios o movimientos
        
        cajaRepository.deleteById(id);
    }
}
