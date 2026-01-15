package tienda.posbackend.models;

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

    private String nombre;

    @Column(name = "precio_venta")
    private BigDecimal precioVenta;

    @Column(name = "precio_compra")
    private BigDecimal precioCompra;

    @Column(name = "id_categoria")
    private Long idCategoria;

    @Column(name = "codigo_barras")
    private String codigoBarras;

    @Column(name = "codigo_interno")
    private String codigoInterno;

    @Column(name = "id_empresa")
    private Long idEmpresa;

    @Column(name = "sevende_por")
    private String seVendePor;

    @Column(name = "maneja_inventarios")
    private Boolean manejaInventarios;

    @Column(name = "maneja_multiprecios")
    private Boolean manejaMultiprecios;
}