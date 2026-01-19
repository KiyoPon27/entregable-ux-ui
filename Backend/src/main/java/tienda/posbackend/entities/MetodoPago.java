package tienda.posbackend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "metodos_pago")
public class MetodoPago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_empresa")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Empresa empresa;

    @Column(columnDefinition = "VARCHAR(255) DEFAULT '-'")
    private String icono;

    @Column(name = "ver_nombre", columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean verNombre;

    @Column(name = "eliminar_actualizar", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean eliminarActualizar;

    // Constructores
    public MetodoPago() {
        this.icono = "-";
        this.verNombre = true;
        this.eliminarActualizar = false;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Empresa getEmpresa() {
        return empresa;
    }

    public void setEmpresa(Empresa empresa) {
        this.empresa = empresa;
    }

    public String getIcono() {
        return icono;
    }

    public void setIcono(String icono) {
        this.icono = icono;
    }

    public Boolean getVerNombre() {
        return verNombre;
    }

    public void setVerNombre(Boolean verNombre) {
        this.verNombre = verNombre;
    }

    public Boolean getEliminarActualizar() {
        return eliminarActualizar;
    }

    public void setEliminarActualizar(Boolean eliminarActualizar) {
        this.eliminarActualizar = eliminarActualizar;
    }
}
