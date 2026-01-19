import Swal from "sweetalert2";
import api from "../api/api";

export async function MostrarUsuarios() {
  try {
    const response = await api.get("/usuarios");
    return response.data;
  } catch (error) {
    console.error("Error al mostrar usuarios:", error);
    return [];
  }
}

export async function MostrarUsuarioPorId(id) {
  try {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al mostrar usuario:", error);
    throw new Error(error.response?.data?.message || error.message);
  }
}

export async function MostrarUsuarioPorCorreo(correo) {
  try {
    const response = await api.get(`/usuarios/correo/${correo}`);
    return response.data;
  } catch (error) {
    console.error("Error al buscar usuario por correo:", error);
    throw new Error(error.response?.data?.message || error.message);
  }
}

export async function InsertarUsuarios(p) {
  try {
    const usuario = {
      nombres: p.nombres,
      nroDoc: p.nro_doc || "-",
      telefono: p.telefono || "-",
      rol: p.id_rol ? { id: p.id_rol } : null,
      correo: p.correo,
      password: p.password || "123",
      estado: p.estado || "ACTIVO",
      tema: p.tema || "light",
      idAuth: p.id_auth,
      tipoDocumento: p.id_tipodocumento ? { id: p.id_tipodocumento } : null
    };
    
    const response = await api.post("/usuarios", usuario);
    
    Swal.fire({
      icon: "success",
      title: "¡Usuario creado!",
      text: "El usuario se ha creado exitosamente",
      timer: 2000,
      showConfirmButton: false
    });
    
    return response.data;
  } catch (error) {
    const mensaje = error.response?.data?.message || error.message;
    Swal.fire({
      icon: "error",
      title: "Error al crear usuario",
      text: mensaje,
    });
    throw new Error(mensaje);
  }
}

export async function EditarUsuarios(p) {
  try {
    const usuario = {
      nombres: p.nombres,
      nroDoc: p.nro_doc,
      telefono: p.telefono,
      rol: p.id_rol ? { id: p.id_rol } : undefined,
      correo: p.correo,
      estado: p.estado,
      tema: p.tema,
      tipoDocumento: p.id_tipodocumento ? { id: p.id_tipodocumento } : undefined
    };
    
    const response = await api.put(`/usuarios/${p.id}`, usuario);
    
    Swal.fire({
      icon: "success",
      title: "¡Usuario actualizado!",
      text: "El usuario se ha actualizado exitosamente",
      timer: 2000,
      showConfirmButton: false
    });
    
    return response.data;
  } catch (error) {
    const mensaje = error.response?.data?.message || error.message;
    Swal.fire({
      icon: "error",
      title: "Error al editar usuario",
      text: mensaje,
    });
    throw new Error(mensaje);
  }
}

export async function CambiarPasswordUsuario(p) {
  try {
    await api.put(`/usuarios/${p.id}/cambiar-password`, {
      password: p.password
    });
    
    Swal.fire({
      icon: "success",
      title: "¡Contraseña actualizada!",
      text: "La contraseña se ha cambiado exitosamente",
      timer: 2000,
      showConfirmButton: false
    });
  } catch (error) {
    const mensaje = error.response?.data?.message || error.message;
    Swal.fire({
      icon: "error",
      title: "Error al cambiar contraseña",
      text: mensaje,
    });
    throw new Error(mensaje);
  }
}

export async function EliminarUsuario(p) {
  try {
    await api.delete(`/usuarios/${p.id}`);
    
    Swal.fire({
      icon: "success",
      title: "¡Usuario eliminado!",
      text: "El usuario se ha eliminado exitosamente",
      timer: 2000,
      showConfirmButton: false
    });
  } catch (error) {
    const mensaje = error.response?.data?.message || error.message;
    Swal.fire({
      icon: "error",
      title: "Error al eliminar usuario",
      text: mensaje,
    });
    throw new Error(mensaje);
  }
}

// Mantener compatibilidad con código antiguo
export async function EliminarUsuarioAsignado(p) {
  return EliminarUsuario(p);
}

export async function InsertarAdmin(p) {
  return InsertarUsuarios(p);
}