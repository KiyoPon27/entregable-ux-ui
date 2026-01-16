package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.models.Empresa;
import tienda.posbackend.repositories.EmpresaRepository;

import java.util.List;

/**
 * SERVICE: EmpresaService
 * 
 * LÓGICA DE NEGOCIO PARA CONFIGURACIÓN DE EMPRESA
 * 
 * MIGRACIÓN FRONTEND:
 * ANTES: await supabase.rpc("mostrarempresaxiduser", { _id_usuario: 5 })
 * AHORA: await axios.get("/api/empresas/mostrar", { params: { idUsuario: 5 } })
 * 
 * FUNCIONALIDADES:
 * 1. mostrarEmpresaXidUsuario() - Obtener empresa del usuario logueado
 * 2. insertarEmpresa() - Crear empresa (solo 1 por usuario)
 * 3. editarEmpresa() - Actualizar configuración (logo, RUC, impuestos, etc.)
 * 4. editarMoneda() - Cambiar moneda de la empresa
 * 5. editarLogo() - Actualizar logo (URL)
 * 
 * IMPORTANTE:
 * - Cada usuario tiene solo UNA empresa (validar en insert)
 * - El logo se maneja en frontend (upload a storage) y acá solo guardamos URL
 * - valorImpuesto se usa para calcular IGV/IVA en ventas
 * - simboloMoneda y nombreMoneda se muestran en tickets
 */
@Service
public class EmpresaService {

    @Autowired
    private EmpresaRepository empresaRepository;

    /**
     * ============================================================
     * MÉTODO: mostrarEmpresaXidUsuario
     * ============================================================
     * 
     * POSTGRESQL RPC: mostrarempresaxiduser(p_id_usuario)
     * 
     * SELECT * FROM empresa WHERE id_usuario = p_id_usuario
     * 
     * FRONTEND:
     * const { dataempresa } = useEmpresaStore();
     * const response = await axios.get("/api/empresas/mostrar", {
     *   params: { idUsuario: user.id }
     * });
     * 
     * RETORNA:
     * {
     *   id: 1,
     *   nombre: "Tienda China Perú",
     *   idFiscal: "20123456789",  // RUC
     *   direccionFiscal: "Av. Principal 123",
     *   simboloMoneda: "S/",
     *   logo: "https://supabase.co/storage/...",
     *   impuesto: "IGV",
     *   valorImpuesto: 18.00,
     *   nombreMoneda: "Soles",
     *   piePaginaTicket: "Gracias por su compra"
     * }
     */
    public Empresa mostrarEmpresaXidUsuario(Long idUsuario) {
        return empresaRepository.findByIdUsuario(idUsuario)
            .orElseThrow(() -> new RuntimeException("No se encontró empresa para el usuario con id: " + idUsuario));
    }

    /**
     * ============================================================
     * MÉTODO: insertarEmpresa
     * ============================================================
     * 
     * POSTGRESQL RPC: insertarempresa(...)
     * 
     * INSERT INTO empresa (...) VALUES (...)
     * 
     * VALIDACIONES:
     * 1. Usuario no debe tener otra empresa (solo 1 por usuario)
     * 2. Establecer valores DEFAULT si no vienen en request
     * 
     * FRONTEND:
     * const response = await axios.post("/api/empresas/insertarempresa", {
     *   nombre: "Mi Tienda",
     *   idFiscal: "20123456789",
     *   direccionFiscal: "Av. Principal 123",
     *   idUsuario: 5,
     *   idAuth: "firebase_auth_123"
     * });
     * 
     * IMPORTANTE:
     * - El logo se sube primero a storage, luego se guarda URL con editarLogo()
     * - Los campos con DEFAULT se autocompletan si vienen null
     */
    @Transactional
    public Empresa insertarEmpresa(Empresa empresa) {
        // VALIDACIÓN: Usuario solo puede tener 1 empresa
        if (empresaRepository.existsByIdUsuario(empresa.getIdUsuario())) {
            throw new RuntimeException("El usuario ya tiene una empresa registrada");
        }

        // VALORES DEFAULT (si no vienen en request)
        if (empresa.getNombre() == null || empresa.getNombre().isEmpty()) {
            empresa.setNombre("Generica");
        }
        if (empresa.getIdFiscal() == null) {
            empresa.setIdFiscal("-");
        }
        if (empresa.getDireccionFiscal() == null) {
            empresa.setDireccionFiscal("-");
        }
        if (empresa.getSimboloMoneda() == null) {
            empresa.setSimboloMoneda("$");
        }
        if (empresa.getIso() == null) {
            empresa.setIso("PE");
        }
        if (empresa.getPais() == null) {
            empresa.setPais("Peru");
        }
        if (empresa.getCurrency() == null) {
            empresa.setCurrency("PEN");
        }
        if (empresa.getImpuesto() == null) {
            empresa.setImpuesto("IGV");
        }
        if (empresa.getValorImpuesto() == null) {
            empresa.setValorImpuesto(new java.math.BigDecimal("18.00"));
        }
        if (empresa.getNombreMoneda() == null) {
            empresa.setNombreMoneda("-");
        }
        if (empresa.getCorreo() == null) {
            empresa.setCorreo("");
        }
        if (empresa.getPiePaginaTicket() == null) {
            empresa.setPiePaginaTicket("-");
        }

        return empresaRepository.save(empresa);
    }

