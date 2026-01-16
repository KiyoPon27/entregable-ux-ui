package tienda.posbackend.models;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

/**
 * ENTIDAD JPA: DetalleVenta
 * 
 * Representa la tabla "detalle_venta" en MySQL.
 * 
 * FUNCIÓN:
 * Almacena los productos vendidos en cada venta.
 * Es la relación MANY-TO-MANY entre Venta y Producto.
 * 
 * ESTRUCTURA:
 * Venta (1) → DetalleVenta (N) → Producto
 * 
 * EJEMPLO:
 * Venta #123:
 *   - DetalleVenta 1: 5 Coca Colas a $2.50 = $12.50
 *   - DetalleVenta 2: 3 Pepsis a $2.00 = $6.00
 *   - Total Venta: $18.50
 * 
 * RELACIONES:
 * - Pertenece a una Venta (id_venta)
 * - Referencia un Producto (id_producto)
 * - Referencia el Almacén del cual se tomó el stock (id_almacen)
 */
@Data
@Entity
@Table(name = "detalle_venta")
public class DetalleVenta {

    /**
     * PRIMARY KEY AUTO_INCREMENT
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Campo: id_venta
     * - FOREIGN KEY hacia "ventas"
     * - NOT NULL en BD
     * - ON DELETE CASCADE: Si se elimina venta, se eliminan sus detalles
     */
    @Column(name = "id_venta", nullable = false)
    private Long idVenta;

    /**
     * Campo: id_producto
     * - FOREIGN KEY hacia "productos"
     * - NOT NULL en BD
     * - Producto vendido
     */
    @Column(name = "id_producto", nullable = false)
    private Long idProducto;

    /**
     * Campo: id_almacen
     * - FOREIGN KEY hacia "almacen"
     * - NOT NULL en BD
     * - Almacén del cual se descontó el stock
     */
    @Column(name = "id_almacen", nullable = false)
    private Long idAlmacen;

    /**
     * Campo: cantidad
     * - INT NOT NULL
     * - Cantidad de unidades vendidas
     * - Debe ser mayor a 0
     */
    @Column(nullable = false)
    private Integer cantidad;

    /**
     * Campo: precio_unitario
     * - DECIMAL(10,2) NOT NULL
     * - Precio al momento de la venta
     * 
     * IMPORTANTE:
     * Se guarda el precio histórico, no el precio actual del producto.
     * Esto permite que los reportes sean precisos incluso si el precio cambia.
     */
    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;

    /**
     * Campo: subtotal
     * - DECIMAL(10,2) NOT NULL
     * - subtotal = cantidad * precio_unitario
     * - Es calculado antes de guardar
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    /**
     * @PrePersist: Se ejecuta ANTES de INSERT
     * - Calcula subtotal automáticamente
     */
    @PrePersist
    protected void onCreate() {
        if (subtotal == null && cantidad != null && precioUnitario != null) {
            subtotal = precioUnitario.multiply(BigDecimal.valueOf(cantidad));
        }
    }

    /**
     * @PreUpdate: Se ejecuta ANTES de UPDATE
     * - Recalcula subtotal si cambian cantidad o precio
     */
    @PreUpdate
    protected void onUpdate() {
        if (cantidad != null && precioUnitario != null) {
            subtotal = precioUnitario.multiply(BigDecimal.valueOf(cantidad));
        }
    }
}
