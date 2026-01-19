import Swal from "sweetalert2";
import api from "../api/api";

export async function MostrarSerializaciones(p) {
  try {
    let response;
    if (p.id_sucursal) {
      response = await api.get(`/serializaciones/sucursal/${p.id_sucursal}`);
    } else if (p.id_empresa) {
      response = await api.get(`/serializaciones/empresa/${p.id_empresa}`);
    } else {
      return [];
    }
    return response.data;
  } catch (error) {
    console.error("Error al mostrar serializaciones:", error);
    return [];
  }
}

export async function MostrarSerializacionesVentas(p) {
  try {
    const response = await api.get(`/serializaciones/sucursal/${p.id_sucursal}/destino/ventas`);
    return response.data;
  } catch (error) {
    console.error("Error al mostrar serializaciones de ventas:", error);
    return [];
  }
}

export async function InsertarSerializacion(p) {
  try {
    const serializacion = {
      serie: p.serie,
      cantidadNumeros: p.cantidad_numeros || 8,
      correlativo: p.correlativo || 1,
      porDefecto: p.por_defecto || false,
      tipoComprobante: { id: p.id_tipo_comprobante },
      sucursal: { id: p.sucursal_id }
    };
    
    const response = await api.post("/serializaciones", serializacion);
    
    Swal.fire({
      icon: "success",
      title: "¡Serialización creada!",
      text: "La serialización se ha creado exitosamente",
      timer: 2000,
      showConfirmButton: false
    });
    
    return response.data;
  } catch (error) {
    const mensaje = error.response?.data?.message || error.message;
    Swal.fire({
      icon: "error",
      title: "Error al crear serialización",
      text: mensaje,
    });
    throw new Error(mensaje);
  }
}

export async function EditarSerializacion(p) {
  try {
    const serializacion = {
      serie: p.serie,
      cantidadNumeros: p.cantidad_numeros,
      correlativo: p.correlativo
    };
    
    const response = await api.put(`/serializaciones/${p.id}`, serializacion);
    
    Swal.fire({
      icon: "success",
      title: "¡Serialización actualizada!",
      text: "La serialización se ha actualizado exitosamente",
      timer: 2000,
      showConfirmButton: false
    });
    
    return response.data;
  } catch (error) {
    const mensaje = error.response?.data?.message || error.message;
    Swal.fire({
      icon: "error",
      title: "Error al editar serialización",
      text: mensaje,
    });
    throw new Error(mensaje);
  }
}

export async function EditarSerializacionDefault(p) {
  try {
    await api.put(`/serializaciones/${p.id}/establecer-defecto`);
    
    Swal.fire({
      icon: "success",
      title: "¡Serialización por defecto establecida!",
      text: "La serialización se ha establecido como predeterminada",
      timer: 2000,
      showConfirmButton: false
    });
  } catch (error) {
    const mensaje = error.response?.data?.message || error.message;
    Swal.fire({
      icon: "error",
      title: "Error al establecer por defecto",
      text: mensaje,
    });
    throw new Error(mensaje);
  }
}

export async function ObtenerSiguienteNumero(id) {
  try {
    const response = await api.get(`/serializaciones/${id}/siguiente-numero`);
    return response.data.numeroComprobante;
  } catch (error) {
    console.error("Error al obtener siguiente número:", error);
    throw new Error(error.response?.data?.message || error.message);
  }
}

export async function EliminarSerializacion(p) {
  try {
    await api.delete(`/serializaciones/${p.id}`);
    
    Swal.fire({
      icon: "success",
      title: "¡Serialización eliminada!",
      text: "La serialización se ha eliminado exitosamente",
      timer: 2000,
      showConfirmButton: false
    });
  } catch (error) {
    const mensaje = error.response?.data?.message || error.message;
    Swal.fire({
      icon: "error",
      title: "Error al eliminar serialización",
      text: mensaje,
    });
    throw new Error(mensaje);
  }
}
