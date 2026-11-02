package tienda.posbackend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "sucursales")
public class Sucursal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    @Column(name = "direccion_fiscal")
    private String direccionFiscal;

    @ManyToOne
    @JoinColumn(name = "id_empresa")
    @JsonIgnoreProperties({"usuario"})
    private Empresa empresa;

    private Boolean eliminar;
}
