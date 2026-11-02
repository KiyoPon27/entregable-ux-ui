package tienda.posbackend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
    @JsonIgnoreProperties({"sucursal"})
    private Almacen almacen;

    @ManyToOne
    @JoinColumn(name = "id_producto")
    @JsonIgnoreProperties({"categoria", "empresa"})
    private Producto producto;

    @Column(name = "stock")
    private BigDecimal stock;

    @Column(name = "stock_minimo")
    private BigDecimal stockMinimo;

    private String ubicacion;
}
