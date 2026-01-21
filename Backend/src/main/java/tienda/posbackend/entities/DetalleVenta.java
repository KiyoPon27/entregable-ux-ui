package tienda.posbackend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "detalle_venta")
public class DetalleVenta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_venta")
    @JsonIgnoreProperties({"detalles", "hibernateLazyInitializer", "handler"})
    private Venta venta;

    private BigDecimal cantidad;

    @Column(name = "precio_venta")
    private BigDecimal precioVenta;

    private BigDecimal total;
    
    private String descripcion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Producto producto;

    @Column(name = "precio_compra")
    private BigDecimal precioCompra;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sucursal")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Sucursal sucursal;

    private String estado; // 'nueva'

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_almacen")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Almacen almacen;
    
    // Exponer IDs directamente para evitar problemas de serialización
    @JsonProperty("id_venta")
    public Long getIdVenta() {
        return venta != null ? venta.getId() : null;
    }
    
    @JsonProperty("id_producto")
    public Long getIdProducto() {
        return producto != null ? producto.getId() : null;
    }
    
    @JsonProperty("id_sucursal")
    public Long getIdSucursal() {
        return sucursal != null ? sucursal.getId() : null;
    }
    
    @JsonProperty("id_almacen")
    public Long getIdAlmacen() {
        return almacen != null ? almacen.getId() : null;
    }
}
