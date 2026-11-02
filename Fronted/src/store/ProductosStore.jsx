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
  productosItemSelect: null,
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
          // Enviar array de códigos adicionales como objetos { codigoBarras }
          codigos: p._codigos ? (Array.isArray(p._codigos) ? p._codigos.map(c => ({ codigoBarras: c })) : []) : undefined,
          codigoInterno: p._codigo_interno ?? p.codigo_interno ?? null,
          empresa: p.idEmpresa ? { id: p.idEmpresa } : undefined,
          seVendePor: (p._sevende_por ?? p.sevende_por ?? 'UNIDAD').toUpperCase(),
          manejaInventarios: Boolean(p._maneja_inventarios ?? p.maneja_inventarios ?? false),
          manejaMultiprecios: Boolean(p._maneja_multiprecios ?? p.maneja_multiprecios ?? false),
          tipoComprobante: p.tipoComprobante ?? 'FACTURADO',
          // Preferir la versión base64 si el backend la incluye (para preview inmediato)
          imagen: p._imagen ?? p.imagenBase64 ?? p.imagen ?? null,
        };
        console.log('🔥 STORE insertarProductos - FINAL:', producto);
        const response = await api.post("/productos", producto);
        const { mostrarProductos, buscarProductos, parametros, buscador } = get();
        if (buscador && buscador.trim() !== "") {
          await buscarProductos({ id_empresa: parametros.id_empresa, buscador });
        } else {
          await mostrarProductos(parametros);
        }
        return response.data?.id;
    } catch (e) {
        console.error("Error inserting producto", e);
        throw e; 
    }
  },

  eliminarProductos: async (p) => {
    try {
        await api.delete(`/productos/${p.id}`);
        const { mostrarProductos, buscarProductos, parametros, buscador } = get();
        if (buscador && buscador.trim() !== "") {
          await buscarProductos({ id_empresa: parametros.id_empresa, buscador });
        } else {
          await mostrarProductos(parametros);
        }
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
          codigos: p._codigos ? (Array.isArray(p._codigos) ? p._codigos.map(c => ({ codigoBarras: c })) : []) : undefined,
          codigoInterno: p._codigo_interno ?? p.codigo_interno ?? null,
          empresa: p.idEmpresa ? { id: p.idEmpresa } : undefined,
          seVendePor: (p._sevende_por ?? p.sevende_por ?? 'UNIDAD').toUpperCase(),
          manejaInventarios: Boolean(p._maneja_inventarios ?? p.maneja_inventarios ?? false),
          manejaMultiprecios: Boolean(p._maneja_multiprecios ?? p.maneja_multiprecios ?? false),
          tipoComprobante: p.tipoComprobante ?? 'FACTURADO',
          // Preferir la versión base64 si está disponible
          imagen: p._imagen ?? p.imagenBase64 ?? p.imagen ?? null,
        };
        console.log('🔥 STORE editarProductos - producto a enviar:', producto);
        const response = await api.put(`/productos/${id}`, producto);
        console.log('🔥 STORE editarProductos - respuesta del servidor:', response?.data);
        const { mostrarProductos, buscarProductos, parametros, buscador } = get();
        if (buscador && buscador.trim() !== "") {
          await buscarProductos({ id_empresa: parametros.id_empresa, buscador });
        } else {
          await mostrarProductos(parametros);
        }
    } catch (e) {
        console.error("Error editing producto", e);
        throw e;
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
  // Paginación persistente
  paginaProductos: 1,
  setPaginaProductos: (p) => set({ paginaProductos: p }),
}));
