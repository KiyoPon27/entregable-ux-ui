package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.models.TipoDocumento;
import tienda.posbackend.services.TipoDocumentoService;

import java.util.List;
import java.util.Map;

/**
 * CONTROLLER: TipoDocumentoController
 * 
 * ENDPOINTS REST PARA TIPOS DE DOCUMENTO
 * 
 * MIGRACIÓN FRONTEND:
 * ANTES: const { data } = await supabase.from("tipodocumento").select().eq("id_empresa", 1)
 * AHORA: const { data } = await axios.get("/api/tipodocumentos/mostrar", { params: { idEmpresa: 1 } })
 * 
 * USADO EN:
 * - RegistrarClientesProveedores.jsx (seleccionar tipo de documento)
 * - RegistrarUsuarios.jsx (nro_doc con tipo de documento)
 * - Configuraciones.jsx (gestionar catálogo de tipos de documento)
 * 
 * ENDPOINTS PRINCIPALES:
 * GET    /api/tipodocumentos/mostrar?idEmpresa=1       → Listar tipos
 * POST   /api/tipodocumentos/insertartipodocumento    → Crear tipo
 * PUT    /api/tipodocumentos/editartipodocumento      → Editar tipo
 * DELETE /api/tipodocumentos/eliminartipodocumento/:id → Eliminar tipo
 */
@RestController
@RequestMapping("/api/tipodocumentos")
@CrossOrigin(origins = "*")
public class TipoDocumentoController {

    @Autowired
    private TipoDocumentoService tipoDocumentoService;

