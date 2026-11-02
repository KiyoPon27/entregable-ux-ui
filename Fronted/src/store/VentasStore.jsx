import { create } from "zustand";
import {
  InsertarVentas,
  EliminarVentasIncompletas,
  MostrarVentasXsucursal,
  useClientesProveedoresStore,
  ConfirmarVenta,
  EliminarVenta,
} from "../index";
import { toast } from "sonner";
import { redondearADecimal } from "../utils/Conversiones";
const DESCUENTO_STORAGE_KEY = "ventas-descuento-preferencias";

const getDescuentoPreferencias = () => {
  const defaults = {
    stateDescuentoActivo: true,
    porcentajeDescuento: 10,
  };

  if (typeof window === "undefined") {
    return defaults;
  }

  try {
    const raw = window.localStorage.getItem(DESCUENTO_STORAGE_KEY);
    if (!raw) {
      return defaults;
    }

    const parsed = JSON.parse(raw);
    return {
      stateDescuentoActivo:
        typeof parsed.stateDescuentoActivo === "boolean"
          ? parsed.stateDescuentoActivo
          : defaults.stateDescuentoActivo,
      porcentajeDescuento:
        Number.isFinite(Number(parsed.porcentajeDescuento)) &&
        Number(parsed.porcentajeDescuento) >= 0
          ? Number(parsed.porcentajeDescuento)
          : defaults.porcentajeDescuento,
    };
  } catch {
    return defaults;
  }
};

const persistDescuentoPreferencias = (pref) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(DESCUENTO_STORAGE_KEY, JSON.stringify(pref));
  } catch {}
};

const descuentoPreferencias = getDescuentoPreferencias();
const initialState = {
  items: [],
  total: 0,
  statePantallaCobro: false,
  tipocobro: "",
  stateMetodosPago: false,
  idventa: 0,
  porcentajeDescuento: descuentoPreferencias.porcentajeDescuento, // ✅ NUEVO: Porcentaje de descuento (0-100)
  montoDescuento: 0, // ✅ NUEVO: Monto calculado del descuento
  stateDescuentoActivo: descuentoPreferencias.stateDescuentoActivo, // ✅ NUEVO: Estado para activar/desactivar descuento
};
export const useVentasStore = create((set, get) => ({
  ...initialState,
  porcentajeCambio: 0,
  dataventas: [],
  resetState: () => {
    const { selectCliPro } = useClientesProveedoresStore.getState();
    selectCliPro([]);
    const descuento = getDescuentoPreferencias();
    set({
      ...initialState,
      porcentajeDescuento: descuento.porcentajeDescuento,
      stateDescuentoActivo: descuento.stateDescuentoActivo,
      montoDescuento: 0,
    });
  },
  setStatePantallaCobro: (p) =>
    set((state) => {
      if (p.data.length === 0) {
        toast.warning("Agrega productos, no seas puerco");
        return {
          state,
        };
      } else {
        return {
          statePantallaCobro: !state.statePantallaCobro,
          tipocobro: p.tipocobro,
        };
      }
    }),
  setStateMetodosPago: () =>
    set((state) => ({ stateMetodosPago: !state.stateMetodosPago })),
  insertarVentas: async (p) => {
    const result = await InsertarVentas(p);
    set({ idventa: result?.id });
    return result;
  },
  eliminarventasIncompletas: async (p) => {
    await EliminarVentasIncompletas(p);
    set({ idventa: 0, items: [], total: 0 });
    try {
      // Llama al método de reset en el store de detalles
      require("./DetalleVentasStore.jsx").useDetalleVentasStore.getState().resetDetalleState();
    } catch (e) {}
  },
  eliminarVenta: async (p) => {
    const { resetState } = get();
    await EliminarVenta(p);
    resetState();
  },
  mostrarventasxsucursal: async (p) => {
    const response = await MostrarVentasXsucursal(p);
    set({ dataventas: response });
    set({ idventa: response?.id ? response?.id : 0 });
    return response;
  },

  confirmarVenta: async (p) => {
    return await ConfirmarVenta(p);
  },
  
  // ✅ NUEVA FUNCIÓN: Establecer descuento
  setDescuento: (porcentaje, totalReal = null) => {
    set((state) => {
      // Validar rango 0-100
      const porcentajeValido = Math.max(0, Math.min(100, parseFloat(porcentaje) || 0));
      
      // Usar totalReal si se proporciona, sino usar state.total
      const subtotal = totalReal !== null ? totalReal : state.total;
      
      // Si el descuento está apagado, no aplicar monto
      const montoDescuentoCalculado = state.stateDescuentoActivo
        ? subtotal * (porcentajeValido / 100)
        : 0;
      
      const descuentoActual = {
        stateDescuentoActivo: state.stateDescuentoActivo,
        porcentajeDescuento: porcentajeValido,
      };
      persistDescuentoPreferencias(descuentoActual);
      
      return {
        porcentajeDescuento: porcentajeValido,
        montoDescuento: redondearADecimal(montoDescuentoCalculado),
      };
    });
  },
  
  // ✅ NUEVA FUNCIÓN: Establecer el total desde DetalleVentasStore
  setTotal: (nuevoTotal) => {
    set({ total: nuevoTotal });
  },
  
  // ✅ NUEVA FUNCIÓN: Obtener total con descuento aplicado (con totalReal como parámetro)
  getTotalConDescuento: (totalReal = null) => {
    const state = get();
    const subtotal = totalReal !== null ? totalReal : state.total;
    const descuentoActivo = state.stateDescuentoActivo && state.porcentajeDescuento > 0;
    const descuentoMonto = descuentoActivo
      ? subtotal * (state.porcentajeDescuento / 100)
      : 0;
    const totalFinal = subtotal - descuentoMonto;
    
    return {
      subtotal: redondearADecimal(subtotal),
      descuentoMonto: redondearADecimal(descuentoMonto),
      totalFinal: redondearADecimal(totalFinal),
    };
  },
  
  // ✅ NUEVA FUNCIÓN: Resetear descuento
  resetDescuento: () => {
    set({
      porcentajeDescuento: 0,
      montoDescuento: 0,
    });
  },
  
  // ✅ NUEVA FUNCIÓN: Activar/Desactivar descuento
  setStateDescuentoActivo: () => {
    set((state) => {
      const nuevoEstado = !state.stateDescuentoActivo;
      const porcentajeActual = state.porcentajeDescuento || 0;
      const montoDescuento = nuevoEstado
        ? redondearADecimal((state.total || 0) * (porcentajeActual / 100))
        : 0;

      persistDescuentoPreferencias({
        stateDescuentoActivo: nuevoEstado,
        porcentajeDescuento: porcentajeActual,
      });

      return {
        stateDescuentoActivo: nuevoEstado,
        montoDescuento,
      };
    });
  },
}));
