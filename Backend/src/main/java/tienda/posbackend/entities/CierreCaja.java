package tienda.posbackend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "cierrecaja")
public class CierreCaja {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fechainicio")
    @JsonProperty("fechainicio")
    private LocalDateTime fechaInicio;

    @Column(name = "fechacierre")
    @JsonProperty("fechacierre")
    private LocalDateTime fechaCierre;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_usuario")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "empresa", "rol"})
    private Usuario usuario;

    @Column(name = "total_efectivo_calculado")
    private BigDecimal totalEfectivoCalculado;

    @Column(name = "total_efectivo_real")
    private BigDecimal totalEfectivoReal;

    private Long estado; // 0 o 1 segun sql

    @Column(name = "diferencia_efectivo")
    private BigDecimal diferenciaEfectivo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_caja")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Caja caja;
}
