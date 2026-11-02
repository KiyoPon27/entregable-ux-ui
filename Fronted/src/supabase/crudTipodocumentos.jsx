import api from "../api/api";

export async function MostrarTipoDocumentos(p) {
  try {
    const response = await api.get(`/tipo-documentos/empresa/${p.id_empresa}`);
    return response.data || [];
  } catch (error) {
    console.error("Error al mostrar tipos de documento:", error);
    return [];
  }
}

export async function InsertarTipoDocumento(p) {
  try {
    const body = {
      nombre: p.nombre,
      idEmpresa: p.id_empresa
    };
    const response = await api.post("/tipo-documentos/crear", body);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

export async function EditarTipoDocumento(p) {
  try {
    const body = {
      nombre: p.nombre,
      idEmpresa: p.id_empresa
    };
    await api.put(`/tipo-documentos/actualizar/${p.id}`, body);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

export async function EliminarTipoDocumento(p) {
  try {
    await api.delete(`/tipo-documentos/eliminar/${p.id}`);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}
