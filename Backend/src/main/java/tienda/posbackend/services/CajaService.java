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

import tienda.posbackend.entities.Usuario;
import tienda.posbackend.entities.AsignacionSucursal;
import tienda.posbackend.entities.Impresora;
import tienda.posbackend.repositories.UsuarioRepository;
import tienda.posbackend.repositories.AsignacionSucursalRepository;
import tienda.posbackend.repositories.ImpresoraRepository;
import tienda.posbackend.repositories.CierreCajaRepository;

@Service
@SuppressWarnings("null")
public class CajaService {

    @Autowired
    private CajaRepository cajaRepository;

    @Autowired
    private SucursalRepository sucursalRepository;
    
    @Autowired
    private ImpresoraRepository impresoraRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private AsignacionSucursalRepository asignacionSucursalRepository;
    
    @Autowired
    private CierreCajaRepository cierreCajaRepository;

    public List<Caja> listarPorSucursal(Long sucursalId) {
        return cajaRepository.findBySucursalId(sucursalId);
    }

    public Caja obtenerPorId(Long id) {
        return cajaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Caja no encontrada con ID: " + id));
    }

    @Transactional
    public Caja crear(Caja caja, Long idUsuarioCreador) {
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
        
        Caja nuevaCaja = cajaRepository.save(caja);

        // Logic: Auto-assign creation user to this box IF ID provided
        if (idUsuarioCreador != null) {
             Usuario usuario = usuarioRepository.findById(idUsuarioCreador).orElse(null);
             if (usuario != null) {
                 AsignacionSucursal asignacion = new AsignacionSucursal();
                 asignacion.setCaja(nuevaCaja);
                 asignacion.setSucursal(sucursal);
                 asignacion.setUsuario(usuario);
                 asignacionSucursalRepository.save(asignacion);
             }
        }

        return nuevaCaja;
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
        if (!cajaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Caja no encontrada con ID: " + id);
        }
        
        // Verificar si tiene cierres de caja asociados (aperturas o movimientos)
        // Esto impide eliminar cajas que ya se han usado
        long cierresCount = cierreCajaRepository.countByCajaId(id);
        if (cierresCount > 0) {
            throw new IllegalStateException(
                "No se puede eliminar la caja porque tiene " + cierresCount + 
                " registro(s) de apertura/cierre. Una caja que ya se usó no puede eliminarse."
            );
        }
        
        // Eliminar asignaciones de sucursal asociadas
        List<AsignacionSucursal> asignaciones = asignacionSucursalRepository.findByCajaId(id);
        if (!asignaciones.isEmpty()) {
            asignacionSucursalRepository.deleteAll(asignaciones);
        }
        
        // Finalmente eliminar la caja
        cajaRepository.deleteById(id);
    }
}
