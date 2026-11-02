package tienda.posbackend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import tienda.posbackend.entities.Rol;
import tienda.posbackend.entities.Modulo;
import tienda.posbackend.entities.PermisoDefault;
import tienda.posbackend.repositories.RolRepository;
import tienda.posbackend.repositories.ModuloRepository;
import tienda.posbackend.repositories.PermisoDefaultRepository;
import java.util.*;

@Component
public class PermisoInitializer implements ApplicationRunner {

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private ModuloRepository moduloRepository;

    @Autowired
    private PermisoDefaultRepository permisoDefaultRepository;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        inicializarPermisosDefault();
    }

    private void inicializarPermisosDefault() {
        // Definir permisos por rol (usando nombres EXACTOS como en BD)
        Map<String, List<String>> permisosPorRol = new HashMap<>();

        // OG: Acceso a TODO
        permisosPorRol.put("OG", Arrays.asList(
            "Dashboard", "Empresa", "Usuarios", "Productos", "Categorias de productos",
            "Sucursales y cajas", "Almacenes", "Inventarios", "Métodos de pago",
            "Impresoras", "Configuración", "Empresa basicos", "Empresa moneda",
            "Cobrar venta", "Ventas", "Clientes", "Proveedores", "Configuración de ticket",
            "Serialización de comprobantes", "Home"
        ));

        // superadmin: Gestión de su empresa
        permisosPorRol.put("superadmin", Arrays.asList(
            "Dashboard", "Empresa", "Usuarios", "Productos", "Categorias de productos",
            "Sucursales y cajas", "Almacenes", "Inventarios", "Métodos de pago",
            "Impresoras", "Empresa basicos", "Empresa moneda", "Ventas", "Clientes",
            "Proveedores", "Home"
        ));

        // admin: Gestión de sucursal
        permisosPorRol.put("admin", Arrays.asList(
            "Dashboard", "Sucursales y cajas", "Almacenes", "Inventarios",
            "Cobrar venta", "Ventas", "Métodos de pago", "Usuarios", "Home"
        ));

        // almacenero: Gestión de inventario
        permisosPorRol.put("almacenero", Arrays.asList(
            "Dashboard", "Almacenes", "Inventarios", "Productos", "Home"
        ));

        // cajero: POS solamente
        permisosPorRol.put("cajero", Arrays.asList(
            "Dashboard", "Cobrar venta", "Ventas", "Métodos de pago", "Home"
        ));

        // Asignar permisos para cada rol
        for (Map.Entry<String, List<String>> entry : permisosPorRol.entrySet()) {
            String nombreRol = entry.getKey();
            List<String> modulosNombre = entry.getValue();

            // Obtener rol (búsqueda case-insensitive)
            Optional<Rol> rolOpt = rolRepository.findAll()
                    .stream()
                    .filter(r -> r.getNombre().equalsIgnoreCase(nombreRol))
                    .findFirst();
            if (rolOpt.isEmpty()) {
                System.out.println("⚠️ Rol no encontrado: " + nombreRol);
                continue;
            }

            Rol rol = rolOpt.get();

            // Asignar cada módulo
            for (String nombreModulo : modulosNombre) {
                Optional<Modulo> moduloOpt = moduloRepository.findAll()
                        .stream()
                        .filter(m -> m.getNombre().equalsIgnoreCase(nombreModulo))
                        .findFirst();
                if (moduloOpt.isEmpty()) {
                    System.out.println("⚠️ Módulo no encontrado: " + nombreModulo);
                    continue;
                }

                Modulo modulo = moduloOpt.get();

                // Verificar si ya existe el permiso
                boolean permisoExiste = permisoDefaultRepository.findByRolAndModulo(rol, modulo).isPresent();

                if (!permisoExiste) {
                    PermisoDefault permiso = new PermisoDefault();
                    permiso.setRol(rol);
                    permiso.setModulo(modulo);
                    permisoDefaultRepository.save(permiso);
                    System.out.println("✅ Permiso asignado: " + rol.getNombre() + " → " + modulo.getNombre());
                } else {
                    System.out.println("ℹ️ Permiso ya existe: " + rol.getNombre() + " → " + modulo.getNombre());
                }
            }
        }

        // Resumen
        long totalPermisos = permisoDefaultRepository.count();
        System.out.println("📊 Total de permisos por defecto: " + totalPermisos);
    }
}
