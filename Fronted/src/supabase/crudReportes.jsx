import api from "../api/api";

/**
 * CRUD para Reportes
 * Backend endpoints: /api/reportes
 */

export async function ObtenerStockBajoMinimo({ sucursalId, almacenId }) {
  try {
    const response = await api.get(`/reportes/stock-bajo-minimo`, {
      params: { sucursalId, almacenId }
    });
    return response.data || [];
  } catch (error) {
    console.error("Error al obtener stock bajo mínimo:", error);
    return [];
  }
}

export async function ObtenerStockPorAlmacen(p) {
  try {
    const response = await api.get("/reportes/stock-por-almacen", {
      params: {
        sucursalId: p.sucursal_id,
        almacenId: p.almacen_id
      }
    });
    return response.data || [];
  } catch (error) {
    console.error("Error al obtener stock por almacén:", error);
    console.error("Params enviados:", p);
    return [];
  }
}

export async function ObtenerVentasPorSucursal(p) {
  try {
    const response = await api.get(`/reportes/ventas-por-sucursal/${p.id_sucursal}`, {
      params: {
        fechaInicio: p.fecha_inicio,
        fechaFin: p.fecha_fin
      }
    });
    return response.data || [];
  } catch (error) {
    console.error("Error al obtener ventas por sucursal:", error);
    return [];
  }
}

// Función auxiliar para generar reporte completo de inventario
export async function GenerarReporteInventarioCompleto(p) {
  try {
    const [stockBajo, stockAlmacenes] = await Promise.all([
      ObtenerStockBajoMinimo(p.id_empresa),
      p.id_almacen ? ObtenerStockPorAlmacen(p) : Promise.resolve([])
    ]);
    
    return {
      productosBajoMinimo: stockBajo,
      stockAlmacen: stockAlmacenes,
      fecha: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error al generar reporte de inventario:", error);
    return {
      productosBajoMinimo: [],
      stockAlmacen: [],
      fecha: new Date().toISOString()
    };
  }
}

// Función auxiliar para generar reporte de ventas por sucursales
export async function GenerarReporteVentasSucursales(p) {
  try {
    // Si se proporciona un array de sucursales, obtener ventas de todas
    if (Array.isArray(p.sucursales)) {
      const ventasPorSucursal = await Promise.all(
        p.sucursales.map(sucursal => 
          ObtenerVentasPorSucursal({
            id_sucursal: sucursal.id,
            fecha_inicio: p.fecha_inicio,
            fecha_fin: p.fecha_fin
          })
        )
      );
      
      return p.sucursales.map((sucursal, index) => ({
        sucursal: sucursal.nombre,
        ventas: ventasPorSucursal[index]
      }));
    } else {
      const ventas = await ObtenerVentasPorSucursal(p);
      return [{
        sucursal: p.nombre_sucursal || "Sucursal",
        ventas
      }];
    }
  } catch (error) {
    console.error("Error al generar reporte de ventas por sucursales:", error);
    return [];
  }
}

// Función para exportar reportes (preparar datos para Excel/PDF)
export function PrepararDatosParaExportar(tipo, datos) {
  switch (tipo) {
    case "stock-bajo":
      return datos.map(item => ({
        Producto: item.producto?.nombre || item.nombre,
        Almacén: item.almacen?.nombre || item.almacen,
        "Stock Actual": item.cantidad || item.stock,
        "Stock Mínimo": item.stockMinimo || item.stock_minimo,
        Diferencia: (item.cantidad || item.stock) - (item.stockMinimo || item.stock_minimo)
      }));
      
    case "stock-almacen":
      return datos.map(item => ({
        Producto: item.producto?.nombre || item.nombre,
        Código: item.producto?.codigo || item.codigo,
        Cantidad: item.cantidad || item.stock,
        "Stock Mínimo": item.stockMinimo || item.stock_minimo,
        Ubicación: item.ubicacion || "-"
      }));
      
    case "ventas-sucursal":
      return datos.map(item => ({
        Fecha: item.fecha || item.fechaVenta,
        Cliente: item.cliente?.nombres || item.cliente,
        Total: item.total,
        "Método Pago": item.metodoPago?.nombre || item.metodo_pago,
        Estado: item.estado
      }));
      
    default:
      return datos;
  }
}
