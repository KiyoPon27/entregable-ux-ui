package tienda.posbackend.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "clientes_proveedores")
public class ClienteProveedor {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String nombres;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_empresa")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Empresa empresa;
    
    @Column(length = 500)
    private String direccion = "-";
    
    @Column(length = 50)
    private String telefono = "-";
    
    private String email = "-";
    
    @Column(name = "identificador_nacional", length = 50)
    private String identificadorNacional = "-";
    
    @Column(name = "identificador_fiscal", length = 50)
    private String identificadorFiscal = "-";
    
    @Column(length = 50)
    private String tipo = "-"; // CLIENTE o PROVEEDOR o AMBOS
    
    @Column(length = 50)
    private String estado = "activo";
    
    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;
    
    @PrePersist
    protected void onCreate() {
        if (this.fechaRegistro == null) {
            this.fechaRegistro = LocalDateTime.now();
        }
        if (this.direccion == null || this.direccion.trim().isEmpty()) {
            this.direccion = "-";
        }
        if (this.telefono == null || this.telefono.trim().isEmpty()) {
            this.telefono = "-";
        }
        if (this.email == null || this.email.trim().isEmpty()) {
            this.email = "-";
        }
        if (this.identificadorNacional == null || this.identificadorNacional.trim().isEmpty()) {
            this.identificadorNacional = "-";
        }
        if (this.identificadorFiscal == null || this.identificadorFiscal.trim().isEmpty()) {
            this.identificadorFiscal = "-";
        }
        if (this.tipo == null || this.tipo.trim().isEmpty()) {
            this.tipo = "-";
        }
        if (this.estado == null || this.estado.trim().isEmpty()) {
            this.estado = "activo";
        }
    }
    
    // Getters y Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getNombres() {
        return nombres;
    }
    
    public void setNombres(String nombres) {
        this.nombres = nombres;
    }
    
    public Empresa getEmpresa() {
        return empresa;
    }
    
    public void setEmpresa(Empresa empresa) {
        this.empresa = empresa;
    }
    
    public String getDireccion() {
        return direccion;
    }
    
    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }
    
    public String getTelefono() {
        return telefono;
    }
    
    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getIdentificadorNacional() {
        return identificadorNacional;
    }
    
    public void setIdentificadorNacional(String identificadorNacional) {
        this.identificadorNacional = identificadorNacional;
    }
    
    public String getIdentificadorFiscal() {
        return identificadorFiscal;
    }
    
    public void setIdentificadorFiscal(String identificadorFiscal) {
        this.identificadorFiscal = identificadorFiscal;
    }
    
    public String getTipo() {
        return tipo;
    }
    
    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
    
    public String getEstado() {
        return estado;
    }
    
    public void setEstado(String estado) {
        this.estado = estado;
    }
    
    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }
    
    public void setFechaRegistro(LocalDateTime fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }
}
