package tienda.posbackend.models;

import jakarta.persistence.*;
import lombok.Data;

/**
 * ENTIDAD JPA: Impresora
 * 
 * Representa la tabla "impresoras" en MySQL.
 * 
 * FUNCIÓN:
 * Almacena configuración de impresoras térmicas/POS por caja registradora.
 * Permite impresión directa sin diálogo del navegador.
 * 
 * RELACIONES:
 * - Pertenece a una Caja (id_caja)
 * - Relación 1:1 con Caja
 * 
 * TRIGGERS RELACIONADOS:
 * - insertarimpresora: Al crear caja, automáticamente crea registro en impresoras
 * - Por eso no hay endpoint de insertar, solo mostrar y editar
 */
@Data
@Entity
@Table(name = "impresoras")
public class Impresora {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Campo: id_caja
     * - FOREIGN KEY hacia tabla "caja"
     * - Relación 1:1 (una impresora por caja)
     */
    @Column(name = "id_caja", nullable = false)
    private Long idCaja;

    /**
     * Campo: name
     * - Nombre de la impresora en el sistema
     * - Ejemplo: "POS-80", "EPSON TM-T20"
     */
    @Column(length = 255)
    private String name;

    /**
     * Campo: pc_name
     * - Nombre del PC donde está conectada la impresora
     */
    @Column(name = "pc_name", length = 255)
    private String pcName;

    /**
     * Campo: ip_local
     * - IP local del PC (para verificar conexión)
     */
    @Column(name = "ip_local", length = 255)
    private String ipLocal;

    /**
     * Campo: state
     * - TINYINT(1) → Boolean
     * - DEFAULT 0 (false) = Impresión con diálogo del navegador
     * - true = Impresión directa sin diálogo
     */
    @Column(columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean state;
}
