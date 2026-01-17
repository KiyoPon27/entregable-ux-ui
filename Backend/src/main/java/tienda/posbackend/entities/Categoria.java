package tienda.posbackend.entities;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "categorias")
public class Categoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    private String color;
    private String icono;

    @ManyToOne
    @JoinColumn(name = "id_empresa")
    private Empresa empresa;
}
