import { create } from "zustand";
import {
  InsertarCompra,
  MostrarCompras,
  EliminarCompra,
  EditarCompra,
  BuscarCompras,
  MostrarCompraDetalle,
} from "../supabase/crudCompras";

const initialState = {
  dataCompras: [],
  compraItemSelect: null,
  detallesCompra: [],
  buscador: "",
};

export const useComprasStore = create((set, get) => ({
  ...initialState,

  // Buscar compras
  setBuscador: (texto) => {
    set({ buscador: texto });
  },

  // Mostrar todas las compras
  mostrarCompras: async (p) => {
    try {
      const response = await MostrarCompras(p);
      set({ dataCompras: response });
      return response;
    } catch (error) {
      console.error("Error al mostrar compras:", error);
      return [];
    }
  },

  // Buscar compras por proveedor o número de factura
  buscarCompras: async (p) => {
    try {
      const response = await BuscarCompras(p);
      set({ dataCompras: response });
      return response;
    } catch (error) {
      console.error("Error al buscar compras:", error);
      return [];
    }
  },

  // Seleccionar una compra
  selectCompra: (compra) => {
    set({ compraItemSelect: compra });
  },

  // Insertar nueva compra
  insertarCompra: async (p) => {
    try {
      const result = await InsertarCompra(p);
      const { mostrarCompras } = get();
      await mostrarCompras({ id_empresa: p.id_empresa });
      return result;
    } catch (error) {
      console.error("Error al insertar compra:", error);
      throw error;
    }
  },

  // Editar compra existente
  editarCompra: async (p) => {
    try {
      await EditarCompra(p);
      const { mostrarCompras } = get();
      await mostrarCompras({ id_empresa: p.id_empresa });
    } catch (error) {
      console.error("Error al editar compra:", error);
      throw error;
    }
  },

  // Eliminar compra
  eliminarCompra: async (p) => {
    try {
      await EliminarCompra(p);
      const { mostrarCompras } = get();
      await mostrarCompras({ id_empresa: p.id_empresa });
    } catch (error) {
      console.error("Error al eliminar compra:", error);
      throw error;
    }
  },

  // Obtener detalle de una compra específica
  mostrarCompraDetalle: async (p) => {
    try {
      const response = await MostrarCompraDetalle(p);
      set({ detallesCompra: response });
      return response;
    } catch (error) {
      console.error("Error al mostrar detalle de compra:", error);
      return [];
    }
  },

  // Resetear estado
  resetState: () => {
    set(initialState);
  },
}));