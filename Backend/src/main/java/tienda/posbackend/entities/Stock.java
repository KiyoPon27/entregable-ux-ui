package tienda.posbackend.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "stock")
public class Stock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_almacen")
    private Almacen almacen;

    @ManyToOne
    @JoinColumn(name = "id_producto")
    private Producto producto;

    @Column(name = "stock")
    private BigDecimal cantidad;

    @Column(name = "stock_minimo")
    private BigDecimal stockMinimo;

    private String ubicacion;
}
