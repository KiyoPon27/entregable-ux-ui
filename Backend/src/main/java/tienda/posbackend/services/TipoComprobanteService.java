package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.entities.TipoComprobante;
import tienda.posbackend.exceptions.DuplicateResourceException;
import tienda.posbackend.exceptions.ResourceNotFoundException;
import tienda.posbackend.repositories.TipoComprobanteRepository;

import java.util.List;
import java.util.Optional;

@Service
@SuppressWarnings("null")
public class TipoComprobanteService {

    @Autowired
    private TipoComprobanteRepository tipoComprobanteRepository;

    public List<TipoComprobante> listarTodos() {
        return tipoComprobanteRepository.findAll();
    }

    public List<TipoComprobante> listarPorDestino(String destino) {
        return tipoComprobanteRepository.findByDestino(destino);
    }

    public TipoComprobante obtenerPorId(Long id) {
        return tipoComprobanteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de comprobante no encontrado con ID: " + id));
    }

    @Transactional
    public TipoComprobante crear(TipoComprobante tipoComprobante) {
        // Validar duplicados por nombre
        Optional<TipoComprobante> existente = tipoComprobanteRepository.findByNombreIgnoreCase(tipoComprobante.getNombre());
        
        if (existente.isPresent()) {
            throw new DuplicateResourceException("Ya existe un tipo de comprobante con el nombre: " + tipoComprobante.getNombre());
        }

        return tipoComprobanteRepository.save(tipoComprobante);
    }

    @Transactional
    public TipoComprobante editar(Long id, TipoComprobante tipoComprobanteDetails) {
        TipoComprobante tipoComprobante = tipoComprobanteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de comprobante no encontrado con ID: " + id));

        // Validar duplicados por nombre (excluyendo el actual)
        Optional<TipoComprobante> existente = tipoComprobanteRepository.findByNombreIgnoreCase(tipoComprobanteDetails.getNombre());
        
        if (existente.isPresent() && !existente.get().getId().equals(id)) {
            throw new DuplicateResourceException("Ya existe un tipo de comprobante con el nombre: " + tipoComprobanteDetails.getNombre());
        }

        tipoComprobante.setNombre(tipoComprobanteDetails.getNombre());
        tipoComprobante.setDestino(tipoComprobanteDetails.getDestino());

        return tipoComprobanteRepository.save(tipoComprobante);
    }

    @Transactional
    public void eliminar(Long id) {
        TipoComprobante tipoComprobante = tipoComprobanteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de comprobante no encontrado con ID: " + id));

        tipoComprobanteRepository.delete(tipoComprobante);
    }
}
