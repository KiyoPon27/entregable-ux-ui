import { create } from "zustand";
import {
  Generarcodigo
} from "../index";
import api from "../api/api";

export const useProductosStore = create((set, get) => ({
  refetchs:null,
  buscador: "",
  setBuscador: (p) => {
    set({ buscador: p });
  },
  dataProductos: [],
  productosItemSelect: {
    id:1
  },
  parametros: {},
  mostrarProductos: async (p) => {
    try {
        if(!p.id_empresa) return;
        const response = await api.get(`/productos/empresa/${p.id_empresa}`);
        set({ parametros: p });
        set({ dataProductos: response.data });
        set({ productosItemSelect: response.data[0] || null });
        set({refetchs:p.refetchs})
        return response.data;
    } catch (e) {
        console.error("Error showing productos", e);
        return [];
    }
  },
  selectProductos: (p) => {
    set({ productosItemSelect: p });
  },
  resetProductosItemSelect: () => {
    set({ productosItemSelect: null });
  },
  insertarProductos: async (p) => {
    try {
        // Adaptar payload desde nombres con underscore a modelo Java
        const producto = {
          nombre: p._nombre ?? p.nombre,
          precioVenta: Number(p._precio_venta ?? p.precio_venta ?? 0),
          precioCompra: Number(p._precio_compra ?? p.precio_compra ?? 0),
          categoria: p.idCategoria ? { id: p.idCategoria } : undefined,
          codigoBarras: p._codigo_barras ?? p.codigo_barras ?? null,
          codigoInterno: p._codigo_interno ?? p.codigo_interno ?? null,
          empresa: p.idEmpresa ? { id: p.idEmpresa } : undefined,
          seVendePor: (p._sevende_por ?? p.sevende_por ?? 'UNIDAD').toUpperCase(),
          manejaInventarios: Boolean(p._maneja_inventarios ?? p.maneja_inventarios ?? false),
          manejaMultiprecios: Boolean(p._maneja_multiprecios ?? p.maneja_multiprecios ?? false),
        };
        const response = await api.post("/productos", producto);
        const { mostrarProductos, parametros } = get();
        await mostrarProductos(parametros);
        return response.data?.id;
    } catch (e) {
        console.error("Error inserting producto", e);
        throw e; 
    }
  },
  eliminarProductos: async (p) => {
    try {
        await api.delete(`/productos/${p.id}`);
        const { mostrarProductos, parametros } = get();
        await mostrarProductos(parametros);
    } catch (e) {
        console.error("Error deleting producto", e);
    }
  },
  editarProductos: async (p) => {
    try {
        const id = p._id ?? p.id;
        const producto = {
          nombre: p._nombre ?? p.nombre,
          precioVenta: Number(p._precio_venta ?? p.precio_venta ?? 0),
          precioCompra: Number(p._precio_compra ?? p.precio_compra ?? 0),
          categoria: p.idCategoria ? { id: p.idCategoria } : undefined,
          codigoBarras: p._codigo_barras ?? p.codigo_barras ?? null,
          codigoInterno: p._codigo_interno ?? p.codigo_interno ?? null,
          empresa: p.idEmpresa ? { id: p.idEmpresa } : undefined,
          seVendePor: (p._sevende_por ?? p.sevende_por ?? 'UNIDAD').toUpperCase(),
          manejaInventarios: Boolean(p._maneja_inventarios ?? p.maneja_inventarios ?? false),
          manejaMultiprecios: Boolean(p._maneja_multiprecios ?? p.maneja_multiprecios ?? false),
        };
        await api.put(`/productos/${id}`, producto);
        const { mostrarProductos, parametros } = get();
        await mostrarProductos(parametros);
    } catch (e) {
        console.error("Error editing producto", e);
    }
  },
  buscarProductos: async (p) => {
    try {
        const query = p.buscador ?? p.descripcion ?? "";
        const response = await api.get(`/productos/buscar/${p.id_empresa}?q=${encodeURIComponent(query)}`);
        set({ dataProductos: response.data });
        return response.data;
    } catch (e) {
        console.error("Error searching productos", e);
        return [];
    }
  },
  codigogenerado:0,
  generarCodigo:()=>{
  const response=  Generarcodigo({id:2})
  set({codigogenerado:response})
  },
  editarPreciosProductos: async (p) => {
    try {
      // Assuming a specific endpoint or just reusing generic update
      await api.put(`/productos/${p.id}`, p);
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Error al editar precio");
    }
  },
}));
