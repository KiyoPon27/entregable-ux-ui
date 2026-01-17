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
        Optional<Empresa> empresa = empresaRepository.findByUsuarioId(idUsuario);
        if (empresa.isPresent()) {
            return ResponseEntity.ok(empresa.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
