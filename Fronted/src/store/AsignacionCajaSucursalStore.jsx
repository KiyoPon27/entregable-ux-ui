import { create } from "zustand";
import {
  BuscarUsuariosAsignados,
  MostrarSucursalCajaAsignada,
  MostrarUsuariosAsignados,
} from "../supabase/crudAsignacionCajaSucursal";
import api from "../api/api";

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
    try {
      const body = {
        usuario: { id: p.id_usuario },
        sucursal: { id: p.id_sucursal },
        caja: p.id_caja ? { id: p.id_caja } : null
      };
      await api.post("/asignacion-sucursal", body);
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  },
}));
