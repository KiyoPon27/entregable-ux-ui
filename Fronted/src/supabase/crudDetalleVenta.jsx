import api from "../api/api";

export async function InsertarDetalleVentas(p) {
  try {
    const payload = {
        idVenta: p._id_venta,
        idProducto: p._id_producto,
        cantidad: p._cantidad,
        precioVenta: p._precio_venta,
        precioCompra: p._precio_compra,
        descripcion: p._descripcion,
        idSucursal: p._id_sucursal,
        idAlmacen: p._id_almacen
    };
    await api.post("/detalle-ventas", payload);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

export async function EditarCantidadDetalleVenta(p) {
  try {
    // p._id, p._cantidad, p._total
    const payload = {
        cantidad: p._cantidad
    };
    await api.put(`/detalle-ventas/${p._id}/cantidad`, payload);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

export async function MostrarDetalleVenta(p) {
  try {
    const response = await api.get(`/detalle-ventas/venta/${p.id_venta}`);
    // Map response to match Supabase structure:
    // Supabase: { ..., ventas: {...}, productos: {...} }
    // Spring: { ..., venta: {...}, producto: {...} }
    const data = response.data.map(d => ({
        ...d,
        ventas: d.venta,
        productos: d.producto
    }));
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

export async function EliminarDetalleVentas(p) {
  try {
    await api.delete(`/detalle-ventas/${p.id}`);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

export async function Mostrartop5productosmasvendidosxcantidad(p) {
  // TODO: Migrar endpoint de dashboard
  // const { data } = await supabase.rpc("mostrartop5productosmasvendidosxcantidad", p);
  // return data;
  return [];
}
export async function Mostrartop10productosmasvendidosxmonto(p) {
  // TODO: Migrar endpoint de dashboard
  return [];
}
