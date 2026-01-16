package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.models.Modulo;
import tienda.posbackend.repositories.ModuloRepository;

import java.util.List;
import java.util.Optional;

/**
 * SERVICE: ModuloService
 * 
 * Lógica de negocio para gestión de módulos del sistema
 * 
 * REGLAS DE NEGOCIO:
 * 1. Los módulos con etiquetas="#default" son del sistema y no se muestran en listados públicos
 * 2. Validación de nombre único
 * 3. No se pueden eliminar módulos del sistema (#default)
 * 
 * MÉTODOS DISPONIBLES:
 * - mostrarModulos() - Lista módulos excluyendo #default
 * - mostrarModulosPorEtiqueta() - Filtra por etiqueta específica
 * - insertarModulo() - Crea nuevo módulo
 * - editarModulo() - Actualiza módulo existente
 * - eliminarModulo() - Elimina módulo (validar dependencias)
 */
@Service
public class ModuloService {

    @Autowired
    private ModuloRepository moduloRepository;

    /**
     * MOSTRAR MÓDULOS (EXCLUYENDO #default)
     * 
     * Replica el query PostgreSQL:
     * SELECT * FROM modulos WHERE etiquetas != '#default'
     * 
     * USADO EN:
     * - PermisosUser.jsx: Para asignar permisos a usuarios
     * - ModulosStore.jsx: Lista de módulos configurables
     * 
     * @return Lista de módulos ordenados alfabéticamente
     */
    @Transactional(readOnly = true)
    public List<Modulo> mostrarModulos() {
        return moduloRepository.findAllExceptDefault();
    }

    /**
     * MOSTRAR TODOS LOS MÓDULOS (INCLUYENDO #default)
     * 
     * Solo para uso interno o administrativo
     * 
     * @return Lista completa de módulos
     */
    @Transactional(readOnly = true)
    public List<Modulo> mostrarTodosModulos() {
        return moduloRepository.findAll();
    }

    /**
     * MOSTRAR MÓDULOS POR ETIQUETA
     * 
     * Ejemplo: mostrarModulosPorEtiqueta("#configuracion")
     * retorna módulos del menú de configuración
     * 
     * @param etiqueta - Etiqueta a filtrar
     * @return Lista de módulos con esa etiqueta
     */
    @Transactional(readOnly = true)
    public List<Modulo> mostrarModulosPorEtiqueta(String etiqueta) {
        return moduloRepository.findByEtiquetas(etiqueta);
    }

    /**
     * BUSCAR MÓDULO POR NOMBRE
     * 
     * @param nombre - Nombre del módulo (case-insensitive)
     * @return Optional con el módulo encontrado
     */
    @Transactional(readOnly = true)
    public Optional<Modulo> buscarPorNombre(String nombre) {
        return moduloRepository.findByNombreIgnoreCase(nombre);
    }

    /**
     * INSERTAR NUEVO MÓDULO
     * 
     * VALIDACIONES:
     * 1. Nombre no vacío
     * 2. Nombre único (case-insensitive)
     * 
     * @param modulo - Entidad con datos a insertar
     * @return Módulo creado con ID asignado
     * @throws IllegalArgumentException si validaciones fallan
     */
    @Transactional
    public Modulo insertarModulo(Modulo modulo) {
        // Validación: campos requeridos
        if (modulo.getNombre() == null || modulo.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del módulo es requerido");
        }

        // Validación: nombre único
        if (moduloRepository.existsByNombreIgnoreCase(modulo.getNombre().trim())) {
            throw new IllegalArgumentException(
                "Ya existe un módulo con el nombre '" + modulo.getNombre() + "'"
            );
        }

        // Normalizar datos
        modulo.setNombre(modulo.getNombre().trim());
        
        // Si no se especifica icono, asignar valor por defecto
        if (modulo.getIcono() == null || modulo.getIcono().isEmpty()) {
            modulo.setIcono("-");
        }

        // Insertar en BD
        return moduloRepository.save(modulo);
    }

