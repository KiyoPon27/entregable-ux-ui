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
    private String pagoCon; // Nuevo campo para método de pago
}
