package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.models.Empresa;
import tienda.posbackend.services.EmpresaService;

import java.util.List;
import java.util.Map;

/**
 * CONTROLLER: EmpresaController
 * 
 * ENDPOINTS REST PARA CONFIGURACIÓN DE EMPRESA
 * 
 * MIGRACIÓN FRONTEND:
 * ANTES: const { data } = await supabase.rpc("mostrarempresaxiduser", { _id_usuario: 5 })
 * AHORA: const { data } = await axios.get("/api/empresas/mostrar", { params: { idUsuario: 5 } })
 * 
 * PÁGINAS QUE USAN ESTOS ENDPOINTS:
 * - Configuraciones.jsx (BasicosConfig, TicketConfig)
 * - Empresa.jsx
 * - POS.jsx (para mostrar logo y datos en ticket)
 * - TicketVenta.jsx (para imprimir comprobantes)
 * 
 * STORE ZUSTAND:
 * EmpresaStore.jsx:
 * - mostrarempresa() → GET /mostrar
 * - editarEmpresa() → PUT /editarempresa
 * - editarMonedaEmpresa() → PUT /editarmoneda
 * 
 * ENDPOINTS PRINCIPALES:
 * GET    /api/empresas/mostrar?idUsuario=5     → Obtener empresa del usuario
 * POST   /api/empresas/insertarempresa         → Crear empresa (1 por usuario)
 * PUT    /api/empresas/editarempresa           → Actualizar datos empresa
 * PUT    /api/empresas/editarmoneda            → Cambiar moneda
 * PUT    /api/empresas/editarlogo              → Actualizar logo
 */
@RestController
@RequestMapping("/api/empresas")
@CrossOrigin(origins = "*")
public class EmpresaController {

    @Autowired
    private EmpresaService empresaService;

