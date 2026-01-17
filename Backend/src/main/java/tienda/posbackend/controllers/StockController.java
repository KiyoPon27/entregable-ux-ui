package tienda.posbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tienda.posbackend.entities.Stock;
import tienda.posbackend.repositories.StockRepository;
import tienda.posbackend.repositories.ProductoRepository;
import tienda.posbackend.repositories.AlmacenRepository;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/stock")
public class StockController {

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private AlmacenRepository almacenRepository;

    @GetMapping("/almacen/{idAlmacen}")
    public List<Stock> listarPorAlmacen(@PathVariable Long idAlmacen) {
        return stockRepository.findByAlmacenId(idAlmacen);
    }

    @GetMapping("/producto/{idProducto}")
    public List<Stock> listarPorProducto(@PathVariable Long idProducto) {
        return stockRepository.findByProductoId(idProducto);
    }

    @PostMapping("/ajuste")
    public ResponseEntity<Stock> ajustar(@RequestBody Stock body) {
        // body debe traer producto.id y almacen.id
        Stock stock = stockRepository.findByProductoIdAndAlmacenId(
                body.getProducto().getId(),
                body.getAlmacen().getId()
        );
        if (stock == null) {
            stock = new Stock();
            stock.setProducto(productoRepository.findById(body.getProducto().getId()).orElseThrow());
            stock.setAlmacen(almacenRepository.findById(body.getAlmacen().getId()).orElseThrow());
            stock.setCantidad(body.getCantidad() != null ? body.getCantidad() : BigDecimal.ZERO);
            stock.setStockMinimo(body.getStockMinimo());
            stock.setUbicacion(body.getUbicacion());
        } else {
            stock.setCantidad(body.getCantidad());
            stock.setStockMinimo(body.getStockMinimo());
            stock.setUbicacion(body.getUbicacion());
        }
        return ResponseEntity.ok(stockRepository.save(stock));
    }
}
