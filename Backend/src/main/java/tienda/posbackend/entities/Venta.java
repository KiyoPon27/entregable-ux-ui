package tienda.posbackend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "ventas")
public class Venta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Column(name = "monto_total")
    private BigDecimal montoTotal;

    @Column(name = "total_impuestos")
    private BigDecimal totalImpuestos;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Usuario usuario;

    private BigDecimal saldo;
    
    @Column(name = "pago_con")
    private BigDecimal pagoCon;
    
    @Column(name = "referencia_tarjeta")
    private String referenciaTarjeta;
    
    @Column(name = "vuelto")
    private BigDecimal vuelto;

    @Column(name = "cantidad_productos")
    private Long cantidadProductos;

    @Column(name = "sub_total")
    private BigDecimal subTotal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cliente")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private ClienteProveedor cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sucursal")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Sucursal sucursal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_empresa")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Empresa empresa;

    private String estado; // 'pendiente', 'confirmada'

    @Column(name = "valor_impuesto")
    private BigDecimal valorImpuesto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cierre_caja")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private CierreCaja cierreCaja;

    @Column(name = "nro_comprobante")
    private String nroComprobante;
    
    /* 
       Optional: relationship to DetalleVenta 
       Mapped by "venta" field in DetalleVenta
    */
    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("venta")
    private List<DetalleVenta> detalles;
}
