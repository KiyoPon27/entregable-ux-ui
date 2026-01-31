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
    private String nroComprobante;
    private String tipoComprobante;
    private String rucDni;
    private String clienteNombre;
    private String metodoPago; // "Efectivo", "Tarjeta", "Mixto", etc.
    private List<MetodoPagoDetalle> metodosPagoDetalle; // Para desglose

    @Data
    public static class MetodoPagoDetalle {
        private String nombre;
        private BigDecimal monto;
    }
}
