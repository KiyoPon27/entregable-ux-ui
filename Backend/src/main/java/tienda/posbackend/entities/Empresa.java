package tienda.posbackend.entities;


import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "empresa")
public class Empresa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(name = "id_fiscal")
    private String idFiscal;

    @Column(name = "direccion_fiscal")
    private String direccionFiscal;

    @Column(name = "simbolo_moneda")
    private String simboloMoneda;

    @Column(columnDefinition = "TEXT")
    private String logo;

    @Column(name = "id_auth", unique = true)
    private String idAuth;

    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    private String iso;
    private String pais;
    private String currency;
    private String impuesto;

    @Column(name = "valor_impuesto")
    private BigDecimal valorImpuesto;

    @Column(name = "nombre_moneda")
    private String nombreMoneda;

    private String correo;

    @Column(name = "pie_pagina_ticket")
    private String piePaginaTicket;
}
