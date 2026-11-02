import api from "../api/api";

export async function InsertarProductos(p) {
  try {
    // Adaptar al modelo Java (empresa y categoria anidadas)
    const producto = {
      nombre: p._nombre,
      precioVenta: Number(p._precio_venta),
      precioCompra: Number(p._precio_compra),
      categoria: p.idCategoria ? { id: p.idCategoria } : undefined,
      codigoBarras: p._codigo_barras || null,
      codigoInterno: p._codigo_interno || null,
      empresa: p.idEmpresa ? { id: p.idEmpresa } : undefined,
      seVendePor: (p._sevende_por || 'UNIDAD').toUpperCase(),
      manejaInventarios: p._maneja_inventarios === 1 || p._maneja_inventarios === true,
      manejaMultiprecios: p._maneja_multiprecios === 1 || p._maneja_multiprecios === true,
      tipoComprobante: p.tipoComprobante || 'FACTURADO',
    };
    
    console.log('🚨 PRODUCTO A ENVIAR AL BACKEND:', producto);

    const response = await api.post("/productos", producto);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || error.message || "Error al insertar producto");
  }
}

export async function MostrarProductos(p) {
  try {
    const response = await api.get(`/productos/empresa/${p.id_empresa}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Error al mostrar productos");
  }
}

export async function BuscarProductos(p) {
  try {
    const q = encodeURIComponent(p.buscador || "");
    const response = await api.get(`/productos/buscar/${p.id_empresa}?q=${q}`);
    return response.data || [];
  } catch (error) {
    if (error.response?.status === 404) {
      return [];
    }
    throw new Error(error.response?.data?.message || error.message || "Error al buscar productos");
  }
}

export async function BuscarProductosLectora(p) {
  try {
    const q = encodeURIComponent(p.buscador || "");
    const response = await api.get(`/productos/buscar-lectora/${p.id_empresa}?q=${q}`);
    return response.data || [];
  } catch (error) {
    if (error.response?.status === 404) {
      return [];
    }
    throw new Error(error.response?.data?.message || error.message || "Error al buscar productos por lectora");
  }
}

export async function EliminarProductos(p) {
  try {
    await api.delete(`/productos/${p.id}`);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Error al eliminar producto");
  }
}

export async function EditarProductos(p) {
  try {
    const producto = {
      nombre: p._nombre,
      precioVenta: Number(p._precio_venta),
      precioCompra: Number(p._precio_compra),
      categoria: p.idCategoria ? { id: p.idCategoria } : undefined,
      codigoBarras: p._codigo_barras || null,
      codigoInterno: p._codigo_interno || null,
      empresa: p.idEmpresa ? { id: p.idEmpresa } : undefined,
      seVendePor: (p._sevende_por || 'UNIDAD').toUpperCase(),
      manejaInventarios: p._maneja_inventarios === 1 || p._maneja_inventarios === true,
      manejaMultiprecios: p._maneja_multiprecios === 1 || p._maneja_multiprecios === true,
      tipoComprobante: p.tipoComprobante || 'FACTURADO',
    };

    await api.put(`/productos/${p._id}`, producto);
  } catch (error) {
    throw new Error(error.response?.data || error.message || "Error al editar producto");
  }
}

export async function MostrarUltimoProducto(p) {
  try {
    const response = await api.get(`/productos/empresa/${p.id_empresa}`);
    const productos = response.data;
    if (productos && productos.length > 0) {
      return productos[productos.length - 1];
    }
    return null;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Error al mostrar último producto");
  }
}
