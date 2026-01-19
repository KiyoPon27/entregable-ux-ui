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
    set({ dataComprobantes: data });
    set({ itemComprobanteSelect: data[0] });
    return data;
  },
  editarSerializacionDefault: async (p) => {
    await EditarSerializacionDefault(p);
  },
  editarSerializacion: async (p) => {
    await EditarSerializacion(p);
  },
}));