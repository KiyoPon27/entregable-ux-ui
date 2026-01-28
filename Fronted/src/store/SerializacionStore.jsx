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
    if (!data || data.length === 0) {
      console.warn("No hay comprobantes configurados para ventas");
      set({ dataComprobantes: [] });
      set({ itemComprobanteSelect: null });
      return [];
    }
    // Buscar el comprobante marcado como por defecto
    const porDefecto = data.find(item => item.porDefecto === true) || data[0];
    set({ dataComprobantes: data });
    set((state) => {
      // Si el comprobante por defecto cambió, actualizar el seleccionado
      if (!state.itemComprobanteSelect || state.itemComprobanteSelect.id !== porDefecto.id) {
        return { itemComprobanteSelect: porDefecto };
      }
      return {};
    });
    return data;
  },
  editarSerializacionDefault: async (p) => {
    await EditarSerializacionDefault(p);
  },
  editarSerializacion: async (p) => {
    await EditarSerializacion(p);
  },
}));