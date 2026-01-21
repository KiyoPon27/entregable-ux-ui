package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.entities.TipoDocumento;
import tienda.posbackend.services.TipoDocumentoService;

import java.util.List;

@RestController
@RequestMapping("/api/tipo-documentos")
@CrossOrigin(origins = "*")
public class TipoDocumentoController {
    
    @Autowired
    private TipoDocumentoService tipoDocumentoService;
    
    @GetMapping("/listar")
    public ResponseEntity<List<TipoDocumento>> listarTodos() {
        try {
            List<TipoDocumento> tipoDocumentos = tipoDocumentoService.listarTodos();
            return ResponseEntity.ok(tipoDocumentos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TipoDocumento> buscarPorId(@PathVariable Long id) {
        try {
            return tipoDocumentoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/empresa/{empresaId}")
    public ResponseEntity<List<TipoDocumento>> listarPorEmpresa(@PathVariable Long empresaId) {
        try {
            List<TipoDocumento> tipoDocumentos = tipoDocumentoService.listarPorEmpresa(empresaId);
            return ResponseEntity.ok(tipoDocumentos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/crear")
    public ResponseEntity<TipoDocumento> crear(@RequestBody TipoDocumento tipoDocumento) {
        try {
            TipoDocumento nuevoTipoDocumento = tipoDocumentoService.crear(tipoDocumento);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoTipoDocumento);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping("/actualizar/{id}")
    public ResponseEntity<TipoDocumento> actualizar(@PathVariable Long id, @RequestBody TipoDocumento tipoDocumento) {
        try {
            TipoDocumento tipoDocumentoActualizado = tipoDocumentoService.actualizar(id, tipoDocumento);
            return ResponseEntity.ok(tipoDocumentoActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        try {
            tipoDocumentoService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
