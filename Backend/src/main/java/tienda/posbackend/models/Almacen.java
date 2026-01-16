package tienda.posbackend.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * ENTIDAD JPA: Almacen
 * 
 * Representa la tabla "almacen" en MySQL.
 * 
 * FUNCIÓN:
 * Los almacenes son espacios físicos dentro de una sucursal donde se almacenan productos.
 * Una sucursal puede tener múltiples almacenes.
 * 
 * ESTRUCTURA:
 * Empresa → Sucursales → Almacenes → Stock de Productos
 * 
 * EJEMPLO:
 * - Sucursal Centro → Almacén Principal
 * - Sucursal Centro → Almacén Temporal
 * - Sucursal Norte → Almacén General
 * 
 * RELACIONES:
 * - Pertenece a una Sucursal (id_sucursal)
 * - Tiene registros de Stock (tabla stock)
 * - Tiene Movimientos de Stock (tabla movimientos_stock)
 * 
 * TRIGGERS RELACIONADOS:
 * - insertpordefecto: Al crear empresa, crea sucursal y almacén por defecto
 */
@Data
@Entity
@Table(name = "almacen")
public class Almacen {

    /**
     * PRIMARY KEY AUTO_INCREMENT
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Campo: id_sucursal
     * - FOREIGN KEY hacia "sucursales"
     * - NOT NULL en BD
     * - ON DELETE CASCADE: Si se elimina sucursal, se eliminan sus almacenes
     */
    @Column(name = "id_sucursal", nullable = false)
    private Long idSucursal;

    /**
     * Campo: fecha_creacion
     * - DEFAULT CURRENT_TIMESTAMP en MySQL
     * - Se asigna automáticamente al crear
     * - updatable = false: No se modifica en UPDATE
     */
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    /**
     * Campo: delete
     * - TINYINT(1) → Boolean en Java
     * - DEFAULT 1 (true) = Se puede eliminar
     * - false = Almacén principal, no se puede eliminar
     * 
     * En Java: "deletable" para evitar palabra reservada "delete"
     */
    @Column(name = "`delete`", columnDefinition = "TINYINT(1) DEFAULT 1")
    private Boolean deletable;

    /**
     * Campo: nombre
     * - Nombre identificativo del almacén
     * - Ejemplo: "Almacén Principal", "Depósito Temporal"
     */
    @Column(length = 255)
    private String nombre;

    /**
     * Campo: default
     * - TINYINT(1) → Boolean
     * - DEFAULT 1 (true) = Es el almacén por defecto de la sucursal
     * - false = Almacén secundario
     * 
     * IMPORTANTE: Solo debe haber UN almacén con default=true por sucursal
     * 
     * En Java: "isDefault" para evitar palabra reservada "default"
     */
    @Column(name = "`default`", columnDefinition = "TINYINT(1) DEFAULT 1")
    private Boolean isDefault;

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
