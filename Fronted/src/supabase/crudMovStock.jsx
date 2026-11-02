import api from "../api/api";

export async function MostrarMovStock(p) {
  if (!p?.id_producto) {
    return [];
  }

  try {
    const response = await api.get(`/movimientos-stock/producto/${p.id_producto}`);
    return response.data || [];
  } catch (error) {
    console.error("Error al mostrar movimientos de stock:", error);
    return [];
  }
}

export async function InsertarMovStock(p) {
  try {
    const body = {
      almacen: { id: p.id_almacen },
      producto: { id: p.id_producto },
      tipoMovimiento: p.tipo_movimiento,
      cantidad: p.cantidad,
      detalle: p.detalle || "-",
      origen: p.origen || "-"
    };
    const response = await api.post("/movimientos-stock", body);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}
