package tienda.posbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardCajaDTO {
    private String sucursalNombre;
    private String cajaDescripcion;
    private LocalDateTime fechaCreacion;
    private BigDecimal totalVentas;
    private Integer estadoCaja; // 0=cerrada, 1=abierta
    private String direccionFiscal;
    private Long idCaja;
    private Long idSucursal;
    private Boolean eliminar;
}
