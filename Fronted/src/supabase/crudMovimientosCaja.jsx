import api from "../api/api";

export async function InsertarMovCaja(p) {
  try {
    const response = await api.post("/movimientos-caja", p);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

export async function MostrarEfectivoSinVentasMovcierrecaja(p) {
  try {
    const response = await api.get(`/movimientos-caja/cierre-caja/${p._id_cierre_caja}/efectivo-sin-ventas`);
    return response.data || [];
  } catch (error) {
    console.error("Error al obtener efectivo sin ventas:", error);
    return [];
  }
}
export async function MostrarVentasMetodoPagoMovCaja(p) {
  try {
    const response = await api.get(`/movimientos-caja/ventas-metodo-pago/${p._id_cierre_caja}`);
    return response.data || [];
  } catch (error) {
    console.error("Error al obtener ventas por método de pago:", error);
    return [];
  }
}

export async function MostrarIngresosYSalidasCaja(p) {
  try {
    const response = await api.get(`/movimientos-caja/cierre-caja/${p._id_cierre_caja}`);
    return response.data || [];
  } catch (error) {
    console.error("Error al obtener ingresos y salidas:", error);
    return [];
  }
}

export async function Mostrarmovimientoscajalive(p) {
  try {
    const response = await api.get(`/movimientos-caja/empresa/${p.idEmpresa}`);
    const data = response.data || [];
    return data;
  } catch (error) {
    console.error("Error al obtener movimientos de caja live:", error);
    return [];
  }
}

