import api from "../api/api";

/**
 * CRUD para Kardex
 * Backend endpoints: /api/kardex
 */

export async function ListarKardex() {
  try {
    const response = await api.get("/kardex/listar");
    return response.data || [];
  } catch (error) {
    console.error("Error al listar kardex:", error);
    return [];
  }
}

export async function ListarKardexPorProducto(idProducto) {
  try {
    const response = await api.get(`/kardex/producto/${idProducto}`);
    return response.data || [];
  } catch (error) {
    console.error("Error al listar kardex por producto:", error);
    return [];
  }
}

export async function ListarKardexPorUsuario(idUsuario) {
  try {
    const response = await api.get(`/kardex/usuario/${idUsuario}`);
    return response.data || [];
  } catch (error) {
    console.error("Error al listar kardex por usuario:", error);
    return [];
  }
}

export async function ListarKardexPorTipo(tipo) {
  try {
    const response = await api.get(`/kardex/tipo/${tipo}`);
    return response.data || [];
  } catch (error) {
    console.error("Error al listar kardex por tipo:", error);
    return [];
  }
}

export async function ListarKardexPorFechas(fechaInicio, fechaFin) {
  try {
    const response = await api.get("/kardex/fechas", {
      params: { fechaInicio, fechaFin }
    });
    return response.data || [];
  } catch (error) {
    console.error("Error al listar kardex por fechas:", error);
    return [];
  }
}

export async function CrearKardex(p) {
  try {
    const body = {
      producto: { id: p.id_producto },
      almacen: { id: p.id_almacen },
      tipoMovimiento: p.tipo_movimiento,
      cantidad: p.cantidad,
      precioUnitario: p.precio_unitario || 0,
      usuario: p.id_usuario ? { id: p.id_usuario } : null,
      documento: p.documento || "-",
      detalle: p.detalle || "-"
    };
    const response = await api.post("/kardex/crear", body);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

export async function ActualizarKardex(p) {
  try {
    const body = {
      producto: p.id_producto ? { id: p.id_producto } : undefined,
      almacen: p.id_almacen ? { id: p.id_almacen } : undefined,
      tipoMovimiento: p.tipo_movimiento,
      cantidad: p.cantidad,
      precioUnitario: p.precio_unitario,
      usuario: p.id_usuario ? { id: p.id_usuario } : undefined,
      documento: p.documento,
      detalle: p.detalle
    };
    await api.put(`/kardex/actualizar/${p.id}`, body);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

export async function EliminarKardex(id) {
  try {
    await api.delete(`/kardex/eliminar/${id}`);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

export async function RegistrarMovimientoKardex(p) {
  try {
    const body = {
      idProducto: p.id_producto,
      idAlmacen: p.id_almacen,
      tipoMovimiento: p.tipo_movimiento,
      cantidad: p.cantidad,
      precioUnitario: p.precio_unitario || 0,
      idUsuario: p.id_usuario || null,
      documento: p.documento || "-",
      detalle: p.detalle || "-"
    };
    const response = await api.post("/kardex/registrar-movimiento", body);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}
