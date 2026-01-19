package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.entities.Almacen;
import tienda.posbackend.entities.Caja;
import tienda.posbackend.entities.Empresa;
import tienda.posbackend.entities.Sucursal;
import tienda.posbackend.exceptions.DuplicateResourceException;
import tienda.posbackend.exceptions.ResourceNotFoundException;
import tienda.posbackend.repositories.AlmacenRepository;
import tienda.posbackend.repositories.CajaRepository;
import tienda.posbackend.repositories.EmpresaRepository;
import tienda.posbackend.repositories.SucursalRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SucursalService {

    @Autowired
    private SucursalRepository sucursalRepository;

    @Autowired
    private EmpresaRepository empresaRepository;
    
    @Autowired
    private CajaRepository cajaRepository;
    
    @Autowired
    private AlmacenRepository almacenRepository;

    public List<Sucursal> listarPorEmpresa(Long empresaId) {
        return sucursalRepository.findByEmpresaId(empresaId);
    }

    public List<Map<String, Object>> listarConCajasPorEmpresa(Long empresaId) {
        List<Sucursal> sucursales = sucursalRepository.findByEmpresaId(empresaId);
        
        return sucursales.stream().map(sucursal -> {
            Map<String, Object> sucursalMap = new HashMap<>();
            sucursalMap.put("id", sucursal.getId());
            sucursalMap.put("nombre", sucursal.getNombre());
            sucursalMap.put("direccion_fiscal", sucursal.getDireccionFiscal());
            sucursalMap.put("eliminar", sucursal.getEliminar());
            sucursalMap.put("delete", sucursal.getEliminar()); // Compatibilidad con frontend
            
            // Obtener cajas de esta sucursal
            List<Caja> cajas = cajaRepository.findBySucursalId(sucursal.getId());
            List<Map<String, Object>> cajasMap = cajas.stream().map(caja -> {
                Map<String, Object> cajaMap = new HashMap<>();
                cajaMap.put("id", caja.getId());
                cajaMap.put("descripcion", caja.getDescripcion());
                cajaMap.put("fecha_creacion", caja.getFechaCreacion());
                cajaMap.put("eliminar", caja.getEliminar());
                cajaMap.put("delete", caja.getEliminar()); // Compatibilidad con frontend
                cajaMap.put("imprimir", caja.getImprimir());
                return cajaMap;
            }).collect(Collectors.toList());
            
            sucursalMap.put("caja", cajasMap);
            
            return sucursalMap;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> listarConAlmacenesPorEmpresa(Long empresaId) {
        List<Sucursal> sucursales = sucursalRepository.findByEmpresaId(empresaId);
        
        return sucursales.stream().map(sucursal -> {
            Map<String, Object> sucursalMap = new HashMap<>();
            sucursalMap.put("id", sucursal.getId());
            sucursalMap.put("nombre", sucursal.getNombre());
            sucursalMap.put("direccion_fiscal", sucursal.getDireccionFiscal());
            sucursalMap.put("eliminar", sucursal.getEliminar());
            sucursalMap.put("delete", sucursal.getEliminar()); // Compatibilidad con frontend
            
            // Obtener almacenes de esta sucursal
            List<Almacen> almacenes = almacenRepository.findBySucursalId(sucursal.getId());
            List<Map<String, Object>> almacenesMap = almacenes.stream().map(almacen -> {
                Map<String, Object> almacenMap = new HashMap<>();
                almacenMap.put("id", almacen.getId());
                almacenMap.put("nombre", almacen.getNombre());
                almacenMap.put("fecha_creacion", almacen.getFechaCreacion());
                almacenMap.put("eliminar", almacen.getEliminar());
                almacenMap.put("delete", almacen.getEliminar()); // Compatibilidad con frontend
                almacenMap.put("defecto", almacen.getDefecto());
                almacenMap.put("id_sucursal", sucursal.getId());
                return almacenMap;
            }).collect(Collectors.toList());
            
            sucursalMap.put("almacen", almacenesMap);
            
            return sucursalMap;
        }).collect(Collectors.toList());
    }

    public Sucursal obtenerPorId(Long id) {
        return sucursalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sucursal no encontrada con ID: " + id));
    }

    @Transactional
    public Sucursal crear(Sucursal sucursal) {
        // Validar que venga la empresa
        if (sucursal.getEmpresa() == null || sucursal.getEmpresa().getId() == null) {
            throw new IllegalArgumentException("Debe especificar una empresa");
        }

        Long empresaId = sucursal.getEmpresa().getId();
        
        // Buscar y asignar la empresa
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new ResourceNotFoundException("Empresa no encontrada con ID: " + empresaId));
        
        sucursal.setEmpresa(empresa);

        // Validar duplicados: nombre + empresa
        Optional<Sucursal> existente = sucursalRepository.findByEmpresaId(empresaId).stream()
                .filter(s -> s.getNombre().equalsIgnoreCase(sucursal.getNombre()))
                .findFirst();
        
        if (existente.isPresent()) {
            throw new DuplicateResourceException("Ya existe una sucursal con el nombre '" + sucursal.getNombre() + "' en esta empresa");
        }

        // Establecer valor por defecto para eliminar si no viene
        if (sucursal.getEliminar() == null) {
            sucursal.setEliminar(true);
        }

        return sucursalRepository.save(sucursal);
    }

    @Transactional
    public Sucursal editar(Long id, Sucursal sucursalDetails) {
        // Buscar sucursal existente
        Sucursal sucursal = sucursalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sucursal no encontrada con ID: " + id));

        Long empresaId = sucursal.getEmpresa().getId();

        // Validar duplicados: nombre + empresa (excluyendo la sucursal actual)
        Optional<Sucursal> existente = sucursalRepository.findByEmpresaId(empresaId).stream()
                .filter(s -> !s.getId().equals(id)) // Excluir la sucursal actual
                .filter(s -> s.getNombre().equalsIgnoreCase(sucursalDetails.getNombre()))
                .findFirst();
        
        if (existente.isPresent()) {
            throw new DuplicateResourceException("Ya existe otra sucursal con el nombre '" + sucursalDetails.getNombre() + "' en esta empresa");
        }

        // Actualizar campos
        sucursal.setNombre(sucursalDetails.getNombre());
        
        if (sucursalDetails.getDireccionFiscal() != null) {
            sucursal.setDireccionFiscal(sucursalDetails.getDireccionFiscal());
        }
        
        if (sucursalDetails.getEliminar() != null) {
            sucursal.setEliminar(sucursalDetails.getEliminar());
        }

        return sucursalRepository.save(sucursal);
    }

    @Transactional
    public void eliminar(Long id) {
        // Verificar que la sucursal existe
        Sucursal sucursal = sucursalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sucursal no encontrada con ID: " + id));
        
        // TODO: Agregar validación si tiene cajas, almacenes o ventas asociadas
        // Por ahora permitimos la eliminación
        
        sucursalRepository.deleteById(id);
    }
}
