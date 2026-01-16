package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.models.ClienteProveedor;
import tienda.posbackend.repositories.ClienteProveedorRepository;

import java.util.List;
import java.util.Optional;

/**
 * SERVICE: ClienteProveedorService
 * 
 * CAPA DE LÓGICA DE NEGOCIO
 * 
 * Aquí se replican TODAS las validaciones y lógica que tenías
 * en las funciones de PostgreSQL (PERFORM 1 FROM... IF FOUND THEN...)
 * 
 * @Transactional asegura que las operaciones sean ACID (Atomicidad, Consistencia, Aislamiento, Durabilidad)
 * Si algo falla, se hace ROLLBACK automático
 */
@Service
@Transactional // Todas las operaciones son transaccionales
public class ClienteProveedorService {

    @Autowired
    private ClienteProveedorRepository repository;

    /**
     * ============================================================
     * FUNCIÓN: mostrarClientesProveedores (simple SELECT)
     * ============================================================
     * 
     * Equivalente a: SELECT * FROM clientes_proveedores WHERE id_empresa = ? AND tipo = ?
     * 
     * @param idEmpresa - Filtro por empresa
     * @param tipo - 'cliente', 'proveedor' o '-'
     * @return Lista de clientes/proveedores
     */
    public List<ClienteProveedor> mostrarClientesProveedores(Long idEmpresa, String tipo) {
        return repository.findByIdEmpresaAndTipo(idEmpresa, tipo);
    }

    /**
     * ============================================================
     * FUNCIÓN: buscarClientesProveedores
     * ============================================================
     * 
     * Búsqueda con LIKE (case-insensitive) en nombres, DNI, RUC
     * 
     * @param idEmpresa - Filtro por empresa
     * @param buscador - Texto a buscar
     * @return Lista de coincidencias
     */
    public List<ClienteProveedor> buscarClientesProveedores(Long idEmpresa, String buscador) {
        return repository.buscarClientesProveedores(idEmpresa, buscador);
    }

    /**
     * ============================================================
     * FUNCIÓN: insertarclientesproveedores
     * ============================================================
     * 
     * REPLICA LA FUNCIÓN POSTGRESQL:
     * 
     * CREATE FUNCTION public.insertarclientesproveedores(
     *   _nombres text, _id_empresa integer, _direccion text, _telefono text, 
     *   _email text, _identificador_nacional text, _identificador_fiscal text, _tipo text
     * ) RETURNS void AS $$
     * begin
     *   perform 1 from clientes_proveedores 
     *   where (LOWER(nombres)=LOWER(_nombres) and tipo=_tipo) 
     *      or (LOWER(identificador_fiscal)=LOWER(_identificador_fiscal) and tipo=_tipo) 
     *      or (LOWER(identificador_nacional)=LOWER(_identificador_nacional) and tipo=_tipo);
     *   
     *   if found then
     *     raise exception 'Datos duplicados';
     *   else
     *     insert into clientes_proveedores(...) values(...);
     *   end if;
     * end;
     * $$;
     * 
     * VALIDACIONES:
     * 1. Nombres duplicados (con mismo tipo y empresa)
     * 2. Identificador fiscal duplicado (con mismo tipo)
     * 3. Identificador nacional duplicado (con mismo tipo)
     * 
     * @param cliente - Datos del cliente/proveedor a insertar
     * @return ClienteProveedor guardado con su ID generado
     * @throws Exception si hay datos duplicados
     */
    public ClienteProveedor insertarClienteProveedor(ClienteProveedor cliente) throws Exception {
        
        // VALIDACIÓN 1: Nombres duplicados
        // PostgreSQL: LOWER(nombres)=LOWER(_nombres) and tipo=_tipo
        Optional<ClienteProveedor> existeNombre = repository
            .findByNombresIgnoreCaseAndTipoAndIdEmpresa(
                cliente.getNombres(), 
                cliente.getTipo(), 
                cliente.getIdEmpresa()
            );
        
        if (existeNombre.isPresent()) {
            throw new Exception("Datos duplicados"); // Mismo mensaje que PostgreSQL
        }

        // VALIDACIÓN 2: Identificador Fiscal duplicado
        // PostgreSQL: LOWER(identificador_fiscal)=LOWER(_identificador_fiscal) and tipo=_tipo
        if (cliente.getIdentificadorFiscal() != null && !cliente.getIdentificadorFiscal().equals("-")) {
            Optional<ClienteProveedor> existeFiscal = repository
                .findByIdentificadorFiscalIgnoreCaseAndTipo(
                    cliente.getIdentificadorFiscal(), 
                    cliente.getTipo()
                );
            
            if (existeFiscal.isPresent()) {
                throw new Exception("Datos duplicados");
            }
        }

        // VALIDACIÓN 3: Identificador Nacional duplicado
        // PostgreSQL: LOWER(identificador_nacional)=LOWER(_identificador_nacional) and tipo=_tipo
        if (cliente.getIdentificadorNacional() != null && !cliente.getIdentificadorNacional().equals("-")) {
            Optional<ClienteProveedor> existeNacional = repository
                .findByIdentificadorNacionalIgnoreCaseAndTipo(
                    cliente.getIdentificadorNacional(), 
                    cliente.getTipo()
                );
            
            if (existeNacional.isPresent()) {
                throw new Exception("Datos duplicados");
            }
        }

        // Si pasa todas las validaciones, INSERTAR
        return repository.save(cliente); // INSERT con ID auto-generado
    }

