package tienda.posbackend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import tienda.posbackend.entities.Rol;
import tienda.posbackend.repositories.RolRepository;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements ApplicationRunner {

    @Autowired
    private RolRepository rolRepository;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        inicializarRoles();
    }

    private void inicializarRoles() {
        // Roles que deben existir (con nombres EXACTOS como en BD)
        List<String> rolesRequeridos = Arrays.asList("superadmin", "cajero", "admin", "almacenero", "OG");

        for (String nombreRol : rolesRequeridos) {
            // Verificar si el rol ya existe (case-insensitive)
            boolean existe = rolRepository.findAll()
                    .stream()
                    .anyMatch(r -> r.getNombre().equalsIgnoreCase(nombreRol));

            if (!existe) {
                Rol nuevoRol = new Rol();
                nuevoRol.setNombre(nombreRol);
                rolRepository.save(nuevoRol);
                System.out.println("✅ Rol creado: " + nombreRol);
            } else {
                System.out.println("ℹ️ Rol ya existe: " + nombreRol);
            }
        }

        // Verificar total de roles
        long totalRoles = rolRepository.count();
        System.out.println("📊 Total de roles en el sistema: " + totalRoles);
    }
}


