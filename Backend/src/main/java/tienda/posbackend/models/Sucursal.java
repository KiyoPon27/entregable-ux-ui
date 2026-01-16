package tienda.posbackend.models;

import jakarta.persistence.*;
import lombok.Data;

/**
 * ENTIDAD JPA: Sucursal
 * 
 * Representa la tabla "sucursales" en MySQL.
 * 
 * ESTRUCTURA ORGANIZACIONAL:
 * Empresa → Sucursales → Cajas/Almacenes
 * 
 * RELACIONES:
 * - Pertenece a una Empresa (id_empresa)
 * - Tiene múltiples Cajas
 * - Tiene múltiples Almacenes
 * - Se asigna a Usuarios (asignacion_sucursal)
 * 
 * TRIGGERS RELACIONADOS:
 * - insertarserializaciones: Al crear sucursal, crea serializaciones de comprobantes
 * - insertpordefecto: Al crear empresa, crea sucursal por defecto
 */
@Data
@Entity
@Table(name = "sucursales")
public class Sucursal {

    /**
     * PRIMARY KEY AUTO_INCREMENT
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Campo: nombre
     * - Nombre identificativo de la sucursal
     * - Ejemplo: "Sucursal Centro", "Tienda Principal"
     */
    @Column(length = 255)
    private String nombre;

    /**
     * Campo: direccion_fiscal
     * - Dirección física de la sucursal
     * - Se usa en reportes y comprobantes
     */
    @Column(name = "direccion_fiscal", length = 255)
    private String direccionFiscal;

    /**
     * Campo: id_empresa
     * - FOREIGN KEY hacia tabla "empresa"
     * - ON DELETE CASCADE: Si se elimina empresa, se eliminan sus sucursales
     */
    @Column(name = "id_empresa")
    private Long idEmpresa;

    /**
     * Campo: delete
     * - TINYINT(1) → Boolean en Java
     * - DEFAULT 1 (true) = Se puede eliminar
     * - false = Sucursal principal, no se puede eliminar
     * 
     * IMPORTANTE: En PostgreSQL llamaste este campo "delete"
     * En Java usamos "deletable" para evitar conflictos con palabra reservada
     */
    @Column(name = "`delete`", columnDefinition = "TINYINT(1) DEFAULT 1")
    private Boolean deletable;
}
