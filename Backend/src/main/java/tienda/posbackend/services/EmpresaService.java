package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.entities.Empresa;
import tienda.posbackend.entities.Usuario;
import tienda.posbackend.exceptions.ResourceNotFoundException;
import tienda.posbackend.exceptions.DuplicateResourceException;
import tienda.posbackend.repositories.EmpresaRepository;
import tienda.posbackend.repositories.UsuarioRepository;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@SuppressWarnings("null")
public class EmpresaService {

    @Autowired
    private EmpresaRepository empresaRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public Empresa obtenerPorUsuario(Long idUsuario) {
        // Primero intentar buscar la empresa del usuario
        Optional<Empresa> empresaUsuario = empresaRepository.findByUsuarioId(idUsuario);
        if (empresaUsuario.isPresent()) {
            return empresaUsuario.get();
        }
        
        // Si no tiene empresa asignada, devolver la primera empresa (caso de usuarios nuevos/empleados)
        return empresaRepository.findFirstByOrderByIdAsc()
            .orElseThrow(() -> new ResourceNotFoundException("No hay empresas registradas en el sistema"));
    }

    @Transactional
    public Empresa crear(Empresa empresa) {
        // Validar que venga el usuario propietario
        if (empresa.getUsuario() == null || empresa.getUsuario().getId() == null) {
            throw new IllegalArgumentException("Debe especificar el usuario propietario de la empresa");
        }
        
        Long idUsuario = empresa.getUsuario().getId();
        Usuario usuario = usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + idUsuario));
        
        // Validar que el usuario no tenga ya una empresa asignada
        Optional<Empresa> empresaExistente = empresaRepository.findByUsuarioId(idUsuario);
        if (empresaExistente.isPresent()) {
            throw new DuplicateResourceException("El usuario ya tiene una empresa asignada");
        }
        
        empresa.setUsuario(usuario);
        
        // Establecer valores por defecto si no vienen
        if (empresa.getSimboloMoneda() == null) {
            empresa.setSimboloMoneda("$");
        }
        if (empresa.getIso() == null) {
            empresa.setIso("PE");
        }
        if (empresa.getPais() == null) {
            empresa.setPais("Peru");
        }
        if (empresa.getCurrency() == null) {
            empresa.setCurrency("PEN");
        }
        if (empresa.getImpuesto() == null) {
            empresa.setImpuesto("IGV");
        }
        if (empresa.getValorImpuesto() == null) {
            empresa.setValorImpuesto(new BigDecimal("18.00"));
        }
        if (empresa.getNombreMoneda() == null) {
            empresa.setNombreMoneda("Soles");
        }
        if (empresa.getCorreo() == null) {
            empresa.setCorreo("");
        }
        
        return empresaRepository.save(empresa);
    }

    @Transactional
    public Empresa editar(Long id, Empresa empresaDetails) {
        Empresa empresa = empresaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Empresa no encontrada con ID: " + id));
        
        // Actualizar campos si vienen
        if (empresaDetails.getNombre() != null) {
            empresa.setNombre(empresaDetails.getNombre());
        }
        if (empresaDetails.getIdFiscal() != null) {
            empresa.setIdFiscal(empresaDetails.getIdFiscal());
        }
        if (empresaDetails.getDireccionFiscal() != null) {
            empresa.setDireccionFiscal(empresaDetails.getDireccionFiscal());
        }
        if (empresaDetails.getSimboloMoneda() != null) {
            empresa.setSimboloMoneda(empresaDetails.getSimboloMoneda());
        }
        if (empresaDetails.getLogo() != null) {
            empresa.setLogo(empresaDetails.getLogo());
        }
        if (empresaDetails.getIso() != null) {
            empresa.setIso(empresaDetails.getIso());
        }
        if (empresaDetails.getPais() != null) {
            empresa.setPais(empresaDetails.getPais());
        }
        if (empresaDetails.getCurrency() != null) {
            empresa.setCurrency(empresaDetails.getCurrency());
        }
        if (empresaDetails.getImpuesto() != null) {
            empresa.setImpuesto(empresaDetails.getImpuesto());
        }
        if (empresaDetails.getValorImpuesto() != null) {
            empresa.setValorImpuesto(empresaDetails.getValorImpuesto());
        }
        if (empresaDetails.getNombreMoneda() != null) {
            empresa.setNombreMoneda(empresaDetails.getNombreMoneda());
        }
        if (empresaDetails.getCorreo() != null) {
            empresa.setCorreo(empresaDetails.getCorreo());
        }
        if (empresaDetails.getPiePaginaTicket() != null) {
            empresa.setPiePaginaTicket(empresaDetails.getPiePaginaTicket());
        }
        
        return empresaRepository.save(empresa);
    }

    @Transactional
    public void eliminar(Long id) {
        Empresa empresa = empresaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Empresa no encontrada con ID: " + id));
        
        // TODO: Validar que no tenga sucursales, productos, ventas, etc.
        // Por ahora permitimos la eliminación
        empresaRepository.delete(empresa);
    }
}
