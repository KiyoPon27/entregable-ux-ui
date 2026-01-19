package tienda.posbackend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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

    @ManyToOne
    @JoinColumn(name = "id_categoria")
    @JsonIgnoreProperties({"empresa"})
    private Categoria categoria;

    @Column(name = "codigo_barras")
    private String codigoBarras;

    @Column(name = "codigo_interno")
    private String codigoInterno;

    @ManyToOne
    @JoinColumn(name = "id_empresa")
    @JsonIgnoreProperties({"usuario"})
    private Empresa empresa;

    @Column(name = "sevende_por")
    private String seVendePor;

    @Column(name = "maneja_inventarios")
    private Boolean manejaInventarios;

    @Column(name = "maneja_multiprecios")
    private Boolean manejaMultiprecios;
    
    @Transient
    private BigDecimal stockTotal;
    
    // Todo: Add image column if added to DB later.
}
