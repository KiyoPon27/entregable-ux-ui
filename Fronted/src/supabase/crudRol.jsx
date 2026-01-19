import api from "../api/api";

export async function MostrarRolesXnombre(p) {
  try {
    const response = await api.get("/roles");
    const roles = response.data;
    return roles.find(r => r.nombre === p.nombre) || null;
  } catch (error) {
    console.error("Error al buscar rol:", error);
    return null;
  }
}

export async function MostrarRoles() {
  try {
    const response = await api.get("/roles");
    // Filtrar superadmin igual que Supabase
    return response.data.filter(r => r.nombre !== "superadmin");
  } catch (error) {
    console.error("Error al mostrar roles:", error);
    return [];
  }
}