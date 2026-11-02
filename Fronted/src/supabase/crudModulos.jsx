import api from "../api/api";

export async function MostrarModulos() {
  try {
    const response = await api.get("/modulos");
    // Filtrar igual que Supabase: neq("etiquetas","#default")
    return response.data.filter(m => m.etiquetas !== "#default");
  } catch (error) {
    console.error("Error al mostrar módulos:", error);
    return [];
  }
}

