package tienda.posbackend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "caja")
public class Caja {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String descripcion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_sucursal")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "empresa"})
    private Sucursal sucursal;
    
    // Exponer id_sucursal directamente para evitar problemas de serialización
    @JsonProperty("id_sucursal")
    public Long getIdSucursal() {
        return sucursal != null ? sucursal.getId() : null;
    }

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    private Boolean eliminar;
    private Boolean imprimir;
}
