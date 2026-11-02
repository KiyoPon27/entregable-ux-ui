package tienda.posbackend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CajaDTO {
    private Long id;
    private String descripcion;
    private Long sucursalId;
    private LocalDateTime fechaCreacion;
    private Boolean eliminar;
    private Boolean imprimir;
    
    // Optional: for auto-assignment when creating
    private Long idUsuarioCreador;
}
