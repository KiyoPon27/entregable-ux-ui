package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tienda.posbackend.models.Modulo;

import java.util.List;
import java.util.Optional;

/**
 * REPOSITORY: ModuloRepository
 * 
 * Acceso a datos de la tabla "modulos"
 * 
 * MÉTODOS DISPONIBLES:
 * 1. findAllExceptDefault() - Lista módulos excluyendo etiqueta "#default"
 * 2. findByEtiquetas() - Busca módulos por etiqueta específica (ej: "#configuracion")
 * 3. existsByNombre() - Valida nombre único
 * 
 * REPLICACIÓN POSTGRESQL:
 * - MostrarModulos() → findAllExceptDefault() [.neq("etiquetas","#default")]
 */
@Repository
public interface ModuloRepository extends JpaRepository<Modulo, Long> {

    /**
     * MÉTODO CRÍTICO: Lista módulos excluyendo los del sistema (etiquetas = "#default")
     * 
     * Replica el query PostgreSQL:
     * SELECT * FROM modulos WHERE etiquetas != '#default'
     * 
     * USADO EN:
     * - PermisosUser.jsx: Muestra módulos disponibles para asignar permisos
     * - ModulosStore.jsx: Lista módulos configurables
     * 
     * @return Lista de módulos ordenados por nombre
     */
    @Query("SELECT m FROM Modulo m WHERE m.etiquetas IS NULL OR m.etiquetas != '#default' ORDER BY m.nombre ASC")
    List<Modulo> findAllExceptDefault();

    /**
     * Busca módulos por etiqueta específica
     * 
     * Ejemplo: findByEtiquetas("#configuracion") retorna módulos de configuración
     * 
     * @param etiquetas - Etiqueta a filtrar
     * @return Lista de módulos con esa etiqueta
     */
    List<Modulo> findByEtiquetas(String etiquetas);

    /**
     * Busca módulo por nombre exacto (case-insensitive)
     * 
     * @param nombre - Nombre del módulo
     * @return Optional con el módulo encontrado
     */
    Optional<Modulo> findByNombreIgnoreCase(String nombre);

    /**
     * Valida que el nombre del módulo sea único
     * 
     * @param nombre - Nombre a validar
     * @return true si ya existe
     */
    boolean existsByNombreIgnoreCase(String nombre);

    /**
     * Cuenta total de módulos
     * 
     * @return Cantidad de módulos
     */
    @Query("SELECT COUNT(m) FROM Modulo m")
    long countModulos();
}