    /**
     * ============================================================
     * ENDPOINT: mostrarempresaxiduser
     * ============================================================
     * 
     * GET /api/empresas/mostrar?idUsuario=5
     * 
     * POSTGRESQL RPC: mostrarempresaxiduser(p_id_usuario)
     * 
     * FRONTEND (EmpresaStore.jsx):
     * const mostrarempresa = async (p) => {
     *   const response = await axios.get("/api/empresas/mostrar", {
     *     params: { idUsuario: p.id_usuario }
     *   });
     *   set({ dataempresa: response.data });
     * };
     * 
     * USADO EN:
     * - BasicosConfig.jsx (editar nombre, dirección, impuesto)
     * - ConfiguracionTicket.jsx (editar RUC, pie de página)
     * - POS.jsx (mostrar logo en interfaz de venta)
     * - TicketVenta.jsx (imprimir datos en comprobante)
     * 
     * RESPUESTA:
     * {
     *   id: 1,
     *   nombre: "Tienda China Perú",
     *   idFiscal: "20123456789",
     *   direccionFiscal: "Av. Principal 123",
     *   simboloMoneda: "S/",
     *   logo: "https://...",
     *   impuesto: "IGV",
     *   valorImpuesto: 18.00,
     *   nombreMoneda: "Soles",
     *   piePaginaTicket: "Gracias por su compra"
     * }
     */
    @GetMapping("/mostrar")
    public ResponseEntity<?> mostrarEmpresaXidUsuario(@RequestParam Long idUsuario) {
        try {
            Empresa empresa = empresaService.mostrarEmpresaXidUsuario(idUsuario);
            return ResponseEntity.ok(empresa);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: insertarempresa
     * ============================================================
     * 
     * POST /api/empresas/insertarempresa
     * Body: { nombre, idFiscal, direccionFiscal, idUsuario, idAuth }
     * 
     * POSTGRESQL RPC: insertarempresa(...)
     * 
     * FRONTEND (EmpresaStore.jsx):
     * const insertarempresa = async (p) => {
     *   const response = await axios.post("/api/empresas/insertarempresa", {
     *     nombre: "Mi Tienda",
     *     idFiscal: "20123456789",
     *     direccionFiscal: "Av. Principal 123",
     *     idUsuario: 5,
     *     idAuth: "firebase_auth_123"
     *   });
     * };
     * 
     * VALIDACIONES:
     * - Usuario solo puede tener 1 empresa
     * - Campos con DEFAULT se autocompletan
     * 
     * IMPORTANTE:
     * - El logo se sube después con editarlogo endpoint
     * - Los valores DEFAULT se aplican automáticamente en Service
     */
    @PostMapping("/insertarempresa")
    public ResponseEntity<?> insertarEmpresa(@RequestBody Empresa empresa) {
        try {
            Empresa nuevaEmpresa = empresaService.insertarEmpresa(empresa);
            return ResponseEntity.ok(nuevaEmpresa);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: editarempresa
     * ============================================================
     * 
     * PUT /api/empresas/editarempresa
     * Body: { id, nombre, direccionFiscal, impuesto, valorImpuesto }
     * 
     * POSTGRESQL RPC: editarempresa(...)
     * 
     * FRONTEND (BasicosConfig.jsx):
     * const { mutate } = useUpdateEmpresaMutation();
     * 
     * const mutationFn = async (data) => {
     *   const p = {
     *     id: dataempresa?.id,
     *     nombre: data.nombre,
     *     direccionFiscal: data.direccion,
     *     impuesto: data.impuesto,
     *     valorImpuesto: parseFloat(data.valor_impuesto)
     *   };
     *   await axios.put("/api/empresas/editarempresa", p);
     * };
     * 
     * FRONTEND (ConfiguracionTicket.jsx):
     * const mutationFn = async (data) => {
     *   const p = {
     *     id: dataempresa?.id,
     *     nombre: data?.nombre,
     *     idFiscal: data?.id_fiscal,
     *     direccionFiscal: data?.direccion_fiscal,
     *     nombreMoneda: data?.nombre_moneda,
     *     piePaginaTicket: data?.pie_pagina_ticket
     *   };
     *   await axios.put("/api/empresas/editarempresa", p);
     * };
     * 
     * IMPORTANTE:
     * - Solo actualiza campos que vengan en body (no nullifica)
     * - El logo se edita por separado con editarlogo
     */
    @PutMapping("/editarempresa")
    public ResponseEntity<?> editarEmpresa(@RequestBody Empresa empresa) {
        try {
            if (empresa.getId() == null) {
                return ResponseEntity.badRequest().body("El campo 'id' es requerido");
            }
            
            Empresa empresaActualizada = empresaService.editarEmpresa(empresa.getId(), empresa);
            return ResponseEntity.ok(empresaActualizada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: editarmonedaempresa
     * ============================================================
     * 
     * PUT /api/empresas/editarmoneda
     * Body: { id, simboloMoneda, nombreMoneda, currency }
     * 
     * POSTGRESQL RPC: editarmonedaempresa(p_id, p_simbolo, p_nombre, p_currency)
     * 
     * FRONTEND (página Configuraciones → Moneda):
     * const editarMonedaEmpresa = async (p) => {
     *   await axios.put("/api/empresas/editarmoneda", {
     *     id: dataempresa?.id,
     *     simboloMoneda: "S/",
     *     nombreMoneda: "Soles",
     *     currency: "PEN"
     *   });
     * };
     * 
     * USADO EN:
     * - Cambiar de Soles a Dólares
     * - Actualizar símbolo que aparece en tickets
     */
    @PutMapping("/editarmoneda")
    public ResponseEntity<?> editarMoneda(@RequestBody Map<String, Object> body) {
        try {
            Long id = Long.valueOf(body.get("id").toString());
            String simboloMoneda = body.get("simboloMoneda").toString();
            String nombreMoneda = body.get("nombreMoneda").toString();
            String currency = body.get("currency").toString();
            
            empresaService.editarMoneda(id, simboloMoneda, nombreMoneda, currency);
            return ResponseEntity.ok("Moneda actualizada correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT: editarlogoempresa
     * ============================================================
     * 
     * PUT /api/empresas/editarlogo
     * Body: { id, logo }
     * 
     * POSTGRESQL RPC: editarlogoempresa(p_id, p_logo_url)
     * 
     * FRONTEND (BasicosConfig.jsx, ConfiguracionTicket.jsx):
     * // PASO 1: Subir archivo a storage
     * const { publicUrl } = await supabase.storage
     *   .from("imagenes")
     *   .upload("empresa/" + idEmpresa, file);
     * 
     * // PASO 2: Guardar URL en BD
     * await axios.put("/api/empresas/editarlogo", {
     *   id: dataempresa?.id,
     *   logo: publicUrl
     * });
     * 
     * IMPORTANTE:
     * - Este endpoint solo guarda la URL (TEXT)
     * - El archivo físico se maneja en frontend (Storage)
     * - Si file.size !== undefined → subir a storage primero
     */
    @PutMapping("/editarlogo")
    public ResponseEntity<?> editarLogo(@RequestBody Map<String, Object> body) {
        try {
            Long id = Long.valueOf(body.get("id").toString());
            String logoUrl = body.get("logo").toString();
            
            empresaService.editarLogo(id, logoUrl);
            return ResponseEntity.ok("Logo actualizado correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT AUXILIAR: Obtener por ID
     * ============================================================
     * 
     * GET /api/empresas/5
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerEmpresa(@PathVariable Long id) {
        try {
            Empresa empresa = empresaService.obtenerEmpresa(id);
            return ResponseEntity.ok(empresa);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ============================================================
     * ENDPOINT AUXILIAR: Listar todas (para admin)
     * ============================================================
     * 
     * GET /api/empresas/listar
     */
    @GetMapping("/listar")
    public ResponseEntity<?> listarEmpresas() {
        List<Empresa> empresas = empresaService.listarEmpresas();
        return ResponseEntity.ok(empresas);
    }

    /**
     * ============================================================
     * ENDPOINT: Contar empresas registradas
     * ============================================================
     * 
     * GET /api/empresas/contar
     */
    @GetMapping("/contar")
    public ResponseEntity<?> contar() {
        Long cantidad = empresaService.contarEmpresas();
        return ResponseEntity.ok(Map.of("cantidad", cantidad));
    }
}
