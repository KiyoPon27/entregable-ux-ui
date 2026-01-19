import { create } from "zustand";
import { MostrarRoles } from "../supabase/crudRol";

export const useRolesStore = create((set) => ({
  rolesItemSelect: null,
  dataroles: null,
  
  selectRol: (p) => {
    set({ rolesItemSelect: p });
  },
  
  setRolesItemSelect: (p) => {
    set({ rolesItemSelect: p });
  },
  
  mostrarRoles: async () => {
    const response = await MostrarRoles();
    set({
      rolesItemSelect: response && response.length > 0 ? response[0] : null,
      dataroles: response,
    });
    return response;
  },
}));
