import { create } from "zustand";
import {
  BuscarUsuariosAsignados,
  MostrarSucursalCajaAsignada,
  MostrarUsuariosAsignados,
} from "../supabase/crudAsignacionCajaSucursal";
import { supabase } from "../supabase/supabase.config";
const tabla = "asignacion_sucursal";
export const useAsignacionCajaSucursalStore = create((set) => ({
  buscador: "",
  setBuscador: (p) => {
    set({ buscador: p });
  },
  accion: "",
  setAccion: (p) => {
    set({ accion: p });
  },
  selectItem: null,
  setSelectItem: (p) => {
    set({ selectItem: p });
  },

  dataSucursalesAsignadas: [],
  sucursalesItemSelectAsignadas: null,
  mostrarSucursalAsignadas: async (p) => {
    const response = await MostrarSucursalCajaAsignada(p);
    set({ dataSucursalesAsignadas: response });
    set({ sucursalesItemSelectAsignadas: response && response[0] });
    return response;
  },
  datausuariosAsignados: [],

  mostrarUsuariosAsignados: async (p) => {
    const response = await MostrarUsuariosAsignados(p);
    set({ datausuariosAsignados: response });
    return response;
  },
  buscarUsuariosAsignados: async (p) => {
    const response = await BuscarUsuariosAsignados(p);
    set({ datausuariosAsignados: response });
    return response;
  },
  insertarAsignacionSucursal: async (p) => {
    const { error } = await supabase.from(tabla).insert(p);
    if (error) {
      throw new Error(error.message);
    }
  },
}));
