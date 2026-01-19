package tienda.posbackend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DetalleVentaDTO {
    private Long idVenta;
    private Long idProducto;
    private Long idSucursal;
    private Long idAlmacen;
    private BigDecimal cantidad;
    private BigDecimal precioVenta;
    private BigDecimal precioCompra;
    private String descripcion;
    
    // For update
    private Long id;
    private BigDecimal total;
}
