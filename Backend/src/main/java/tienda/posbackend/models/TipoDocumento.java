package tienda.posbackend.models;

import jakarta.persistence.*;
import lombok.Data;

/**
 * ENTITY: TipoDocumento
 * 
 * TABLA: tipodocumento (sin guion bajo)
 * 
 * CATÁLOGO DE TIPOS DE DOCUMENTOS DE IDENTIDAD
 * 
 * EJEMPLOS:
 * - DNI (Documento Nacional de Identidad)
 * - RUC (Registro Único de Contribuyentes)
 * - Pasaporte
 * - Carnet de Extranjería
 * - Libreta Electoral
 * - Otros
 * 
 * USADO EN:
 * - clientes_proveedores (identificador_fiscal, identificador_nacional)
 * - usuarios (nro_doc)
 * - empresa (id_fiscal - RUC)
 * 
 * IMPORTANTE:
 * - Cada empresa configura sus propios tipos de documento
 * - Por defecto se crean: DNI, RUC, Pasaporte
 * - Se puede agregar/editar/eliminar según necesidad
 */
@Data
@Entity
@Table(name = "tipodocumento")
public class TipoDocumento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;  // "DNI", "RUC", "Pasaporte", etc.

    @Column(name = "id_empresa", nullable = false)
    private Long idEmpresa;

    @Column(length = 100)
    private String icono;  // Emoji o clase de icono: "🪖", "👑", "icon-document"

    private String descripcion;  // Descripción opcional del documento
}
