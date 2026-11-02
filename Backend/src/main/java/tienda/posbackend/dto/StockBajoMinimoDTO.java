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
public class StockBajoMinimoDTO {
    private String codigoArticulo;
    private String descripcionArticulo;
    private BigDecimal stock;
    private BigDecimal stockMinimo;
    private BigDecimal precioCosto;
    private BigDecimal total; // stock * precioCosto
}
