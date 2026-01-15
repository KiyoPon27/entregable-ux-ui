package tienda.posbackend.models;

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

    @Column
    private String color;

    @Column(columnDefinition = "VARCHAR(255) DEFAULT '-'")
    private String icono;

    @Column(name = "id_empresa")
    private Long idEmpresa;
}