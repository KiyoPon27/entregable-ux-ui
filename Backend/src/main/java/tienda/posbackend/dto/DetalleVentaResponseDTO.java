package tienda.posbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetalleVentaResponseDTO {
    private Long id;
    private Long id_venta;
    private ProductoSimpleDTO producto;
    private BigDecimal cantidad;
    
    @JsonProperty("precio_venta")
    private BigDecimal precio_venta;
    
    @JsonProperty("precio_compra")
    private BigDecimal precio_compra;
    
    private BigDecimal total;
    private String descripcion;
    private String estado;
    private Long id_almacen;
    private Long id_sucursal;
    
    // Alias para compatibilidad con Supabase
    @JsonProperty("productos")
    public ProductoSimpleDTO getProductos() {
        return producto;
    }
    
    // DTO simplificado para evitar problemas de lazy loading
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductoSimpleDTO {
        private Long id;
        private String nombre;
        private BigDecimal precioVenta;
        private BigDecimal precioCompra;
        private String codigoBarras;
        private String codigoInterno;
        private String tipoComprobante; // 'FACTURADO' o 'MANUALIDAD'
    }
}
