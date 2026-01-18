package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.entities.Sucursal;
import tienda.posbackend.repositories.SucursalRepository;

import java.util.List;

@RestController
@RequestMapping("/api/sucursales")
@CrossOrigin(origins = "*")
public class SucursalController {

    @Autowired
    private SucursalRepository sucursalRepository;

    @GetMapping("/empresa/{idEmpresa}")
    public List<Sucursal> listarPorEmpresa(@PathVariable Long idEmpresa) {
        return sucursalRepository.findByEmpresaId(idEmpresa);
    }
}
