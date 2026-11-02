import api from "../api/api";

export async function EditarImpresoras(p) {
  try {
    const body = {
      nombrePc: p.nombre_pc || p.pc_name || "-",
      ipLocal: p.ip_local || "-",
      estado: p.estado === true || p.state === true,
      nombre: p.nombre || p.name || "-"
    };
    await api.put(`/impresoras/${p.id}`, body);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

export async function MostrarImpresoraXUsuario(p) {
  try {
    const response = await api.get(`/impresoras/usuario/${p.id_usuario}`);
    return response.data || null;
  } catch (error) {
    console.error("Error al mostrar impresora por usuario:", error);
    return null;
  }
}

export async function InsertarImpresora(p) {
  try {
    const body = {
      usuario: { id: p.id_usuario },
      nombrePc: p.nombre_pc || p.pc_name || "-",
      ipLocal: p.ip_local || "-",
      estado: p.estado === true || p.state === true,
      nombre: p.nombre || p.name || "-"
    };
    const response = await api.post("/impresoras", body);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}