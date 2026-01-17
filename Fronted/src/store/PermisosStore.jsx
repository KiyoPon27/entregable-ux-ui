import { create } from "zustand";
import api from "../api/api"; 

import {
  MostrarPermisos,
  EliminarPermisos,
  MostrarPermisosDefault,
  InsertarPermisos,
  MostrarPermisosGlobales,
  MostrarPermisosConfiguracion,
} from "../supabase/crudPermisos";
export const usePermisosStore = create((set, get) => ({
  datapermisos: [],
  selectedModules: [],
  setSelectedModules: (p) => set({ selectedModules: p }),
  toggleModule: (moduleId) => {
    const { selectedModules, datapermisos } = get();
    let updatedModules;
    let updatedPermisos;

    if (selectedModules.includes(moduleId)) {
      // Desmarcar: remover de ambos
      updatedModules = selectedModules.filter((id) => id !== moduleId);
      updatedPermisos = datapermisos.filter((p) => p.idmodulo !== moduleId);
    } else {
      // Marcar: agregar a ambos
      updatedModules = [...selectedModules, moduleId];
      updatedPermisos = [...datapermisos, { idmodulo: moduleId }];
    }

    set({
      selectedModules: updatedModules,
      datapermisos: updatedPermisos,
    });
  },

  mostrarPermisos: async (p) => {
    const response = await MostrarPermisos(p);
    set({ datapermisos: response });
    return response;
  },
  mostrarPermisosDefault: async () => {
    const response = MostrarPermisosDefault();
    return response;
  },
  eliminarPermisos: async (p) => {
    await EliminarPermisos(p);
  },
  // ... existing code ...
  dataPermisosGlobales: null,
  mostrarPermisosGlobales: async (p) => {
    try {
        const response = await api.get(`/permisos/usuario/${p.id_usuario}`);
        // Mapear respuesta para que coincida con la estructura esperada:
        // Supabase devolvía: { modulos: { link: '/...', ... } }
        // Java devuelve: { modulo: { enlace: '/...', ... } }
        // Adaptamos los nombres de propiedades (enlace -> link, nombre -> label, etc si necesario)
        
        const adapted = response.data.map(perm => {
            const modulo = perm.modulo || {};
            return {
                ...perm,
                modulos: {
                    ...modulo,
                    link: modulo.enlace // Frontend expects 'link'
                }
            };
        });

        set({ dataPermisosGlobales: adapted });
        return adapted;
    } catch (e) {
        console.error("Error fetching permisos globales", e);
        return [];
    }
  },
  dataPermisosConfiguracion: [],
  mostrarPermisosConfiguracion: async (p) => {
    try {
      const response = await api.get(`/permisos/usuario/${p.id_usuario}`);
      // Filtrar para mostrar solo los de configuración (#configuracion)
      // Y adaptar estructura
      console.log("Raw permisos response:", response.data); 
      const adapted = response.data
        .filter(perm => perm.modulo?.etiquetas?.includes("#configuracion"))
        .map(perm => {
            const modulo = perm.modulo || {};
            return {
                ...perm,
                modulos: {
                    ...modulo,
                    link: modulo.enlace,
                    state: true // Frontend uses 'state' for CSS class ?
                }
            };
        });
      
      console.log("Adapted permisos configuracion:", adapted);
      set({ dataPermisosConfiguracion: adapted });
      return adapted;
    } catch (error) {
      console.error("Error en mostrarPermisosConfiguracion:", error);
      set({ dataPermisosConfiguracion: [] });
      return [];
    }
  },
}));
