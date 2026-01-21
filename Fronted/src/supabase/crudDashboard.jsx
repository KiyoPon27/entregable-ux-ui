import api from "../api/api";

/**
 * CRUD para Dashboard
 * Backend endpoints: /api/dashboard
 */

export async function ObtenerCajasPorEmpresa(idEmpresa) {
  try {
    const response = await api.get(`/dashboard/cajas/empresa/${idEmpresa}`);
    return response.data || [];
  } catch (error) {
    console.error("Error al obtener cajas por empresa:", error);
    return [];
  }
}

export async function ObtenerResumenPorEmpresa(p) {
  try {
    const response = await api.get(`/dashboard/resumen/empresa/${p.id_empresa}`, {
      params: {
        fechaInicio: `${p.fecha_inicio}T00:00:00`,
        fechaFin: `${p.fecha_fin}T23:59:59`
      }
    });
    const data = response.data || {};
    console.log('ObtenerResumenPorEmpresa - Raw backend data:', data);
    // Mapear camelCase del backend a camelCase (el backend ya retorna camelCase)
    const result = {
      cantidadProductos: Number(data.cantidadProductos || 0),
      gananciaTotal: Number(data.gananciaTotal || 0),
      totalVentas: Number(data.totalVentas || 0)
    };
    console.log('ObtenerResumenPorEmpresa - Mapped result:', result);
    return result;
  } catch (error) {
    console.error("Error al obtener resumen por empresa:", error);
    return {};
  }
}

export async function ObtenerTop5ProductosPorCantidad(p) {
  try {
    const response = await api.get(`/dashboard/top5-productos-cantidad/empresa/${p.id_empresa}`, {
      params: {
        fechaInicio: `${p.fecha_inicio}T00:00:00`,
        fechaFin: `${p.fecha_fin}T23:59:59`
      }
    });
    const data = response.data || [];
    // Mapear camelCase del backend a snake_case del frontend
    return data.map(item => ({
      id_producto: item.idProducto,
      nombre_producto: item.nombreProducto || '',
      total_vendido: item.totalVendido || 0,
      porcentaje: item.porcentaje || 0
    }));
  } catch (error) {
    console.error("Error al obtener top 5 productos por cantidad:", error);
    return [];
  }
}

export async function ObtenerTop10ProductosPorMonto(p) {
  try {
    const response = await api.get(`/dashboard/top10-productos-monto/empresa/${p.id_empresa}`, {
      params: {
        fechaInicio: `${p.fecha_inicio}T00:00:00`,
        fechaFin: `${p.fecha_fin}T23:59:59`
      }
    });
    const data = response.data || [];
    // Mapear camelCase del backend a snake_case del frontend
    return data.map(item => ({
      id_producto: item.idProducto,
      nombre_producto: item.nombreProducto || '',
      total_vendido: item.totalVendido || 0,
      porcentaje: item.porcentaje || 0
    }));
  } catch (error) {
    console.error("Error al obtener top 10 productos por monto:", error);
    return [];
  }
}

export async function ObtenerVentasPorFecha(p) {
  try {
    const response = await api.get(`/dashboard/ventas-por-fecha/empresa/${p.id_empresa}`, {
      params: {
        fechaInicio: `${p.fecha_inicio}T00:00:00`,
        fechaFin: `${p.fecha_fin}T23:59:59`
      }
    });
    const data = response.data || [];
    console.log('ObtenerVentasPorFecha - Raw backend data:', data);
    // Mapear camelCase del backend a snake_case del frontend
    const result = data.map(item => ({
      fecha: item.fecha,
      total_ventas: Number(item.totalVentas || 0)
    }));
    console.log('ObtenerVentasPorFecha - Mapped result:', result);
    return result;
  } catch (error) {
    console.error("Error al obtener ventas por fecha:", error);
    return [];
  }
}

export async function ObtenerVentasPorMetodoPago(p) {
  try {
    const response = await api.get(`/dashboard/ventas-por-metodo-pago/empresa/${p.id_empresa}`, {
      params: {
        fechaInicio: `${p.fecha_inicio}T00:00:00`,
        fechaFin: `${p.fecha_fin}T23:59:59`
      }
    });
    const data = response.data || [];
    // Mapear camelCase del backend a snake_case del frontend
    return data.map(item => ({
      fecha: item.fecha,
      metodo_pago: item.metodoPago || 'Sin método',
      total_ventas: item.totalVentas || 0
    }));
  } catch (error) {
    console.error("Error al obtener ventas por método de pago:", error);
    return [];
  }
}

// Funciones auxiliares para el dashboard
export async function ObtenerEstadisticasGenerales(idEmpresa) {
  try {
    const [resumen, top5, top10] = await Promise.all([
      ObtenerResumenPorEmpresa(idEmpresa),
      ObtenerTop5ProductosPorCantidad(idEmpresa),
      ObtenerTop10ProductosPorMonto(idEmpresa)
    ]);
    
    return {
      resumen,
      top5ProductosCantidad: top5,
      top10ProductosMonto: top10
    };
  } catch (error) {
    console.error("Error al obtener estadísticas generales:", error);
    return {
      resumen: {},
      top5ProductosCantidad: [],
      top10ProductosMonto: []
    };
  }
}

export async function ObtenerDashboardCompleto(p) {
  try {
    const [cajas, estadisticas, ventasFecha, ventasMetodo] = await Promise.all([
      ObtenerCajasPorEmpresa(p.id_empresa),
      ObtenerEstadisticasGenerales(p.id_empresa),
      p.fecha_inicio && p.fecha_fin ? ObtenerVentasPorFecha(p) : Promise.resolve([]),
      p.fecha_inicio && p.fecha_fin ? ObtenerVentasPorMetodoPago(p) : Promise.resolve([])
    ]);
    
    return {
      cajas,
      ...estadisticas,
      ventasPorFecha: ventasFecha,
      ventasPorMetodoPago: ventasMetodo
    };
  } catch (error) {
    console.error("Error al obtener dashboard completo:", error);
    return {
      cajas: [],
      resumen: {},
      top5ProductosCantidad: [],
      top10ProductosMonto: [],
      ventasPorFecha: [],
      ventasPorMetodoPago: []
    };
  }
}
