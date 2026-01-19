package tienda.posbackend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "serializacion_comprobantes")
public class SerializacionComprobante {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_tipo_comprobante", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private TipoComprobante tipoComprobante;

    @Column(length = 50)
    private String serie;

    @Column(name = "cantidad_numeros")
    private Long cantidadNumeros;

    private Long correlativo;

    @ManyToOne
    @JoinColumn(name = "sucursal_id")
    @JsonIgnoreProperties({"empresa"})
    private Sucursal sucursal;

    @Column(name = "por_defecto")
    private Boolean porDefecto;

    @PrePersist
    public void prePersist() {
        if (correlativo == null) {
            correlativo = 1L;
        }
        if (cantidadNumeros == null) {
            cantidadNumeros = 8L;
        }
        if (porDefecto == null) {
            porDefecto = false;
        }
    }

    // Método para generar el número de comprobante formateado
    public String generarNumeroComprobante() {
        String formato = "%0" + cantidadNumeros + "d";
        return serie + "-" + String.format(formato, correlativo);
    }

    // Método para incrementar el correlativo
    public void incrementarCorrelativo() {
        this.correlativo++;
    }
}
