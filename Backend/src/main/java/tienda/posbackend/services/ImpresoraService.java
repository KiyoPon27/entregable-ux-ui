package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.entities.Caja;
import tienda.posbackend.entities.Impresora;
import tienda.posbackend.exceptions.ResourceNotFoundException;
import tienda.posbackend.repositories.CajaRepository;
import tienda.posbackend.repositories.ImpresoraRepository;

import java.util.List;
import java.util.Optional;

@Service
@SuppressWarnings("null")
public class ImpresoraService {

    @Autowired
    private ImpresoraRepository impresoraRepository;

    @Autowired
    private CajaRepository cajaRepository;

    public List<Impresora> listarPorCaja(Long cajaId) {
        return impresoraRepository.findByCajaId(cajaId);
    }

    public Impresora obtenerPorId(Long id) {
        return impresoraRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Impresora no encontrada con ID: " + id));
    }

    public Optional<Impresora> obtenerImpresoraActivaPorCaja(Long cajaId) {
        return impresoraRepository.findByCajaIdAndEstadoTrue(cajaId);
    }

    @Transactional
    public Impresora crear(Impresora impresora) {
        // Validar que venga la caja
        if (impresora.getCaja() == null || impresora.getCaja().getId() == null) {
            throw new IllegalArgumentException("Debe especificar una caja");
        }

        Long cajaId = impresora.getCaja().getId();
        
        // Buscar y asignar la caja
        Caja caja = cajaRepository.findById(cajaId)
                .orElseThrow(() -> new ResourceNotFoundException("Caja no encontrada con ID: " + cajaId));
        
        impresora.setCaja(caja);

        // Establecer valores por defecto si no vienen
        if (impresora.getNombrePc() == null) {
            impresora.setNombrePc("-");
        }
        if (impresora.getIpLocal() == null) {
            impresora.setIpLocal("-");
        }
        if (impresora.getEstado() == null) {
            impresora.setEstado(false);
        }
        if (impresora.getNombre() == null) {
            impresora.setNombre("-");
        }

        return impresoraRepository.save(impresora);
    }

    @Transactional
    public Impresora editar(Long id, Impresora impresoraDetails) {
        // Buscar impresora existente
        Impresora impresora = impresoraRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Impresora no encontrada con ID: " + id));

        // Actualizar campos
        if (impresoraDetails.getNombrePc() != null) {
            impresora.setNombrePc(impresoraDetails.getNombrePc());
        }
        
        if (impresoraDetails.getIpLocal() != null) {
            impresora.setIpLocal(impresoraDetails.getIpLocal());
        }
        
        if (impresoraDetails.getEstado() != null) {
            impresora.setEstado(impresoraDetails.getEstado());
        }
        
        if (impresoraDetails.getNombre() != null) {
            impresora.setNombre(impresoraDetails.getNombre());
        }

        return impresoraRepository.save(impresora);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!impresoraRepository.existsById(id)) {
            throw new ResourceNotFoundException("Impresora no encontrada con ID: " + id);
        }
        impresoraRepository.deleteById(id);
    }
}
