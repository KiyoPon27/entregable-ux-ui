import Swal from "sweetalert2";
import api from "../api/api";

export async function InsertarCategorias(p, file) {
  try {
    const response = await api.post("/categorias", {
      nombre: p._nombre,
      color: p._color,
      icono: p._icono || '-',
      empresa: { id: p.idEmpresa }
    });
    
    Swal.fire({
      icon: "success",
      title: "¡Éxito!",
      text: "Categoría creada correctamente",
      timer: 1500,
      showConfirmButton: false
    });
    
    return response.data;
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error al crear categoría",
      text: error.response?.data || error.message,
    });
  }
}

export async function MostrarCategorias(p) {
  try {
    const response = await api.get(`/categorias/empresa/${p.id_empresa}`);
    return response.data;
  } catch (error) {
    console.error("Error al mostrar categorías:", error);
    return [];
  }
}

export async function BuscarCategorias(p) {
  try {
    // El backend no tiene endpoint de búsqueda, así que filtramos en frontend
    const response = await api.get(`/categorias/empresa/${p.id_empresa}`);
    const categorias = response.data;
    
    // Filtrar por nombre si hay descripción
    if (p.descripcion) {
      return categorias.filter(cat => 
        cat.nombre.toLowerCase().includes(p.descripcion.toLowerCase())
      );
    }
    
    return categorias;
  } catch (error) {
    console.error("Error al buscar categorías:", error);
    return [];
  }
}

export async function EliminarCategorias(p) {
  try {
    await api.delete(`/categorias/${p.id}`);
    Swal.fire({
      icon: "success",
      title: "¡Eliminado!",
      text: "Categoría eliminada correctamente",
      timer: 1500,
      showConfirmButton: false
    });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error al eliminar",
      text: error.response?.data || error.message,
    });
  }
}

export async function EditarCategorias(p, fileold, filenew) {
  try {
    await api.put(`/categorias/${p._id}`, {
      nombre: p._nombre,
      empresa: { id: p.idEmpresa },
      color: p._color || null,
      icono: p._icono || null
    });
    
    Swal.fire({
      icon: "success",
      title: "¡Actualizado!",
      text: "Categoría actualizada correctamente",
      timer: 1500,
      showConfirmButton: false
    });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error al editar",
      text: error.response?.data || error.message,
    });
  }
}
