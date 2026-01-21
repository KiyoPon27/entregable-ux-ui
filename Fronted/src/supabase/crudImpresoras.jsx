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

export async function MostrarImpresoraXCaja(p) {
  try {
    const response = await api.get(`/impresoras/caja/${p.id_caja}`);
    return response.data || null;
  } catch (error) {
    console.error("Error al mostrar impresora por caja:", error);
    return null;
  }
}

export async function InsertarImpresora(p) {
  try {
    const body = {
      caja: { id: p.id_caja },
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