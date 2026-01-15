package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tienda.posbackend.models.Categoria;

import java.util.List;
import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    // Mostrar categorías por empresa
    List<Categoria> findByIdEmpresaOrderByNombreAsc(Long idEmpresa);

    // Validaciones para duplicados
    Optional<Categoria> findByNombreAndIdEmpresa(String nombre, Long idEmpresa);
}