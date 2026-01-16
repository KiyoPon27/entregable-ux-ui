package tienda.posbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tienda.posbackend.models.Stock;
import tienda.posbackend.repositories.StockRepository;

import java.util.List;
import java.util.Map;

/**
 * SERVICE: StockService
 * 
 * LÓGICA DE NEGOCIO PARA STOCK
 * 
 * IMPORTANTE:
 * - Cada cambio de stock debe registrarse en "movimientos_stock"
 * - Los movimientos se crean desde el Service de Ventas/Compras
 * - Este Service solo gestiona las cantidades actuales
 * 
 * TRIGGER RELACIONADO:
 * - actualizarstock: Se dispara en ventas para decrementar stock
 */
@Service
@Transactional
public class StockService {

    @Autowired
    private StockRepository repository;

    /**
     * ============================================================
     * FUNCIÓN: mostrarstock
     * ============================================================
     * 
     * REPLICADA DE POSTGRESQL
     * 
     * Muestra stock con información del producto
     * 
     * FRONTEND:
     * const response = await axios.get("/api/stock/mostrar", {
     *   params: { idAlmacen: 1 }
     * });
     * 
     * @param idAlmacen - ID del almacén
     * @return Lista con Maps { id, idProducto, nombreProducto, cantidad, fechaActualizacion }
     */
    public List<Map<String, Object>> mostrarStock(Long idAlmacen) {
        return repository.mostrarStockPorAlmacen(idAlmacen);
    }

    /**
     * ============================================================
     * FUNCIÓN: insertarstock
     * ============================================================
     * 
     * REPLICADA DE POSTGRESQL
     * 
     * Inserta un nuevo registro de stock para un producto en un almacén
     * 
     * VALIDACIONES:
     * 1. No puede haber duplicados (UNIQUE constraint id_producto + id_almacen)
     * 2. Cantidad no puede ser negativa
     * 
     * POSTGRESQL ORIGINAL:
     * PERFORM 1 FROM stock WHERE id_producto = ? AND id_almacen = ?
     * IF FOUND THEN
     *   RAISE EXCEPTION 'El producto ya tiene stock en este almacén'
     * 
     * @param stock - Datos del stock (idProducto, idAlmacen, cantidad)
     * @return Stock creado
     * @throws Exception si hay duplicado o validación falla
     */
    public Stock insertarStock(Stock stock) throws Exception {
        
        // VALIDACIÓN 1: Duplicado
        if (repository.existsByIdProductoAndIdAlmacen(stock.getIdProducto(), stock.getIdAlmacen())) {
            throw new Exception("El producto ya tiene stock registrado en este almacén. " +
                              "Use la función 'editar' para modificar la cantidad.");
        }

        // VALIDACIÓN 2: Cantidad no negativa
        if (stock.getCantidad() < 0) {
            throw new Exception("La cantidad inicial no puede ser negativa");
        }

        // Guardar
        Stock nuevoStock = repository.save(stock);

        // TODO: Registrar movimiento en "movimientos_stock"
        // Esto se implementará en MovimientosStockService
        // Tipo: "ENTRADA_INICIAL" o "INVENTARIO_INICIAL"

        return nuevoStock;
    }

    /**
     * ============================================================
     * FUNCIÓN: editarstock
     * ============================================================
     * 
     * REPLICADA DE POSTGRESQL
     * 
     * Edita la cantidad de stock
     * 
     * IMPORTANTE:
     * Esta función actualiza directamente la cantidad.
     * Para movimientos normales (ventas, compras), usar funciones específicas
     * que registren el movimiento automáticamente.
     * 
     * USO TÍPICO:
     * - Ajustes de inventario
     * - Correcciones manuales
     * - Sincronización de datos
     * 
     * @param id - ID del registro de stock
     * @param nuevaCantidad - Nueva cantidad
     * @throws Exception si no existe
     */
    public void editarStock(Long id, Integer nuevaCantidad) throws Exception {
        
        // Verificar existencia
        Stock stock = repository.findById(id)
            .orElseThrow(() -> new Exception("Registro de stock no encontrado"));

        // Actualizar cantidad
        stock.setCantidad(nuevaCantidad);
        repository.save(stock);

        // TODO: Registrar movimiento en "movimientos_stock"
        // Tipo: "AJUSTE_INVENTARIO"
    }

    /**
     * ============================================================
     * FUNCIÓN: eliminarstock
     * ============================================================
     * 
     * REPLICADA DE POSTGRESQL
     * 
     * Elimina un registro de stock
     * 
     * ADVERTENCIA:
     * Solo usar en casos excepcionales (errores de carga)
     * Normalmente el stock se ajusta a 0, no se elimina
     * 
     * @param id - ID del registro a eliminar
     * @throws Exception si no existe
     */
    public void eliminarStock(Long id) throws Exception {
        
        if (!repository.existsById(id)) {
            throw new Exception("Registro de stock no encontrado");
        }

        // Eliminar
        repository.deleteById(id);

        // TODO: Considerar si registrar movimiento de eliminación
    }