    /**
     * ============================================================
     * MÉTODO: editarEmpresa
     * ============================================================
     * 
     * POSTGRESQL RPC: editarempresa(...)
     * 
     * UPDATE empresa SET ... WHERE id = p_id
     * 
     * FRONTEND:
     * const response = await axios.put("/api/empresas/editarempresa", {
     *   id: 1,
     *   nombre: "Tienda China Perú SAC",
     *   direccionFiscal: "Av. Nueva 456",
     *   impuesto: "IGV",
     *   valorImpuesto: 18.00
     * });
     * 
     * IMPORTANTE:
     * - El logo se edita por separado con editarLogo()
     * - Solo actualiza campos que vengan en request (no nullifica)
     */
    @Transactional
    public Empresa editarEmpresa(Long id, Empresa empresaActualizada) {
        Empresa empresaExistente = empresaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("No se encontró empresa con id: " + id));

        // ACTUALIZAR CAMPOS (solo si vienen en request, no nullificar)
        if (empresaActualizada.getNombre() != null) {
            empresaExistente.setNombre(empresaActualizada.getNombre());
        }
        if (empresaActualizada.getIdFiscal() != null) {
            empresaExistente.setIdFiscal(empresaActualizada.getIdFiscal());
        }
        if (empresaActualizada.getDireccionFiscal() != null) {
            empresaExistente.setDireccionFiscal(empresaActualizada.getDireccionFiscal());
        }
        if (empresaActualizada.getSimboloMoneda() != null) {
            empresaExistente.setSimboloMoneda(empresaActualizada.getSimboloMoneda());
        }
        if (empresaActualizada.getIso() != null) {
            empresaExistente.setIso(empresaActualizada.getIso());
        }
        if (empresaActualizada.getPais() != null) {
            empresaExistente.setPais(empresaActualizada.getPais());
        }
        if (empresaActualizada.getCurrency() != null) {
            empresaExistente.setCurrency(empresaActualizada.getCurrency());
        }
        if (empresaActualizada.getImpuesto() != null) {
            empresaExistente.setImpuesto(empresaActualizada.getImpuesto());
        }
        if (empresaActualizada.getValorImpuesto() != null) {
            empresaExistente.setValorImpuesto(empresaActualizada.getValorImpuesto());
        }
        if (empresaActualizada.getNombreMoneda() != null) {
            empresaExistente.setNombreMoneda(empresaActualizada.getNombreMoneda());
        }
        if (empresaActualizada.getCorreo() != null) {
            empresaExistente.setCorreo(empresaActualizada.getCorreo());
        }
        if (empresaActualizada.getPiePaginaTicket() != null) {
            empresaExistente.setPiePaginaTicket(empresaActualizada.getPiePaginaTicket());
        }

        return empresaRepository.save(empresaExistente);
    }

    /**
     * ============================================================
     * MÉTODO: editarMoneda
     * ============================================================
     * 
     * POSTGRESQL RPC: editarmonedaempresa(p_id, p_simbolo, p_nombre, p_currency)
     * 
     * UPDATE empresa SET 
     *   simbolo_moneda = p_simbolo,
     *   nombre_moneda = p_nombre,
     *   currency = p_currency
     * WHERE id = p_id
     * 
     * FRONTEND (página Configuraciones → Moneda):
     * const response = await axios.put("/api/empresas/editarmoneda", {
     *   id: 1,
     *   simboloMoneda: "S/",
     *   nombreMoneda: "Soles",
     *   currency: "PEN"
     * });
     */
    @Transactional
    public void editarMoneda(Long id, String simboloMoneda, String nombreMoneda, String currency) {
        Empresa empresa = empresaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("No se encontró empresa con id: " + id));

        empresa.setSimboloMoneda(simboloMoneda);
        empresa.setNombreMoneda(nombreMoneda);
        empresa.setCurrency(currency);

        empresaRepository.save(empresa);
    }

    /**
     * ============================================================
     * MÉTODO: editarLogo
     * ============================================================
     * 
     * POSTGRESQL RPC: editarlogoempresa(p_id, p_logo_url)
     * 
     * UPDATE empresa SET logo = p_logo_url WHERE id = p_id
     * 
     * FRONTEND (después de subir imagen a storage):
     * // 1. Subir archivo a storage
     * const { publicUrl } = await supabase.storage.from("imagenes").upload(...)
     * 
     * // 2. Guardar URL en BD
     * const response = await axios.put("/api/empresas/editarlogo", {
     *   id: 1,
     *   logo: publicUrl
     * });
     * 
     * IMPORTANTE:
     * - Este endpoint solo guarda la URL
     * - El archivo físico se maneja en frontend (Storage de Supabase/Firebase)
     */
    @Transactional
    public void editarLogo(Long id, String logoUrl) {
        Empresa empresa = empresaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("No se encontró empresa con id: " + id));

        empresa.setLogo(logoUrl);
        empresaRepository.save(empresa);
    }

    /**
     * ============================================================
     * MÉTODO AUXILIAR: obtenerEmpresa
     * ============================================================
     */
    public Empresa obtenerEmpresa(Long id) {
        return empresaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("No se encontró empresa con id: " + id));
    }

    /**
     * ============================================================
     * MÉTODO AUXILIAR: listarEmpresas
     * ============================================================
     * 
     * Listar todas las empresas (para admin)
     */
    public List<Empresa> listarEmpresas() {
        return empresaRepository.findAll();
    }

    /**
     * ============================================================
     * MÉTODO AUXILIAR: contarEmpresas
     * ============================================================
     */
    public Long contarEmpresas() {
        return empresaRepository.countEmpresas();
    }
}
