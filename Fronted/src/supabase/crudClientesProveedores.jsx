import Swal from "sweetalert2";
import api from "../api/api";

export async function InsertarClientesProveedores(p) {
  try {
    const body = {
      nombres: p.nombres,
      empresa: { id: p.id_empresa },
      direccion: p.direccion || "-",
      telefono: p.telefono || "-",
      email: p.email || "-",
      identificadorNacional: p.identificador_nacional || "-",
      identificadorFiscal: p.identificador_fiscal || "-",
      tipo: p.tipo || "-",
      estado: p.estado || "activo"
    };
    const response = await api.post("/clientes-proveedores", body);
    return response.data;
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.response?.data?.message || error.message,
    });
    return;
  }
}

export async function MostrarClientesProveedores(p) {
  try {
    const response = await api.get(`/clientes-proveedores/empresa/${p.id_empresa}/tipo/${p.tipo}`);
    return response.data || [];
  } catch (error) {
    console.error("Error al mostrar clientes/proveedores:", error);
    return [];
  }
}

export async function BuscarClientesProveedores(p) {
  try {
    const q = encodeURIComponent(p.buscador || "");
    const response = await api.get(`/clientes-proveedores/buscar/${p.id_empresa}?tipo=${p.tipo}&q=${q}`);
    return response.data || [];
  } catch (error) {
    console.error("Error al buscar clientes/proveedores:", error);
    return [];
  }
}

export async function EliminarClientesProveedores(p) {
  try {
    await api.delete(`/clientes-proveedores/${p.id}`);
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error.response?.data?.message || error.message,
    });
    return;
  }
}

export async function EditarClientesProveedores(p) {
  try {
    const body = {
      nombres: p.nombres,
      direccion: p.direccion || "-",
      telefono: p.telefono || "-",
      email: p.email || "-",
      identificadorNacional: p.identificador_nacional || "-",
      identificadorFiscal: p.identificador_fiscal || "-",
      tipo: p.tipo || "-",
      estado: p.estado || "activo"
    };
    await api.put(`/clientes-proveedores/${p.id}`, body);
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.response?.data?.message || error.message,
    });
    return;
  }
}


