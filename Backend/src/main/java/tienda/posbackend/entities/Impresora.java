package tienda.posbackend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "impresoras")
public class Impresora {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Usuario usuario;

    @Column(name = "nombre_pc", columnDefinition = "VARCHAR(255) DEFAULT '-'")
    private String nombrePc;

    @Column(name = "ip_local", columnDefinition = "VARCHAR(255) DEFAULT '-'")
    private String ipLocal;

    @Column(columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean estado;

    @Column(columnDefinition = "VARCHAR(255) DEFAULT '-'")
    private String nombre;

    // Constructores
    public Impresora() {
        this.nombrePc = "-";
        this.ipLocal = "-";
        this.estado = false;
        this.nombre = "-";
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getNombrePc() {
        return nombrePc;
    }

    public void setNombrePc(String nombrePc) {
        this.nombrePc = nombrePc;
    }

    public String getIpLocal() {
        return ipLocal;
    }

    public void setIpLocal(String ipLocal) {
        this.ipLocal = ipLocal;
    }

    public Boolean getEstado() {
        return estado;
    }

    public void setEstado(Boolean estado) {
        this.estado = estado;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}