    /**
     * EDITAR MÓDULO EXISTENTE
     * 
     * VALIDACIONES:
     * 1. Módulo existe
     * 2. No editar módulos del sistema (etiquetas="#default")
     * 3. Nombre único (excluyendo módulo actual)
     * 
     * @param id - ID del módulo a editar
     * @param moduloActualizado - Datos actualizados
     * @return Módulo actualizado
     * @throws IllegalArgumentException si validaciones fallan
     */
    @Transactional
    public Modulo editarModulo(Long id, Modulo moduloActualizado) {
        // Buscar módulo existente
        Modulo moduloExistente = moduloRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Módulo no encontrado con ID: " + id));

        // Validar que no sea un módulo del sistema
        if ("#default".equals(moduloExistente.getEtiquetas())) {
            throw new IllegalArgumentException(
                "No se pueden editar módulos del sistema (etiquetas=#default)"
            );
        }

        // Actualizar campos solo si están presentes
        if (moduloActualizado.getNombre() != null && !moduloActualizado.getNombre().trim().isEmpty()) {
            String nuevoNombre = moduloActualizado.getNombre().trim();
            
            // Validar nombre único (excluyendo módulo actual)
            Optional<Modulo> moduloConMismoNombre = moduloRepository.findByNombreIgnoreCase(nuevoNombre);
            if (moduloConMismoNombre.isPresent() && !moduloConMismoNombre.get().getId().equals(id)) {
                throw new IllegalArgumentException(
                    "Ya existe otro módulo con el nombre '" + nuevoNombre + "'"
                );
            }
            
            moduloExistente.setNombre(nuevoNombre);
        }

        if (moduloActualizado.getDescripcion() != null) {
            moduloExistente.setDescripcion(moduloActualizado.getDescripcion());
        }

        if (moduloActualizado.getIcono() != null) {
            moduloExistente.setIcono(moduloActualizado.getIcono());
        }

        if (moduloActualizado.getRuta() != null) {
            moduloExistente.setRuta(moduloActualizado.getRuta());
        }

        if (moduloActualizado.getEtiquetas() != null) {
            moduloExistente.setEtiquetas(moduloActualizado.getEtiquetas());
        }

        // Guardar cambios
        return moduloRepository.save(moduloExistente);
    }

    /**
     * ELIMINAR MÓDULO
     * 
     * IMPORTANTE: Validar antes de eliminar que:
     * - No sea un módulo del sistema (etiquetas="#default")
     * - No tenga permisos asignados (tabla "permisos")
     * - No tenga configuración por defecto (tabla "permisos_default")
     * 
     * TODO: Implementar validaciones de integridad referencial
     * 
     * @param id - ID del módulo a eliminar
     * @throws IllegalArgumentException si módulo no existe o tiene dependencias
     */
    @Transactional
    public void eliminarModulo(Long id) {
        // Buscar módulo
        Modulo modulo = moduloRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Módulo no encontrado con ID: " + id));

        // Validar que no sea un módulo del sistema
        if ("#default".equals(modulo.getEtiquetas())) {
            throw new IllegalArgumentException(
                "No se pueden eliminar módulos del sistema (etiquetas=#default)"
            );
        }

        // TODO: Implementar validación de dependencias
        // - Verificar que no tenga permisos: permisoRepository.countByIdModulo(id) == 0
        // - Verificar que no tenga config default: permisoDefaultRepository.countByIdModulo(id) == 0

        moduloRepository.deleteById(id);
    }

    /**
     * BUSCAR MÓDULO POR ID
     * 
     * @param id - ID del módulo
     * @return Módulo encontrado
     * @throws IllegalArgumentException si no existe
     */
    @Transactional(readOnly = true)
    public Modulo buscarPorId(Long id) {
        return moduloRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Módulo no encontrado con ID: " + id));
    }

    /**
     * CONTAR TOTAL DE MÓDULOS
     * 
     * @return Cantidad de módulos
     */
    @Transactional(readOnly = true)
    public long contarModulos() {
        return moduloRepository.countModulos();
    }
}
