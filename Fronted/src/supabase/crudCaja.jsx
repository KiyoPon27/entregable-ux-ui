import Swal from "sweetalert2";
import api from "../api/api";

export async function MostrarCajaXSucursal(p) {
  try {
    const response = await api.get(`/cajas/sucursal/${p.id_sucursal}`);
    return response.data;
  } catch (error) {
    console.error("Error al mostrar cajas:", error);
    return [];
  }
}

export async function InsertarCaja(p) {
  try {
    const caja = {
      descripcion: p.descripcion,
      sucursal: { id: p.id_sucursal },
      eliminar: p.eliminar !== undefined ? p.eliminar : true,
      imprimir: p.imprimir !== undefined ? p.imprimir : false,
      idUsuarioCreador: p.idUsuarioCreador
    };
    
    const response = await api.post("/cajas", caja);
    
    Swal.fire({
      icon: "success",
      title: "¡Caja creada!",
      text: "La caja se ha creado exitosamente",
      timer: 2000,
      showConfirmButton: false
    });
    
    return response.data;
  } catch (error) {
    const mensaje = error.response?.data?.message || error.message;
    Swal.fire({
      icon: "error",
      title: "Error al crear caja",
      text: mensaje,
    });
    throw new Error(mensaje);
  }
}

export async function EditarCaja(p) {
  try {
    const caja = {
      descripcion: p.descripcion,
      eliminar: p.eliminar,
      imprimir: p.imprimir
    };
    
    const response = await api.put(`/cajas/${p.id}`, caja);
    
    Swal.fire({
      icon: "success",
      title: "¡Caja actualizada!",
      text: "La caja se ha actualizado exitosamente",
      timer: 2000,
      showConfirmButton: false
    });
    
    return response.data;
  } catch (error) {
    const mensaje = error.response?.data?.message || error.message;
    Swal.fire({
      icon: "error",
      title: "Error al editar caja",
      text: mensaje,
    });
    throw new Error(mensaje);
  }
}

export async function EliminarCaja(p) {
  try {
    await api.delete(`/cajas/${p.id}`);
    
    Swal.fire({
      icon: "success",
      title: "¡Caja eliminada!",
      text: "La caja se ha eliminado exitosamente",
      timer: 2000,
      showConfirmButton: false
    });
  } catch (error) {
    const mensaje = error.response?.data?.message || error.message;
    Swal.fire({
      icon: "error",
      title: "Error al eliminar caja",
      text: mensaje,
    });
    throw new Error(mensaje);
  }
}
