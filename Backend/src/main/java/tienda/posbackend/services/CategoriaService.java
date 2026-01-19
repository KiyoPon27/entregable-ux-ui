package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.entities.Categoria;
import tienda.posbackend.entities.Empresa;
import tienda.posbackend.exceptions.DuplicateResourceException;
import tienda.posbackend.exceptions.ResourceNotFoundException;
import tienda.posbackend.repositories.CategoriaRepository;
import tienda.posbackend.repositories.EmpresaRepository;
import tienda.posbackend.repositories.ProductoRepository;

import java.util.List;
import java.util.Optional;

@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private EmpresaRepository empresaRepository;
    
    @Autowired
    private ProductoRepository productoRepository;

    public List<Categoria> listarPorEmpresa(Long empresaId) {
        return categoriaRepository.findByEmpresaId(empresaId);
    }

    public List<Categoria> buscarPorNombre(Long empresaId, String query) {
        return categoriaRepository.buscarPorNombre(empresaId, query);
    }

    @Transactional
    public Categoria crear(Categoria categoria) {
        // Validar que venga la empresa
        if (categoria.getEmpresa() == null || categoria.getEmpresa().getId() == null) {
            throw new IllegalArgumentException("Debe especificar una empresa");
        }

        Long empresaId = categoria.getEmpresa().getId();
        
        // Buscar y asignar la empresa
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new ResourceNotFoundException("Empresa no encontrada con ID: " + empresaId));
        
        categoria.setEmpresa(empresa);

        // Validar duplicados: nombre + empresa
        Optional<Categoria> existente = categoriaRepository.findByEmpresaId(empresaId).stream()
                .filter(c -> c.getNombre().equalsIgnoreCase(categoria.getNombre()))
                .findFirst();
        
        if (existente.isPresent()) {
            throw new DuplicateResourceException("Ya existe una categoría con el nombre '" + categoria.getNombre() + "' en esta empresa");
        }

        return categoriaRepository.save(categoria);
    }

    @Transactional
    public Categoria editar(Long id, Categoria categoriaDetails) {
        // Buscar categoría existente
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + id));

        Long empresaId = categoria.getEmpresa().getId();

        // Validar duplicados: nombre + empresa (excluyendo la categoría actual)
        Optional<Categoria> existente = categoriaRepository.findByEmpresaId(empresaId).stream()
                .filter(c -> !c.getId().equals(id)) // Excluir la categoría actual
                .filter(c -> c.getNombre().equalsIgnoreCase(categoriaDetails.getNombre()))
                .findFirst();
        
        if (existente.isPresent()) {
            throw new DuplicateResourceException("Ya existe otra categoría con el nombre '" + categoriaDetails.getNombre() + "' en esta empresa");
        }

        // Actualizar campos
        categoria.setNombre(categoriaDetails.getNombre());
        if (categoriaDetails.getColor() != null) {
            categoria.setColor(categoriaDetails.getColor());
        }
        if (categoriaDetails.getIcono() != null) {
            categoria.setIcono(categoriaDetails.getIcono());
        }

        return categoriaRepository.save(categoria);
    }

    @Transactional
    public void eliminar(Long id) {
        // Verificar que la categoría existe
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + id));
        
        // Verificar si tiene productos asociados
        long cantidadProductos = productoRepository.countByCategoriaId(id);
        if (cantidadProductos > 0) {
            throw new IllegalStateException("No se puede eliminar la categoría porque tiene " + cantidadProductos + " producto(s) asociado(s). Elimina o reasigna los productos primero.");
        }
        
        categoriaRepository.deleteById(id);
    }
}
