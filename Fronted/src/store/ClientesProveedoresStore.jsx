import { create } from "zustand";
import api from "../api/api";

export const useClientesProveedoresStore = create((set, get) => ({
  tipo: "",
  setTipo: (p) => set({ tipo: p }),
  
  buscador: "",
  setBuscador: (p) => {
    set({ buscador: p });
  },
  
  dataclipro: [],
  cliproItemSelect: null,
  parametros: {},
  loading: false,
  error: null,
  
  // Mostrar clientes/proveedores por empresa y tipo
  mostrarCliPro: async (p) => {
    try {
      set({ loading: true, error: null });
      
      if (!p.id_empresa || !p.tipo) {
        set({ loading: false });
        return [];
      }
      
      // Filtrar por empresa Y tipo
      const response = await api.get(`/clientes-proveedores/empresa/${p.id_empresa}/tipo/${p.tipo}`);
      
      set({ 
        parametros: p,
        dataclipro: response.data,
        loading: false
      });
      
      return response.data;
    } catch (e) {
      console.error("Error al mostrar clientes/proveedores", e);
      set({ 
        error: e.response?.data?.mensaje || "Error al cargar clientes/proveedores",
        loading: false 
      });
      return [];
    }
  },
  
  // Seleccionar cliente/proveedor
  selectCliPro: (p) => {
    set({ cliproItemSelect: p });
  },
  
  // Insertar nuevo cliente/proveedor
  insertarCliPro: async (p) => {
    try {
      set({ loading: true, error: null });
      
      // Adaptar payload al formato del backend
      const payload = {
        nombres: p._nombres ?? p.nombres,
        empresa: { id: p.idEmpresa ?? p.id_empresa },
        direccion: p._direccion ?? p.direccion ?? "-",
        telefono: p._telefono ?? p.telefono ?? "-",
        email: p._email ?? p.email ?? "-",
        identificadorNacional: p._identificador_nacional ?? p.identificador_nacional ?? "-",
        identificadorFiscal: p._identificador_fiscal ?? p.identificador_fiscal ?? "-",
        tipo: (p._tipo ?? p.tipo ?? "CLIENTE").toUpperCase(),
        estado: p._estado ?? p.estado ?? "activo"
      };
      
      await api.post('/clientes-proveedores', payload);
      
      set({ loading: false });
      
      // Refrescar lista
      const { mostrarCliPro, parametros } = get();
      await mostrarCliPro(parametros);
      
      return { success: true };
    } catch (e) {
      console.error("Error al insertar cliente/proveedor", e);
      const errorMsg = e.response?.data?.mensaje || "Error al crear cliente/proveedor";
      set({ 
        error: errorMsg,
        loading: false 
      });
      throw new Error(errorMsg);
    }
  },
  
  // Eliminar cliente/proveedor
  eliminarCliPro: async (p) => {
    try {
      set({ loading: true, error: null });
      
      await api.delete(`/clientes-proveedores/${p.id}`);
      
      set({ loading: false });
      
      // Refrescar lista
      const { mostrarCliPro, parametros } = get();
      await mostrarCliPro(parametros);
      
      return { success: true };
    } catch (e) {
      console.error("Error al eliminar cliente/proveedor", e);
      set({ 
        error: e.response?.data?.mensaje || "Error al eliminar cliente/proveedor",
        loading: false 
      });
      return { success: false };
    }
  },
  
  // Editar cliente/proveedor
  editarCliPro: async (p) => {
    try {
      set({ loading: true, error: null });
      
      // Adaptar payload al formato del backend
      const payload = {
        nombres: p._nombres ?? p.nombres,
        direccion: p._direccion ?? p.direccion ?? "-",
        telefono: p._telefono ?? p.telefono ?? "-",
        email: p._email ?? p.email ?? "-",
        identificadorNacional: p._identificador_nacional ?? p.identificador_nacional ?? "-",
        identificadorFiscal: p._identificador_fiscal ?? p.identificador_fiscal ?? "-",
        tipo: (p._tipo ?? p.tipo ?? "CLIENTE").toUpperCase(),
        estado: p._estado ?? p.estado ?? "activo"
      };
      
      await api.put(`/clientes-proveedores/${p.id}`, payload);
      
      set({ loading: false });
      
      // Refrescar lista
      const { mostrarCliPro, parametros } = get();
      await mostrarCliPro(parametros);
      
      return { success: true };
    } catch (e) {
      console.error("Error al editar cliente/proveedor", e);
      const errorMsg = e.response?.data?.mensaje || "Error al editar cliente/proveedor";
      set({ 
        error: errorMsg,
        loading: false 
      });
      throw new Error(errorMsg);
    }
  },
  
  // Buscar clientes/proveedores por nombre y tipo
  buscarCliPro: async (p) => {
    try {
      set({ loading: true, error: null });
      
      if (!p.id_empresa || !p.tipo) {
        set({ loading: false });
        return [];
      }
      
      const query = p.buscador || p.query || "";
      
      // Primero buscar con el query general
      const response = await api.get(`/clientes-proveedores/empresa/${p.id_empresa}/buscar`, {
        params: { q: query }
      });
      
      // Filtrar los resultados por tipo en el frontend (porque el backend no filtra por tipo en la búsqueda)
      const filteredData = response.data.filter(item => item.tipo === p.tipo);
      
      set({ 
        dataclipro: filteredData,
        loading: false
      });
      
      return response.data;
    } catch (e) {
      console.error("Error al buscar clientes/proveedores", e);
      set({ 
        error: e.response?.data?.mensaje || "Error al buscar",
        loading: false 
      });
      return [];
    }
  },
  
  // Listar por tipo (CLIENTE, PROVEEDOR, AMBOS)
  listarPorTipo: async (idEmpresa, tipo) => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.get(`/clientes-proveedores/empresa/${idEmpresa}/tipo/${tipo}`);
      
      set({ 
        dataclipro: response.data,
        loading: false
      });
      
      return response.data;
    } catch (e) {
      console.error("Error al listar por tipo", e);
      set({ 
        error: e.response?.data?.mensaje || "Error al filtrar por tipo",
        loading: false 
      });
      return [];
    }
  },
  
  // Cambiar estado (activo/inactivo)
  cambiarEstado: async (id, nuevoEstado) => {
    try {
      set({ loading: true, error: null });
      
      await api.patch(`/clientes-proveedores/${id}/estado`, {
        estado: nuevoEstado
      });
      
      set({ loading: false });
      
      // Refrescar lista
      const { mostrarCliPro, parametros } = get();
      await mostrarCliPro(parametros);
      
      return { success: true };
    } catch (e) {
      console.error("Error al cambiar estado", e);
      set({ 
        error: e.response?.data?.mensaje || "Error al cambiar estado",
        loading: false 
      });
      return { success: false };
    }
  },
}));
