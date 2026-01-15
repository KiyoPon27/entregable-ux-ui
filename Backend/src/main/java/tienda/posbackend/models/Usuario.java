package tienda.posbackend.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "usuarios")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombres;

    @Column(name = "nro_doc")
    private String nroDoc;

    private String telefono;

    @Column(name = "id_rol")
    private Long idRol;

    // CAMPOS DE SEGURIDAD
    @Column(unique = true, nullable = false)
    private String correo;

    @Column(nullable = false)
    private String password; // Hash BCrypt

    private String estado;

    @Column(name = "id_auth")
    private String idAuth;

    private String tema;

    @Column(name = "fecharegistro")
    private LocalDateTime fechaRegistro;
}