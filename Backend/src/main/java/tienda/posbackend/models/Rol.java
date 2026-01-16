package tienda.posbackend.models;

import jakarta.persistence.*;
import lombok.Data;

/**
 * ENTITY: Rol
 * 
 * TABLA: roles
 * 
 * CATÁLOGO DE ROLES DE USUARIO
 * 
 * ROLES PREDEFINIDOS:
 * - superadmin: Acceso total al sistema (no visible en listados normales)
 * - administrador: Gestión completa de la empresa
 * - empleado: Operaciones de venta y caja
 * - cajero: Solo operaciones de caja
 * - vendedor: Solo operaciones de venta
 * 
 * RELACIÓN:
 * - usuarios.id_rol → roles.id
 * - permisos_default.id_rol → roles.id (permisos por defecto del rol)
 * 
 * IMPORTANTE:
 * - Cada rol tiene permisos asociados en tabla permisos_default
 * - El rol "superadmin" NO se lista en MostrarRoles() (neq filter)
 * - Los roles se usan para asignar permisos masivos a usuarios
 */
@Data
@Entity
@Table(name = "roles")
public class Rol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombre;  // "superadmin", "administrador", "empleado", "cajero", "vendedor"

    private String descripcion;  // Descripción del rol

    @Column(length = 100)
    private String icono;  // Emoji o clase de icono: "👑", "🪖", "icon-user"
}
