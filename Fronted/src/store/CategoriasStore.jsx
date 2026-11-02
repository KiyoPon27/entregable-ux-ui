import { create } from "zustand";
import api from "../api/api";
import Swal from "sweetalert2";

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
    try {
        // Construir el objeto que espera el backend
        const categoria = {
          nombre: p.nombre,
          color: p.color,
          icono: p.icono || "-",
          empresa: { id: p.id_empresa }
        };
        
        await api.post("/categorias", categoria);
        const { mostrarCategorias, parametros } = get();
        await mostrarCategorias(parametros);
        
        // Mostrar mensaje de éxito
        Swal.fire({
          icon: "success",
          title: "¡Categoría creada!",
          text: "La categoría se ha creado exitosamente",
          timer: 2000,
          showConfirmButton: false
        });
        
        return { success: true };
    } catch (e) {
        console.error("Error inserting categoria", e);
        
        // Manejar error 409 (nombre duplicado)
        if (e.response?.status === 409) {
          Swal.fire({
            icon: "error",
            title: "Nombre duplicado",
            text: e.response.data.message || "Ya existe una categoría con este nombre",
            confirmButtonColor: "#d33"
          });
          return { success: false, error: "duplicate" };
        }
        
        // Otros errores
        Swal.fire({
          icon: "error",
          title: "Error",
          text: e.response?.data?.message || "No se pudo crear la categoría",
          confirmButtonColor: "#d33"
        });
        return { success: false, error: "general" };
    }
  },
  
  eliminarCategoria: async (p) => {
    try {
        await api.delete(`/categorias/${p.id}`);
        const { mostrarCategorias, parametros } = get();
        await mostrarCategorias(parametros);
        
        // Mostrar mensaje de éxito
        Swal.fire({
          icon: "success",
          title: "¡Categoría eliminada!",
          text: "La categoría se ha eliminado exitosamente",
          timer: 2000,
          showConfirmButton: false
        });
        
        return { success: true };
    } catch (e) {
        console.error("Error deleting categoria", e);
        
        // Manejar error 404 (categoría no existe)
        if (e.response?.status === 404) {
          Swal.fire({
            icon: "warning",
            title: "Categoría no encontrada",
            text: "La categoría que intentas eliminar no existe o ya fue eliminada",
            confirmButtonColor: "#3085d6"
          });
          
          // Recargar lista para sincronizar
          const { mostrarCategorias, parametros } = get();
          await mostrarCategorias(parametros);
          
          return { success: false, error: "not_found" };
        }
        
        // Manejar error 400 (tiene productos asociados)
        if (e.response?.status === 400) {
          const mensaje = e.response?.data?.message || "No se puede eliminar la categoría";
          
          Swal.fire({
            icon: "warning",
            title: "No se puede eliminar",
            text: mensaje,
            confirmButtonColor: "#d33",
            html: `<p>${mensaje}</p><p style="margin-top: 10px; font-size: 14px; color: #666;">Elimina o reasigna los productos a otra categoría primero.</p>`
          });
          
          return { success: false, error: "has_products" };
        }
        
        // Manejar error 500 u otros errores del servidor
        const mensaje = e.response?.data?.message || e.response?.data || "Error al eliminar la categoría";
        
        Swal.fire({
          icon: "error",
          title: "Error",
          text: mensaje,
          confirmButtonColor: "#d33"
        });
        return { success: false, error: "general" };
    }
  },
  
  editarCategoria: async (p, fileold, filenew) => {
    try {
        // Construir el objeto que espera el backend
        const categoria = {
          nombre: p.nombre,
          color: p.color,
          icono: p.icono || "-",
          empresa: { id: p.id_empresa }
        };
        
        await api.put(`/categorias/${p.id}`, categoria);
        const { mostrarCategorias, parametros } = get();
        await mostrarCategorias(parametros);
         
        // Mostrar mensaje de éxito
        Swal.fire({
          icon: "success",
          title: "¡Categoría actualizada!",
          text: "Los cambios se han guardado exitosamente",
          timer: 2000,
          showConfirmButton: false
        });
         
        return { success: true };
    } catch (e) {
        console.error("Error editing categoria", e);
        
        // Manejar error 409 (nombre duplicado)
        if (e.response?.status === 409) {
          Swal.fire({
            icon: "error",
            title: "Nombre duplicado",
            text: e.response.data.message || "Ya existe otra categoría con este nombre",
            confirmButtonColor: "#d33"
          });
          return { success: false, error: "duplicate" };
        }
        
        // Manejar error 404 (categoría no existe)
        if (e.response?.status === 404) {
          Swal.fire({
            icon: "warning",
            title: "Categoría no encontrada",
            text: "La categoría que intentas editar no existe o fue eliminada",
            confirmButtonColor: "#3085d6"
          });
          
          // Recargar lista para sincronizar
          const { mostrarCategorias, parametros } = get();
          await mostrarCategorias(parametros);
          
          return { success: false, error: "not_found" };
        }
        
        // Otros errores
        Swal.fire({
          icon: "error",
          title: "Error",
          text: e.response?.data?.message || "No se pudo actualizar la categoría",
          confirmButtonColor: "#d33"
        });
        return { success: false, error: "general" };
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