    /**
     * ============================================================
     * ENDPOINT: mostrartipodocumentos
     * ============================================================
     * 
     * GET /api/tipodocumentos/mostrar?idEmpresa=1
     * 
     * POSTGRESQL RPC: mostrartipodocumentos(p_id_empresa)
     * 
     * FRONTEND:
     * const response = await axios.get("/api/tipodocumentos/mostrar", {
     *   params: { idEmpresa: dataempresa?.id }
     * });
     * 
     * USADO EN:
     * - RegistrarClientesProveedores.jsx (dropdown tipo documento)
     * - RegistrarUsuarios.jsx (validar nro_doc)
     * - Configuraciones.jsx (tabla de tipos de documento)
     * 
     * RESPUESTA:
     * [
     *   { id: 1, nombre: "DNI", idEmpresa: 1, icono: "🪖", descripcion: "Documento Nacional de Identidad" },
     *   { id: 2, nombre: "RUC", idEmpresa: 1, icono: "📋", descripcion: "Registro Único de Contribuyentes" },
     *   { id: 3, nombre: "Pasaporte", idEmpresa: 1, icono: "✈️", descripcion: "Pasaporte internacional" }
     * ]
     */
    @GetMapping("/mostrar")
    public ResponseEntity<?> mostrar(@RequestParam Long idEmpresa) {
        try {
            List<TipoDocumento> tiposDocumento = tipoDocumentoService.mostrarTipoDocumentos(idEmpresa);
            return ResponseEntity.ok(tiposDocumento);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: insertartipodocumento
     * ============================================================
     * 
     * POST /api/tipodocumentos/insertartipodocumento
     * Body: { nombre, idEmpresa, icono, descripcion }
     * 
     * POSTGRESQL RPC: insertartipodocumento(...)
     * 
     * FRONTEND:
     * const response = await axios.post("/api/tipodocumentos/insertartipodocumento", {
     *   nombre: "Carnet de Extranjería",
     *   idEmpresa: 1,
     *   icono: "🌍",
     *   descripcion: "Documento de extranjeros residentes"
     * });
     * 
     * VALIDACIONES:
     * - Nombre único por empresa (case-insensitive)
     */
    @PostMapping("/insertartipodocumento")
    public ResponseEntity<?> insertar(@RequestBody TipoDocumento tipoDocumento) {
        try {
            TipoDocumento nuevoTipo = tipoDocumentoService.insertarTipoDocumento(tipoDocumento);
            return ResponseEntity.ok(nuevoTipo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: editartipodocumento
     * ============================================================
     * 
     * PUT /api/tipodocumentos/editartipodocumento
     * Body: { id, nombre, icono, descripcion }
     * 
     * POSTGRESQL RPC: editartipodocumento(...)
     * 
     * FRONTEND:
     * const response = await axios.put("/api/tipodocumentos/editartipodocumento", {
     *   id: 5,
     *   nombre: "CE",
     *   icono: "🌍",
     *   descripcion: "Carnet de Extranjería"
     * });
     */
    @PutMapping("/editartipodocumento")
    public ResponseEntity<?> editar(@RequestBody TipoDocumento tipoDocumento) {
        try {
            if (tipoDocumento.getId() == null) {
                return ResponseEntity.badRequest().body("El campo 'id' es requerido");
            }
            
            TipoDocumento tipoActualizado = tipoDocumentoService.editarTipoDocumento(
                tipoDocumento.getId(), 
                tipoDocumento
            );
            return ResponseEntity.ok(tipoActualizado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: eliminartipodocumento
     * ============================================================
     * 
     * DELETE /api/tipodocumentos/eliminartipodocumento/5
     * 
     * POSTGRESQL RPC: eliminartipodocumento(p_id)
     * 
     * FRONTEND:
     * const response = await axios.delete("/api/tipodocumentos/eliminartipodocumento/5");
     * 
     * VALIDACIONES:
     * - No eliminar si está en uso en clientes/proveedores
     */
    @DeleteMapping("/eliminartipodocumento/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            tipoDocumentoService.eliminarTipoDocumento(id);
            return ResponseEntity.ok("Tipo de documento eliminado correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT AUXILIAR: Obtener por ID
     * ============================================================
     * 
     * GET /api/tipodocumentos/5
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(@PathVariable Long id) {
        try {
            TipoDocumento tipoDocumento = tipoDocumentoService.obtenerTipoDocumento(id);
            return ResponseEntity.ok(tipoDocumento);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT AUXILIAR: Buscar por nombre
     * ============================================================
     * 
     * GET /api/tipodocumentos/buscar?nombre=DNI&idEmpresa=1
     */
    @GetMapping("/buscar")
    public ResponseEntity<?> buscarPorNombre(
        @RequestParam String nombre,
        @RequestParam Long idEmpresa
    ) {
        try {
            TipoDocumento tipoDocumento = tipoDocumentoService.buscarPorNombre(nombre, idEmpresa);
            return ResponseEntity.ok(tipoDocumento);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: Contar tipos de documento
     * ============================================================
     * 
     * GET /api/tipodocumentos/contar?idEmpresa=1
     */
    @GetMapping("/contar")
    public ResponseEntity<?> contar(@RequestParam Long idEmpresa) {
        Long cantidad = tipoDocumentoService.contarTipoDocumentos(idEmpresa);
        return ResponseEntity.ok(Map.of("cantidad", cantidad));
    }

    /**
     * ============================================================
     * ENDPOINT: Crear tipos de documento por defecto
     * ============================================================
     * 
     * POST /api/tipodocumentos/crear-default
     * Body: { idEmpresa }
     * 
     * IMPORTANTE:
     * - Se llama automáticamente al crear empresa
     * - Crea DNI, RUC, Pasaporte por defecto
     * 
     * FRONTEND:
     * const response = await axios.post("/api/tipodocumentos/crear-default", {
     *   idEmpresa: 1
     * });
     */
    @PostMapping("/crear-default")
    public ResponseEntity<?> crearDefault(@RequestBody Map<String, Object> body) {
        try {
            Long idEmpresa = Long.valueOf(body.get("idEmpresa").toString());
            tipoDocumentoService.crearTiposDocumentoDefault(idEmpresa);
            return ResponseEntity.ok("Tipos de documento por defecto creados correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
