package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.entities.SerializacionComprobante;
import tienda.posbackend.entities.Sucursal;
import tienda.posbackend.entities.TipoComprobante;
import tienda.posbackend.exceptions.DuplicateResourceException;
import tienda.posbackend.exceptions.ResourceNotFoundException;
import tienda.posbackend.repositories.SerializacionComprobanteRepository;
import tienda.posbackend.repositories.SucursalRepository;
import tienda.posbackend.repositories.TipoComprobanteRepository;

import java.util.List;
import java.util.Optional;

@Service
@SuppressWarnings("null")
public class SerializacionComprobanteService {

    @Autowired
    private SerializacionComprobanteRepository serializacionRepository;

    @Autowired
    private TipoComprobanteRepository tipoComprobanteRepository;

    @Autowired
    private SucursalRepository sucursalRepository;

    public List<SerializacionComprobante> listarPorSucursal(Long sucursalId) {
        return serializacionRepository.findBySucursalId(sucursalId);
    }

    public List<SerializacionComprobante> listarPorEmpresa(Long empresaId) {
        return serializacionRepository.findByEmpresaId(empresaId);
    }

    public List<SerializacionComprobante> listarPorSucursalYDestino(Long sucursalId, String destino) {
        return serializacionRepository.findBySucursalIdAndDestino(sucursalId, destino);
    }

    public SerializacionComprobante obtenerPorId(Long id) {
        return serializacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serialización no encontrada con ID: " + id));
    }

    @Transactional
    public SerializacionComprobante crear(SerializacionComprobante serializacion) {
        // Validar que venga el tipo de comprobante
        if (serializacion.getTipoComprobante() == null || serializacion.getTipoComprobante().getId() == null) {
            throw new IllegalArgumentException("Debe especificar un tipo de comprobante");
        }

        // Validar que venga la sucursal
        if (serializacion.getSucursal() == null || serializacion.getSucursal().getId() == null) {
            throw new IllegalArgumentException("Debe especificar una sucursal");
        }

        Long tipoComprobanteId = serializacion.getTipoComprobante().getId();
        Long sucursalId = serializacion.getSucursal().getId();

        // Buscar y asignar el tipo de comprobante
        TipoComprobante tipoComprobante = tipoComprobanteRepository.findById(tipoComprobanteId)
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de comprobante no encontrado con ID: " + tipoComprobanteId));
        
        serializacion.setTipoComprobante(tipoComprobante);

        // Buscar y asignar la sucursal
        Sucursal sucursal = sucursalRepository.findById(sucursalId)
                .orElseThrow(() -> new ResourceNotFoundException("Sucursal no encontrada con ID: " + sucursalId));
        
        serializacion.setSucursal(sucursal);

        // Validar duplicados: serie + sucursal
        Optional<SerializacionComprobante> existente = serializacionRepository.findBySerieAndSucursalId(
                serializacion.getSerie(), sucursalId);
        
        if (existente.isPresent()) {
            throw new DuplicateResourceException("Ya existe una serialización con la serie '" + 
                    serializacion.getSerie() + "' en esta sucursal");
        }

        // Si esta será por defecto, desmarcar las demás
        if (Boolean.TRUE.equals(serializacion.getPorDefecto())) {
            serializacionRepository.desmarcarTodosPorDefecto(sucursalId);
        }

        return serializacionRepository.save(serializacion);
    }

    @Transactional
    public SerializacionComprobante editar(Long id, SerializacionComprobante serializacionDetails) {
        SerializacionComprobante serializacion = serializacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serialización no encontrada con ID: " + id));

        Long sucursalId = serializacion.getSucursal().getId();

        // Validar duplicados: serie + sucursal (excluyendo el actual)
        Optional<SerializacionComprobante> existente = serializacionRepository
                .findBySerieAndSucursalId(serializacionDetails.getSerie(), sucursalId);
        
        if (existente.isPresent() && !existente.get().getId().equals(id)) {
            throw new DuplicateResourceException("Ya existe una serialización con la serie '" + 
                    serializacionDetails.getSerie() + "' en esta sucursal");
        }

        // Actualizar campos
        serializacion.setSerie(serializacionDetails.getSerie());
        serializacion.setCantidadNumeros(serializacionDetails.getCantidadNumeros());
        serializacion.setCorrelativo(serializacionDetails.getCorrelativo());

        return serializacionRepository.save(serializacion);
    }

    @Transactional
    public void establecerPorDefecto(Long id) {
        SerializacionComprobante serializacion = serializacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serialización no encontrada con ID: " + id));

        Long sucursalId = serializacion.getSucursal().getId();

        // Desmarcar todas las serializaciones por defecto de esta sucursal
        serializacionRepository.desmarcarTodosPorDefecto(sucursalId);

        // Marcar esta como por defecto
        serializacion.setPorDefecto(true);
        serializacionRepository.save(serializacion);
    }

    @Transactional
    public String obtenerSiguienteNumero(Long id) {
        SerializacionComprobante serializacion = serializacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serialización no encontrada con ID: " + id));

        String numeroComprobante = serializacion.generarNumeroComprobante();
        
        // Incrementar el correlativo para la próxima vez
        serializacion.incrementarCorrelativo();
        serializacionRepository.save(serializacion);

        return numeroComprobante;
    }

    @Transactional
    public String generarNumero(Long tipoComprobanteId, String serie, Long sucursalId) {
        SerializacionComprobante serializacion = serializacionRepository
                .findByTipoComprobanteIdAndSerieAndSucursalId(tipoComprobanteId, serie, sucursalId)
                .orElseThrow(() -> new ResourceNotFoundException("Serialización no encontrada para Tipo: " + tipoComprobanteId + ", Serie: " + serie + ", Sucursal: " + sucursalId));

        String numeroComprobante = serializacion.generarNumeroComprobante();
        
        // Incrementar el correlativo para la próxima vez
        serializacion.incrementarCorrelativo();
        serializacionRepository.save(serializacion);

        return numeroComprobante;
    }

    @Transactional
    public void eliminar(Long id) {
        SerializacionComprobante serializacion = serializacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serialización no encontrada con ID: " + id));

        serializacionRepository.delete(serializacion);
    }
}
