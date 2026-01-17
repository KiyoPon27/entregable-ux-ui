package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import tienda.posbackend.entities.Almacen;
import java.util.List;

public interface AlmacenRepository extends JpaRepository<Almacen, Long> {
    List<Almacen> findBySucursalId(Long idSucursal);

    @Query("SELECT a FROM Almacen a WHERE a.sucursal.empresa.id = :idEmpresa")
    List<Almacen> findByEmpresaId(Long idEmpresa);
}