    /**
     * ============================================================
     * FUNCIÓN: verificarstock
     * ============================================================
     * 
     * REPLICADA DE POSTGRESQL
     * 
     * Verifica si hay stock disponible ANTES de una venta
     * 
     * POSTGRESQL ORIGINAL:
     * IF NOT FOUND THEN
     *   RAISE EXCEPTION 'Stock insuficiente para el producto "%", almacén "%"'
     * 
     * @param idProducto - ID del producto
     * @param idAlmacen - ID del almacén
     * @param cantidadRequerida - Cantidad necesaria
     * @return true si hay stock suficiente
     * @throws Exception si no hay stock suficiente
     */
    public boolean verificarStock(Long idProducto, Long idAlmacen, Integer cantidadRequerida) throws Exception {
        
        // Verificar si existe stock suficiente
        repository.verificarStockDisponible(idProducto, idAlmacen, cantidadRequerida)
            .orElseThrow(() -> new Exception(
                String.format("Stock insuficiente. Producto ID: %d, Almacén ID: %d, Requerido: %d",
                    idProducto, idAlmacen, cantidadRequerida)
            ));

        return true;
    }

    /**
     * ============================================================
     * FUNCIÓN: calcularstockprincipal
     * ============================================================
     * 
     * REPLICADA DE POSTGRESQL
     * 
     * Calcula stock en el almacén principal (default=true)
     * 
     * USO:
     * - Mostrar stock disponible en ventas
     * - Dashboard
     * 
     * @param idProducto - ID del producto
     * @return Cantidad en almacén principal (0 si no hay)
     */
    public Integer calcularStockPrincipal(Long idProducto) {
        return repository.calcularStockAlmacenPrincipal(idProducto);
    }

    /**
     * ============================================================
     * FUNCIÓN AUXILIAR: Calcular stock total
     * ============================================================
     * 
     * Suma stock de todos los almacenes
     * 
     * @param idProducto - ID del producto
     * @return Cantidad total
     */
    public Integer calcularStockTotal(Long idProducto) {
        return repository.calcularStockTotal(idProducto);
    }

    /**
     * ============================================================
     * FUNCIÓN AUXILIAR: Incrementar stock
     * ============================================================
     * 
     * Incrementa cantidad (usado en compras, devoluciones)
     * 
     * @param idProducto - ID del producto
     * @param idAlmacen - ID del almacén
     * @param cantidad - Cantidad a incrementar
     * @throws Exception si no existe el stock
     */
    public void incrementarStock(Long idProducto, Long idAlmacen, Integer cantidad) throws Exception {
        
        Stock stock = repository.findByIdProductoAndIdAlmacen(idProducto, idAlmacen)
            .orElseThrow(() -> new Exception("No existe stock para este producto en el almacén especificado"));

        stock.setCantidad(stock.getCantidad() + cantidad);
        repository.save(stock);
    }

    /**
     * ============================================================
     * FUNCIÓN AUXILIAR: Decrementar stock
     * ============================================================
     * 
     * Decrementa cantidad (usado en ventas, bajas)
     * 
     * IMPORTANTE: Verificar stock ANTES de llamar esta función
     * 
     * @param idProducto - ID del producto
     * @param idAlmacen - ID del almacén
     * @param cantidad - Cantidad a decrementar
     * @throws Exception si no existe o stock insuficiente
     */
    public void decrementarStock(Long idProducto, Long idAlmacen, Integer cantidad) throws Exception {
        
        Stock stock = repository.findByIdProductoAndIdAlmacen(idProducto, idAlmacen)
            .orElseThrow(() -> new Exception("No existe stock para este producto en el almacén especificado"));

        // Verificar que hay suficiente
        if (stock.getCantidad() < cantidad) {
            throw new Exception(String.format(
                "Stock insuficiente. Disponible: %d, Requerido: %d",
                stock.getCantidad(), cantidad
            ));
        }

        stock.setCantidad(stock.getCantidad() - cantidad);
        repository.save(stock);
    }

    /**
     * ============================================================
     * FUNCIÓN AUXILIAR: Obtener stock por producto y almacén
     * ============================================================
     * 
     * @param idProducto - ID del producto
     * @param idAlmacen - ID del almacén
     * @return Stock o null
     */
    public Stock obtenerStock(Long idProducto, Long idAlmacen) {
        return repository.findByIdProductoAndIdAlmacen(idProducto, idAlmacen).orElse(null);
    }

    /**
     * ============================================================
     * FUNCIÓN AUXILIAR: Productos con stock bajo
     * ============================================================
     * 
     * Útil para alertas de reabastecimiento
     * 
     * @param idAlmacen - ID del almacén
     * @param cantidadMinima - Umbral (ej: 10)
     * @return Lista de productos con stock bajo
     */
    public List<Stock> obtenerStockBajo(Long idAlmacen, Integer cantidadMinima) {
        return repository.findStockBajo(idAlmacen, cantidadMinima);
    }
}
