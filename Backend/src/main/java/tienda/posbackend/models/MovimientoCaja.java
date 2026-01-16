package tienda.posbackend.models;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ENTIDAD JPA: MovimientoCaja
 * 
 * Representa la tabla "movimientos_caja" en MySQL.
 * 
 * FUNCIÓN:
 * Registra TODOS los movimientos de dinero en las cajas registradoras.
 * Es el libro contable de cada caja.
 * 
 * TIPOS DE MOVIMIENTO:
 * - VENTA: Ingreso por venta
 * - APERTURA: Efectivo inicial al abrir caja
 * - CIERRE: Efectivo al cerrar caja
 * - INGRESO: Otros ingresos (depósitos, abonos)
 * - EGRESO: Salidas (gastos, retiros)
 * - ANULACION: Devolución por venta anulada
 * 
 * RELACIONES:
 * - Vinculado a Caja (id_caja)
 * - Vinculado a Usuario (id_usuario) que realiza el movimiento
 * - Puede vincularse a Venta (id_venta) si es por venta
 * 
 * IMPORTANTE:
 * Este registro es INMUTABLE (no se edita, solo se crea)
 * Cada movimiento de dinero genera un nuevo registro
 */
@Data
@Entity
@Table(name = "movimientos_caja")
public class MovimientoCaja {

    /**
     * PRIMARY KEY AUTO_INCREMENT
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Campo: id_caja
     * - FOREIGN KEY hacia "caja"
     * - NOT NULL en BD
     * - Caja donde se registra el movimiento
     */
    @Column(name = "id_caja", nullable = false)
    private Long idCaja;

    /**
     * Campo: id_usuario
     * - FOREIGN KEY hacia "usuarios"
     * - Usuario (cajero) que realiza el movimiento
     * - NOT NULL en BD
     */
    @Column(name = "id_usuario", nullable = false)
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
     * Campo: tipo_movimiento
     * - VARCHAR(50)
     * - Valores: VENTA, APERTURA, CIERRE, INGRESO, EGRESO, ANULACION
     */
    @Column(name = "tipo_movimiento", length = 50, nullable = false)
    private String tipoMovimiento;

    /**
     * Campo: monto
     * - DECIMAL(10,2) NOT NULL
     * - Siempre positivo
     * - El tipo de movimiento indica si suma o resta
     * 
     * EJEMPLOS:
     * - VENTA: $100 → suma $100 a caja
     * - EGRESO: $50 → resta $50 de caja
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    /**
     * Campo: saldo_anterior
     * - DECIMAL(10,2)
     * - Saldo de caja ANTES del movimiento
     * - Útil para auditoría
     */
    @Column(name = "saldo_anterior", precision = 10, scale = 2)
    private BigDecimal saldoAnterior;

    /**
     * Campo: saldo_nuevo
     * - DECIMAL(10,2)
     * - Saldo de caja DESPUÉS del movimiento
     * - Para INGRESO/VENTA: saldo_nuevo = saldo_anterior + monto
     * - Para EGRESO/ANULACION: saldo_nuevo = saldo_anterior - monto
     */
    @Column(name = "saldo_nuevo", precision = 10, scale = 2)
    private BigDecimal saldoNuevo;

    /**
     * Campo: descripcion
     * - VARCHAR(255)
     * - Descripción del movimiento
     * 
     * EJEMPLOS:
     * - "Venta #123 - Cliente María González"
     * - "Apertura de caja turno mañana"
     * - "Pago a proveedor XYZ"
     * - "Retiro para depósito bancario"
     */
    @Column(length = 255)
    private String descripcion;

    /**
     * Campo: fecha_movimiento
     * - TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
