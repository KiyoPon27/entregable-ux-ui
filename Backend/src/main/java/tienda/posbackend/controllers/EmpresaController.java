package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.entities.Empresa;
import tienda.posbackend.dto.CrearEmpresaRequestDTO;
import tienda.posbackend.services.EmpresaService;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/empresas")
@CrossOrigin(origins = "*")
public class EmpresaController {

    @Autowired
    private EmpresaService empresaService;

    /**
     * Obtiene la empresa asociada a un usuario
     * GET /api/empresas/mostrar?idUsuario={id}
     */
    @GetMapping("/mostrar")
    public ResponseEntity<Empresa> mostrarEmpresa(@RequestParam Long idUsuario) {
        return ResponseEntity.ok(empresaService.obtenerPorUsuario(idUsuario));
    }
    
    /**
     * Obtiene todas las empresas (solo OG)
     * GET /api/empresas
     */
    @PreAuthorize("hasRole('OG')")
    @GetMapping
    public ResponseEntity<List<Empresa>> obtenerTodas() {
        return ResponseEntity.ok(empresaService.obtenerTodas());
    }

    /**
     * Obtiene todas las empresas incluyendo deshabilitadas (solo OG)
     * GET /api/empresas/all/incluyendo-deshabilitadas
     */
    @PreAuthorize("hasRole('OG')")
    @GetMapping("/all/incluyendo-deshabilitadas")
    public ResponseEntity<List<Empresa>> obtenerTodasIncluiyendoDeshabilitadas() {
        return ResponseEntity.ok(empresaService.obtenerTodasIncluiyendoDeshabilitadas());
    }
    
    /**
     * Crea una nueva empresa
     * POST /api/empresas
     */
    @PostMapping
    public ResponseEntity<Empresa> crear(@RequestBody Empresa empresa) {
        Empresa nuevaEmpresa = empresaService.crear(empresa);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaEmpresa);
    }

    /**
     * Crea una empresa completa con SuperAdmin y estructura base (solo OG)
     * POST /api/empresas/crear-completa
     */
    @PreAuthorize("hasRole('OG')")
    @PostMapping("/crear-completa")
    public ResponseEntity<Empresa> crearEmpresaCompleta(@RequestBody CrearEmpresaRequestDTO dto) {
        Empresa nuevaEmpresa = empresaService.crearEmpresaCompleta(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaEmpresa);
    }
    
    /**
     * Edita una empresa existente
     * PUT /api/empresas/{id}
     */
    @PreAuthorize("hasRole('OG')")
    @PutMapping("/{id}")
    public ResponseEntity<Empresa> editar(@PathVariable Long id, @RequestBody Empresa empresaDetails) {
        Empresa empresaActualizada = empresaService.editar(id, empresaDetails);
        return ResponseEntity.ok(empresaActualizada);
    }
    
    /**
     * Deshabilita una empresa (Soft Delete)
     * PUT /api/empresas/{id}/deshabilitar
     */
    @PreAuthorize("hasRole('OG')")
    @PutMapping("/{id}/deshabilitar")
    public ResponseEntity<Void> deshabilitar(@PathVariable Long id) {
        empresaService.deshabilitar(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Habilita una empresa y reactiva sus usuarios
     * PUT /api/empresas/{id}/habilitar
     */
    @PreAuthorize("hasRole('OG')")
    @PutMapping("/{id}/habilitar")
    public ResponseEntity<Empresa> habilitar(@PathVariable Long id) {
        return ResponseEntity.ok(empresaService.habilitar(id));
    }

    /**
     * Sanea estados de usuarios segun estado de cada empresa (solo OG)
     * POST /api/empresas/sanear-estados-usuarios
     */
    @PreAuthorize("hasRole('OG')")
    @PostMapping("/sanear-estados-usuarios")
    public ResponseEntity<Map<String, Object>> sanearEstadosUsuarios() {
        int totalActualizados = empresaService.sanearEstadosUsuariosPorEmpresa();
        return ResponseEntity.ok(Map.of(
                "message", "Saneamiento completado",
                "usuariosActualizados", totalActualizados
        ));
    }
    
    /**
     * Elimina una empresa (ahora es soft delete)
     * DELETE /api/empresas/{id}
     */
    @PreAuthorize("hasRole('OG')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        empresaService.deshabilitar(id);
        return ResponseEntity.noContent().build();
    }
}
