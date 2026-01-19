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
    // TODO: Implement Insert endpoint if needed
    // const { error } = await supabase.from(tabla).insert(p);
}

export async function MostrarUsuariosAsignados(p) {
  // RPC replacement needed if used
  return [];
}
export async function BuscarUsuariosAsignados(p) {
  // RPC replacement needed if used
  return [];
}