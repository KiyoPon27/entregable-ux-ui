package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import tienda.posbackend.entities.ClienteProveedor;
import tienda.posbackend.entities.Empresa;
import tienda.posbackend.repositories.ClienteProveedorRepository;
import tienda.posbackend.repositories.EmpresaRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ClienteProveedorService {
    
    @Autowired
    private ClienteProveedorRepository clienteProveedorRepository;
    
    @Autowired
    private EmpresaRepository empresaRepository;
    
    /**
     * Listar todos los clientes/proveedores de una empresa
     */
    public List<ClienteProveedor> listarPorEmpresa(Long idEmpresa) {
        return clienteProveedorRepository.findByEmpresaIdOrderByFechaRegistroDesc(idEmpresa);
    }
    
    /**
     * Listar por tipo (CLIENTE, PROVEEDOR, AMBOS)
     */
    public List<ClienteProveedor> listarPorTipo(Long idEmpresa, String tipo) {
        return clienteProveedorRepository.findByEmpresaIdAndTipoOrderByNombresAsc(idEmpresa, tipo);
    }
    
    /**
     * Listar por estado (activo, inactivo)
     */
    public List<ClienteProveedor> listarPorEstado(Long idEmpresa, String estado) {
        return clienteProveedorRepository.findByEmpresaIdAndEstadoOrderByNombresAsc(idEmpresa, estado);
    }
    
    /**
     * Buscar por nombre
     */
    public List<ClienteProveedor> buscarPorNombre(Long idEmpresa, String query) {
        return clienteProveedorRepository.buscarPorNombre(idEmpresa, query);
    }
    
    /**
     * Obtener por ID
     */
    public ClienteProveedor obtenerPorId(Long id) {
        return clienteProveedorRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Cliente/Proveedor no encontrado con ID: " + id));
    }
    
    /**
     * Insertar cliente/proveedor con validaciones de duplicados
     * Basado en la función insertarclientesproveedores de Supabase
     */
    @Transactional
    public ClienteProveedor insertar(ClienteProveedor clienteProveedor) {
        // Verificar que la empresa exista
        Empresa empresa = empresaRepository.findById(clienteProveedor.getEmpresa().getId())
            .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
        
        clienteProveedor.setEmpresa(empresa);
        
        // Validación: Verificar duplicados por nombre + tipo
        Optional<ClienteProveedor> porNombre = clienteProveedorRepository
            .findByEmpresaIdAndNombresIgnoreCaseAndTipo(
                empresa.getId(), 
                clienteProveedor.getNombres(), 
                clienteProveedor.getTipo()
            );
        
        if (porNombre.isPresent()) {
            throw new RuntimeException("Ya existe un " + clienteProveedor.getTipo() + 
                " con el nombre '" + clienteProveedor.getNombres() + "'");
        }
        
        // Validación: Verificar duplicados por identificador fiscal + tipo (si no es "-")
        if (clienteProveedor.getIdentificadorFiscal() != null && 
            !clienteProveedor.getIdentificadorFiscal().equals("-") &&
            !clienteProveedor.getIdentificadorFiscal().trim().isEmpty()) {
            
            Optional<ClienteProveedor> porFiscal = clienteProveedorRepository
                .findByEmpresaIdAndIdentificadorFiscalIgnoreCaseAndTipo(
                    empresa.getId(), 
                    clienteProveedor.getIdentificadorFiscal(), 
                    clienteProveedor.getTipo()
                );
            
            if (porFiscal.isPresent()) {
                throw new RuntimeException("Ya existe un " + clienteProveedor.getTipo() + 
                    " con el identificador fiscal '" + clienteProveedor.getIdentificadorFiscal() + "'");
            }
        }
        
        // Validación: Verificar duplicados por identificador nacional + tipo (si no es "-")
        if (clienteProveedor.getIdentificadorNacional() != null && 
            !clienteProveedor.getIdentificadorNacional().equals("-") &&
            !clienteProveedor.getIdentificadorNacional().trim().isEmpty()) {
            
            Optional<ClienteProveedor> porNacional = clienteProveedorRepository
                .findByEmpresaIdAndIdentificadorNacionalIgnoreCaseAndTipo(
                    empresa.getId(), 
                    clienteProveedor.getIdentificadorNacional(), 
                    clienteProveedor.getTipo()
                );
            
            if (porNacional.isPresent()) {
                throw new RuntimeException("Ya existe un " + clienteProveedor.getTipo() + 
                    " con el identificador nacional '" + clienteProveedor.getIdentificadorNacional() + "'");
            }
        }
        
        // Si pasa todas las validaciones, guardar
        return clienteProveedorRepository.save(clienteProveedor);
    }
    
    /**
     * Editar cliente/proveedor con validaciones de duplicados (excluyendo el ID actual)
     * Basado en la función editarclientesproveedores de Supabase
     */
    @Transactional
    public ClienteProveedor editar(Long id, ClienteProveedor clienteProveedorActualizado) {
        // Verificar que el cliente/proveedor exista
        ClienteProveedor clienteProveedorExistente = clienteProveedorRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Cliente/Proveedor no encontrado con ID: " + id));
        
        Long idEmpresa = clienteProveedorExistente.getEmpresa().getId();
        String tipo = clienteProveedorActualizado.getTipo();
        
        // Validación: Verificar duplicados por nombre + tipo (excluyendo el ID actual)
        Optional<ClienteProveedor> porNombre = clienteProveedorRepository
            .findByEmpresaIdAndNombresIgnoreCaseAndTipoExcludingId(
                idEmpresa, 
                clienteProveedorActualizado.getNombres(), 
                tipo,
                id
            );
        
        if (porNombre.isPresent()) {
            throw new RuntimeException("Ya existe otro " + tipo + 
                " con el nombre '" + clienteProveedorActualizado.getNombres() + "'");
        }
        
        // Validación: Verificar duplicados por identificador fiscal + tipo (excluyendo el ID actual)
        if (clienteProveedorActualizado.getIdentificadorFiscal() != null && 
            !clienteProveedorActualizado.getIdentificadorFiscal().equals("-") &&
            !clienteProveedorActualizado.getIdentificadorFiscal().trim().isEmpty()) {
            
            Optional<ClienteProveedor> porFiscal = clienteProveedorRepository
                .findByEmpresaIdAndIdentificadorFiscalIgnoreCaseAndTipoExcludingId(
                    idEmpresa, 
                    clienteProveedorActualizado.getIdentificadorFiscal(), 
                    tipo,
                    id
                );
            
            if (porFiscal.isPresent()) {
                throw new RuntimeException("Ya existe otro " + tipo + 
                    " con el identificador fiscal '" + clienteProveedorActualizado.getIdentificadorFiscal() + "'");
            }
        }
        
        // Validación: Verificar duplicados por identificador nacional + tipo (excluyendo el ID actual)
        if (clienteProveedorActualizado.getIdentificadorNacional() != null && 
            !clienteProveedorActualizado.getIdentificadorNacional().equals("-") &&
            !clienteProveedorActualizado.getIdentificadorNacional().trim().isEmpty()) {
            
            Optional<ClienteProveedor> porNacional = clienteProveedorRepository
                .findByEmpresaIdAndIdentificadorNacionalIgnoreCaseAndTipoExcludingId(
                    idEmpresa, 
                    clienteProveedorActualizado.getIdentificadorNacional(), 
                    tipo,
                    id
                );
            
            if (porNacional.isPresent()) {
                throw new RuntimeException("Ya existe otro " + tipo + 
                    " con el identificador nacional '" + clienteProveedorActualizado.getIdentificadorNacional() + "'");
            }
        }
        
        // Actualizar campos
        clienteProveedorExistente.setNombres(clienteProveedorActualizado.getNombres());
        clienteProveedorExistente.setDireccion(clienteProveedorActualizado.getDireccion());
        clienteProveedorExistente.setTelefono(clienteProveedorActualizado.getTelefono());
        clienteProveedorExistente.setEmail(clienteProveedorActualizado.getEmail());
        clienteProveedorExistente.setIdentificadorNacional(clienteProveedorActualizado.getIdentificadorNacional());
        clienteProveedorExistente.setIdentificadorFiscal(clienteProveedorActualizado.getIdentificadorFiscal());
        clienteProveedorExistente.setTipo(clienteProveedorActualizado.getTipo());
        clienteProveedorExistente.setEstado(clienteProveedorActualizado.getEstado());
        
        return clienteProveedorRepository.save(clienteProveedorExistente);
    }
    
    /**
     * Eliminar cliente/proveedor
     */
    @Transactional
    public void eliminar(Long id) {
        ClienteProveedor clienteProveedor = clienteProveedorRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Cliente/Proveedor no encontrado con ID: " + id));
        
        clienteProveedorRepository.delete(clienteProveedor);
    }
    
    /**
     * Cambiar estado (activo/inactivo)
     */
    @Transactional
    public ClienteProveedor cambiarEstado(Long id, String nuevoEstado) {
        ClienteProveedor clienteProveedor = clienteProveedorRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Cliente/Proveedor no encontrado con ID: " + id));
        
        clienteProveedor.setEstado(nuevoEstado);
        return clienteProveedorRepository.save(clienteProveedor);
    }
}
