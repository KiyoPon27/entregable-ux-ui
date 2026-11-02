package tienda.posbackend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "movimientos_stock")
public class MovimientoStock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_almacen", nullable = false)
    @JsonIgnoreProperties({"sucursal", "stocks"})
    private Almacen almacen;

    @ManyToOne
    @JoinColumn(name = "id_producto")
    @JsonIgnoreProperties({"categoria", "empresa", "stocks"})
    private Producto producto;

    @Column(name = "tipo_movimiento", length = 50)
    private String tipoMovimiento; // ENTRADA, SALIDA, AJUSTE_ENTRADA, AJUSTE_SALIDA, TRASPASO

    @Column(precision = 15, scale = 2)
    private BigDecimal cantidad;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Column(length = 500)
    private String detalle;

    @Column(length = 255)
    private String origen; // POS, AJUSTE_MANUAL, TRASPASO, COMPRA, VENTA

    @PrePersist
    protected void onCreate() {
        if (fecha == null) {
            fecha = LocalDateTime.now();
        }
        if (detalle == null) {
            detalle = "-";
        }
        if (origen == null) {
            origen = "-";
        }
    }
}
