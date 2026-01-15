package tienda.posbackend.dto;

import java.math.BigDecimal;

public class ProductoDTO {
    private Long id;
    private String nombre;
    private BigDecimal precioVenta;
    private BigDecimal precioCompra;
    private Long idCategoria;
    private String sevendePor;
    private String codigoBarras;
    private String codigoInterno;
    private Long idEmpresa;
    private Boolean manejaInventarios;
    private Boolean manejaMultiprecios;
    private String pVenta; // Formateado: simbolo_moneda + precio_venta
    private String pCompra; // Formateado: simbolo_moneda + precio_compra
    private String categoria; // Nombre de la categoría

    // Constructor vacío
    public ProductoDTO() {}

    // Constructor con parámetros
    public ProductoDTO(Long id, String nombre, BigDecimal precioVenta, BigDecimal precioCompra,
                       Long idCategoria, String sevendePor, String codigoBarras, String codigoInterno,
                       Long idEmpresa, Boolean manejaInventarios, Boolean manejaMultiprecios,
                       String pVenta, String pCompra, String categoria) {
        this.id = id;
        this.nombre = nombre;
        this.precioVenta = precioVenta;
        this.precioCompra = precioCompra;
        this.idCategoria = idCategoria;
        this.sevendePor = sevendePor;
        this.codigoBarras = codigoBarras;
        this.codigoInterno = codigoInterno;
        this.idEmpresa = idEmpresa;
        this.manejaInventarios = manejaInventarios;
        this.manejaMultiprecios = manejaMultiprecios;
        this.pVenta = pVenta;
        this.pCompra = pCompra;
        this.categoria = categoria;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public BigDecimal getPrecioVenta() { return precioVenta; }
    public void setPrecioVenta(BigDecimal precioVenta) { this.precioVenta = precioVenta; }

    public BigDecimal getPrecioCompra() { return precioCompra; }
    public void setPrecioCompra(BigDecimal precioCompra) { this.precioCompra = precioCompra; }

    public Long getIdCategoria() { return idCategoria; }
    public void setIdCategoria(Long idCategoria) { this.idCategoria = idCategoria; }

    public String getSevendePor() { return sevendePor; }
    public void setSevendePor(String sevendePor) { this.sevendePor = sevendePor; }

    public String getCodigoBarras() { return codigoBarras; }
    public void setCodigoBarras(String codigoBarras) { this.codigoBarras = codigoBarras; }

    public String getCodigoInterno() { return codigoInterno; }
    public void setCodigoInterno(String codigoInterno) { this.codigoInterno = codigoInterno; }

    public Long getIdEmpresa() { return idEmpresa; }
    public void setIdEmpresa(Long idEmpresa) { this.idEmpresa = idEmpresa; }

    public Boolean getManejaInventarios() { return manejaInventarios; }
    public void setManejaInventarios(Boolean manejaInventarios) { this.manejaInventarios = manejaInventarios; }

    public Boolean getManejaMultiprecios() { return manejaMultiprecios; }
    public void setManejaMultiprecios(Boolean manejaMultiprecios) { this.manejaMultiprecios = manejaMultiprecios; }

    public String getPVenta() { return pVenta; }
    public void setPVenta(String pVenta) { this.pVenta = pVenta; }

    public String getPCompra() { return pCompra; }
    public void setPCompra(String pCompra) { this.pCompra = pCompra; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
}