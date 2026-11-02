package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tienda.posbackend.entities.MetodoPago;
import java.util.List;
import java.util.Optional;

public interface MetodoPagoRepository extends JpaRepository<MetodoPago, Long> {
    
    // Listar métodos de pago por empresa
    List<MetodoPago> findByEmpresaId(Long empresaId);
    
    // Buscar método de pago por nombre (case insensitive) y empresa
    @Query("SELECT m FROM MetodoPago m WHERE lower(m.nombre) LIKE lower(concat('%', :query, '%')) AND m.empresa.id = :empresaId")
    List<MetodoPago> buscarPorNombre(@Param("empresaId") Long empresaId, @Param("query") String query);
    
    // Verificar si existe un método de pago con el mismo nombre en la empresa
    Optional<MetodoPago> findByNombreIgnoreCaseAndEmpresaId(String nombre, Long empresaId);
}
