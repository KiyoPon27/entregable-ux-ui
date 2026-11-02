package tienda.posbackend.entities;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "modulos")
public class Modulo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    private Boolean marcado;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    private String icono;
    private String enlace;
    private String etiquetas;
}
