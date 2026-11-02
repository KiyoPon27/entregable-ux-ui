import { create } from "zustand";
import { 
  ObtenerVentasPorFecha,
  ObtenerTop5ProductosPorCantidad,
  ObtenerTop10ProductosPorMonto,
  ObtenerResumenPorEmpresa
} from "../supabase/crudDashboard";

export const useReportesStore = create((set, get) => ({
  totalventas: 0,
  totalventasAnterior: 0,
  porcentajeCambio: 0,
  totalCantidadDetalleVentas: 0,
  totalGanancias: 0,
  resetearventas: () =>
    set({
      idventa: 0,
    }),
  mostrarVentasDashboard: async (p) => {
    const data = await ObtenerVentasPorFecha({
      id_empresa: p.idEmpresa || p.id_empresa,
      fecha_inicio: p.fechaInicio || p.fecha_inicio,
      fecha_fin: p.fechaFin || p.fecha_fin
    });
    console.log('mostrarVentasDashboard - params:', p);
    console.log('mostrarVentasDashboard - data received:', data);
    // Calcular el total general en el frontend
    const totalGeneral = data.reduce(
      (sum, venta) => sum + Number(venta.total_ventas || venta.total || 0),
      0
    );
    console.log('mostrarVentasDashboard - totalGeneral calculated:', totalGeneral);
    set({ totalventas: totalGeneral });
    get().setCalcularPorcentajeCambio();
    return data;
  },
  mostrarCantidadDetalleVentasDashboard: async (p) => {
    const resumen = await ObtenerResumenPorEmpresa({
      id_empresa: p.idEmpresa || p.id_empresa,
      fecha_inicio: p.fechaInicio || p.fecha_inicio,
      fecha_fin: p.fechaFin || p.fecha_fin
    });
    console.log('mostrarCantidadDetalleVentasDashboard - params:', p);
    console.log('mostrarCantidadDetalleVentasDashboard - resumen:', resumen);
    const totalCantidad = Number(resumen.cantidadProductos || 0);
    console.log('mostrarCantidadDetalleVentasDashboard - totalCantidad:', totalCantidad);
    set({ totalCantidadDetalleVentas: totalCantidad });
    return totalCantidad;
  },
  mostrarVentasDashboardPeriodoAnterior: async (p) => {
    // TODO: Implementar endpoint en backend para período anterior
    // Por ahora, retornar 0
    set({ totalventasAnterior: 0 });
    get().setCalcularPorcentajeCambio();
    return 0;
  },
  mostrarGananciasDetalleVenta: async (p) => {
    const resumen = await ObtenerResumenPorEmpresa({
      id_empresa: p.idEmpresa || p.id_empresa,
      fecha_inicio: p.fechaInicio || p.fecha_inicio,
      fecha_fin: p.fechaFin || p.fecha_fin
    });
    console.log('mostrarGananciasDetalleVenta - params:', p);
    console.log('mostrarGananciasDetalleVenta - resumen:', resumen);
    const totalGanancias = Number(resumen.gananciaTotal || 0);
    console.log('mostrarGananciasDetalleVenta - totalGanancias:', totalGanancias);
    set({ totalGanancias: totalGanancias });
    return totalGanancias;
  },
  setCalcularPorcentajeCambio: () => {
    const { totalventas, totalventasAnterior } = get();

    const result =
      totalventasAnterior > 0
        ? ((totalventas - totalventasAnterior) / totalventasAnterior) * 100
        : 0;
    set({ porcentajeCambio: parseFloat(result.toFixed(2)) }); // Limita a 2 decimales y convierte a número
  },
}));
