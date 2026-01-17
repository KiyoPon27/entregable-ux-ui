import api from "../api/api";

export async function InsertarProductos(p) {
  try {
    const producto = {
      nombre: p._nombre,
      precioVenta: parseFloat(p._precio_venta),
      precioCompra: parseFloat(p._precio_compra),
      idCategoria: p._id_categoria,
      codigoBarras: p._codigo_barras || null,
      codigoInterno: p._codigo_interno || null,
      idEmpresa: p._id_empresa,
      sevendePor: p._sevende_por || 'unidad',
      manejaInventarios: p._maneja_inventarios === 1 || p._maneja_inventarios === true,
      manejaMultiprecios: p._maneja_multiprecios === 1 || p._maneja_multiprecios === true
    };
    
    const response = await api.post("/productos/insertar", producto);
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || error.message || "Error al insertar producto");
  }
}

export async function MostrarProductos(p) {
  try {
    const response = await api.get(`/productos/mostrar/${p.id_empresa}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Error al mostrar productos");
  }
}

export async function BuscarProductos(p) {
  try {
    const response = await api.get("/productos/buscar", {
      params: { 
        idEmpresa: p.id_empresa,
        buscador: p.buscador
      }
    });
    return response.data || [];
  } catch (error) {
    // Si no encuentra, retornar array vacío en lugar de error
    if (error.response?.status === 404) {
      return [];
    }
    throw new Error(error.response?.data?.message || error.message || "Error al buscar productos");
  }
}

export async function EliminarProductos(p) {
  try {
    await api.delete(`/productos/eliminar/${p.id}`);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Error al eliminar producto");
  }
}

export async function EditarProductos(p) {
  try {
    const producto = {
      nombre: p._nombre,
      precioVenta: parseFloat(p._precio_venta),
      precioCompra: parseFloat(p._precio_compra),
      idCategoria: p._id_categoria,
      codigoBarras: p._codigo_barras || null,
      codigoInterno: p._codigo_interno || null,
      idEmpresa: p._id_empresa,
      sevendePor: p._sevende_por || 'unidad',
      manejaInventarios: p._maneja_inventarios === 1 || p._maneja_inventarios === true,
      manejaMultiprecios: p._maneja_multiprecios === 1 || p._maneja_multiprecios === true
    };
    
    await api.put(`/productos/editar/${p._id}`, producto);
  } catch (error) {
    throw new Error(error.response?.data || error.message || "Error al editar producto");
  }
}

export async function MostrarUltimoProducto(p) {
  try {
    const response = await api.get(`/productos/mostrar/${p.id_empresa}`);
    // Retornar el último producto (mayor ID)
    const productos = response.data;
    if (productos && productos.length > 0) {
      return productos[productos.length - 1];
    }
    return null;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Error al mostrar último producto");
  }
}
