import api from "../api/api";

// Stock backend adapter
// Endpoints usados:
// GET /api/stock/almacen/{idAlmacen}
// GET /api/stock/producto/{idProducto}
// POST /api/stock/ajuste

export async function InsertarStock(p) {
  // Crea o actualiza stock para un producto en un almacén
  try {
    const body = {
      almacen: { id: p.id_almacen },
      producto: { id: p.id_producto },
      stock: Number(p.stock ?? p.cantidad ?? 0),
      stockMinimo: p.stock_minimo != null ? Number(p.stock_minimo) : undefined,
      ubicacion: p.ubicacion ?? undefined,
    };
    const resp = await api.post(`/stock/ajuste`, body);
    return resp.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Error al insertar/ajustar stock");
  }
}

export async function EditarStock(p, tipo) {
  // Ajuste incremental/decremental según 'tipo'
  try {
    // Obtener stock actual del producto y filtrar por almacén
    const currentList = await MostrarStockXAlmacenYProducto({ id_almacen: p.id_almacen, id_producto: p.id_producto });
    const current = currentList?.[0];
    const actualCantidad = Number(current?.stock ?? current?.cantidad ?? 0);
    const delta = Number(p.cantidad ?? p.stock ?? 0);
    const nuevaCantidad = tipo === "ingreso" ? actualCantidad + delta : actualCantidad - delta;

    const body = {
      almacen: { id: p.id_almacen },
      producto: { id: p.id_producto },
      stock: nuevaCantidad,
      stockMinimo: p.stock_minimo != null ? Number(p.stock_minimo) : current?.stock_minimo ?? undefined,
      ubicacion: p.ubicacion ?? current?.ubicacion ?? undefined,
    };
    const resp = await api.post(`/stock/ajuste`, body);
    return resp.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Error al editar stock");
  }
}

export async function MostrarStockXAlmacenYProducto(p) {
  try {
    // Obtener todos los stocks del producto y filtrar por almacén
    const resp = await api.get(`/stock/producto/${p.id_producto}`);
    const list = (resp.data || []).filter((s) => s.almacen?.id === p.id_almacen);
    if (!list.length) return null; // Retornar null en vez de array vacio si no hay stock
    const s = list[0];
    return {
      id: s.id,
      id_almacen: s.almacen?.id,
      id_producto: s.producto?.id,
      stock: Number(s.stock ?? 0),
      stock_minimo: s.stockMinimo != null ? Number(s.stockMinimo) : null,
      ubicacion: s.ubicacion ?? null,
      almacen: s.almacen,
      producto: s.producto,
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Error al mostrar stock por almacén y producto");
  }
}

export async function MostrarStockXAlmacenesYProducto(p) {
  try {
    const resp = await api.get(`/stock/producto/${p.id_producto}`);
    const list = resp.data || [];
    return list
      .filter((s) => (p.id_almacen ? s.almacen?.id === p.id_almacen : true))
      .map((s) => ({
        id: s.id,
        id_almacen: s.almacen?.id,
        id_producto: s.producto?.id,
        stock: Number(s.cantidad ?? 0),
        stock_minimo: s.stockMinimo != null ? Number(s.stockMinimo) : null,
        ubicacion: s.ubicacion ?? null,
        almacen: s.almacen,
      }));
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Error al mostrar stock por producto");
  }
}
