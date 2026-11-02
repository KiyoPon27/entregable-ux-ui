import Swal from "sweetalert2";
import api from "../api/api";

export async function MostrarSucursales(p) {
  try {
    const response = await api.get(`/sucursales/empresa/${p.id_empresa}`);
    return response.data;
  } catch (error) {
    console.error("Error al mostrar sucursales:", error);
    throw new Error(error.response?.data?.message || error.message);
  }
}

export async function MostrarSucursalesAsignadasXuser(p) {
  // TODO: Implementar en backend cuando se migre AsignacionSucursal
  console.warn("MostrarSucursalesAsignadasXuser aún no implementado en backend");
  return [];
}

export async function MostrarCajasXSucursal(p) {
  try {
    const response = await api.get(`/sucursales/empresa/${p.id_empresa}/con-cajas`);
    return response.data;
  } catch (error) {
    console.error("Error al mostrar cajas por sucursal:", error);
    return [];
  }
}

export async function InsertarSucursal(p) {
  try {
    const sucursal = {
      nombre: p.nombre,
      direccionFiscal: p.direccion_fiscal || "",
      empresa: { id: p.id_empresa },
      eliminar: p.eliminar !== undefined ? p.eliminar : true
    };
    
    const response = await api.post("/sucursales", sucursal);
    
    Swal.fire({
      icon: "success",
      title: "¡Sucursal creada!",
      text: "La sucursal se ha creado exitosamente",
      timer: 2000,
      showConfirmButton: false
    });
    
    return response.data;
  } catch (error) {
    const mensaje = error.response?.data?.message || error.message;
    Swal.fire({
      icon: "error",
      title: "Error al crear sucursal",
      text: mensaje,
    });
    throw new Error(mensaje);
  }
}

export async function EditarSucursal(p) {
  try {
    const sucursal = {
      nombre: p.nombre,
      direccionFiscal: p.direccion_fiscal || "",
      eliminar: p.eliminar
    };
    
    const response = await api.put(`/sucursales/${p.id}`, sucursal);
    
    Swal.fire({
      icon: "success",
      title: "¡Sucursal actualizada!",
      text: "La sucursal se ha actualizado exitosamente",
      timer: 2000,
      showConfirmButton: false
    });
    
    return response.data;
  } catch (error) {
    const mensaje = error.response?.data?.message || error.message;
    Swal.fire({
      icon: "error",
      title: "Error al editar sucursal",
      text: mensaje,
    });
    throw new Error(mensaje);
  }
}

export async function EliminarSucursal(p) {
  try {
    await api.delete(`/sucursales/${p.id}`);
    
    Swal.fire({
      icon: "success",
      title: "¡Sucursal eliminada!",
      text: "La sucursal se ha eliminado exitosamente",
      timer: 2000,
      showConfirmButton: false
    });
  } catch (error) {
    const mensaje = error.response?.data?.message || error.message;
    Swal.fire({
      icon: "error",
      title: "Error al eliminar sucursal",
      text: mensaje,
    });
    throw new Error(mensaje);
  }
}
