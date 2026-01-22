package tienda.posbackend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "productos")
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(name = "precio_venta")
    private BigDecimal precioVenta;

    @Column(name = "precio_compra")
    private BigDecimal precioCompra;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categoria")
    @JsonIgnoreProperties({"empresa", "hibernateLazyInitializer", "handler"})
    private Categoria categoria;

    @Column(name = "codigo_barras")
    private String codigoBarras;

    @Column(name = "codigo_interno")
    private String codigoInterno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_empresa")
    @JsonIgnoreProperties({"usuario", "hibernateLazyInitializer", "handler"})
    private Empresa empresa;

    @Column(name = "sevende_por")
    private String seVendePor;

    @Column(name = "maneja_inventarios")
    private Boolean manejaInventarios;

    @Column(name = "maneja_multiprecios")
    private Boolean manejaMultiprecios;

    @Column(length = 20)
    private String estado = "ACTIVO";
    
    @Column(name = "tipo_comprobante")
    private String tipoComprobante; // 'FACTURA' o 'BOLETA'
    
    @Transient
    private BigDecimal stockTotal;
    
    // Exponer IDs directamente para evitar problemas de serialización
    @JsonProperty("id_categoria")
    public Long getIdCategoria() {
        return categoria != null ? categoria.getId() : null;
    }
    
    @JsonProperty("id_empresa")
    public Long getIdEmpresa() {
        return empresa != null ? empresa.getId() : null;
    }
    
    
}
