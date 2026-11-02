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
public class ReporteVentaSucursalDTO {
    private Long idVenta;
    private LocalDateTime fecha;
    private BigDecimal montoTotal;
    private BigDecimal totalImpuestos;
    private BigDecimal subtotal;
    private BigDecimal saldo;
    private Long cantidadProductos;
    private Long idUsuario;
    private String cajero;
    private Long idCliente;
    private String estado;
}
