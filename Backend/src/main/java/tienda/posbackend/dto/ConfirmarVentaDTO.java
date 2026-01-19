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
    
    // Optional: Payment method details if needed for full context, but SQL didn't request them specifically as args, 
    // although "pago_con", "referencia_tarjeta" exist in Venta table.
}
