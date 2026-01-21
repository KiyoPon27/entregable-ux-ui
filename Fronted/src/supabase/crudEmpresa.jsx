import Swal from "sweetalert2";
import api from "../api/api";

export async function InsertarEmpresa(p) {
  try {
    const response = await api.post("/empresas", p);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || error.message || "Error al insertar empresa");
  }
}

export async function MostrarEmpresaXidsuario(p) {
  try {
    console.log("🔍 Buscando empresa con parámetro:", p);
    // Usar el idUsuario para obtener la empresa
    const idUsuario = p?.id_usuario || p?.idUsuario || Number(localStorage.getItem("user_id"));
    const response = await api.get("/empresas/mostrar", {
      params: { idUsuario }
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
    await api.put(`/empresas/${p.id}`, p);
  } catch (error) {
    throw new Error(error.response?.data || error.message || "Error al editar moneda");
  }
}

export async function EditarLogoEmpresa(p){
  try {
    await api.put(`/empresas/${p.id}`, p);
  } catch (error) {
    throw new Error(error.response?.data || error.message || "Error al editar logo");
  }
}

export async function EditarEmpresa(p, fileold, filenew){
  try {
    console.log("📝 EditarEmpresa - Datos recibidos:", {
      empresa: p,
      tieneFileNew: !!filenew,
      tipoFileNew: typeof filenew,
      esFile: filenew instanceof File
    });
    
    const empresaData = { ...p };
    
    // Si hay un nuevo archivo de imagen, agregarlo como base64 comprimido
    if (filenew && filenew !== "-" && filenew instanceof File) {
      console.log("🖼️ Procesando imagen...");
      try {
        // Comprimir la imagen antes de convertirla a base64
        const compressedBase64 = await compressImage(filenew);
        console.log("✅ Imagen procesada, tamaño final:", compressedBase64.length, "caracteres");
        empresaData.logo = compressedBase64;
      } catch (imgError) {
        console.error("❌ Error al procesar imagen:", imgError);
        throw new Error("No se pudo procesar la imagen");
      }
    } else if (typeof filenew === 'string' && filenew.startsWith('data:image')) {
      console.log("🖼️ Usando base64 existente");
      empresaData.logo = filenew;
    } else {
      console.log("📷 No hay cambios en el logo");
    }
    
    console.log("🚀 Enviando actualización al backend...");
    const response = await api.put(`/empresas/${p.id}`, empresaData);
    console.log("✅ Empresa actualizada correctamente", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error al editar empresa:", error);
    
    // Extraer mensaje de error legible
    let errorMessage = "Error al editar empresa";
    
    if (error.response?.data) {
      // Si el backend devolvió un mensaje
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data.error) {
        errorMessage = error.response.data.error;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    console.error("💥 Mensaje de error final:", errorMessage);
    throw new Error(errorMessage);
  }
}

// Función para comprimir imagen antes de convertir a base64
async function compressImage(file, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Crear canvas para redimensionar
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Redimensionar si es muy grande
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir a base64 con compresión
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        
        console.log("📊 Imagen original:", file.size, "bytes");
        console.log("📊 Imagen comprimida:", compressedBase64.length, "caracteres");
        console.log("📊 Reducción:", ((1 - compressedBase64.length / (file.size * 1.37)) * 100).toFixed(1) + "%");
        
        resolve(compressedBase64);
      };
      
      img.onerror = reject;
      img.src = e.target.result;
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Las funciones de storage se implementarán después con Cloudinary o similar
export async function EditarIconoStorage(id, file){
  console.warn("EditarIconoStorage: Función pendiente de migrar");
}
