import { create } from "zustand";
import {
  EditarImpresoras,
  MostrarImpresoraXUsuario,
  InsertarImpresora,
} from "../supabase/crudImpresoras";
const fetchWithTimeout = (url, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Timeout")), timeout);
    fetch(url)
      .then((response) => {
        clearTimeout(timer);
        resolve(response);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
};
export const useImpresorasStore = create((set, get) => ({
  dataImpresorasPorUsuario: null,
  selectImpresora: {
    name: "seleccione una impresora",
  },
  setSelectImpresora: (p) => {
    set({ selectImpresora: p });
  },
  statePrintDirecto: false,
  setStatePrintDirecto: () => {
    set((state) => ({ statePrintDirecto: !state.statePrintDirecto }));
  },
  mostrarDatosPc: async () => {
    try {
      const response = await fetchWithTimeout(
        "http://localhost:5075/api/get-local-ip",
        5000
      );
      if (!response.ok) {
        throw new Error(`Error de red: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return null;
    }
  },
  mostrarListaImpresoraLocales: async () => {
    const response = await fetch("http://localhost:5075/api/list");
    if (!response.ok) {
      return;
    }
    const data = await response.json();
    return data;
  },
  editarImpresoras: async (p) => {
    await EditarImpresoras(p);
  },
  insertarImpresoras: async (p) => {
    const response = await InsertarImpresora(p);
    set(() => ({ dataImpresorasPorUsuario: response }));
    return response;
  },
  mostrarImpresoraXUsuario: async (p) => {
    const response = await MostrarImpresoraXUsuario(p);
    set(() => ({
      dataImpresorasPorUsuario: response,
      statePrintDirecto: response?.estado,
      selectImpresora:
        response?.nombre === "-"
          ? {
              name: "seleccione una impresora",
            }
          : { name: response?.nombre },
    }));
    return response;
  },
  
}));
