import { create } from "zustand";
import {
  InsertarDetalleVentas,
  MostrarDetalleVenta,
  EliminarDetalleVentas,
  EditarCantidadDetalleVenta,
  CambiarMultiprecioDetalleVenta,
} from "../supabase/crudDetalleVenta";
import {
  ObtenerTop5ProductosPorCantidad,
  ObtenerTop10ProductosPorMonto,
} from "../supabase/crudDashboard";
function calcularTotal(items) {
  return items.reduce(
    (total, item) => total + (item.total ?? item.precio_venta * item.cantidad),
    0
  );
}
export const useDetalleVentasStore = create((set, get) => ({
    resetDetalleState: () => {
      set({ datadetalleventa: [], total: 0 });
    },
  datadetalleventa: [],
  parametros: {},
  total: 0,
  mostrardetalleventa: async (p) => {
    const response = await MostrarDetalleVenta(p);
    set({ datadetalleventa: response });
    set({ total: calcularTotal(response) });
    return response;
  },
  insertarDetalleVentas: async (p) => {
    await InsertarDetalleVentas(p);
  },
  eliminardetalleventa: async (p) => {
    await EliminarDetalleVentas(p);
  },
  mostrartop5productosmasvendidosxcantidad: async (p) => {
    const response = await ObtenerTop5ProductosPorCantidad({
      id_empresa: p.idEmpresa,
      fecha_inicio: p.fechaInicio,
      fecha_fin: p.fechaFin
    });
    return response;
  },
  mostrartop10productosmasvendidosxmonto: async (p) => {
    const response = await ObtenerTop10ProductosPorMonto({
      id_empresa: p.idEmpresa,
      fecha_inicio: p.fechaInicio,
      fecha_fin: p.fechaFin
    });
    return response;
  },
  editarCantidadDetalleVenta: async (p) => {
    await EditarCantidadDetalleVenta(p);
  },
  cambiarMultiprecioDetalleVenta: async (p) => {
    await CambiarMultiprecioDetalleVenta(p);
  },
}));
