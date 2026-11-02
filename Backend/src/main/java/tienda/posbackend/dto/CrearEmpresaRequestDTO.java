package tienda.posbackend.dto;

import java.math.BigDecimal;

public class CrearEmpresaRequestDTO {
    
    // Datos de la Empresa
    private String nombreEmpresa;
    private String idFiscal;
    private String direccionFiscal;
    private String iso;
    private String pais;
    private String currency;
    private String simboloMoneda;
    private String nombreMoneda;
    private String impuesto;
    private BigDecimal valorImpuesto;
    private String correo;
    private String piePaginaTicket;
    
    // Datos del SuperAdmin
    private String nombreSuperAdmin;
    private String emailSuperAdmin;
    private String contrasenyaSuperAdmin;
    
    // Constructores
    public CrearEmpresaRequestDTO() {}
    
    public CrearEmpresaRequestDTO(String nombreEmpresa, String idFiscal, String direccionFiscal,
                                   String nombreSuperAdmin, String emailSuperAdmin, String contrasenyaSuperAdmin) {
        this.nombreEmpresa = nombreEmpresa;
        this.idFiscal = idFiscal;
        this.direccionFiscal = direccionFiscal;
        this.nombreSuperAdmin = nombreSuperAdmin;
        this.emailSuperAdmin = emailSuperAdmin;
        this.contrasenyaSuperAdmin = contrasenyaSuperAdmin;
    }
    
    // Getters y Setters
    public String getNombreEmpresa() {
        return nombreEmpresa;
    }
    
    public void setNombreEmpresa(String nombreEmpresa) {
        this.nombreEmpresa = nombreEmpresa;
    }
    
    public String getIdFiscal() {
        return idFiscal;
    }
    
    public void setIdFiscal(String idFiscal) {
        this.idFiscal = idFiscal;
    }
    
    public String getDireccionFiscal() {
        return direccionFiscal;
    }
    
    public void setDireccionFiscal(String direccionFiscal) {
        this.direccionFiscal = direccionFiscal;
    }
    
    public String getIso() {
        return iso;
    }
    
    public void setIso(String iso) {
        this.iso = iso;
    }
    
    public String getPais() {
        return pais;
    }
    
    public void setPais(String pais) {
        this.pais = pais;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    
    public String getSimboloMoneda() {
        return simboloMoneda;
    }
    
    public void setSimboloMoneda(String simboloMoneda) {
        this.simboloMoneda = simboloMoneda;
    }
    
    public String getNombreMoneda() {
        return nombreMoneda;
    }
    
    public void setNombreMoneda(String nombreMoneda) {
        this.nombreMoneda = nombreMoneda;
    }
    
    public String getImpuesto() {
        return impuesto;
    }
    
    public void setImpuesto(String impuesto) {
        this.impuesto = impuesto;
    }
    
    public BigDecimal getValorImpuesto() {
        return valorImpuesto;
    }
    
    public void setValorImpuesto(BigDecimal valorImpuesto) {
        this.valorImpuesto = valorImpuesto;
    }
    
    public String getCorreo() {
        return correo;
    }
    
    public void setCorreo(String correo) {
        this.correo = correo;
    }
    
    public String getPiePaginaTicket() {
        return piePaginaTicket;
    }
    
    public void setPiePaginaTicket(String piePaginaTicket) {
        this.piePaginaTicket = piePaginaTicket;
    }
    
    public String getNombreSuperAdmin() {
        return nombreSuperAdmin;
    }
    
    public void setNombreSuperAdmin(String nombreSuperAdmin) {
        this.nombreSuperAdmin = nombreSuperAdmin;
    }
    
    public String getEmailSuperAdmin() {
        return emailSuperAdmin;
    }
    
    public void setEmailSuperAdmin(String emailSuperAdmin) {
        this.emailSuperAdmin = emailSuperAdmin;
    }
    
    public String getContrasenyaSuperAdmin() {
        return contrasenyaSuperAdmin;
    }
    
    public void setContrasenyaSuperAdmin(String contrasenyaSuperAdmin) {
        this.contrasenyaSuperAdmin = contrasenyaSuperAdmin;
    }
}
