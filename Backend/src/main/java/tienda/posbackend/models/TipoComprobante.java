package tienda.posbackend.models;

import jakarta.persistence.*;
import lombok.Data;

/**
 * ENTITY: TipoComprobante
 * 
 * TABLA: tipo_comprobantes
 * 
 * DESCRIPCIÓN:
 * Tipos de comprobantes de pago (Factura, Boleta, Ticket, Nota de Crédito, etc.)
 * 
 * VALORES PREDETERMINADOS (insertados en BD):
 * 1. Factura (destino: ventas)
 * 2. Boleta (destino: ventas)
 * 3. Nota de Crédito (destino: -)
 * 4. Nota de Débito (destino: -)
 * 5. Ticket (destino: ventas)
 * 
 * IMPORTANTE:
 * - Esta tabla es ESTÁTICA (datos maestros)
 * - Los registros se insertan manualmente en la BD
 * - No se crean/editan desde la aplicación
 */
@Data
@Entity
@Table(name = "tipo_comprobantes")
public class TipoComprobante {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * Nombre del tipo de comprobante
     * Ejemplos: "Factura", "Boleta", "Ticket"
     */
    @Column(nullable = false)
    private String nombre;
    
    /**
     * Destino del comprobante
     * "ventas" = para ventas
     * "-" = otros usos
     */
    @Column(length = 50)
    private String destino;
}
