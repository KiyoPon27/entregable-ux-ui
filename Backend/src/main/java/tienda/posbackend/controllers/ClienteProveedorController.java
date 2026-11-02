package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import tienda.posbackend.entities.ClienteProveedor;
import tienda.posbackend.services.ClienteProveedorService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clientes-proveedores")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class ClienteProveedorController {
    
    @Autowired
    private ClienteProveedorService clienteProveedorService;
    
    /**
     * Listar todos los clientes/proveedores de una empresa
     * GET /api/clientes-proveedores/empresa/{idEmpresa}
     */
    @GetMapping("/empresa/{idEmpresa}")
    public ResponseEntity<?> listarPorEmpresa(@PathVariable Long idEmpresa) {
        try {
            List<ClienteProveedor> lista = clienteProveedorService.listarPorEmpresa(idEmpresa);
            return ResponseEntity.ok(lista);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(crearRespuestaError("Error al listar clientes/proveedores: " + e.getMessage()));
        }
    }
    
    /**
     * Listar por tipo (CLIENTE, PROVEEDOR, AMBOS)
     * GET /api/clientes-proveedores/empresa/{idEmpresa}/tipo/{tipo}
     */
    @GetMapping("/empresa/{idEmpresa}/tipo/{tipo}")
    public ResponseEntity<?> listarPorTipo(@PathVariable Long idEmpresa, @PathVariable String tipo) {
        try {
            List<ClienteProveedor> lista = clienteProveedorService.listarPorTipo(idEmpresa, tipo);
            return ResponseEntity.ok(lista);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(crearRespuestaError("Error al listar por tipo: " + e.getMessage()));
        }
    }
    
    /**
     * Listar por estado (activo, inactivo)
     * GET /api/clientes-proveedores/empresa/{idEmpresa}/estado/{estado}
     */
    @GetMapping("/empresa/{idEmpresa}/estado/{estado}")
    public ResponseEntity<?> listarPorEstado(@PathVariable Long idEmpresa, @PathVariable String estado) {
        try {
            List<ClienteProveedor> lista = clienteProveedorService.listarPorEstado(idEmpresa, estado);
            return ResponseEntity.ok(lista);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(crearRespuestaError("Error al listar por estado: " + e.getMessage()));
        }
    }
    
    /**
     * Buscar por nombre
     * GET /api/clientes-proveedores/empresa/{idEmpresa}/buscar?q=texto
     */
    @GetMapping("/empresa/{idEmpresa}/buscar")
    public ResponseEntity<?> buscarPorNombre(
        @PathVariable Long idEmpresa, 
        @RequestParam String q
    ) {
        try {
            List<ClienteProveedor> lista = clienteProveedorService.buscarPorNombre(idEmpresa, q);
            return ResponseEntity.ok(lista);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(crearRespuestaError("Error al buscar: " + e.getMessage()));
        }
    }
    
    /**
     * Obtener por ID
     * GET /api/clientes-proveedores/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            ClienteProveedor clienteProveedor = clienteProveedorService.obtenerPorId(id);
            return ResponseEntity.ok(clienteProveedor);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(crearRespuestaError(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(crearRespuestaError("Error al obtener cliente/proveedor: " + e.getMessage()));
        }
    }
    
    /**
     * Crear nuevo cliente/proveedor
     * POST /api/clientes-proveedores
     */
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody ClienteProveedor clienteProveedor) {
        try {
            ClienteProveedor nuevo = clienteProveedorService.insertar(clienteProveedor);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
        } catch (RuntimeException e) {
            // Error de validación (duplicados)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(crearRespuestaError(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(crearRespuestaError("Error al crear cliente/proveedor: " + e.getMessage()));
        }
    }
    
    /**
     * Editar cliente/proveedor existente
     * PUT /api/clientes-proveedores/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> editar(
        @PathVariable Long id, 
        @RequestBody ClienteProveedor clienteProveedor
    ) {
        try {
            ClienteProveedor actualizado = clienteProveedorService.editar(id, clienteProveedor);
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException e) {
            // Error de validación o no encontrado
            if (e.getMessage().contains("no encontrado")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(crearRespuestaError(e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(crearRespuestaError(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(crearRespuestaError("Error al editar cliente/proveedor: " + e.getMessage()));
        }
    }
    
    /**
     * Eliminar cliente/proveedor
     * DELETE /api/clientes-proveedores/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            clienteProveedorService.eliminar(id);
            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("mensaje", "Cliente/Proveedor eliminado exitosamente");
            respuesta.put("id", id);
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(crearRespuestaError(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(crearRespuestaError("Error al eliminar cliente/proveedor: " + e.getMessage()));
        }
    }
    
    /**
     * Cambiar estado (activo/inactivo)
     * PATCH /api/clientes-proveedores/{id}/estado
     * Body: { "estado": "activo" | "inactivo" }
     */
    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(
        @PathVariable Long id, 
        @RequestBody Map<String, String> body
    ) {
        try {
            String nuevoEstado = body.get("estado");
            if (nuevoEstado == null || nuevoEstado.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(crearRespuestaError("El campo 'estado' es requerido"));
            }
            
            ClienteProveedor actualizado = clienteProveedorService.cambiarEstado(id, nuevoEstado);
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(crearRespuestaError(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(crearRespuestaError("Error al cambiar estado: " + e.getMessage()));
        }
    }
    
    /**
     * Método auxiliar para crear respuestas de error consistentes
     */
    private Map<String, Object> crearRespuestaError(String mensaje) {
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("error", true);
        respuesta.put("mensaje", mensaje);
        return respuesta;
    }
}
