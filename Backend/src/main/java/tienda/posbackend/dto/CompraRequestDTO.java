package tienda.posbackend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class CompraRequestDTO {
    private String numeroFactura;
    private LocalDate fechaEmision;
    private Long idProveedor;
    private Long idMetodoPago;
    private Long idTipoComprobante;
    private String observacion;
    private String estado;
    private BigDecimal montoTotal;
    private Long idEmpresa;
    private Long idUsuario;
    private List<DetalleCompraDTO> detalles;
}