package tienda.posbackend.entities;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "asignacion_sucursal")
public class AsignacionSucursal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_sucursal", nullable = false)
    private Sucursal sucursal;

    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "id_caja")
    private Caja caja;
}
