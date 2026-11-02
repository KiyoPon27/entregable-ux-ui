package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.dto.CrearEmpresaRequestDTO;
import tienda.posbackend.entities.*;
import tienda.posbackend.exceptions.ResourceNotFoundException;
import tienda.posbackend.exceptions.DuplicateResourceException;
import tienda.posbackend.repositories.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@SuppressWarnings("null")
public class EmpresaService {

    @Autowired
    private EmpresaRepository empresaRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private UsuarioService usuarioService;
    
    @Autowired
    private SucursalRepository sucursalRepository;
    
    @Autowired
    private AlmacenRepository almacenRepository;
    
    @Autowired
    private CajaRepository cajaRepository;
    
    @Autowired
    private RolRepository rolRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private ModuloRepository moduloRepository;
    
    @Autowired
    private PermisoRepository permisoRepository;
    
    @Autowired
    private MetodoPagoRepository metodoPagoRepository;
    
    @Autowired
    private TipoDocumentoRepository tipoDocumentoRepository;
    
    @Autowired
    private ClienteProveedorRepository clienteProveedorRepository;
    
    @Autowired
    private TipoComprobanteRepository tipoComprobanteRepository;
    
    @Autowired
    private SerializacionComprobanteRepository serializacionComprobanteRepository;
    
    @Autowired
    private CategoriaRepository categoriaRepository;
    
    @Autowired
    private AsignacionSucursalRepository asignacionSucursalRepository;

    private int actualizarEstadoUsuariosDeEmpresa(Long idEmpresa, String estado) {
        List<Usuario> usuariosDeEmpresa = usuarioRepository.findByEmpresaId(idEmpresa);
        int actualizados = 0;
        for (Usuario usuario : usuariosDeEmpresa) {
            String estadoActual = usuario.getEstado() != null ? usuario.getEstado().trim() : "";
            if (!estado.equalsIgnoreCase(estadoActual)) {
                usuario.setEstado(estado);
                usuarioRepository.save(usuario);
                actualizados++;
            }
        }
        return actualizados;
    }

    @Transactional
    public int sanearEstadosUsuariosPorEmpresa() {
        List<Empresa> empresas = empresaRepository.findAll();
        int totalActualizados = 0;

        for (Empresa empresa : empresas) {
            String estadoObjetivo = Boolean.TRUE.equals(empresa.getHabilitada()) ? "ACTIVO" : "INACTIVO";
            totalActualizados += actualizarEstadoUsuariosDeEmpresa(empresa.getId(), estadoObjetivo);
        }

        return totalActualizados;
    }

    @Transactional(readOnly = true)
    public Empresa obtenerPorUsuario(Long idUsuario) {
        // Primero intentar buscar si el usuario ES SuperAdmin (propietario de empresa)
        Optional<Empresa> empresaUsuario = empresaRepository.findByUsuarioId(idUsuario);
        if (empresaUsuario.isPresent()) {
            return empresaUsuario.get();
        }
        
        // Si no es superadmin, buscar empresa a través de AsignacionSucursal -> Sucursal
        List<AsignacionSucursal> asignaciones = asignacionSucursalRepository.findByUsuarioId(idUsuario);
        if (!asignaciones.isEmpty()) {
            // Obtener la primera asignación y su sucursal
            Sucursal sucursal = asignaciones.get(0).getSucursal();
            if (sucursal != null && sucursal.getEmpresa() != null) {
                return sucursal.getEmpresa();
            }
        }
        
        // Si no tiene asignación ni es propietario, lanzar excepción
        throw new ResourceNotFoundException("Usuario no tiene empresa asignada. ID: " + idUsuario);
    }

