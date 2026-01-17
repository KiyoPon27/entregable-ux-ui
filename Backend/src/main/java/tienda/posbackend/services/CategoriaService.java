package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tienda.posbackend.models.Categoria;
import tienda.posbackend.repositories.CategoriaRepository;

import java.util.List;
import java.util.Optional;

@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository repository;

    // Mostrar categorías por empresa
    public List<Categoria> mostrarCategorias(Long idEmpresa) {
        return repository.findByIdEmpresaOrderByNombreAsc(idEmpresa);
    }

    // Equivalente a 'insertarcategorias'
    public Long insertarCategoria(Categoria c) throws Exception {
        // Validación: nombre único por empresa
        if (repository.findByNombreAndIdEmpresa(c.getNombre(), c.getIdEmpresa()).isPresent()) {
            throw new Exception("Nombre de categoría duplicado");
        }
        Categoria nueva = repository.save(c);
        return nueva.getId();
    }

    // Equivalente a 'editarcategorias'
    @SuppressWarnings("null") // Suprimir warnings de null safety para evitar falsos positivos en análisis estático
    public void editarCategoria(Long id, String nombre, Long idEmpresa, String color, String icono) throws Exception {
        // Validación: nombre único por empresa, excepto el mismo id    
        Optional<Categoria> duplicado = repository.findByNombreAndIdEmpresa(nombre, idEmpresa);
        if (duplicado.isPresent() && !duplicado.get().getId().equals(id)) {
            throw new Exception("Nombre de categoría duplicado");
        }

        Optional<Categoria> categoria = repository.findById(id);
        if (categoria.isPresent()) {
            categoria.get().setNombre(nombre);
            categoria.get().setColor(color);
            if (icono != null) {
                categoria.get().setIcono(icono);
            }
            repository.save(categoria.get());
        } else {
            throw new Exception("Categoría no encontrada");
        }
    }

    // Eliminar categoría (si es necesario)
    @SuppressWarnings("null") // Suprimir warnings de null safety para evitar falsos positivos en análisis estático
    public void eliminarCategoria(Long id) {
        repository.deleteById(id);
    }
}