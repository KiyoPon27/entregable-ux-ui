package tienda.posbackend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "almacen")
public class Almacen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_sucursal")
    @JsonIgnoreProperties({"empresa"})
    private Sucursal sucursal;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "eliminar")
    private Boolean eliminar;

    private String nombre;

    @Column(name = "defecto")
    private Boolean defecto;

    @PrePersist
    public void prePersist() {
        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }
        if (eliminar == null) {
            eliminar = Boolean.TRUE;
        }
        if (defecto == null) {
            defecto = Boolean.FALSE;
        }
    }
}
