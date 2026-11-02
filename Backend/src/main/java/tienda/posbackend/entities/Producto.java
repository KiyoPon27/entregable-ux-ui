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

    @Transient
    private String codigoBarras;

    @Column(name = "codigo_interno")
    private String codigoInterno;

    // Relación a los códigos alternativos / múltiples de un producto
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private java.util.List<ProductoCodigo> codigos;

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

    @Column(name = "imagen")
    private String imagen; // URL o ruta local de la imagen del producto

    @Column(name = "imagen_base64", columnDefinition = "LONGTEXT")
    private String imagenBase64; // data URI base64 de la imagen (por ejemplo: data:image/jpeg;base64,...)
    
    @Transient
    private BigDecimal stockTotal;
    
    @Transient
    private BigDecimal totalVendido;
    
    @Transient
    private BigDecimal stockInitial;
    
    // Exponer IDs directamente para evitar problemas de serialización
    @JsonProperty("id_categoria")
    public Long getIdCategoria() {
        return categoria != null ? categoria.getId() : null;
    }
    
    @JsonProperty("id_empresa")
    public Long getIdEmpresa() {
        return empresa != null ? empresa.getId() : null;
    }
    
// Getter/Setter personalizados para compatibilidad con el frontend y la nueva tabla producto_codigos
// El campo codigoBarras se mantiene en la clase para recibir el payload, pero es TRANSIENT (no mapea a columna)
// y el getter prioriza devolver el primer código dentro de la relación codigos si existe.
public String getCodigoBarras() {
    if (this.codigoBarras != null && !this.codigoBarras.trim().isEmpty()) {
        return this.codigoBarras;
    }
    if (this.codigos != null && !this.codigos.isEmpty()) {
        ProductoCodigo first = this.codigos.get(0);
        return first != null ? first.getCodigoBarras() : null;
    }
    return null;
}

public void setCodigoBarras(String codigoBarras) {
    this.codigoBarras = codigoBarras;
}

}
