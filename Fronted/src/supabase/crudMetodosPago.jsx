import api from "../api/api";

export async function MostrarMetodosPago(p) {
  try {
    const response = await api.get(`/metodos-pago/empresa/${p.id_empresa}`);
    return response.data || [];
  } catch (error) {
    console.error("Error al mostrar métodos de pago:", error);
    return [];
  }
}
export async function InsertarMetodosPago(p, file) {
  try {
    const body = {
      nombre: p.nombre,
      empresa: { id: p.id_empresa },
      icono: p.icono || "-",
      verNombre: p.ver_nombre !== false,
      eliminarActualizar: p.delete_update === true
    };
    const response = await api.post("/metodos-pago", body);
    // TODO: Si necesitas subir imágenes, implementar con multipart/form-data
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

export async function EditarMetodosPago(p, fileold, filenew) {
  try {
    const body = {
      nombre: p.nombre,
      icono: p.icono || "-",
      verNombre: p.ver_nombre !== false,
      eliminarActualizar: p.delete_update === true
    };
    await api.put(`/metodos-pago/${p.id || p._id}`, body);
    // TODO: Si necesitas subir imágenes, implementar con multipart/form-data
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}
