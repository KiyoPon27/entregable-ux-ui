package tienda.posbackend.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * ENTIDAD JPA: Stock
 * 
 * Representa la tabla "stock" en MySQL.
 * 
 * FUNCIÓN:
 * Controla la cantidad disponible de cada producto en cada almacén.
 * 
 * ESTRUCTURA:
 * - Cada producto puede tener stock en múltiples almacenes
 * - Cada almacén puede tener múltiples productos
 * - Relación MANY-TO-MANY entre Producto y Almacén
 * 
 * EJEMPLO:
 * - Producto "Coca Cola" → Almacén Principal → Cantidad: 100
 * - Producto "Coca Cola" → Almacén Temporal → Cantidad: 50
 * - Producto "Pepsi" → Almacén Principal → Cantidad: 75
 * 
 * RESTRICCIÓN ÚNICA:
 * Un producto solo puede tener UN registro de stock por almacén
 * UNIQUE(id_producto, id_almacen)
 * 
 * MOVIMIENTOS:
 * Cada cambio de cantidad se registra en "movimientos_stock"
 */
@Data
@Entity
@Table(name = "stock")
public class Stock {

    /**
     * PRIMARY KEY AUTO_INCREMENT
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Campo: id_producto
     * - FOREIGN KEY hacia "productos"
     * - NOT NULL en BD
     * - ON DELETE CASCADE: Si se elimina producto, se elimina su stock
     * 
     * IMPORTANTE: Parte de UNIQUE(id_producto, id_almacen)
     */
    @Column(name = "id_producto", nullable = false)
    private Long idProducto;

    /**
     * Campo: id_almacen
     * - FOREIGN KEY hacia "almacen"
     * - NOT NULL en BD
     * - ON DELETE CASCADE: Si se elimina almacén, se elimina su stock
     * 
     * IMPORTANTE: Parte de UNIQUE(id_producto, id_almacen)
     */
    @Column(name = "id_almacen", nullable = false)
    private Long idAlmacen;

    /**
     * Campo: cantidad
     * - INT NOT NULL DEFAULT 0
     * - Puede ser negativo en casos especiales (ventas pendientes)
     * - El frontend puede alertar si cantidad < 0
     * 
     * IMPORTANTE:
     * - Se incrementa con entradas (compras, devoluciones)
     * - Se decrementa con salidas (ventas, bajas)
     */
    @Column(nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer cantidad;

    /**
     * Campo: fecha_registro
     * - DEFAULT CURRENT_TIMESTAMP en MySQL
     * - Se asigna automáticamente al crear
     * - updatable = false: No se modifica en UPDATE
     */
    @Column(name = "fecha_registro", updatable = false)
    private LocalDateTime fechaRegistro;

    /**
     * Campo: fecha_actualizacion
     * - ON UPDATE CURRENT_TIMESTAMP en MySQL
     * - Se actualiza automáticamente en cada UPDATE
     * 
     * En JPA no hay equivalente directo de ON UPDATE CURRENT_TIMESTAMP
     * Se debe actualizar manualmente en el Service
     */
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    /**
     * @PrePersist: Se ejecuta ANTES de INSERT
     * - Asigna fecha de registro
     */
    @PrePersist
    protected void onCreate() {
        if (fechaRegistro == null) {
            fechaRegistro = LocalDateTime.now();
        }
        fechaActualizacion = LocalDateTime.now();
    }

    /**
     * @PreUpdate: Se ejecuta ANTES de UPDATE
     * - Actualiza fecha de actualización (simula ON UPDATE CURRENT_TIMESTAMP)
     */
    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
}
