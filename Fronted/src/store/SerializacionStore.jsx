import { create } from "zustand";
import {
  MostrarSerializaciones,
  MostrarSerializacionesVentas,
  EditarSerializacion,
  EditarSerializacionDefault,
} from "../supabase/crudSerializacion";

export const useSerializacionStore = create((set) => ({
  dataComprobantes: null,
  itemComprobanteSelect: null,
  setItemComprobanteSelect: (p) => {
    set({ itemComprobanteSelect: p });
  },
  mostrarSerializaciones: async (p) => {
    const data = await MostrarSerializaciones(p);
    return data;
  },

  mostrarSerializacionesVentas: async (p) => {
    const data = await MostrarSerializacionesVentas(p);
    
    // Validar que haya datos
    if (!data || data.length === 0) {
      console.warn("No hay comprobantes configurados para ventas");
      set({ dataComprobantes: [] });
      set({ itemComprobanteSelect: null });
      return [];
    }
    
    // Buscar el comprobante marcado como por defecto
    const porDefecto = data.find(item => item.porDefecto === true);
    
    set({ dataComprobantes: data });
    set({ itemComprobanteSelect: porDefecto || data[0] });
    
    return data;
  },
  editarSerializacionDefault: async (p) => {
    await EditarSerializacionDefault(p);
  },
  editarSerializacion: async (p) => {
    await EditarSerializacion(p);
  },
}));