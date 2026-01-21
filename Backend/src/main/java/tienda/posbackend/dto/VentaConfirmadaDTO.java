package tienda.posbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VentaConfirmadaDTO {
    private Long id;
    private String estado;
    private String nroComprobante;
    private LocalDateTime fecha;
    private BigDecimal montoTotal;
    private BigDecimal vuelto;
    private Long idUsuario;
    private Long idCliente;
    private Long idSucursal;
}
