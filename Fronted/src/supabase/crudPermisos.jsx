import api from "../api/api";

export async function MostrarPermisos(p) {
  if (!p?.id_usuario) return [];
  try {
    const response = await api.get(`/permisos/usuario/${p.id_usuario}`);
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
    // Backend devuelve: [{id, rol: {id, nombre}, modulo: {id, nombre, ...}}]
    // Transformar a formato esperado: [{id, id_rol, id_modulo}]
    const data = response.data || [];
    return data.map(p => ({
      id: p.id,
      id_rol: p.rol?.id,
      id_modulo: p.modulo?.id
    }));
  } catch (error) {
    console.error("Error al mostrar permisos default:", error);
    return [];
  }
}

export async function InsertarPermisos(p) {
  try {
    const permiso = {
      id_usuario: p.id_usuario,
      idmodulo: p.idmodulo
    };
    await api.post(`/permisos`, permiso);
  } catch (error) {
    console.error("Error al insertar permiso:", error);
    throw new Error(error.response?.data?.message || error.message || "Error al insertar permisos");
  }
}

export async function EliminarPermisos(p) {
  if (!p?.id_usuario) return null;
  try {
    await api.delete(`/permisos/usuario/${p.id_usuario}`);
  } catch (error) {
    console.error("Error al eliminar permisos:", error);
    throw new Error(error.response?.data?.message || error.message || "Error al eliminar permisos");
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
