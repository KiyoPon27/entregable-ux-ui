package tienda.posbackend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DetalleCompraDTO {
    private Long idProducto;
    
    // Campos nuevos
    private BigDecimal cantidad;
    private String unidadMedidaCompra;
    private Integer factorCompra;
    private BigDecimal importe;
    private BigDecimal valorUnitario;
    
    // Campos antiguos (mantenidos por compatibilidad)
    private Integer cantidadEsperada;
    private Integer cantidadRecibida;
    private BigDecimal precioCompra;
    private BigDecimal subtotal;
}