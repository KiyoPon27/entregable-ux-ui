package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.entities.Almacen;
import tienda.posbackend.repositories.AlmacenRepository;

import java.util.List;

@RestController
@RequestMapping("/api/almacenes")
public class AlmacenController {

    @Autowired
    private AlmacenRepository almacenRepository;

    @GetMapping("/sucursal/{idSucursal}")
    public List<Almacen> listarPorSucursal(@PathVariable Long idSucursal) {
        return almacenRepository.findBySucursalId(idSucursal);
    }

    @GetMapping("/empresa/{idEmpresa}")
    public List<Almacen> listarPorEmpresa(@PathVariable Long idEmpresa) {
        return almacenRepository.findByEmpresaId(idEmpresa);
    }

    @PostMapping
    public ResponseEntity<Almacen> crear(@RequestBody Almacen almacen) {
        return ResponseEntity.ok(almacenRepository.save(almacen));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Almacen> editar(@PathVariable Long id, @RequestBody Almacen details) {
        Almacen almacen = almacenRepository.findById(id).orElseThrow(() -> new RuntimeException("Almacen no encontrado"));
        almacen.setNombre(details.getNombre());
        almacen.setDefecto(details.getDefecto());
        almacen.setEliminar(details.getEliminar());
        return ResponseEntity.ok(almacenRepository.save(almacen));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        almacenRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
