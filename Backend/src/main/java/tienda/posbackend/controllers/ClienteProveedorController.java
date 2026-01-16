package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.models.ClienteProveedor;
import tienda.posbackend.services.ClienteProveedorService;

import java.util.List;

/**
 * CONTROLLER: ClienteProveedorController
 * 
 * CAPA DE PRESENTACIÓN (API REST)
 * 
 * Define los ENDPOINTS HTTP que consumirá el frontend con Axios.
 * 
 * CAMBIO EN FRONTEND:
 * ANTES (Supabase):
 *   const { data } = await supabase.rpc("insertarclientesproveedores", params)
 * 
 * AHORA (Axios):
 *   const { data } = await axios.post("/api/clientes-proveedores/insertar", params)
 * 
 * IMPORTANTE: Los nombres de los endpoints coinciden con las funciones PostgreSQL
 * para facilitar la migración del frontend.
 * 
 * @RestController: Combina @Controller + @ResponseBody (respuestas JSON automáticas)
 * @RequestMapping: Prefijo común para todos los endpoints (/api/clientes-proveedores)
 */
@RestController
@RequestMapping("/api/clientes-proveedores")
public class ClienteProveedorController {

    @Autowired
    private ClienteProveedorService service;

    /**
     * ============================================================
     * ENDPOINT: Mostrar clientes/proveedores por empresa y tipo
     * ============================================================
     * 
     * MÉTODO: GET
     * URL: /api/clientes-proveedores/mostrar?idEmpresa=1&tipo=cliente
     * 
     * FRONTEND (Axios):
     * const response = await axios.get("/api/clientes-proveedores/mostrar", {
     *   params: { idEmpresa: 1, tipo: "cliente" }
     * });
     * 
     * @param idEmpresa - ID de la empresa
     * @param tipo - "cliente", "proveedor" o "-"
     * @return Lista de clientes/proveedores en formato JSON
     */
    @GetMapping("/mostrar")
    public List<ClienteProveedor> mostrar(
        @RequestParam Long idEmpresa, 
        @RequestParam String tipo
    ) {
        return service.mostrarClientesProveedores(idEmpresa, tipo);
    }

    /**
     * ============================================================
     * ENDPOINT: Buscar con filtro de texto
     * ============================================================
     * 
     * MÉTODO: GET
     * URL: /api/clientes-proveedores/buscar?idEmpresa=1&buscador=juan
     * 
     * FRONTEND (Axios):
     * const response = await axios.get("/api/clientes-proveedores/buscar", {
     *   params: { idEmpresa: 1, buscador: "juan" }
     * });
     * 
     * @param idEmpresa - ID de la empresa
     * @param buscador - Texto a buscar (nombre, DNI, RUC)
     * @return Lista de coincidencias
     */
    @GetMapping("/buscar")
    public List<ClienteProveedor> buscar(
        @RequestParam Long idEmpresa, 
        @RequestParam String buscador
    ) {
        return service.buscarClientesProveedores(idEmpresa, buscador);
    }

    /**
     * ============================================================
     * ENDPOINT: Insertar cliente/proveedor
     * ============================================================
     * 
     * MÉTODO: POST
     * URL: /api/clientes-proveedores/insertarclientesproveedores
     * BODY: JSON con los datos del cliente/proveedor
     * 
     * NOMBRE EXACTO: "insertarclientesproveedores" (igual que PostgreSQL)
     * Para que el frontend solo cambie supabase.rpc() por axios.post()
     * 
     * FRONTEND (Axios):
     * const response = await axios.post("/api/clientes-proveedores/insertarclientesproveedores", {
     *   nombres: "Juan Pérez",
     *   idEmpresa: 1,
     *   direccion: "Av. Principal 123",
     *   telefono: "999888777",
     *   email: "juan@mail.com",
     *   identificadorNacional: "12345678",
     *   identificadorFiscal: "20123456789",
     *   tipo: "cliente"
     * });
     * 
     * @RequestBody: Convierte el JSON del request en objeto ClienteProveedor automáticamente
     * 
     * @param cliente - Datos del cliente/proveedor (JSON → Objeto Java)
     * @return ResponseEntity con el cliente insertado o mensaje de error
     */
    @PostMapping("/insertarclientesproveedores")
    public ResponseEntity<?> insertarClientesProveedores(@RequestBody ClienteProveedor cliente) {
        try {
            // Llamar al service que valida y guarda
            ClienteProveedor nuevo = service.insertarClienteProveedor(cliente);
            
            // Respuesta exitosa (HTTP 200)
            return ResponseEntity.ok(nuevo);
            
        } catch (Exception e) {
            // Si hay error (duplicados, etc.), retornar HTTP 400 con mensaje
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: Editar cliente/proveedor
     * ============================================================
     * 
     * MÉTODO: PUT
     * URL: /api/clientes-proveedores/editarclientesproveedores
     * BODY: JSON con los datos actualizados (debe incluir "id")
     * 
     * NOMBRE EXACTO: "editarclientesproveedores" (igual que PostgreSQL)
     * 
     * FRONTEND (Axios):
     * const response = await axios.put("/api/clientes-proveedores/editarclientesproveedores", {
     *   id: 5,
     *   nombres: "Juan Carlos Pérez",
     *   idEmpresa: 1,
     *   direccion: "Av. Secundaria 456",
     *   telefono: "999888777",
     *   email: "juancarlos@mail.com",
     *   identificadorNacional: "12345678",
     *   identificadorFiscal: "20123456789",
     *   tipo: "cliente"
     * });
     * 
     * @param cliente - Datos actualizados (debe incluir el ID)
     * @return ResponseEntity con mensaje de éxito o error
     */
    @PutMapping("/editarclientesproveedores")
    public ResponseEntity<?> editarClientesProveedores(@RequestBody ClienteProveedor cliente) {
        try {
            // Validar que se envió el ID
            if (cliente.getId() == null) {
                return ResponseEntity.badRequest().body("El campo 'id' es requerido");
            }
            
            // Llamar al service que valida y actualiza
            service.editarClienteProveedor(cliente.getId(), cliente);
            
            // Respuesta exitosa
            return ResponseEntity.ok("Cliente/Proveedor actualizado");
            
        } catch (Exception e) {
            // Error (duplicados, no encontrado, etc.)
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: Eliminar cliente/proveedor
     * ============================================================
     * 
     * MÉTODO: DELETE
     * URL: /api/clientes-proveedores/eliminar/5
     * 
     * FRONTEND (Axios):
     * const response = await axios.delete("/api/clientes-proveedores/eliminar/5");
     * 
     * @PathVariable: El ID viene en la URL (no en el body)
     * 
     * @param id - ID del cliente/proveedor a eliminar
     * @return ResponseEntity con mensaje de confirmación
     */
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            service.eliminarClienteProveedor(id);
            return ResponseEntity.ok("Cliente/Proveedor eliminado");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT AUXILIAR: Obtener cliente genérico
     * ============================================================
     * 
     * MÉTODO: GET
     * URL: /api/clientes-proveedores/generico/1
     * 
     * Se usa en el frontend cuando se crea una venta sin cliente especificado
     * (equivalente al trigger asignarclientegenerico de PostgreSQL)
     * 
     * @param idEmpresa - ID de la empresa
     * @return Cliente genérico (tipo = '-')
     */
    @GetMapping("/generico/{idEmpresa}")
    public ResponseEntity<?> obtenerGenerico(@PathVariable Long idEmpresa) {
        ClienteProveedor generico = service.obtenerClienteGenerico(idEmpresa);
        
        if (generico == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(generico);
    }
}
