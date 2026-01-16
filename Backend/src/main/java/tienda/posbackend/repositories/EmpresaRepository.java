package tienda.posbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import org.springframework.stereotype.Repository;
import tienda.posbackend.models.Empresa;

import java.util.Optional;

/**
 * REPOSITORY: EmpresaRepository
 * 
 * DATA ACCESS LAYER PARA EMPRESA (CONFIGURACIÓN EMPRESA)
 * 
 * REPLICACIÓN POSTGRESQL:
 * - mostrarempresaxiduser(p_id_usuario) → findByIdUsuario()
 * - La tabla empresa es única por usuario (1:1)
 * 
 * IMPORTANTE:
 * - Cada usuario tiene solo UNA empresa
 * - El logo se guarda como URL (TEXT NULL)
 * - El frontend envía files a Storage, luego guarda URL
 * 
 * ESTRUCTURA TABLA empresa:
 * - id (PK)
 * - nombre (nombre de la empresa)
 * - id_fiscal (RUC)
 * - direccion_fiscal
 * - simbolo_moneda ("S/", "$", etc.)
 * - logo (URL de imagen)
 * - id_auth (Firebase Auth ID)
 * - id_usuario (FK a usuarios)
 * - iso (código país: "PE", "US", etc.)
 * - pais (nombre país: "Peru", "USA")
 * - currency (código moneda: "PEN", "USD")
 * - impuesto (nombre: "IGV", "IVA")
 * - valor_impuesto (18.00 para IGV)
 * - nombre_moneda (nombre completo: "Soles", "Dólares")
 * - correo (email de empresa)
 * - pie_pagina_ticket (texto al pie del ticket)
 */
@Repository
public interface EmpresaRepository extends JpaRepository<Empresa, Long> {

    /**
     * ============================================================
     * MÉTODO: findByIdUsuario
     * ============================================================
     * 
     * POSTGRESQL RPC: mostrarempresaxiduser(p_id_usuario)
     * 
     * SELECT * FROM empresa WHERE id_usuario = ?
     * 
     * IMPORTANTE:
     * - Solo devuelve 1 empresa por usuario (relación 1:1)
     * - Si no tiene empresa, devuelve Optional.empty()
     */
    Optional<Empresa> findByIdUsuario(Long idUsuario);

    /**
     * ============================================================
     * MÉTODO: findByIdAuth
     * ============================================================
     * 
     * Buscar empresa por Firebase Auth ID
     * Útil para login con Firebase
     */
    Optional<Empresa> findByIdAuth(String idAuth);

    /**
     * ============================================================
     * MÉTODO: existsByIdUsuario
     * ============================================================
     * 
     * Verificar si un usuario ya tiene empresa creada
     * Usado en validaciones de inserción
     */
    boolean existsByIdUsuario(Long idUsuario);

    /**
     * ============================================================
     * MÉTODO: countEmpresas
     * ============================================================
     * 
     * Contar total de empresas registradas
     * Útil para dashboard de administrador
     */
    @Query("SELECT COUNT(e) FROM Empresa e")
    Long countEmpresas();

    /**
     * ============================================================
     * MÉTODO: findByCorreo
     * ============================================================
     * 
     * Buscar empresa por correo electrónico
     * Útil para validaciones de unicidad
     */
    Optional<Empresa> findByCorreo(String correo);
}
