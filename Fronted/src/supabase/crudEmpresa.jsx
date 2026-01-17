import Swal from "sweetalert2";
import api from "../api/api";

export async function InsertarEmpresa(p) {
  try {
    const response = await api.post("/empresas/insertar", p);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || error.message || "Error al insertar empresa");
  }
}

export async function MostrarEmpresaXidsuario(p) {
  try {
    console.log("🔍 Buscando empresa con parámetro:", p);
    // Usar el idUsuario para obtener la empresa
    const response = await api.get("/empresas/mostrar", {
      params: { idUsuario: p._id_usuario }
    });
    console.log("✅ Empresa encontrada:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error al obtener empresa:", error);
    return null;
  }
}

export async function EditarMonedaEmpresa(p){
  try {
    await api.put(`/empresas/editar/${p.id}`, p);
  } catch (error) {
    throw new Error(error.response?.data || error.message || "Error al editar moneda");
  }
}

export async function EditarLogoEmpresa(p){
  try {
    await api.put(`/empresas/editar/${p.id}`, p);
  } catch (error) {
    throw new Error(error.response?.data || error.message || "Error al editar logo");
  }
}

export async function EditarEmpresa(p, fileold, filenew){
  try {
    await api.put(`/empresas/editar/${p.id}`, p);
    
    // TODO: Implementar subida de imágenes (Cloudinary o local)
    if (filenew !== "-" && filenew?.size !== undefined) {
      console.warn("Subida de imágenes pendiente de implementar");
      // Por ahora solo guardamos la empresa sin imagen
    }
  } catch (error) {
    throw new Error(error.response?.data || error.message || "Error al editar empresa");
  }
}

// Las funciones de storage se implementarán después con Cloudinary o similar
export async function EditarIconoStorage(id, file){
  console.warn("EditarIconoStorage: Función pendiente de migrar");
}
