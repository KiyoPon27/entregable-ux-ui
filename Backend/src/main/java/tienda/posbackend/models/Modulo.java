package tienda.posbackend.models;

import jakarta.persistence.*;
import lombok.Data;

/**
 * ENTIDAD JPA: Modulo
 * 
 * Representa la tabla "modulos" en MySQL.
 * 
 * FUNCIÓN:
 * Los módulos son las secciones/funcionalidades del sistema que se asignan
 * a roles o usuarios mediante la tabla "permisos".
 * 
 * EJEMPLOS:
 * - Dashboard, Ventas, Productos, Clientes, Reportes, Configuración
 * 
 * RELACIONES:
 * - Se asigna a Usuarios mediante tabla "permisos" (id_usuario, id_modulo)
 * - Tiene configuración por defecto en "permisos_default" (id_rol, id_modulo)
 * 
 * CAMPOS CLAVE:
 * - etiquetas: Filtra módulos especiales
 *   * "#default" = Módulos del sistema, no editables
 *   * "#configuracion" = Aparecen en menú de configuración
 *   * null o "" = Módulos normales
 */
@Data
@Entity
@Table(name = "modulos")
public class Modulo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Campo: nombre
     * - Nombre del módulo (ej: "Dashboard", "Ventas", "Productos")
     */
    @Column(nullable = false, length = 255)
    private String nombre;

    /**
     * Campo: descripcion
     * - Descripción del módulo (ej: "Gestión de ventas y facturación")
     */
    @Column(length = 255)
    private String descripcion;

    /**
     * Campo: icono
     * - URL de la imagen del módulo o emoji
     * - DEFAULT '-'
     */
    @Column(length = 255, columnDefinition = "VARCHAR(255) DEFAULT '-'")
    private String icono;

    /**
     * Campo: link
     * - Ruta de navegación del módulo (ej: "/ventas", "/productos")
     */
    @Column(length = 255)
    private String link;

    /**
     * Campo: etiquetas
     * - Filtra módulos por tipo
     * - "#default" = Módulos del sistema (NO se muestran en MostrarModulos)
     * - "#configuracion" = Se muestran en /configuracion
     * - null o "" = Módulos normales
     */
    @Column(length = 255)
    private String etiquetas;
}
