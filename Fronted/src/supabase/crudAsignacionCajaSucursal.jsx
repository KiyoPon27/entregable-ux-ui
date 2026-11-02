import api from "../api/api";
const tabla = "asignacion_sucursal";

export async function MostrarSucursalCajaAsignada(p) {
  if (!p?.id_usuario) return null;
  try {
    const response = await api.get(`/asignacion-sucursal/usuario/${p.id_usuario}`);
    // Backend returns list of AsignacionSucursal objects
    // Frontend expects: { ..., sucursales: { ... }, caja: { ... } }
    // Java returns: { ..., sucursal: { ... }, caja: { ... } }
    // We need to map 'sucursal' to 'sucursales' (plural) to match existing code usage.
    const mapped = response.data.map(item => ({
        ...item,
        sucursales: item.sucursal, // alias for compat
    }));
    return mapped;
  } catch (error) {
    console.error("Error al mostrar asignaciones:", error);
    return [];
  }
}

export async function InsertarAsignacionCajaSucursal(p) {
  // Espera: { id_sucursal, id_usuario, id_caja }
  try {
    const body = {
      usuario: { id: p.id_usuario },
      sucursal: { id: p.id_sucursal },
      caja: p.id_caja ? { id: p.id_caja } : null
    };
    const response = await api.post("/asignacion-sucursal", body);
    return response.data;
  } catch (error) {
    console.error("Error al insertar asignación sucursal/caja:", error);
    throw new Error(error.response?.data?.message || error.message);
  }
}

export async function MostrarUsuariosAsignados(p) {
  // RPC replacement needed if used
  return [];
}
export async function BuscarUsuariosAsignados(p) {
  // RPC replacement needed if used
  return [];
}