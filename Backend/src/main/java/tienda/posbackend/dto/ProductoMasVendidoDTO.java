package tienda.posbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductoMasVendidoDTO {
    private Long idProducto;
    private String nombreProducto;
    private BigDecimal totalVendido; // Cantidad o monto
    private BigDecimal porcentaje;
}