    /**
     * Obtiene la empresa real del usuario, considerando:
     * 1. Si es SuperAdmin: empresa donde es propietario
     * 2. Si es empleado: empresa a través de AsignacionSucursal -> Sucursal
     */
    @Transactional(readOnly = true)
    public Empresa obtenerEmpresaDelUsuario(Long idUsuario) {
        // Primero intentar buscar la empresa del usuario (para superadmins)
        Optional<Empresa> empresaUsuario = empresaRepository.findByUsuarioId(idUsuario);
        if (empresaUsuario.isPresent()) {
            return empresaUsuario.get();
        }
        
        // Si no es superadmin, buscar empresa a través de AsignacionSucursal
        List<AsignacionSucursal> asignaciones = asignacionSucursalRepository.findByUsuarioId(idUsuario);
        if (!asignaciones.isEmpty()) {
            // Obtener la primera asignación y su sucursal
            Sucursal sucursal = asignaciones.get(0).getSucursal();
            if (sucursal != null && sucursal.getEmpresa() != null) {
                return sucursal.getEmpresa();
            }
        }
        
        // Si no tiene asignación ni es propietario, lanzar excepción
        throw new ResourceNotFoundException("Usuario no tiene empresa asignada. ID: " + idUsuario);
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
    public void deshabilitar(Long id) {
        Empresa empresa = empresaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Empresa no encontrada con ID: " + id));
        
        // Soft delete: marcar como deshabilitada en lugar de eliminar
        empresa.setHabilitada(false);
        empresaRepository.save(empresa);
        actualizarEstadoUsuariosDeEmpresa(id, "INACTIVO");
    }

    @Transactional
    public Empresa habilitar(Long id) {
        Empresa empresa = empresaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Empresa no encontrada con ID: " + id));

        empresa.setHabilitada(true);
        Empresa empresaActualizada = empresaRepository.save(empresa);
        actualizarEstadoUsuariosDeEmpresa(id, "ACTIVO");
        return empresaActualizada;
    }

    /**
     * Mantener método eliminar() para backward compatibility
     * Ahora solo deshabilita en lugar de eliminar
     */
    @Transactional
    public void eliminar(Long id) {
        deshabilitar(id);
    }

    @Transactional
    public Empresa crearEmpresaCompleta(CrearEmpresaRequestDTO dto) {
        // Validaciones previas
        if (dto.getNombreEmpresa() == null || dto.getNombreEmpresa().trim().isEmpty()) {
            throw new RuntimeException("El nombre de la empresa es requerido");
        }
        if (dto.getIdFiscal() == null || dto.getIdFiscal().trim().isEmpty()) {
            throw new RuntimeException("El ID fiscal (RUC) es requerido");
        }
        if (dto.getNombreSuperAdmin() == null || dto.getNombreSuperAdmin().trim().isEmpty()) {
            throw new RuntimeException("El nombre del SuperAdmin es requerido");
        }
        if (dto.getEmailSuperAdmin() == null || dto.getEmailSuperAdmin().trim().isEmpty()) {
            throw new RuntimeException("El email del SuperAdmin es requerido");
        }
        if (dto.getContrasenyaSuperAdmin() == null || dto.getContrasenyaSuperAdmin().trim().isEmpty()) {
            throw new RuntimeException("La contraseña del SuperAdmin es requerida");
        }

        // Verificar que el RUC no exista (si no es AUTO)
        String idFiscal = dto.getIdFiscal();
        if ("AUTO".equalsIgnoreCase(idFiscal)) {
            // Generar un idFiscal único basado en UUID si es AUTO
            idFiscal = "AUTO-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } else {
            if (empresaRepository.findByIdFiscal(idFiscal).isPresent()) {
                throw new RuntimeException("Ya existe una empresa con el ID fiscal: " + idFiscal);
            }
        }

        // Verificar que el email no exista
        if (usuarioRepository.findByCorreo(dto.getEmailSuperAdmin()).isPresent()) {
            throw new RuntimeException("Ya existe un usuario con el email: " + dto.getEmailSuperAdmin());
        }

        // Obtener el rol de SUPERADMIN
        Rol rolSuperAdmin = rolRepository.findByNombre("SUPERADMIN")
            .orElseThrow(() -> new RuntimeException("Rol SUPERADMIN no encontrado"));

        // 1. Crear la Empresa primero (sin usuario)
        Empresa empresa = new Empresa();
        empresa.setNombre(dto.getNombreEmpresa());
        empresa.setIdFiscal(idFiscal); // Usar el idFiscal generado/validado
        empresa.setIdAuth("auth-empresa-" + UUID.randomUUID().toString()); // Generar idAuth único
        empresa.setDireccionFiscal(dto.getDireccionFiscal());
        empresa.setIso(dto.getIso() != null ? dto.getIso() : "PE");
        empresa.setPais(dto.getPais() != null ? dto.getPais() : "Peru");
        empresa.setCurrency(dto.getCurrency());
        empresa.setSimboloMoneda(dto.getSimboloMoneda() != null ? dto.getSimboloMoneda() : "$");
        empresa.setNombreMoneda(dto.getNombreMoneda());
        empresa.setImpuesto(dto.getImpuesto());
        empresa.setValorImpuesto(dto.getValorImpuesto());
        empresa.setCorreo(dto.getCorreo());
        empresa.setPiePaginaTicket(dto.getPiePaginaTicket());
        empresa = empresaRepository.save(empresa);

        // 2. Crear el Usuario SuperAdmin
        Usuario usuarioSuperAdmin = new Usuario();
        usuarioSuperAdmin.setNombres(dto.getNombreSuperAdmin());
        usuarioSuperAdmin.setCorreo(dto.getEmailSuperAdmin());
        // Encriptar la contraseña con bcrypt
        usuarioSuperAdmin.setPassword(passwordEncoder.encode(dto.getContrasenyaSuperAdmin()));
        usuarioSuperAdmin.setRol(rolSuperAdmin);
        usuarioSuperAdmin.setEstado("ACTIVO"); // Usar mayúsculas para consistencia
        usuarioSuperAdmin.setFechaRegistro(java.time.LocalDateTime.now());
        usuarioSuperAdmin = usuarioRepository.save(usuarioSuperAdmin);

        // Asignar todos los módulos como permisos al nuevo SuperAdmin
        List<Modulo> todosLosModulos = moduloRepository.findAll();
        for (Modulo modulo : todosLosModulos) {
            Permiso permiso = new Permiso();
            permiso.setUsuario(usuarioSuperAdmin);
            permiso.setModulo(modulo);
            permisoRepository.save(permiso);
        }

        // 3. Asociar el SuperAdmin a la Empresa (como propietario/usuario)
        empresa.setUsuario(usuarioSuperAdmin);
        empresa = empresaRepository.save(empresa);

        // 4. Crear la Sucursal Principal
        Sucursal sucursalPrincipal = new Sucursal();
        sucursalPrincipal.setNombre("Sucursal Principal");
        sucursalPrincipal.setEmpresa(empresa);
        sucursalPrincipal = sucursalRepository.save(sucursalPrincipal);

        // 4b. Crear AsignacionSucursal (conectar SuperAdmin a la sucursal principal)
        AsignacionSucursal asignacion = new AsignacionSucursal();
        asignacion.setUsuario(usuarioSuperAdmin);
        asignacion.setSucursal(sucursalPrincipal);
        asignacionSucursalRepository.save(asignacion);

        // 5. Crear el Almacén Principal
        Almacen almacenPrincipal = new Almacen();
        almacenPrincipal.setNombre("Almacen principal");
        almacenPrincipal.setSucursal(sucursalPrincipal);
        almacenRepository.save(almacenPrincipal);

        // 6. Crear la Caja 1
        Caja caja = new Caja();
        caja.setDescripcion("Caja 1");
        caja.setSucursal(sucursalPrincipal);
        caja = cajaRepository.save(caja);

        // 7. Crear Métodos de Pago (Efectivo, Tarjeta, Mixto, Yape)
        MetodoPago metodoEfectivo = new MetodoPago();
        metodoEfectivo.setNombre("Efectivo");
        metodoEfectivo.setEmpresa(empresa);
        metodoEfectivo.setIcono("💵");
        metodoEfectivo.setColor("#16a34a");
        metodoEfectivo.setVerNombre(true);
        metodoEfectivo.setEliminarActualizar(false);
        metodoPagoRepository.save(metodoEfectivo);

        MetodoPago metodoTarjeta = new MetodoPago();
        metodoTarjeta.setNombre("Tarjeta");
        metodoTarjeta.setEmpresa(empresa);
        metodoTarjeta.setIcono("💳");
        metodoTarjeta.setColor("#0ea5e9");
        metodoTarjeta.setVerNombre(true);
        metodoTarjeta.setEliminarActualizar(true);
        metodoPagoRepository.save(metodoTarjeta);

        MetodoPago metodoMixto = new MetodoPago();
        metodoMixto.setNombre("Mixto");
        metodoMixto.setEmpresa(empresa);
        metodoMixto.setIcono("🏦");
        metodoMixto.setColor("#f59e0b");
        metodoMixto.setVerNombre(true);
        metodoMixto.setEliminarActualizar(true);
        metodoPagoRepository.save(metodoMixto);

        MetodoPago metodoYape = new MetodoPago();
        metodoYape.setNombre("Yape");
        metodoYape.setEmpresa(empresa);
        metodoYape.setIcono("📱");
        metodoYape.setColor("#7c3aed");
        metodoYape.setVerNombre(true);
        metodoYape.setEliminarActualizar(true);
        metodoPagoRepository.save(metodoYape);

        // 8. Crear Tipo de Documento (DNI)
        TipoDocumento tipoDocDNI = new TipoDocumento();
        tipoDocDNI.setNombre("DNI");
        tipoDocDNI.setIdEmpresa(empresa.getId());
        tipoDocumentoRepository.save(tipoDocDNI);

        // 9. Crear Cliente Genérico
        ClienteProveedor clienteGenerico = new ClienteProveedor();
        clienteGenerico.setNombres("Cliente Genérico");
        clienteGenerico.setEmpresa(empresa);
        clienteGenerico.setDireccion("-");
        clienteGenerico.setTelefono("-");
        clienteGenerico.setEmail("-");
        clienteGenerico.setIdentificadorNacional("00000000");
        clienteGenerico.setIdentificadorFiscal("00000000000");
        clienteGenerico.setTipo("cliente");
        clienteGenerico.setEstado("activo");
        clienteProveedorRepository.save(clienteGenerico);

        // 10. Crear Serializaciones de Comprobantes
        // Obtener tipos de comprobantes (Factura, Boleta, Nota Crédito, Nota Débito, Ticket)
        List<TipoComprobante> tiposComprobantes = tipoComprobanteRepository.findAll();
        
        for (TipoComprobante tipoComprobante : tiposComprobantes) {
            SerializacionComprobante serializacion = new SerializacionComprobante();
            serializacion.setTipoComprobante(tipoComprobante);
            serializacion.setSucursal(sucursalPrincipal);
            
            // Asignar series basadas en el tipo
            if ("Factura".equalsIgnoreCase(tipoComprobante.getNombre())) {
                serializacion.setSerie("F001");
                serializacion.setCantidadNumeros(9L);
                serializacion.setPorDefecto(false);
            } else if ("Boleta".equalsIgnoreCase(tipoComprobante.getNombre())) {
                serializacion.setSerie("B001");
                serializacion.setCantidadNumeros(8L);
                serializacion.setPorDefecto(false);
            } else if ("Nota de credito".equalsIgnoreCase(tipoComprobante.getNombre())) {
                serializacion.setSerie("NC01");
                serializacion.setCantidadNumeros(8L);
                serializacion.setPorDefecto(false);
            } else if ("Nota de debito".equalsIgnoreCase(tipoComprobante.getNombre())) {
                serializacion.setSerie("ND01");
                serializacion.setCantidadNumeros(9L);
                serializacion.setPorDefecto(false);
            } else if ("Ticket".equalsIgnoreCase(tipoComprobante.getNombre())) {
                serializacion.setSerie("T001");
                serializacion.setCantidadNumeros(8L);
                serializacion.setPorDefecto(true); // Ticket es por defecto
            }
            
            serializacion.setCorrelativo(0L);
            serializacionComprobanteRepository.save(serializacion);
        }

        // 11. Crear Categoría por defecto
        Categoria categoriaPorDefecto = new Categoria();
        categoriaPorDefecto.setNombre("General");
        categoriaPorDefecto.setColor("#95a5a6");
        categoriaPorDefecto.setIcono("📦");
        categoriaPorDefecto.setEmpresa(empresa);
        categoriaRepository.save(categoriaPorDefecto);

        return empresa;
    }

    @Transactional(readOnly = true)
    public List<Empresa> obtenerTodas() {
        // Solo retorna empresas habilitadas (soft delete)
        return empresaRepository.findAllByHabilitada(true);
    }

    /**
     * Obtiene todas las empresas incluyendo deshabilitadas (solo para OG)
     */
    @Transactional(readOnly = true)
    public List<Empresa> obtenerTodasIncluiyendoDeshabilitadas() {
        return empresaRepository.findAll();
    }
}
