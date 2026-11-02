package tienda.posbackend.repositories;

import tienda.posbackend.entities.Producto;
import java.util.List;

/**
 * Repositorio custom para búsquedas dinámicas de productos
 */
public interface ProductoRepositoryCustom {
    
    /**
     * Busca productos por múltiples palabras clave.
     * Cada palabra debe estar presente en el nombre del producto.
     * Ejemplo: "CUADERNO RAYADO" encontrará:
     * - "CUADERNO COLLEGE RAYADO"
     * - "CUADERNO JUSTUS RAYADO"
     * - "RAYADO CUADERNO SURCO"
     * 
     * @param empresaId ID de la empresa
     * @param palabrasClave Lista de palabras a buscar
     * @return Lista de productos que contienen todas las palabras clave
     */
    List<Producto> buscarPorPalabrasClave(Long empresaId, List<String> palabrasClave);
}