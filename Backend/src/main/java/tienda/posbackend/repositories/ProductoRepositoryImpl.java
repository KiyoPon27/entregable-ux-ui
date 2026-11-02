package tienda.posbackend.repositories;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.*;
import tienda.posbackend.entities.Producto;

import java.util.ArrayList;
import java.util.List;

/**
 * Implementación del repositorio custom para búsquedas dinámicas.
 * Spring Data JPA detecta automáticamente esta clase por la convención de nombres (NombreRepositorioImpl).
 */
public class ProductoRepositoryImpl implements ProductoRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<Producto> buscarPorPalabrasClave(Long empresaId, List<String> palabrasClave) {
        if (palabrasClave == null || palabrasClave.isEmpty()) {
            return new ArrayList<>();
        }

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Producto> query = cb.createQuery(Producto.class);
        Root<Producto> producto = query.from(Producto.class);

        // Hacer join LEFT con los códigos (producto_codigos)
        Join<?, ?> codigos = producto.join("codigos", JoinType.LEFT);

        // Lista de predicados (condiciones)
        List<Predicate> predicates = new ArrayList<>();

        // Condición: empresa coincide
        predicates.add(cb.equal(producto.get("empresa").get("id"), empresaId));

        // Condición: estado = ACTIVO
        predicates.add(cb.equal(producto.get("estado"), "ACTIVO"));

        // Para cada palabra clave, agregar condiciones OR (nombre, codigoBarras, codigoInterno)
        // Todas las palabras deben estar presentes (AND entre palabras, OR entre campos)
        for (String palabra : palabrasClave) {
            String palabraBusqueda = "%" + palabra.toLowerCase() + "%";
            
            Predicate palabraEnNombre = cb.like(cb.lower(producto.get("nombre")), palabraBusqueda);
            Predicate palabraEnCodigoBarras = cb.like(cb.lower(codigos.get("codigoBarras")), palabraBusqueda);
            Predicate palabraEnCodigoInterno = cb.like(cb.lower(producto.get("codigoInterno")), palabraBusqueda);
            
            // Al menos uno de los campos debe contener la palabra
            Predicate palabraEnAlgunCampo = cb.or(palabraEnNombre, palabraEnCodigoBarras, palabraEnCodigoInterno);
            
            // Agregar esta condición a la lista (AND con las demás palabras)
            predicates.add(palabraEnAlgunCampo);
        }

        // Evitar duplicados por joins
        query.distinct(true);

        // Combinar todos los predicados con AND
        query.where(cb.and(predicates.toArray(new Predicate[0])));

        // Ordenar por nombre
        query.orderBy(cb.asc(producto.get("nombre")));

        return entityManager.createQuery(query).getResultList();
    }
}