    /**
     * ============================================================
     * FUNCIÓN: editarclientesproveedores
     * ============================================================
     * 
     * REPLICA LA FUNCIÓN POSTGRESQL:
     * 
     * CREATE FUNCTION public.editarclientesproveedores(
     *   _id integer, _nombres text, _id_empresa integer, _direccion text, 
     *   _telefono text, _email text, _identificador_nacional text, 
     *   _identificador_fiscal text, _tipo text
     * ) RETURNS void AS $$
     * begin
     *   perform 1 from clientes_proveedores 
     *   where (LOWER(nombres)=LOWER(_nombres) and tipo=_tipo and id!=_id and id_empresa=_id_empresa) 
     *      or (LOWER(identificador_fiscal)=LOWER(_identificador_fiscal) and tipo=_tipo and id!=_id) 
     *      or (LOWER(identificador_nacional)=LOWER(_identificador_nacional) and tipo=_tipo and id!=_id);
     *   
     *   if found then
     *     raise exception 'Datos duplicados';
     *   else
     *     update clientes_proveedores set ... where id = _id;
     *   end if;
     * end;
     * $$;
     * 
     * DIFERENCIA CON INSERT: Se excluye el registro actual (id != _id)
     * 
     * @param id - ID del cliente/proveedor a editar
     * @param cliente - Nuevos datos
     * @throws Exception si hay duplicados o no existe el registro
     */
    public void editarClienteProveedor(Long id, ClienteProveedor cliente) throws Exception {
        
        // Verificar que el registro existe
        ClienteProveedor existente = repository.findById(id)
            .orElseThrow(() -> new Exception("Cliente/Proveedor no encontrado"));

        // VALIDACIÓN 1: Nombres duplicados (excluyendo el registro actual)
        // PostgreSQL: ... and id != _id and id_empresa = _id_empresa
        Optional<ClienteProveedor> existeNombre = repository
            .findByNombresIgnoreCaseAndTipoAndIdNotAndIdEmpresa(
                cliente.getNombres(), 
                cliente.getTipo(), 
                id, 
                cliente.getIdEmpresa()
            );
        
        if (existeNombre.isPresent()) {
            throw new Exception("Datos duplicados");
        }

        // VALIDACIÓN 2: Identificador Fiscal duplicado (excluyendo actual)
        if (cliente.getIdentificadorFiscal() != null && !cliente.getIdentificadorFiscal().equals("-")) {
            Optional<ClienteProveedor> existeFiscal = repository
                .findByIdentificadorFiscalIgnoreCaseAndTipoAndIdNot(
                    cliente.getIdentificadorFiscal(), 
                    cliente.getTipo(), 
                    id
                );
            
            if (existeFiscal.isPresent()) {
                throw new Exception("Datos duplicados");
            }
        }

        // VALIDACIÓN 3: Identificador Nacional duplicado (excluyendo actual)
        if (cliente.getIdentificadorNacional() != null && !cliente.getIdentificadorNacional().equals("-")) {
            Optional<ClienteProveedor> existeNacional = repository
                .findByIdentificadorNacionalIgnoreCaseAndTipoAndIdNot(
                    cliente.getIdentificadorNacional(), 
                    cliente.getTipo(), 
                    id
                );
            
            if (existeNacional.isPresent()) {
                throw new Exception("Datos duplicados");
            }
        }

        // Actualizar campos (NO se actualiza id, fecha_registro)
        existente.setNombres(cliente.getNombres());
        existente.setDireccion(cliente.getDireccion());
        existente.setTelefono(cliente.getTelefono());
        existente.setEmail(cliente.getEmail());
        existente.setIdentificadorNacional(cliente.getIdentificadorNacional());
        existente.setIdentificadorFiscal(cliente.getIdentificadorFiscal());
        existente.setEstado(cliente.getEstado());
        // tipo e idEmpresa generalmente no se cambian

        // Guardar cambios (UPDATE)
        repository.save(existente);
    }

    /**
     * ============================================================
     * FUNCIÓN: eliminarClienteProveedor
     * ============================================================
     * 
     * DELETE simple (no había función específica en PostgreSQL)
     * 
     * IMPORTANTE: Si hay FOREIGN KEYs con ON DELETE CASCADE,
     * se eliminará en cascada (igual que PostgreSQL)
     * 
     * @param id - ID del cliente/proveedor a eliminar
     */
    public void eliminarClienteProveedor(Long id) {
        repository.deleteById(id); // DELETE FROM clientes_proveedores WHERE id = ?
    }

    /**
     * ============================================================
     * FUNCIÓN AUXILIAR: Obtener cliente genérico
     * ============================================================
     * 
     * Se usa en el trigger "asignarclientegenerico" de PostgreSQL
     * Para asignar a ventas sin cliente especificado
     * 
     * @param idEmpresa - ID de la empresa
     * @return Cliente genérico (tipo = '-')
     */
    public ClienteProveedor obtenerClienteGenerico(Long idEmpresa) {
        return repository.findClienteGenericoPorEmpresa(idEmpresa)
            .orElse(null);
    }
}
