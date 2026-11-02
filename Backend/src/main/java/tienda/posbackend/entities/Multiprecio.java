package tienda.posbackend.entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "multiprecios")
public class Multiprecio {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "precio_venta", nullable = false)
    private BigDecimal precioVenta;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto")
    private Producto producto;
    
    private BigDecimal cantidad;
    
    @Column(name = "nombre_referencial", nullable = true)
    private String nombreReferencial;
    
    // Constructors
    public Multiprecio() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public BigDecimal getPrecioVenta() {
        return precioVenta;
    }
    
    public void setPrecioVenta(BigDecimal precioVenta) {
        this.precioVenta = precioVenta;
    }
    
    @JsonIgnore
    public Producto getProducto() {
        return producto;
    }
    
    public void setProducto(Producto producto) {
        this.producto = producto;
    }
    
    @JsonProperty("id_producto")
    public Long getProductoId() {
        return producto != null ? producto.getId() : null;
    }
    
    @JsonSetter("idProducto")
    public void setProductoId(Long idProducto) {
        // Este método se usa solo para recibir el ID desde JSON
        // El producto real se asignará en el service
        if (this.producto == null && idProducto != null) {
            this.producto = new Producto();
            this.producto.setId(idProducto);
        }
    }
    
    public BigDecimal getCantidad() {
        return cantidad;
    }
    
    public void setCantidad(BigDecimal cantidad) {
        this.cantidad = cantidad;
    }
    
    public String getNombreReferencial() {
        return nombreReferencial;
    }
    
    public void setNombreReferencial(String nombreReferencial) {
        this.nombreReferencial = nombreReferencial;
    }
}
