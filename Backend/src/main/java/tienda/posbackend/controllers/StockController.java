package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.entities.MovimientoStock;
import tienda.posbackend.entities.Stock;
import tienda.posbackend.repositories.StockRepository;
import tienda.posbackend.repositories.ProductoRepository;
import tienda.posbackend.repositories.AlmacenRepository;
import tienda.posbackend.services.MovimientoStockService;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/stock")
@SuppressWarnings("null")
public class StockController {

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private AlmacenRepository almacenRepository;

    @Autowired
    private MovimientoStockService movimientoStockService;

    @GetMapping("/almacen/{idAlmacen}")
    public List<Stock> listarPorAlmacen(@PathVariable Long idAlmacen) {
        return stockRepository.findByAlmacenId(idAlmacen);
    }

    @GetMapping("/producto/{idProducto}")
    public List<Stock> listarPorProducto(@PathVariable Long idProducto) {
        return stockRepository.findByProductoId(idProducto);
    }

    @GetMapping("/almacen/{idAlmacen}/producto/{idProducto}")
    public ResponseEntity<Stock> obtenerStockEspecifico(@PathVariable Long idAlmacen, @PathVariable Long idProducto) {
        Stock stock = stockRepository.findByProductoIdAndAlmacenId(idProducto, idAlmacen);
        if (stock == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(stock);
    }

    @GetMapping("/ajustar/{idProducto}")
    public List<Stock> obtenerParaAjustar(@PathVariable Long idProducto) {
        return stockRepository.findByProductoId(idProducto);
    }

    @PostMapping("/ajuste")
    public ResponseEntity<Stock> ajustar(@RequestBody Stock body) {
        // Validar que el stock no sea negativo
        if (body.getStock() != null && body.getStock().compareTo(BigDecimal.ZERO) < 0) {
            return ResponseEntity.badRequest().build();
        }
        
        // Obtener el stock actual antes del ajuste
        Stock stockAnterior = stockRepository.findByProductoIdAndAlmacenId(
                body.getProducto().getId(),
                body.getAlmacen().getId()
        );
        
        BigDecimal stockPrevio = (stockAnterior != null) ? stockAnterior.getStock() : BigDecimal.ZERO;
        BigDecimal stockNuevo = body.getStock() != null ? body.getStock() : BigDecimal.ZERO;
        
        // Determinar tipo de movimiento
        String tipoMovimiento;
        BigDecimal diferencia = stockNuevo.subtract(stockPrevio);
        
        if (diferencia.compareTo(BigDecimal.ZERO) > 0) {
            tipoMovimiento = "AJUSTE_ENTRADA";
        } else if (diferencia.compareTo(BigDecimal.ZERO) < 0) {
            tipoMovimiento = "AJUSTE_SALIDA";
        } else {
            tipoMovimiento = "AJUSTE_SIN_CAMBIO";
        }
        
        // Crear o actualizar stock
        Stock stock;
        if (stockAnterior == null) {
            stock = new Stock();
            stock.setProducto(productoRepository.findById(body.getProducto().getId()).orElseThrow());
            stock.setAlmacen(almacenRepository.findById(body.getAlmacen().getId()).orElseThrow());
            stock.setStock(stockNuevo);
            stock.setStockMinimo(body.getStockMinimo());
            stock.setUbicacion(body.getUbicacion());
        } else {
            stock = stockAnterior;
            stock.setStock(stockNuevo);
            stock.setStockMinimo(body.getStockMinimo());
            stock.setUbicacion(body.getUbicacion());
        }
        
        Stock stockGuardado = stockRepository.save(stock);
        
        // Registrar movimiento en el historial (solo si hay cambio en la cantidad)
        if (diferencia.compareTo(BigDecimal.ZERO) != 0) {
            MovimientoStock movimiento = new MovimientoStock();
            movimiento.setAlmacen(stockGuardado.getAlmacen());
            movimiento.setProducto(stockGuardado.getProducto());
            movimiento.setTipoMovimiento(tipoMovimiento);
            movimiento.setCantidad(diferencia.abs()); // Valor absoluto de la diferencia
            movimiento.setDetalle("Ajuste manual de stock. Stock anterior: " + stockPrevio + ", Stock nuevo: " + stockNuevo);
            movimiento.setOrigen("AJUSTE_MANUAL");
            
            movimientoStockService.registrarMovimiento(movimiento);
        }
        
        return ResponseEntity.ok(stockGuardado);
    }
}
