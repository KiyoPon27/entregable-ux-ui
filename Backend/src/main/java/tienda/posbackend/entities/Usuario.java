package tienda.posbackend.entities;

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

    @Column(nullable = false)
    private String nombres;

    @ManyToOne
    @JoinColumn(name = "id_tipodocumento")
    private TipoDocumento tipoDocumento;

    @Column(name = "nro_doc")
    private String nroDoc;

    private String telefono;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_rol")
    private Rol rol;

    private String correo;

    @Column(nullable = false)
    private String password;

    @Column(name = "fecharegistro")
    private LocalDateTime fechaRegistro;

    private String estado;

    @Column(name = "id_auth", unique = true)
    private String idAuth;

    private String tema;
}
