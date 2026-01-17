import { create } from "zustand";
import api from "../api/api";

export const useCategoriasStore = create((set, get) => ({
  buscador: "",
  setBuscador: (p) => {
    set({ buscador: p });
  },
  datacategorias: [],
  categoriaItemSelect: [],
  parametros: {},
  mostrarCategorias: async (p) => {
    try {
      if(!p.id_empresa) return;
      const response = await api.get(`/categorias/empresa/${p.id_empresa}`);
      set({ parametros: p });
      set({ datacategorias: response.data });
      // Select the first one if available and not set? or keep logic
      set({ categoriaItemSelect: response.data[0] || null });
      return response.data;
    } catch (e) {
        console.error("Error al mostrar categorias", e);
        return [];
    }
  },
  selectCategoria: (p) => {
    set({ categoriaItemSelect: p });
  },
  insertarCategorias: async (p, file) => {
    // Nota: El backend espera JSON. Si hay archivo (icono), la subida de archivo debe manejarse antes o separada.
    // Por ahora asumimos que p tiene el objeto categoria
    try {
        await api.post("/categorias", p);
        const { mostrarCategorias, parametros } = get();
        await mostrarCategorias(parametros);
    } catch (e) {
        console.error("Error inserting categoria", e);
    }
  },
  eliminarCategoria: async (p) => {
    try {
        await api.delete(`/categorias/${p.id}`);
        const { mostrarCategorias, parametros } = get();
        await mostrarCategorias(parametros);
    } catch (e) {
        console.error("Error deleting categoria", e);
    }
  },
  editarCategoria: async (p, fileold, filenew) => {
    try {
         await api.put(`/categorias/${p.id}`, p);
         const { mostrarCategorias, parametros } = get();
         await mostrarCategorias(parametros);
    } catch (e) {
        console.error("Error editing categoria", e);
    }
  },
  buscarCategorias: async (p) => {
    try {
        const response = await api.get(`/categorias/buscar/${p.id_empresa}?q=${p.descripcion}`);
        set({ datacategorias: response.data });
        return response.data;
    } catch (e) {
        console.error("Error searching categorias", e);
        return [];
    }
  },
}));
