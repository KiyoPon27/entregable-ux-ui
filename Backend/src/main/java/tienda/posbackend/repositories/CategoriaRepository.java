package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tienda.posbackend.entities.Categoria;
import java.util.List;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    List<Categoria> findByEmpresaId(Long empresaId);
    
    // Búsqueda por nombre dentro de la empresa
    @Query("SELECT c FROM Categoria c WHERE c.empresa.id = :empresaId AND lower(c.nombre) LIKE lower(concat('%', :search, '%'))")
    List<Categoria> buscarPorNombre(@Param("empresaId") Long empresaId, @Param("search") String search);
}
