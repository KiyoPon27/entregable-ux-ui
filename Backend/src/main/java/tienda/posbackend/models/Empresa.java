package tienda.posbackend.models;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "empresa")
public class Empresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "VARCHAR(255) DEFAULT 'Generica'")
    private String nombre;

    @Column(name = "id_fiscal", columnDefinition = "VARCHAR(255) DEFAULT '-'")
    private String idFiscal;

    @Column(name = "direccion_fiscal", columnDefinition = "VARCHAR(255) DEFAULT '-'")
    private String direccionFiscal;

    @Column(name = "simbolo_moneda", columnDefinition = "VARCHAR(10) DEFAULT '$'")
    private String simboloMoneda;

    @Column(columnDefinition = "TEXT DEFAULT NULL")
    private String logo;

    @Column(name = "id_auth", nullable = false, columnDefinition = "VARCHAR(255) DEFAULT ''")
    private String idAuth;

    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(columnDefinition = "VARCHAR(10) DEFAULT 'PE'")
    private String iso;

    @Column(columnDefinition = "VARCHAR(100) DEFAULT 'Peru'")
    private String pais;

    @Column(columnDefinition = "VARCHAR(10) DEFAULT 'PEN'")
    private String currency;

    @Column(name = "impuesto", columnDefinition = "VARCHAR(50) DEFAULT 'IGV'")
    private String impuesto;

    @Column(name = "valor_impuesto", precision = 15, scale = 2, columnDefinition = "DECIMAL(15,2) DEFAULT 18.00")
    private java.math.BigDecimal valorImpuesto;

    @Column(name = "nombre_moneda", columnDefinition = "VARCHAR(100) DEFAULT '-'")
    private String nombreMoneda;

    @Column(columnDefinition = "VARCHAR(255) DEFAULT ''")
    private String correo;

    @Column(name = "pie_pagina_ticket", columnDefinition = "VARCHAR(255) DEFAULT '-'")
    private String piePaginaTicket;
}