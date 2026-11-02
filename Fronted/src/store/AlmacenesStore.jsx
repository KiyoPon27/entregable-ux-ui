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
  // Almacén seleccionado actualmente (se actualiza dinámicamente)
  almacenSelectItem: null,
  setAlmacenSelectItem: (p) => {
    // Ahora SÍ usa el parámetro que le pasan (sucursal completa)
    if (p && p.id) {
      set({ almacenSelectItem: { id: p.id, nombre: p.nombre } });
    }
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
  dataAlmacenes: [],
  mostrarAlmacenes: async (p) => {
    const sucursales = await MostrarAlmacenesXEmpresa(p);
    const almacenes = (sucursales || []).flatMap((sucursal) =>
      (sucursal.almacen || sucursal.almacenes || []).map((almacen) => ({
        ...almacen,
        id_sucursal: sucursal.id,
        nombre_sucursal: sucursal.nombre,
      }))
    );
    set({ dataAlmacenes: almacenes, dataAlmacenesXsucursal: sucursales });
    return almacenes;
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
