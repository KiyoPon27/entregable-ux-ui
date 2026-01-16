package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.models.Almacen;
import tienda.posbackend.services.AlmacenService;

import java.util.List;

/**
 * CONTROLLER: AlmacenController
 * 
 * ENDPOINTS REST PARA ALMACENES
 * 
 * MIGRACIÓN FRONTEND:
 * ANTES: supabase.from("almacen").select()
 * AHORA: axios.get("/api/almacenes/mostrar")
 */
@RestController
@RequestMapping("/api/almacenes")
public class AlmacenController {

    @Autowired
    private AlmacenService service;

    /**
     * ============================================================
     * ENDPOINT: Mostrar almacenes por sucursal
     * ============================================================
     * 
     * GET /api/almacenes/mostrar?idSucursal=1
     * 
     * FRONTEND:
     * const response = await axios.get("/api/almacenes/mostrar", {
     *   params: { idSucursal: 1 }
     * });
     */
    @GetMapping("/mostrar")
    public List<Almacen> mostrar(@RequestParam Long idSucursal) {
        return service.mostrarAlmacenesPorSucursal(idSucursal);
    }

    /**
     * ============================================================
     * ENDPOINT: Obtener almacén por defecto
     * ============================================================
     * 
     * GET /api/almacenes/default/1
     * 
     * Se usa en el POS cuando no se especifica almacén
     * 
     * FRONTEND:
     * const response = await axios.get("/api/almacenes/default/1");
     */
    @GetMapping("/default/{idSucursal}")
    public ResponseEntity<?> obtenerDefault(@PathVariable Long idSucursal) {
        Almacen almacen = service.obtenerAlmacenDefault(idSucursal);
        
        if (almacen == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(almacen);
    }

    /**
     * ============================================================
     * ENDPOINT: Insertar almacén
     * ============================================================
     * 
     * POST /api/almacenes/insertar
     * Body: { nombre, idSucursal, isDefault, deletable }
     * 
     * FRONTEND:
     * const response = await axios.post("/api/almacenes/insertar", {
     *   nombre: "Almacén Secundario",
     *   idSucursal: 1,
     *   isDefault: false,
     *   deletable: true
     * });
     */
    @PostMapping("/insertar")
    public ResponseEntity<?> insertar(@RequestBody Almacen almacen) {
        try {
            Almacen nuevo = service.insertarAlmacen(almacen);
            return ResponseEntity.ok(nuevo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: Editar almacén
     * ============================================================
     * 
     * PUT /api/almacenes/editar
     * Body: { id, nombre, idSucursal, isDefault }
     * 
     * FRONTEND:
     * const response = await axios.put("/api/almacenes/editar", {
     *   id: 2,
     *   nombre: "Almacén Principal - Actualizado",
     *   idSucursal: 1,
     *   isDefault: true
     * });
     */
    @PutMapping("/editar")
    public ResponseEntity<?> editar(@RequestBody Almacen almacen) {
        try {
            if (almacen.getId() == null) {
                return ResponseEntity.badRequest().body("El campo 'id' es requerido");
            }
            service.editarAlmacen(almacen.getId(), almacen);
            return ResponseEntity.ok("Almacén actualizado");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: Eliminar almacén
     * ============================================================
     * 
     * DELETE /api/almacenes/eliminar/2
     * 
     * FRONTEND:
     * const response = await axios.delete("/api/almacenes/eliminar/2");
     */
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            service.eliminarAlmacen(id);
            return ResponseEntity.ok("Almacén eliminado");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: Cambiar almacén por defecto
     * ============================================================
     * 
     * PUT /api/almacenes/cambiar-default/3
     * 
     * Desactiva el actual y activa el nuevo automáticamente
     * 
     * FRONTEND:
     * const response = await axios.put("/api/almacenes/cambiar-default/3");
     */
    @PutMapping("/cambiar-default/{id}")
    public ResponseEntity<?> cambiarDefault(@PathVariable Long id) {
        try {
            service.cambiarAlmacenDefault(id);
            return ResponseEntity.ok("Almacén por defecto actualizado");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT AUXILIAR: Contar almacenes por sucursal
     * ============================================================
     * 
     * GET /api/almacenes/contar/1
     */
    @GetMapping("/contar/{idSucursal}")
    public Long contar(@PathVariable Long idSucursal) {
        return service.contarAlmacenes(idSucursal);
    }
}
