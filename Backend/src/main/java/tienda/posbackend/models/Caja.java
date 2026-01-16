package tienda.posbackend.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * ENTIDAD JPA: Caja
 * 
 * Representa la tabla "caja" en MySQL.
 * 
 * FUNCIÓN:
 * Las cajas son puntos de venta (POS) dentro de una sucursal.
 * Cada usuario se asigna a una caja específica para operar.
 * 
 * RELACIONES:
 * - Pertenece a una Sucursal (id_sucursal)
 * - Tiene un CierreCaja activo o histórico
 * - Tiene una Impresora asociada (trigger insertarimpresora)
 * - Se asigna a Usuarios (asignacion_sucursal)
 * 
 * TRIGGERS RELACIONADOS:
 * - insertarimpresora: Al crear caja, automáticamente crea registro en tabla impresoras
 */
@Data
@Entity
@Table(name = "caja")
public class Caja {

    /**
     * PRIMARY KEY AUTO_INCREMENT
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Campo: descripcion
     * - NOT NULL en BD
     * - Nombre identificativo de la caja
     * - Ejemplo: "Caja 1", "Caja Principal", "POS Norte"
     */
    @Column(nullable = false, length = 255)
    private String descripcion;

    /**
     * Campo: id_sucursal
     * - FOREIGN KEY hacia tabla "sucursales"
     * - ON DELETE CASCADE: Si se elimina sucursal, se eliminan sus cajas
     */
    @Column(name = "id_sucursal")
    private Long idSucursal;

    /**
     * Campo: fecha_creacion
     * - DEFAULT CURRENT_TIMESTAMP en MySQL
     * - Se asigna automáticamente al crear
     */
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    /**
     * Campo: delete
     * - TINYINT(1) → Boolean
     * - DEFAULT 1 (true) = Se puede eliminar
     * - false = Caja principal, no eliminable
     * 
     * En Java: "deletable" para evitar palabra reservada
     */
    @Column(name = "`delete`", columnDefinition = "TINYINT(1) DEFAULT 1")
    private Boolean deletable;

    /**
     * Campo: print
     * - TINYINT(1) → Boolean
     * - DEFAULT 0 (false)
     * - Indica si tiene impresora configurada y activa
     */
    @Column(columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean print;

    /**
     * @PrePersist: Se ejecuta ANTES de INSERT
     * - Asigna fecha actual automáticamente
     */
    @PrePersist
    protected void onCreate() {
        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }
    }
}
