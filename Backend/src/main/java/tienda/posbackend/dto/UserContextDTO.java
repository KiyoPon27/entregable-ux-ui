package tienda.posbackend.dto;

import lombok.Data;
import tienda.posbackend.entities.Empresa;
import tienda.posbackend.entities.Usuario;
import tienda.posbackend.entities.AsignacionSucursal;
import java.util.List;

@Data
public class UserContextDTO {
    private Usuario usuario;
    private Empresa empresa;
    private AsignacionSucursal asignacion;
    private List<Long> permisos; // List of Module IDs allowed
}
