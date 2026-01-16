package tienda.posbackend.models;

import jakarta.persistence.*;
import lombok.Data;

/**
 * ENTITY: MetodoPago
 * 
 * TABLA: metodos_pago
 * 
 * DESCRIPCIÓN:
 * Métodos de pago disponibles para ventas (Efectivo, Tarjeta, Crédito, etc.)
 * 
 * CAMPOS IMPORTANTES:
 * - nombre: Nombre del método (ej: "Efectivo", "Visa")
 * - id_empresa: FK a empresa (cada empresa tiene sus métodos)
 * - icono: URL o clase CSS del icono
 * - ver_nombre: Si mostrar el nombre en POS (UI)
 * - delete_update: Si se puede eliminar/editar (métodos predeterminados no)
 * 
 * CONSTRAINT:
 * - UNIQUE(nombre, id_empresa): No duplicados por empresa
 * 
 * MIGRACIÓN FRONTEND:
 * Antes: supabase.from("metodos_pago").select()
 * Ahora: axios.get("/api/metodospago/mostrar", { params: { idEmpresa: 1 } })
 */
@Data
@Entity
@Table(name = "metodos_pago")
public class MetodoPago {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * Nombre del método de pago
     * Ejemplos: "Efectivo", "Tarjeta Visa", "Yape", "Plin"
     * UNIQUE por empresa
     */
    @Column(nullable = false)
    private String nombre;
    
    /**
     * FK: ID de la empresa dueña
     * Permite métodos diferentes por empresa
     */
    @Column(name = "id_empresa")
    private Long idEmpresa;
    
    /**
     * Icono del método (URL o clase CSS)
     * Ejemplo: "https://...", "fa-money-bill", "-"
     */
    @Column(columnDefinition = "VARCHAR(255) DEFAULT '-'")
    private String icono = "-";
    
    /**
     * Si mostrar el nombre en la UI del POS
     * true = mostrar texto, false = solo ícono
     */
    @Column(name = "ver_nombre", columnDefinition = "TINYINT(1) DEFAULT 1")
    private Boolean verNombre = true;
    
    /**
     * Si se puede eliminar/editar
     * false = método predeterminado del sistema (Efectivo, Tarjeta, etc.)
     * true = método personalizado por usuario
     */
    @Column(name = "delete_update", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean deleteUpdate = false;
}
