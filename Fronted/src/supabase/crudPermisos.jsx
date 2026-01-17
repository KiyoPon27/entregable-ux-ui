import api from "../api/api";

export async function MostrarPermisos(p) {
  if (!p?.id_usuario) return [];
  try {
    const response = await api.get(`/permisos/mostrar`, {
      params: { idUsuario: p.id_usuario }
    });
    return response.data || [];
  } catch (error) {
    console.error("Error al mostrar permisos:", error);
    return [];
  }
}

export async function MostrarPermisosConfiguracion(p) {
  if (!p?.id_usuario) return [];
  try {
    // Usar endpoint general de módulos y filtrar en frontend
    const response = await api.get(`/modulos/mostrar`);
    
    const todosModulos = response.data || [];
    
    // Filtrar solo los que tienen etiqueta #configuracion
    const modulosConfig = todosModulos.filter(m => m.etiquetas === '#configuracion');
    
    // Transformar formato para que coincida con la estructura esperada
    // De: { id, nombre, icono, ... }
    // A: { modulos: { id, nombre, icono, ... } }
    return modulosConfig.map(m => ({ modulos: m }));
  } catch (error) {
    console.error("Error al mostrar permisos configuración:", error);
    return [];
  }
}

export async function MostrarPermisosDefault() {
  try {
    const response = await api.get(`/permisos/default`);
    return response.data || [];
  } catch (error) {
    console.error("Error al mostrar permisos default:", error);
    return [];
  }
}

export async function InsertarPermisos(p) {
  try {
    await api.post(`/permisos/insertar`, p);
  } catch (error) {
    throw new Error(error.response?.data || error.message || "Error al insertar permisos");
  }
}

export async function EliminarPermisos(p) {
  if (!p?.id_usuario) return null;
  try {
    await api.delete(`/permisos/eliminar/${p.id_usuario}`);
  } catch (error) {
    throw new Error(error.response?.data || error.message || "Error al eliminar permisos");
  }
}

export async function MostrarPermisosGlobales(p) {
  if (!p?.id_usuario) return [];
  try {
    const response = await api.get(`/permisos/globales`, {
      params: { idUsuario: p.id_usuario }
    });
    return response.data || [];
  } catch (error) {
    console.error("Error al mostrar permisos globales:", error);
    return [];
  }
}
