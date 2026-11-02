import { create } from "zustand";
import { 
  ObtenerStockPorAlmacen, 
  ObtenerStockBajoMinimo, 
  ObtenerVentasPorSucursal 
} from "../supabase/crudReportes";

export const useReportStore = create((set) => ({
  reportStockPorAlmacenSucursal: async (p) => {
    const data = await ObtenerStockPorAlmacen({
      sucursal_id: p.sucursalId,
      almacen_id: p.almacenId
    });
    return data;
  },
  reportStockBajoMinimo: async (p) => {
    const data = await ObtenerStockBajoMinimo({
      sucursalId: p.sucursal_id,
      almacenId: p.almacen_id
    });
    return data;
  },
  reportVentasPorSucursal: async (p) => {
    const data = await ObtenerVentasPorSucursal({
      id_sucursal: p.idSucursal,
      fecha_inicio: p.fechaInicio,
      fecha_fin: p.fechaFin
    });
    return data;
  },
}));
