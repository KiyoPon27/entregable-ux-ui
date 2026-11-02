import api from "../api/api";

export async function InsertarVentas(p) {
  try {
    const venta = {
      fecha: new Date(),
      montoTotal: 0,
      usuario: p.id_usuario ? { id: p.id_usuario } : null,
      sucursal: p.id_sucursal ? { id: p.id_sucursal } : null,
      empresa: p.id_empresa ? { id: p.id_empresa } : null,
      cliente: p.id_cliente ? { id: p.id_cliente } : null,
      cierreCaja: p.id_cierre_caja ? { id: p.id_cierre_caja } : null,
      estado: p.estado || "nueva",
      saldo: 0,
      pagoCon: 0,
      vuelto: 0,
      cantidadProductos: 0,
      subTotal: 0,
      valorImpuesto: 0
    };
    
    const response = await api.post("/ventas", venta);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Error al insertar venta");
  }
}

export async function EliminarVentasIncompletas(p) {
  try {
    // Original deleted 'pendiente'. Ensure backend does too.
    // My backend deletes what is passed. But I hardcoded "pendiente" in service?
    // Let's check logic: service.eliminarIncompletas hardcoded "pendiente".
    await api.delete(`/ventas/incompletas?idUsuario=${p.id_usuario}&idCierreCaja=${p.id_cierre_caja}`);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

export async function EliminarVenta(p) {
  try {
    await api.delete(`/ventas/${p.id}`);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

export async function MostrarVentasXsucursal(p) {
  try {
    // Original searched for 'nueva'
    try {
        const response = await api.get(`/ventas/sucursal/${p.id_sucursal}?estado=nueva`);
        return response.data;
    } catch (e) {
        if (e.response && (e.response.status === 404 || e.response.status === 204)) return null;
        throw e;
    }
  } catch (error) {
     if (error.response?.status === 404) return null;
    throw new Error(error.response?.data?.message || error.message);
  }
}

export async function ConfirmarVenta(p) {
  try {
    const payload = {
        idUsuario: p.idUsuario ?? p.id_usuario,
        vuelto: p._vuelto ?? p.vuelto,
        idTipoComprobante: p._id_tipo_comprobante ?? p.id_tipo_comprobante,
        serie: p._serie ?? p.serie,
        idSucursal: p.idSucursal ?? p.id_sucursal,
        idCliente: p._id_cliente ?? p.id_cliente,
        fecha: p._fecha ?? p.fecha,
        montoTotal: p._monto_total ?? p.monto_total,
        subTotal: p._sub_total ?? p.sub_total, // ✅ AGREGADO: Subtotal sin descuento
        nroComprobante: p._nro_comprobante ?? p.nro_comprobante,
        rucDni: p._ruc_dni ?? p.ruc_dni,
        
        // ✅ NUEVOS CAMPOS DE DESCUENTO
        porcentajeDescuento: p.porcentajeDescuento ?? p.porcentaje_descuento ?? 0,
        montoDescuento: p.montoDescuento ?? p.monto_descuento ?? 0,
    };
    
    const response = await api.post(`/ventas/${p._id_venta ?? p.id_venta ?? p.id}/confirmar`, payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Error al confirmar venta");
  }
}
