package tienda.posbackend.models;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ENTIDAD JPA: Venta
 * 
 * Representa la tabla "ventas" en MySQL.
 * 
 * FUNCIÓN:
 * Registra las ventas realizadas en el sistema POS.
 * Es la cabecera de la venta, los productos vendidos están en "detalle_venta".
 * 
 * ESTRUCTURA:
 * Venta (cabecera) → DetalleVenta (productos) → MovimientoStock (afecta inventario)
 * 
 * FLUJO DE VENTA:
 * 1. Se crea registro en "ventas" con totales
 * 2. Se crean N registros en "detalle_venta" (uno por producto)
 * 3. Se decrementan cantidades en "stock"
 * 4. Se registran movimientos en "movimientos_stock"
 * 5. Se registra pago en "movimientos_caja"
 * 
 * ESTADOS POSIBLES:
 * - COMPLETADA: Venta finalizada exitosamente
 * - ANULADA: Venta cancelada
 * - PENDIENTE: Venta en proceso (opcional)
 */
@Data
@Entity
@Table(name = "ventas")
public class Venta {

    /**
     * PRIMARY KEY AUTO_INCREMENT
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Campo: id_empresa
     * - FOREIGN KEY hacia "empresa"
     * - NOT NULL en BD
     */
    @Column(name = "id_empresa", nullable = false)
    private Long idEmpresa;

    /**
     * Campo: id_usuario
     * - FOREIGN KEY hacia "usuarios"
     * - Usuario (cajero) que realiza la venta
     * - NOT NULL en BD
     */
    @Column(name = "id_usuario", nullable = false)
    private Long idUsuario;

    /**
     * Campo: id_cliente
     * - FOREIGN KEY hacia "clientes_proveedores"
     * - Puede ser NULL (venta sin cliente registrado)
     * - Si es NULL, es venta genérica
     */
    @Column(name = "id_cliente")
    private Long idCliente;

    /**
     * Campo: id_sucursal
     * - FOREIGN KEY hacia "sucursales"
     * - Sucursal donde se realiza la venta
     * - NOT NULL en BD
     */
    @Column(name = "id_sucursal", nullable = false)
    private Long idSucursal;

    /**
     * Campo: id_caja
     * - FOREIGN KEY hacia "caja"
     * - Caja registradora utilizada
     * - NOT NULL en BD
     */
    @Column(name = "id_caja", nullable = false)
    private Long idCaja;

    /**
     * Campo: id_almacen
     * - FOREIGN KEY hacia "almacen"
     * - Almacén del cual se descuenta el stock
     * - NOT NULL en BD
     */
    @Column(name = "id_almacen", nullable = false)
    private Long idAlmacen;

    /**
     * Campo: id_metodo_pago
     * - FOREIGN KEY hacia "metodos_pago"
     * - Método de pago utilizado (efectivo, tarjeta, etc.)
     * - NOT NULL en BD
     */
    @Column(name = "id_metodo_pago", nullable = false)
    private Long idMetodoPago;

    /**
     * Campo: subtotal
     * - DECIMAL(10,2) NOT NULL
     * - Suma de (precio * cantidad) de todos los productos
     * - ANTES de aplicar descuentos e impuestos
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    /**
     * Campo: descuento
     * - DECIMAL(10,2) DEFAULT 0.00
     * - Descuento aplicado a la venta
     * - Puede ser porcentaje o valor fijo (según implementación frontend)
     */
    @Column(precision = 10, scale = 2, columnDefinition = "DECIMAL(10,2) DEFAULT 0.00")
    private BigDecimal descuento;

    /**
     * Campo: impuesto
     * - DECIMAL(10,2) DEFAULT 0.00
     * - Impuesto aplicado (IVA, IGV, etc.)
     * - Calculado sobre (subtotal - descuento)
     */
    @Column(precision = 10, scale = 2, columnDefinition = "DECIMAL(10,2) DEFAULT 0.00")
    private BigDecimal impuesto;

    /**
     * Campo: total
     * - DECIMAL(10,2) NOT NULL
     * - Total final de la venta
     * - total = subtotal - descuento + impuesto
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    /**
     * Campo: estado
     * - VARCHAR(50) DEFAULT 'COMPLETADA'
     * - Estados: COMPLETADA, ANULADA, PENDIENTE
     */
    @Column(length = 50, columnDefinition = "VARCHAR(50) DEFAULT 'COMPLETADA'")
    private String estado;

    /**
     * Campo: fecha_venta
     * - TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     * - Fecha y hora de la venta
     * - updatable = false: No se modifica
     */
    @Column(name = "fecha_venta", updatable = false)
    private LocalDateTime fechaVenta;

    /**
     * Campo: observaciones
     * - TEXT
     * - Notas adicionales sobre la venta
     * - Puede ser NULL
     */
    @Column(columnDefinition = "TEXT")
    private String observaciones;

    /**
     * @PrePersist: Se ejecuta ANTES de INSERT
     * - Asigna fecha de venta automáticamente
     * - Asigna valores por defecto
     */
    @PrePersist
    protected void onCreate() {
        if (fechaVenta == null) {
            fechaVenta = LocalDateTime.now();
        }
        if (estado == null) {
            estado = "COMPLETADA";
        }
        if (descuento == null) {
            descuento = BigDecimal.ZERO;
        }
        if (impuesto == null) {
            impuesto = BigDecimal.ZERO;
        }
    }
}
