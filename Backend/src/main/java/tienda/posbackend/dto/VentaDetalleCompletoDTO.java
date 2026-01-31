package tienda.posbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VentaDetalleCompletoDTO {
    
    // Datos de la empresa
    private EmpresaDTO dataempresa;
    
    // Datos de la venta
    private VentaDTO dataventas;
    
    // Productos vendidos
    private List<ProductoVentaDTO> productos;
    
    // Datos del cliente
    private ClienteDTO dataCliente;
    
    // Sucursal asociada a la venta
    private SucursalDTO sucursal;
    
    // Métodos de pago
    private List<MetodoPagoDTO> metodosPago;
    
    // Nombre del comprobante (TICKET, BOLETA, FACTURA)
    private String nombreComprobante;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmpresaDTO {
        private Long id;
        private String nombre;
        private String logo;
        private String id_fiscal;
        private String idFiscal;
        private String direccion_fiscal;
        private String direccionFiscal;
        private String simbolo_moneda;
        private String simboloMoneda;
        private String nombre_moneda;
        private String nombreMoneda;
        private String pie_pagina_ticket;
        private String piePaginaTicket;
        private String impuesto;
        private BigDecimal valor_impuesto;
        private BigDecimal valorImpuesto;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VentaDTO {
        private Long id;
        private String nroComprobante;
        private LocalDateTime fecha;
        private BigDecimal montoTotal;
        private BigDecimal subTotal;
        private BigDecimal totalImpuestos;
        private String rucDni;
        private String tipoComprobante;
        private String estado;
        private UsuarioDTO usuario;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductoVentaDTO {
        private Long id;
        private Integer cantidad;
        private BigDecimal precio_venta;
        private BigDecimal precioVenta;
        private BigDecimal total;
        private ProductoSimpleDTO productos;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductoSimpleDTO {
        private Long id;
        private String nombre;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClienteDTO {
        private Long id;
        private String nombres;
        private String identificador_fiscal;
        private String identificadorFiscal;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SucursalDTO {
        private Long id;
        private String nombre;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MetodoPagoDTO {
        private String tipo;
        private BigDecimal monto;
        private BigDecimal vuelto;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UsuarioDTO {
        private Long id;
        private String nombres;
    }
}
