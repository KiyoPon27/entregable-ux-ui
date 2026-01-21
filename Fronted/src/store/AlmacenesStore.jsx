import { create } from "zustand";
import {
  EliminarAlmacen,
  
  MostrarAlmacenXSucursal,
  MostrarAlmacenesXEmpresa,
  InsertarAlmacen,
  EditarAlmacen,
  MostrarAlmacenesXSucursal,
} from "../index";

export const useAlmacenesStore = create((set, get) => ({
  stateAlmacen: false,
  setStateAlmacen: (p) => set({ stateAlmacen: p }),
  accion: "",
  setAccion: (p) => set({ accion: p }),
  // Siempre usar el almacén principal con id=1
  almacenSelectItem: { id: 1, nombre: "Almacén Principal" },
  setAlmacenSelectItem: (p) => {
    // Siempre mantener el almacén con id=1
    set({ almacenSelectItem: { id: 1, nombre: "Almacén Principal" } });
  },

  dataalmacen: [],
  dataalmacenxsucursalxproducto: [],
  
  mostrarAlmacenXsucursal: async (p) => {
    const response = await MostrarAlmacenXSucursal(p);
    set({ dataalmacenxsucursalxproducto: response });
    const { dataalmacenxsucursalxproducto } = get();
    return dataalmacenxsucursalxproducto;
  },
  dataAlmacenesXempresa: null,
  mostrarAlmacenesXEmpresa: async (p) => {
    const response = await MostrarAlmacenesXEmpresa(p);
    set({ dataAlmacenesXsucursal: response });
    return response;
  },
  dataAlmacenesXsucursal: null,
  mostrarAlmacenesXSucursal: async (p) => {
    const response = await MostrarAlmacenesXSucursal(p);
    
    // Seleccionar primer almacén disponible o null si no hay
    if (response && response.length > 0) {
      const primerAlmacen = response[0];
      set({ almacenSelectItem: { id: primerAlmacen.id, nombre: primerAlmacen.nombre } });
    } else {
      set({ almacenSelectItem: null });
      console.warn("⚠️ La sucursal no tiene almacenes configurados");
    }
    
    set({ dataAlmacenesXsucursal: response });
    return response;
  },
 
  insertarAlmacen: async (p) => {
    await InsertarAlmacen(p);
  },
  eliminarAlmacen: async (p) => {
    await EliminarAlmacen(p);
  },
  editarAlmacen: async (p) => {
    await EditarAlmacen(p);
  },
}));
