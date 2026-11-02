package tienda.posbackend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ConfirmarVentaDTO {
    private Long idUsuario;
    private BigDecimal vuelto;
    private Long idTipoComprobante;
    private String serie;
    private Long idSucursal;
    private Long idCliente;
    private LocalDateTime fecha;
    private BigDecimal montoTotal;
    private BigDecimal subTotal; // Monto sin descuento, para cálculos de IGV
    private String pagoCon; // Nuevo campo para método de pago
    private String nroComprobante; // Número de comprobante ingresado manualmente
    private String rucDni; // RUC o DNI del cliente
    
    // CAMPOS DE DESCUENTO
    private BigDecimal porcentajeDescuento; // Porcentaje de descuento (0-100)
    private BigDecimal montoDescuento; // Monto del descuento
}
