package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.entities.Empresa;
import tienda.posbackend.repositories.EmpresaRepository;

import java.util.Optional;

@RestController
@RequestMapping("/api/empresas")
public class EmpresaController {

    @Autowired
    private EmpresaRepository empresaRepository;

    @GetMapping("/mostrar")
    public ResponseEntity<Empresa> mostrarEmpresa(@RequestParam Long idUsuario) {
        // Primero intentar buscar la empresa del usuario
        Optional<Empresa> empresaUsuario = empresaRepository.findByUsuarioId(idUsuario);
        if (empresaUsuario.isPresent()) {
            return ResponseEntity.ok(empresaUsuario.get());
        }
        
        // Si no tiene empresa asignada, devolver la primera empresa (caso de usuarios nuevos)
        Optional<Empresa> primeraEmpresa = empresaRepository.findFirstByOrderByIdAsc();
        if (primeraEmpresa.isPresent()) {
            return ResponseEntity.ok(primeraEmpresa.get());
        }
        
        return ResponseEntity.notFound().build();
    }
}
