import { create } from "zustand";
import api from "../api/api";

export const useMovimientosStockStore = create((set, get) => ({
  // Estado
  dataMovimientos: [],
  movimientoItemSelect: null,
  loading: false,
  error: null,
  
  // Filtros
  filtros: {
    idProducto: null,
    idAlmacen: null,
    tipoMovimiento: null,
    fechaInicio: null,
    fechaFin: null,
    idEmpresa: null,
  },

  // Setters de filtros
  setFiltros: (filtros) => {
    set({ filtros: { ...get().filtros, ...filtros } });
  },

  resetFiltros: () => {
    set({ 
      filtros: {
        idProducto: null,
        idAlmacen: null,
        tipoMovimiento: null,
        fechaInicio: null,
        fechaFin: null,
        idEmpresa: null,
      }
    });
  },

  // Listar todos los movimientos
  listarTodos: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/movimientos-stock');
      set({ 
        dataMovimientos: response.data,
        loading: false 
      });
      return response.data;
    } catch (e) {
      console.error("Error al listar movimientos", e);
      set({ 
        error: e.response?.data?.mensaje || "Error al cargar movimientos",
        loading: false 
      });
      return [];
    }
  },

  // Kardex por producto
  listarPorProducto: async (idProducto) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get(`/movimientos-stock/producto/${idProducto}`);
      set({ 
        dataMovimientos: response.data,
        loading: false 
      });
      return response.data;
    } catch (e) {
      console.error("Error al obtener Kardex del producto", e);
      set({ 
        error: e.response?.data?.mensaje || "Error al obtener Kardex",
        loading: false 
      });
      return [];
    }
  },

  // Listar por almacén
  listarPorAlmacen: async (idAlmacen) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get(`/movimientos-stock/almacen/${idAlmacen}`);
      set({ 
        dataMovimientos: response.data,
        loading: false 
      });
      return response.data;
    } catch (e) {
      console.error("Error al listar movimientos del almacén", e);
      set({ 
        error: e.response?.data?.mensaje || "Error al cargar movimientos del almacén",
        loading: false 
      });
      return [];
    }
  },

  // Kardex específico (producto + almacén)
  listarPorProductoYAlmacen: async (idProducto, idAlmacen) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get(`/movimientos-stock/producto/${idProducto}/almacen/${idAlmacen}`);
      set({ 
        dataMovimientos: response.data,
        loading: false 
      });
      return response.data;
    } catch (e) {
      console.error("Error al obtener Kardex específico", e);
      set({ 
        error: e.response?.data?.mensaje || "Error al obtener Kardex específico",
        loading: false 
      });
      return [];
    }
  },

  // Filtrar por tipo de movimiento
  listarPorTipo: async (tipo) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get(`/movimientos-stock/tipo/${tipo}`);
      set({ 
        dataMovimientos: response.data,
        loading: false 
      });
      return response.data;
    } catch (e) {
      console.error("Error al filtrar por tipo", e);
      set({ 
        error: e.response?.data?.mensaje || "Error al filtrar movimientos",
        loading: false 
      });
      return [];
    }
  },

  // Filtrar por rango de fechas
  listarPorFechas: async (fechaInicio, fechaFin) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get(`/movimientos-stock/fechas`, {
        params: { inicio: fechaInicio, fin: fechaFin }
      });
      set({ 
        dataMovimientos: response.data,
        loading: false 
      });
      return response.data;
    } catch (e) {
      console.error("Error al filtrar por fechas", e);
      set({ 
        error: e.response?.data?.mensaje || "Error al filtrar por fechas",
        loading: false 
      });
      return [];
    }
  },

  // Kardex con fechas
  listarPorProductoYFechas: async (idProducto, fechaInicio, fechaFin) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get(`/movimientos-stock/producto/${idProducto}/fechas`, {
        params: { inicio: fechaInicio, fin: fechaFin }
      });
      set({ 
        dataMovimientos: response.data,
        loading: false 
      });
      return response.data;
    } catch (e) {
      console.error("Error al obtener Kardex con fechas", e);
      set({ 
        error: e.response?.data?.mensaje || "Error al obtener Kardex con fechas",
        loading: false 
      });
      return [];
    }
  },

  // Movimientos del almacén con fechas
  listarPorAlmacenYFechas: async (idAlmacen, fechaInicio, fechaFin) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get(`/movimientos-stock/almacen/${idAlmacen}/fechas`, {
        params: { inicio: fechaInicio, fin: fechaFin }
      });
      set({ 
        dataMovimientos: response.data,
        loading: false 
      });
      return response.data;
    } catch (e) {
      console.error("Error al listar movimientos del almacén con fechas", e);
      set({ 
        error: e.response?.data?.mensaje || "Error al filtrar movimientos del almacén",
        loading: false 
      });
      return [];
    }
  },

  // Listar por empresa
  listarPorEmpresa: async (idEmpresa) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get(`/movimientos-stock/empresa/${idEmpresa}`);
      set({ 
        dataMovimientos: response.data,
        loading: false 
      });
      return response.data;
    } catch (e) {
      console.error("Error al listar movimientos de la empresa", e);
      set({ 
        error: e.response?.data?.mensaje || "Error al cargar movimientos de la empresa",
        loading: false 
      });
      return [];
    }
  },

  // Obtener movimiento por ID
  obtenerPorId: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get(`/movimientos-stock/${id}`);
      set({ 
        movimientoItemSelect: response.data,
        loading: false 
      });
      return response.data;
    } catch (e) {
      console.error("Error al obtener movimiento", e);
      set({ 
        error: e.response?.data?.mensaje || "Error al obtener el movimiento",
        loading: false 
      });
      return null;
    }
  },

  // Registrar movimiento manual
  registrarMovimiento: async (movimiento) => {
    try {
      set({ loading: true, error: null });
      const payload = {
        almacen: { id: movimiento.idAlmacen },
        producto: { id: movimiento.idProducto },
        tipoMovimiento: movimiento.tipoMovimiento,
        cantidad: Number(movimiento.cantidad),
        detalle: movimiento.detalle || "Movimiento registrado",
        origen: movimiento.origen || "MANUAL"
      };
      
      const response = await api.post('/movimientos-stock', payload);
      set({ loading: false });
      
      // Refrescar lista después de registrar
      const filtros = get().filtros;
      if (filtros.idProducto) {
        get().listarPorProducto(filtros.idProducto);
      } else {
        get().listarTodos();
      }
      
      return response.data;
    } catch (e) {
      console.error("Error al registrar movimiento", e);
      set({ 
        error: e.response?.data?.mensaje || "Error al registrar el movimiento",
        loading: false 
      });
      return null;
    }
  },

  // Búsqueda con filtros combinados (inteligente)
  buscarConFiltros: async (filtros = null) => {
    const f = filtros || get().filtros;
    
    try {
      set({ loading: true, error: null });
      
      // Lógica de selección de endpoint según filtros activos
      if (f.idProducto && f.idAlmacen && f.fechaInicio && f.fechaFin) {
        // Caso: Producto + Almacén + Fechas (usar endpoint de producto con fechas y filtrar en frontend)
        const data = await get().listarPorProductoYFechas(f.idProducto, f.fechaInicio, f.fechaFin);
        const filtrado = data.filter(m => m.almacen.id === f.idAlmacen);
        set({ dataMovimientos: filtrado, loading: false });
        return filtrado;
        
      } else if (f.idProducto && f.idAlmacen) {
        // Caso: Producto + Almacén
        return await get().listarPorProductoYAlmacen(f.idProducto, f.idAlmacen);
        
      } else if (f.idProducto && f.fechaInicio && f.fechaFin) {
        // Caso: Producto + Fechas
        return await get().listarPorProductoYFechas(f.idProducto, f.fechaInicio, f.fechaFin);
        
      } else if (f.idAlmacen && f.fechaInicio && f.fechaFin) {
        // Caso: Almacén + Fechas
        return await get().listarPorAlmacenYFechas(f.idAlmacen, f.fechaInicio, f.fechaFin);
        
      } else if (f.idProducto) {
        // Caso: Solo Producto
        return await get().listarPorProducto(f.idProducto);
        
      } else if (f.idAlmacen) {
        // Caso: Solo Almacén
        return await get().listarPorAlmacen(f.idAlmacen);
        
      } else if (f.tipoMovimiento) {
        // Caso: Solo Tipo
        return await get().listarPorTipo(f.tipoMovimiento);
        
      } else if (f.fechaInicio && f.fechaFin) {
        // Caso: Solo Fechas
        return await get().listarPorFechas(f.fechaInicio, f.fechaFin);
        
      } else if (f.idEmpresa) {
        // Caso: Por Empresa
        return await get().listarPorEmpresa(f.idEmpresa);
        
      } else {
        // Caso: Sin filtros
        return await get().listarTodos();
      }
      
    } catch (e) {
      console.error("Error en búsqueda con filtros", e);
      set({ 
        error: "Error al buscar movimientos",
        loading: false 
      });
      return [];
    }
  },

  // Seleccionar movimiento
  selectMovimiento: (movimiento) => {
    set({ movimientoItemSelect: movimiento });
  },

  // Reset selección
  resetMovimientoItemSelect: () => {
    set({ movimientoItemSelect: null });
  },
}));
