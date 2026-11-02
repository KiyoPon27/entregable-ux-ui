package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.entities.Modulo;
import tienda.posbackend.repositories.ModuloRepository;

import java.util.List;

@RestController
@RequestMapping("/api/modulos")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
@SuppressWarnings("null")
public class ModuloController {

    @Autowired
    private ModuloRepository moduloRepository;

    @GetMapping
    public ResponseEntity<List<Modulo>> listarTodos() {
        List<Modulo> modulos = moduloRepository.findAll();
        return ResponseEntity.ok(modulos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Modulo> obtenerPorId(@PathVariable Long id) {
        return moduloRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
