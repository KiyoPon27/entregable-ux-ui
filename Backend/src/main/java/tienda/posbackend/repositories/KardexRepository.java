package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import tienda.posbackend.entities.Kardex;
import java.time.LocalDate;
import java.util.List;

public interface KardexRepository extends JpaRepository<Kardex, Long> {
    List<Kardex> findByProductoId(Long productoId);
    
    List<Kardex> findByUsuarioId(Long usuarioId);
    
    List<Kardex> findByTipo(String tipo);
    
    List<Kardex> findByFechaBetween(LocalDate fechaInicio, LocalDate fechaFin);
    
    List<Kardex> findByProductoIdAndFechaBetween(Long productoId, LocalDate fechaInicio, LocalDate fechaFin);
    
    @Query("SELECT k FROM Kardex k WHERE k.producto.id = :productoId ORDER BY k.fecha DESC, k.id DESC")
    List<Kardex> findByProductoIdOrderByFechaDesc(Long productoId);
}
