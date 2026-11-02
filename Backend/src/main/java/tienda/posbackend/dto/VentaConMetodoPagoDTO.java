package tienda.posbackend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class VentaConMetodoPagoDTO {
    private Long id;
    private LocalDateTime fecha;
    private BigDecimal montoTotal;
    private BigDecimal totalImpuestos;
    private BigDecimal subTotal;
    private String nroComprobante;
    private String numeroSunat; // Número de comprobante registrado en SUNAT
    private String tipoComprobante;
    private String rucDni;
    private String clienteNombre;
    private String metodoPago; // "Efectivo", "Tarjeta", "Mixto", etc.
    private List<MetodoPagoDetalle> metodosPagoDetalle; // Para desglose
    
    // CAMPOS DE DESCUENTO
    private BigDecimal porcentajeDescuento; // Porcentaje de descuento (0-100)
    private BigDecimal montoDescuento; // Monto del descuento calculado

    @Data
    public static class MetodoPagoDetalle {
        private String nombre;
        private BigDecimal monto;
    }
}