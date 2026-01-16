package tienda.posbackend.models;

import jakarta.persistence.*;
import lombok.Data;

/**
 * ENTIDAD JPA: AsignacionSucursal
 * 
 * Representa la tabla "asignacion_sucursal" en MySQL.
 * 
 * FUNCIÓN:
 * Esta tabla relaciona Usuarios con Sucursales y Cajas.
 * Define dónde puede operar cada usuario.
 * 
 * ESTRUCTURA:
 * Usuario → AsignacionSucursal → Sucursal + Caja
 * 
 * EJEMPLO:
 * - Usuario "Juan" puede operar en "Sucursal Centro" - "Caja 1"
 * - Usuario "María" puede operar en "Sucursal Norte" - "Caja 2"
 * 
 * RELACIONES:
 * - Pertenece a un Usuario (id_usuario)
 * - Pertenece a una Sucursal (id_sucursal)
 * - Pertenece a una Caja (id_caja)
 */
@Data
@Entity
@Table(name = "asignacion_sucursal")
public class AsignacionSucursal {

    /**
     * PRIMARY KEY AUTO_INCREMENT
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Campo: id_sucursal
     * - FOREIGN KEY hacia "sucursales"
     * - NOT NULL en BD
     * - ON DELETE CASCADE: Si se elimina sucursal, se elimina asignación
     */
    @Column(name = "id_sucursal", nullable = false)
    private Long idSucursal;

    /**
     * Campo: id_usuario
     * - FOREIGN KEY hacia "usuarios"
     * - ON DELETE CASCADE: Si se elimina usuario, se elimina asignación
     */
    @Column(name = "id_usuario")
    private Long idUsuario;

    /**
     * Campo: id_caja
     * - FOREIGN KEY hacia "caja"
     * - ON DELETE CASCADE: Si se elimina caja, se elimina asignación
     */
    @Column(name = "id_caja")
    private Long idCaja;
}
