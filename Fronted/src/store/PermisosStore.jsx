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
  // Helper: Deduplicate array of module IDs
  getUniqueModules: (modules) => [...new Set(modules)],

  setSelectedModules: (p) => {
    // Ensure no duplicates when setting modules
    const { getUniqueModules } = get();
    const uniqueModules = getUniqueModules(p);
    set({ selectedModules: uniqueModules });
  },

  toggleModule: (moduleId) => {
    const { selectedModules, datapermisos, getUniqueModules } = get();
    let updatedModules;
    let updatedPermisos;

    if (selectedModules.includes(moduleId)) {
      // Desmarcar: remover de ambos
      updatedModules = selectedModules.filter((id) => id !== moduleId);
      updatedPermisos = datapermisos.filter((p) => p.idmodulo !== moduleId);
    } else {
      // Marcar: agregar a ambos (con deduplicación)
      updatedModules = getUniqueModules([...selectedModules, moduleId]);
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
    const response = await MostrarPermisosDefault();
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
        // Adaptamos con fallbacks robustos
        
        const adapted = response.data.map(perm => {
            // Soportar ambos formatos: modulo (Java) o modulos (Supabase legacy)
            const modulo = perm?.modulo || perm?.modulos || {};
            
            return {
                ...perm,
                modulos: {
                    ...modulo,
                    // Soportar tanto 'link' (frontend) como 'enlace' (backend)
                    link: modulo.link || modulo.enlace || '#',
                    // Asegurar que otros campos críticos existan
                    nombre: modulo.nombre || 'Sin nombre',
                    icono: modulo.icono || 'icon-default'
                }
            };
        });

        set({ dataPermisosGlobales: adapted });
        return adapted;
    } catch (e) {
        console.error("Error fetching permisos globales", e);
        set({ dataPermisosGlobales: [] });
        return [];
    }
  },
  dataPermisosConfiguracion: [],
  mostrarPermisosConfiguracion: async (p) => {
    try {
      const response = await api.get(`/permisos/usuario/${p.id_usuario}`);
      // Filtrar para mostrar solo los de configuración (#configuracion)
      // Y adaptar estructura con fallbacks robustos
      
      const adapted = response.data
        .filter(perm => {
          const modulo = perm?.modulo || perm?.modulos || {};
          const etiquetas = modulo.etiquetas || modulo.tags || '';
          return etiquetas.includes("#configuracion");
        })
        .map(perm => {
            const modulo = perm?.modulo || perm?.modulos || {};
            return {
                ...perm,
                modulos: {
                    ...modulo,
                    link: modulo.link || modulo.enlace || '#',
                    nombre: modulo.nombre || 'Sin nombre',
                    icono: modulo.icono || 'icon-default',
                    state: true // Frontend uses 'state' for CSS class
                }
            };
        });
      
      set({ dataPermisosConfiguracion: adapted });
      return adapted;
    } catch (error) {
      console.error("Error en mostrarPermisosConfiguracion:", error);
      set({ dataPermisosConfiguracion: [] });
      return [];
    }
  },
}));
