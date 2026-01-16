package tienda.posbackend.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * ENTIDAD JPA: ClienteProveedor
 * 
 * Esta clase representa la tabla "clientes_proveedores" en MySQL.
 * Lombok @Data genera automáticamente:
 * - Getters y Setters para todos los campos
 * - toString(), equals(), hashCode()
 * 
 * IMPORTANTE: Los nombres de columnas deben coincidir EXACTAMENTE
 * con los de la base de datos (MySQL es case-insensitive pero mejor ser exactos)
 */
@Data // Genera getters, setters y métodos automáticamente
@Entity // Indica que esta clase es una entidad de base de datos
@Table(name = "clientes_proveedores") // Nombre exacto de la tabla en MySQL
public class ClienteProveedor {

    // PRIMARY KEY AUTO_INCREMENT
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // AUTO_INCREMENT de MySQL
    private Long id;

    /**
     * Campo: nombres
     * - NOT NULL en BD, valor por defecto '-'
     * - Se usa para validaciones de duplicados (con LOWER en PostgreSQL)
     */
    @Column(nullable = false, columnDefinition = "VARCHAR(255) DEFAULT '-'")
    private String nombres;

    /**
     * Campo: id_empresa
     * - FOREIGN KEY hacia tabla "empresa"
     * - Se usa para filtrar clientes/proveedores por empresa
     */
    @Column(name = "id_empresa")
    private Long idEmpresa;

    /**
     * Campos de información del cliente/proveedor
     * - Todos tienen valor por defecto '-'
     */
    @Column(columnDefinition = "VARCHAR(255) DEFAULT '-'")
    private String direccion;

    @Column(columnDefinition = "VARCHAR(50) DEFAULT '-'")
    private String telefono;

    @Column(columnDefinition = "VARCHAR(255) DEFAULT '-'")
    private String email;

    /**
     * identificador_nacional: DNI, RUT, CI, etc.
     * - Se valida para evitar duplicados en función insertarclientesproveedores
     */
    @Column(name = "identificador_nacional", columnDefinition = "VARCHAR(50) DEFAULT '-'")
    private String identificadorNacional;

    /**
     * identificador_fiscal: RUC, CUIT, RFC, etc.
     * - Se valida para evitar duplicados en función insertarclientesproveedores
     */
    @Column(name = "identificador_fiscal", columnDefinition = "VARCHAR(50) DEFAULT '-'")
    private String identificadorFiscal;

    /**
     * tipo: Indica si es "cliente", "proveedor" o "-" (genérico)
     * - Se usa en las validaciones de duplicados
     * - En PostgreSQL: WHERE tipo=_tipo
     */
    @Column(columnDefinition = "VARCHAR(50) DEFAULT '-'")
    private String tipo;

    /**
     * estado: 'activo' o 'inactivo'
     * - Valor por defecto: 'activo'
     */
    @Column(columnDefinition = "VARCHAR(50) DEFAULT 'activo'")
    private String estado;

    /**
     * fecha_registro: Fecha de creación del registro
     * - DEFAULT CURRENT_TIMESTAMP en MySQL
     * - updatable = false: No se actualiza en UPDATE
     */
    @Column(name = "fecha_registro", updatable = false)
    private LocalDateTime fechaRegistro;

    /**
     * @PrePersist: Se ejecuta ANTES de insertar en BD
     * - Asigna la fecha actual si no se especificó
     * - Equivalente a DEFAULT CURRENT_TIMESTAMP de MySQL
     */
    @PrePersist
    protected void onCreate() {
        if (fechaRegistro == null) {
            fechaRegistro = LocalDateTime.now();
        }
    }
}
