package tienda.posbackend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DetalleCompraDTO {
    private Long idProducto;
    private Integer cantidadEsperada;
    private Integer cantidadRecibida;
    private BigDecimal precioCompra;
    private BigDecimal subtotal;
}