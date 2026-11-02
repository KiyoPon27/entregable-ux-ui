import api from "../api/api";

/**
 * CRUD para Multiprecios
 * Backend endpoints: /api/multiprecios
 */

export async function ListarMultiprecios() {
  try {
    const response = await api.get("/multiprecios/listar");
    return response.data || [];
  } catch (error) {
    console.error("Error al listar multiprecios:", error);
    return [];
  }
}

export async function ListarMultipreciosPorProducto(idProducto) {
  try {
    const response = await api.get(`/multiprecios/producto/${idProducto}`);
    return response.data || [];
  } catch (error) {
    console.error("Error al listar multiprecios por producto:", error);
    return [];
  }
}

export async function ObtenerPrecioPorCantidad(p) {
  try {
    const response = await api.get("/multiprecios/precio-por-cantidad", {
      params: {
        idProducto: p.id_producto,
        cantidad: p.cantidad
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener precio por cantidad:", error);
    throw new Error(error.response?.data?.message || error.message);
  }
}

export async function CrearMultiprecio(p) {
  try {
    const body = {
      producto: { id: p.id_producto },
      cantidadMinima: p.cantidad_minima,
      cantidadMaxima: p.cantidad_maxima || null,
      precio: p.precio,
      activo: p.activo !== false
    };
    const response = await api.post("/multiprecios/crear", body);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

export async function ActualizarMultiprecio(p) {
  try {
    const body = {
      producto: p.id_producto ? { id: p.id_producto } : undefined,
      cantidadMinima: p.cantidad_minima,
      cantidadMaxima: p.cantidad_maxima,
      precio: p.precio,
      activo: p.activo
    };
    await api.put(`/multiprecios/actualizar/${p.id}`, body);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

export async function EliminarMultiprecio(id) {
  try {
    await api.delete(`/multiprecios/eliminar/${id}`);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

export async function ActivarDesactivarMultiprecio(p) {
  try {
    const body = {
      activo: p.activo
    };
    await api.put(`/multiprecios/actualizar/${p.id}`, body);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}
