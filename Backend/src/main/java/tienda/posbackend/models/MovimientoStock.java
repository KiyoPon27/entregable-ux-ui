package tienda.posbackend.models;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ENTIDAD JPA: MovimientoStock
 * 
 * Representa la tabla "movimientos_stock" en MySQL.
 * 
 * FUNCIÓN:
 * Registra TODOS los movimientos de stock (entradas, salidas, ajustes).
 * Es el historial completo de cambios en el inventario.
 * 
 * TIPOS DE MOVIMIENTO:
 * - ENTRADA: Compras, devoluciones de clientes, ajustes positivos
 * - SALIDA: Ventas, devoluciones a proveedores, bajas, mermas
 * - AJUSTE: Correcciones de inventario
 * - TRANSFERENCIA: Entre almacenes
 * 
 * RELACIONES:
 * - Vinculado a Stock (id_stock)
 * - Vinculado a Usuario (id_usuario) que realiza el movimiento
 * - Puede vincularse a Venta (id_venta) si es por venta
 * 
 * IMPORTANTE:
 * Este registro es INMUTABLE (no se edita, solo se crea)
 * Cada cambio en stock genera un nuevo registro aquí
 */
@Data
@Entity
@Table(name = "movimientos_stock")
public class MovimientoStock {

    /**
     * PRIMARY KEY AUTO_INCREMENT
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Campo: id_stock
     * - FOREIGN KEY hacia "stock"
     * - NOT NULL en BD
     * - ON DELETE CASCADE: Si se elimina stock, se eliminan sus movimientos
     */
    @Column(name = "id_stock", nullable = false)
    private Long idStock;

    /**
     * Campo: tipo_movimiento
     * - ENUM('ENTRADA', 'SALIDA', 'AJUSTE', 'TRANSFERENCIA')
     * - Categoriza el tipo de movimiento
     * 
     * En JPA se puede usar @Enumerated o String
     * Aquí usamos String para flexibilidad
     */
    @Column(name = "tipo_movimiento", length = 50, nullable = false)
    private String tipoMovimiento;

    /**
     * Campo: cantidad
     * - INT NOT NULL
     * - Siempre positivo (el tipo indica entrada/salida)
     * 
     * EJEMPLO:
     * - ENTRADA de 10 unidades → cantidad = 10
     * - SALIDA de 5 unidades → cantidad = 5
     */
    @Column(nullable = false)
    private Integer cantidad;

    /**
     * Campo: cantidad_anterior
     * - INT
     * - Stock ANTES del movimiento
     * - Útil para auditoría y rastreo
     */
    @Column(name = "cantidad_anterior")
    private Integer cantidadAnterior;

    /**
     * Campo: cantidad_nueva
     * - INT
     * - Stock DESPUÉS del movimiento
     * - Debe coincidir con stock.cantidad actual
     */
    @Column(name = "cantidad_nueva")
    private Integer cantidadNueva;

    /**
     * Campo: motivo
     * - VARCHAR(255)
     * - Descripción del movimiento
     * 
     * EJEMPLOS:
     * - "Venta #123"
     * - "Compra a proveedor XYZ"
     * - "Ajuste por inventario físico"
     * - "Merma por vencimiento"
     */
    @Column(length = 255)
    private String motivo;

    /**
     * Campo: id_usuario
     * - FOREIGN KEY hacia "usuarios"
     * - Usuario que registra el movimiento
     * - Puede ser NULL en movimientos automáticos
     */
    @Column(name = "id_usuario")
    private Long idUsuario;

    /**
     * Campo: id_venta
     * - FOREIGN KEY hacia "ventas"
     * - NULL si el movimiento no es por venta
     * - Permite rastrear ventas asociadas
     */
    @Column(name = "id_venta")
    private Long idVenta;

    /**
     * Campo: precio_unitario
     * - DECIMAL(10,2)
     * - Precio al momento del movimiento
     * - Útil para cálculos de costo de ventas
     */
    @Column(name = "precio_unitario", precision = 10, scale = 2)
    private BigDecimal precioUnitario;

    /**
     * Campo: fecha_movimiento
     * - DEFAULT CURRENT_TIMESTAMP
     * - Fecha y hora del movimiento
     * - updatable = false: INMUTABLE
     */
    @Column(name = "fecha_movimiento", updatable = false)
    private LocalDateTime fechaMovimiento;

    /**
     * @PrePersist: Se ejecuta ANTES de INSERT
     * - Asigna fecha actual automáticamente
     */
    @PrePersist
    protected void onCreate() {
        if (fechaMovimiento == null) {
            fechaMovimiento = LocalDateTime.now();
        }
    }
}
