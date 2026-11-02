import api from "../api/api";
import Swal from "sweetalert2";

export async function MostrarMetodosPago(p) {
  try {
    const response = await api.get(`/metodos-pago/empresa/${p.id_empresa}`);
    return response.data;
  } catch (error) {
    console.error("Error al mostrar métodos de pago:", error);
    return [];
  }
}

export async function InsertarMetodosPago(p, file) {
  try {
    const metodoPago = {
      nombre: p.nombre || p._nombre,
      icono: p.icono || p._icono || "-",
      color: p.color || p._color || "#F44336",
      verNombre: p.ver_nombre !== undefined ? p.ver_nombre : true,
      eliminarActualizar: p.eliminar_actualizar || false,
      empresa: { id: p.id_empresa || p.idEmpresa }
    };
    
    const response = await api.post("/metodos-pago", metodoPago);
    
    Swal.fire({
      icon: "success",
      title: "¡Éxito!",
      text: "Método de pago creado correctamente",
      timer: 1500,
      showConfirmButton: false
    });
    
    return response.data;
  } catch (error) {
    const mensaje = error.response?.data?.message || error.message || "Error al crear método de pago";
    Swal.fire({
      icon: "error",
      title: "Error",
      text: mensaje
    });
    throw new Error(mensaje);
  }
}

export async function EditarMetodosPago(p, fileold, filenew) {
  try {
    const metodoPago = {
      nombre: p.nombre || p._nombre,
      icono: p.icono || p._icono || "-",
      color: p.color || p._color || undefined,
      verNombre: p.ver_nombre !== undefined ? p.ver_nombre : undefined,
      eliminarActualizar: p.eliminar_actualizar !== undefined ? p.eliminar_actualizar : undefined
    };
    
    const id = p.id || p._id;
    await api.put(`/metodos-pago/${id}`, metodoPago);
    
    Swal.fire({
      icon: "success",
      title: "¡Actualizado!",
      text: "Método de pago actualizado correctamente",
      timer: 1500,
      showConfirmButton: false
    });
  } catch (error) {
    const mensaje = error.response?.data?.message || error.message || "Error al actualizar método de pago";
    Swal.fire({
      icon: "error",
      title: "Error",
      text: mensaje
    });
    throw new Error(mensaje);
  }
}

export async function EliminarMetodosPago(p) {
  try {
    await api.delete(`/metodos-pago/${p.id}`);
    
    Swal.fire({
      icon: "success",
      title: "¡Eliminado!",
      text: "Método de pago eliminado correctamente",
      timer: 1500,
      showConfirmButton: false
    });
  } catch (error) {
    const mensaje = error.response?.data?.message || error.message || "Error al eliminar método de pago";
    Swal.fire({
      icon: "error",
      title: "Error",
      text: mensaje
    });
    throw new Error(mensaje);
  }
}

export async function DeshabilitarMetodosPago(p) {
  try {
    await api.put(`/metodos-pago/${p.id}/deshabilitar`);

    Swal.fire({
      icon: "success",
      title: "Deshabilitado",
      text: "Método de pago deshabilitado correctamente",
      timer: 1500,
      showConfirmButton: false
    });
  } catch (error) {
    const mensaje = error.response?.data?.message || error.message || "Error al deshabilitar método de pago";
    Swal.fire({
      icon: "error",
      title: "Error",
      text: mensaje
    });
    throw new Error(mensaje);
  }
}

export async function HabilitarMetodosPago(p) {
  try {
    await api.put(`/metodos-pago/${p.id}/habilitar`);

    Swal.fire({
      icon: "success",
      title: "Habilitado",
      text: "Método de pago habilitado correctamente",
      timer: 1500,
      showConfirmButton: false
    });
  } catch (error) {
    const mensaje = error.response?.data?.message || error.message || "Error al habilitar método de pago";
    Swal.fire({
      icon: "error",
      title: "Error",
      text: mensaje
    });
    throw new Error(mensaje);
  }
}

export async function BuscarMetodosPago(p) {
  try {
    if (!p.descripcion) {
      return await MostrarMetodosPago(p);
    }
    
    const response = await api.get(`/metodos-pago/buscar/${p.id_empresa}?q=${p.descripcion}`);
    return response.data;
  } catch (error) {
    console.error("Error al buscar métodos de pago:", error);
    return [];
  }
}
