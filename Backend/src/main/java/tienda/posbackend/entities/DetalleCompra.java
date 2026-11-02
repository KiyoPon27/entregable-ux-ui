package tienda.posbackend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "detalle_compra")
public class DetalleCompra {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_compra", nullable = false)
    @JsonIgnoreProperties({"detalles", "hibernateLazyInitializer", "handler"})
    private Compra compra;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_producto", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Producto producto;

    // Campos nuevos
    @Column(name = "cantidad", nullable = true, precision = 12, scale = 2)
    private BigDecimal cantidad;

    @Column(name = "unidad_medida_compra", nullable = true)
    private String unidadMedidaCompra = "CJA";

    @Column(name = "factor_compra", nullable = true)
    private Integer factorCompra = 1;

    @Column(name = "importe", nullable = true, precision = 12, scale = 2)
    private BigDecimal importe;

    @Column(name = "valor_unitario", nullable = true, precision = 12, scale = 2)
    private BigDecimal valorUnitario;

    // Campos antiguos (mantenidos por compatibilidad)
    @Column(name = "cantidad_esperada")
    private Integer cantidadEsperada;

    @Column(name = "cantidad_recibida")
    private Integer cantidadRecibida;

    @Column(name = "precio_compra", precision = 12, scale = 2)
    private BigDecimal precioCompra;

    @Column(name = "subtotal", precision = 12, scale = 2)
    private BigDecimal subtotal;
}