import Swal from "sweetalert2";
import api from "../api/api";

export async function MostrarTipoComprobantes() {
  try {
    const response = await api.get("/tipo-comprobantes");
    return response.data;
  } catch (error) {
    console.error("Error al mostrar tipos de comprobante:", error);
    return [];
  }
}

export async function MostrarTipoComprobantesPorDestino(destino) {
  try {
    const response = await api.get(`/tipo-comprobantes/destino/${destino}`);
    return response.data;
  } catch (error) {
    console.error("Error al mostrar tipos de comprobante por destino:", error);
    return [];
  }
}

export async function InsertarTipoComprobante(p) {
  try {
    const tipoComprobante = {
      nombre: p.nombre,
      destino: p.destino
    };
    
    const response = await api.post("/tipo-comprobantes", tipoComprobante);
    
    Swal.fire({
      icon: "success",
      title: "¡Tipo de comprobante creado!",
      text: "El tipo de comprobante se ha creado exitosamente",
      timer: 2000,
      showConfirmButton: false
    });
    
    return response.data;
  } catch (error) {
    const mensaje = error.response?.data?.message || error.message;
    Swal.fire({
      icon: "error",
      title: "Error al crear tipo de comprobante",
      text: mensaje,
    });
    throw new Error(mensaje);
  }
}

export async function EditarTipoComprobante(p) {
  try {
    const tipoComprobante = {
      nombre: p.nombre,
      destino: p.destino
    };
    
    const response = await api.put(`/tipo-comprobantes/${p.id}`, tipoComprobante);
    
    Swal.fire({
      icon: "success",
      title: "¡Tipo de comprobante actualizado!",
      text: "El tipo de comprobante se ha actualizado exitosamente",
      timer: 2000,
      showConfirmButton: false
    });
    
    return response.data;
  } catch (error) {
    const mensaje = error.response?.data?.message || error.message;
    Swal.fire({
      icon: "error",
      title: "Error al editar tipo de comprobante",
      text: mensaje,
    });
    throw new Error(mensaje);
  }
}

export async function EliminarTipoComprobante(p) {
  try {
    await api.delete(`/tipo-comprobantes/${p.id}`);
    
    Swal.fire({
      icon: "success",
      title: "¡Tipo de comprobante eliminado!",
      text: "El tipo de comprobante se ha eliminado exitosamente",
      timer: 2000,
      showConfirmButton: false
    });
  } catch (error) {
    const mensaje = error.response?.data?.message || error.message;
    Swal.fire({
      icon: "error",
      title: "Error al eliminar tipo de comprobante",
      text: mensaje,
    });
    throw new Error(mensaje);
  }
}
