package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.dto.CompraRequestDTO;
import tienda.posbackend.dto.DetalleCompraDTO;
import tienda.posbackend.entities.*;
import tienda.posbackend.exceptions.ResourceNotFoundException;
import tienda.posbackend.repositories.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class CompraService {

    @Autowired
    private CompraRepository compraRepository;

    @Autowired
    private DetalleCompraRepository detalleCompraRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ClienteProveedorRepository clienteProveedorRepository;

    @Autowired
    private MetodoPagoRepository metodoPagoRepository;

    @Autowired
    private TipoComprobanteRepository tipoComprobanteRepository;

    @Autowired
    private ProductoRepository productoRepository;

    // Listar todas las compras de una empresa
    public List<Compra> listarPorEmpresa(Long empresaId) {
        return compraRepository.findByEmpresaIdOrderByFechaRegistroDesc(empresaId);
    }

    // Obtener una compra por ID
    public Compra obtenerPorId(Long id) {
        return compraRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Compra no encontrada con ID: " + id));
    }

    // Obtener detalles de una compra
    public List<DetalleCompra> obtenerDetalles(Long compraId) {
        return detalleCompraRepository.findByCompraId(compraId);
    }

    // Buscar por número de factura
    public List<Compra> buscarPorNumeroFactura(Long empresaId, String numeroFactura) {
        return compraRepository.buscarPorNumeroFactura(empresaId, numeroFactura);
    }

    // Buscar por proveedor
    public List<Compra> buscarPorProveedor(Long empresaId, String query) {
        return compraRepository.buscarPorProveedor(empresaId, query);
    }

    // Filtrar por estado
    public List<Compra> filtrarPorEstado(Long empresaId, String estado) {
        return compraRepository.findByEmpresaIdAndEstadoOrderByFechaRegistroDesc(empresaId, estado);
    }

    // Filtrar por rango de fechas
    public List<Compra> filtrarPorRangoFechas(Long empresaId, LocalDate fechaInicio, LocalDate fechaFin) {
        return compraRepository.buscarPorRangoFechas(empresaId, fechaInicio, fechaFin);
    }

    // Crear nueva compra
    @Transactional
    public Compra crear(CompraRequestDTO dto) {
        // Validaciones
        if (dto.getIdEmpresa() == null) {
            throw new IllegalArgumentException("Debe especificar una empresa");
        }
        if (dto.getDetalles() == null || dto.getDetalles().isEmpty()) {
            throw new IllegalArgumentException("La compra debe tener al menos un producto");
        }

        // Validar que el número de factura no exista
        if (compraRepository.existsByEmpresaIdAndNumeroFactura(dto.getIdEmpresa(), dto.getNumeroFactura())) {
            throw new IllegalArgumentException("Ya existe una compra con el número de factura: " + dto.getNumeroFactura());
        }

        // Buscar entidades relacionadas
        Empresa empresa = empresaRepository.findById(dto.getIdEmpresa())
                .orElseThrow(() -> new ResourceNotFoundException("Empresa no encontrada"));

        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        ClienteProveedor proveedor = clienteProveedorRepository.findById(dto.getIdProveedor())
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado"));

        MetodoPago metodoPago = metodoPagoRepository.findById(dto.getIdMetodoPago())
                .orElseThrow(() -> new ResourceNotFoundException("Método de pago no encontrado"));

        TipoComprobante tipoComprobante = tipoComprobanteRepository.findById(dto.getIdTipoComprobante())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de comprobante no encontrado"));

        // Crear compra
        Compra compra = new Compra();
        compra.setNumeroFactura(dto.getNumeroFactura());
        compra.setFechaEmision(dto.getFechaEmision());
        compra.setProveedor(proveedor);
        compra.setMetodoPago(metodoPago);
        compra.setTipoComprobante(tipoComprobante);
        compra.setObservacion(dto.getObservacion());
        compra.setEstado(dto.getEstado() != null ? dto.getEstado() : "INCOMPLETO");
        compra.setMontoTotal(dto.getMontoTotal());
        compra.setEmpresa(empresa);
        compra.setUsuario(usuario);
        
        // Campos de resumen
        compra.setResumenGravada(dto.getResumenGravada());
        compra.setResumenIGV(dto.getResumenIgv());
        compra.setResumenDescuentoTotal(dto.getResumenDescuentoTotal());
        compra.setResumenTotal(dto.getResumenTotal());

        // Guardar compra
        Compra compraSaved = compraRepository.save(compra);

        // Crear detalles
        List<DetalleCompra> detalles = new ArrayList<>();
        for (DetalleCompraDTO detalleDTO : dto.getDetalles()) {
            Producto producto = productoRepository.findById(detalleDTO.getIdProducto())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + detalleDTO.getIdProducto()));

            DetalleCompra detalle = new DetalleCompra();
            detalle.setCompra(compraSaved);
            detalle.setProducto(producto);
            
            // Campos nuevos
            detalle.setCantidad(detalleDTO.getCantidad());
            detalle.setUnidadMedidaCompra(detalleDTO.getUnidadMedidaCompra());
            detalle.setFactorCompra(detalleDTO.getFactorCompra());
            detalle.setImporte(detalleDTO.getImporte());
            detalle.setValorUnitario(detalleDTO.getValorUnitario());
            
            // Campos antiguos (por compatibilidad)
            detalle.setCantidadEsperada(detalleDTO.getCantidadEsperada());
            detalle.setCantidadRecibida(detalleDTO.getCantidadRecibida());
            detalle.setPrecioCompra(detalleDTO.getPrecioCompra());
            detalle.setSubtotal(detalleDTO.getSubtotal());

            detalles.add(detalle);
        }

        // Guardar detalles
        detalleCompraRepository.saveAll(detalles);

        // Asignar detalles a la compra
        compraSaved.setDetalles(detalles);

        return compraSaved;
    }

    // Actualizar compra completa
    @Transactional
    public Compra actualizar(Long id, CompraRequestDTO dto) {
        Compra compraExistente = obtenerPorId(id);
        
        // Actualizar campos básicos
        compraExistente.setNumeroFactura(dto.getNumeroFactura());
        compraExistente.setFechaEmision(dto.getFechaEmision());
        compraExistente.setObservacion(dto.getObservacion());
        compraExistente.setEstado(dto.getEstado());
        compraExistente.setMontoTotal(dto.getMontoTotal());
        
        // Actualizar campos de resumen
        compraExistente.setResumenGravada(dto.getResumenGravada());
        compraExistente.setResumenIGV(dto.getResumenIgv());
        compraExistente.setResumenDescuentoTotal(dto.getResumenDescuentoTotal());
        compraExistente.setResumenTotal(dto.getResumenTotal());
        
        // Actualizar relaciones si han cambiado
        if (dto.getIdProveedor() != null) {
            ClienteProveedor proveedor = clienteProveedorRepository.findById(dto.getIdProveedor())
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));
            compraExistente.setProveedor(proveedor);
        }
        
        if (dto.getIdMetodoPago() != null) {
            MetodoPago metodoPago = metodoPagoRepository.findById(dto.getIdMetodoPago())
                .orElseThrow(() -> new RuntimeException("Método de pago no encontrado"));
            compraExistente.setMetodoPago(metodoPago);
        }
        
        if (dto.getIdTipoComprobante() != null) {
            TipoComprobante tipoComprobante = tipoComprobanteRepository.findById(dto.getIdTipoComprobante())
                .orElseThrow(() -> new RuntimeException("Tipo de comprobante no encontrado"));
            compraExistente.setTipoComprobante(tipoComprobante);
        }
        
        // Actualizar detalles si vienen en el DTO
        if (dto.getDetalles() != null && !dto.getDetalles().isEmpty()) {
            // Eliminar detalles antiguos
            detalleCompraRepository.deleteAll(compraExistente.getDetalles());
            compraExistente.getDetalles().clear();
            
            // Agregar nuevos detalles
            for (DetalleCompraDTO detalleDTO : dto.getDetalles()) {
                Producto producto = productoRepository.findById(detalleDTO.getIdProducto())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
                
                DetalleCompra detalle = new DetalleCompra();
                detalle.setCompra(compraExistente);
                detalle.setProducto(producto);
                
                // Campos nuevos
                detalle.setCantidad(detalleDTO.getCantidad());
                detalle.setUnidadMedidaCompra(detalleDTO.getUnidadMedidaCompra());
                detalle.setFactorCompra(detalleDTO.getFactorCompra());
                detalle.setImporte(detalleDTO.getImporte());
                detalle.setValorUnitario(detalleDTO.getValorUnitario());
                
                // Campos antiguos (por compatibilidad)
                detalle.setCantidadEsperada(detalleDTO.getCantidadEsperada());
                detalle.setCantidadRecibida(detalleDTO.getCantidadRecibida());
                detalle.setPrecioCompra(detalleDTO.getPrecioCompra());
                detalle.setSubtotal(detalleDTO.getSubtotal());
                
                compraExistente.getDetalles().add(detalle);
            }
        }
        
        return compraRepository.save(compraExistente);
    }

    // Filtrar compras con múltiples criterios (por fechaEmision)
    @Transactional(readOnly = true)
    public List<Compra> filtrarCompras(Long empresaId, String estado, Long idProveedor, LocalDate fechaInicio, LocalDate fechaFin, String buscador) {
        return compraRepository.findComprasConFiltros(empresaId, estado, idProveedor, fechaInicio, fechaFin, buscador);
    }

    // Actualizar estado de compra
    @Transactional
    public Compra actualizarEstado(Long id, String nuevoEstado) {
        Compra compra = obtenerPorId(id);
        compra.setEstado(nuevoEstado);
        return compraRepository.save(compra);
    }

    // Eliminar compra
    @Transactional
    public void eliminar(Long id) {
        Compra compra = obtenerPorId(id);
        compraRepository.delete(compra);
    }
}