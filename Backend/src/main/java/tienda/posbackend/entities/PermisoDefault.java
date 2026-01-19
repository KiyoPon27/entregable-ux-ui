package tienda.posbackend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "permisos_default")
public class PermisoDefault {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_rol", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Rol rol;

    @ManyToOne
    @JoinColumn(name = "id_modulo")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Modulo modulo;
}
