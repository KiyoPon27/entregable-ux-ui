package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.entities.Empresa;
import tienda.posbackend.services.EmpresaService;

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
     * Crea una nueva empresa
     * POST /api/empresas
     */
    @PostMapping
    public ResponseEntity<Empresa> crear(@RequestBody Empresa empresa) {
        Empresa nuevaEmpresa = empresaService.crear(empresa);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaEmpresa);
    }
    
    /**
     * Edita una empresa existente
     * PUT /api/empresas/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Empresa> editar(@PathVariable Long id, @RequestBody Empresa empresaDetails) {
        Empresa empresaActualizada = empresaService.editar(id, empresaDetails);
        return ResponseEntity.ok(empresaActualizada);
    }
    
    /**
     * Elimina una empresa
     * DELETE /api/empresas/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        empresaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
