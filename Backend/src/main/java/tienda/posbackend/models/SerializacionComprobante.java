package tienda.posbackend.models;

import jakarta.persistence.*;
import lombok.Data;

/**
 * ENTITY: SerializacionComprobante
 * 
 * TABLA: serializacion_comprobantes
 * 
 * DESCRIPCIÓN:
 * Configuración de series y numeración para comprobantes de pago
 * 
 * EJEMPLO:
 * - Tipo: Factura (id=1)
 * - Serie: "F001"
 * - Cantidad números: 9 (para formato 000000001)
 * - Correlativo: 5 (último número usado)
 * - Resultado: "F001-000000005"
 * 
 * CAMPOS IMPORTANTES:
 * - id_tipo_comprobante: FK a tipo_comprobantes (Factura, Boleta, etc.)
 * - serie: Código de serie (ej: "F001", "B001", "T001")
 * - cantidad_numeros: Longitud del número (9 = 000000001)
 * - correlativo: Último número usado (se incrementa automáticamente)
 * - sucursal_id: FK a sucursales (cada sucursal tiene sus series)
 * - por_default: Si es la serie predeterminada para ese tipo
 * 
 * TRIGGER POSTGRESQL REPLICADO:
 * insertarserializacionestrigger → Al crear sucursal, inserta 5 serializaciones
 * 
 * FUNCIÓN POSTGRESQL REPLICADA:
 * generar_nro_comprobante() → Genera número correlativo automático
 * 
 * MIGRACIÓN FRONTEND:
 * Antes: supabase.from("serializacion_comprobantes").select()
 * Ahora: axios.get("/api/serializaciones/mostrar", { params: { idSucursal: 1 } })
 */
@Data
@Entity
@Table(name = "serializacion_comprobantes")
public class SerializacionComprobante {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * FK: Tipo de comprobante (Factura, Boleta, etc.)
     * CONSTRAINT: ON DELETE CASCADE
     */
    @Column(name = "id_tipo_comprobante", nullable = false)
    private Long idTipoComprobante;
    
    /**
     * Serie del comprobante
     * Ejemplos: "F001", "B001", "T001", "NC01", "ND01"
     * Formato Perú SUNAT: 
     * - Facturas: F###
     * - Boletas: B###
     * - Tickets: T###
     */
    @Column(length = 50)
    private String serie;
    
    /**
     * Cantidad de dígitos del número correlativo
     * Ejemplos:
     * - 8 = 00000001 (hasta 99,999,999)
     * - 9 = 000000001 (hasta 999,999,999)
     */
    @Column(name = "cantidad_numeros")
    private Long cantidadNumeros;
    
    /**
     * Último número correlativo usado
     * Se incrementa automáticamente al generar comprobante
     * Inicia en 0, primer comprobante será 1
     */
    @Column(columnDefinition = "BIGINT DEFAULT 0")
    private Long correlativo = 0L;
    
    /**
     * FK: Sucursal dueña de esta serialización
     * Cada sucursal tiene sus propias series
     * CONSTRAINT: ON DELETE CASCADE
     */
    @Column(name = "sucursal_id")
    private Long sucursalId;
    
    /**
     * Si es la serie predeterminada para este tipo
     * Solo UNA serialización por tipo puede ser default en cada sucursal
     * 
     * Ejemplo:
     * Sucursal 1:
     * - Factura F001 (default=true) ← Se usa por defecto
     * - Factura F002 (default=false)
     * - Boleta B001 (default=true) ← Se usa por defecto
     */
    @Column(name = "por_default", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean porDefault = false;
}
