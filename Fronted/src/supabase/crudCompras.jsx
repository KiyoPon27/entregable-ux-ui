import Swal from "sweetalert2";
import api from "../api/api";

// ==================== COMPRAS ====================

export async function InsertarCompra(p) {
  try {
    const compra = {
      numeroFactura: p.numero_factura,
      fechaEmision: p.fecha_emision,
      idProveedor: p.id_proveedor,
      idMetodoPago: p.id_metodo_pago,
      idTipoComprobante: p.id_tipo_comprobante,
      observacion: p.observacion || "",
      estado: p.estado || "COMPLETO",
      montoTotal: p.monto_total || 0,
      idEmpresa: p.id_empresa,
      idUsuario: p.id_usuario,
      detalles: (p.detalles || []).map(d => ({
        idProducto: d.id_producto,
        cantidadEsperada: d.cantidad_esperada,
        cantidadRecibida: d.cantidad_recibida,
        precioCompra: d.precio_compra,
        subtotal: d.subtotal
      }))
    };

    const response = await api.post("/compras", compra);

    Swal.fire({
      icon: "success",
      title: "¡Éxito!",
      text: "Compra registrada correctamente",
      timer: 1500,
      showConfirmButton: false,
    });

    return response.data;
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error al registrar compra",
      text: error.response?.data?.message || error.message,
    });
    throw error;
  }
}

export async function MostrarCompras(p) {
  try {
    const response = await api.get(`/compras/empresa/${p.id_empresa}`);
    return response.data;
  } catch (error) {
    console.error("Error al mostrar compras:", error);
    return [];
  }
}

export async function BuscarCompras(p) {
  try {
    const { id_empresa, buscador, estado, id_proveedor } = p;
    
    // Si hay búsqueda de texto, buscar por factura o proveedor
    if (buscador && buscador.trim()) {
      // Intentar buscar por número de factura primero
      const responseFactura = await api.get(`/compras/buscar/factura/${id_empresa}`, {
        params: { numeroFactura: buscador }
      });
      
      if (responseFactura.data && responseFactura.data.length > 0) {
        return responseFactura.data;
      }
      
      // Si no hay resultados, buscar por proveedor
      const responseProveedor = await api.get(`/compras/buscar/proveedor/${id_empresa}`, {
        params: { query: buscador }
      });
      return responseProveedor.data;
    }
    
    // Si hay filtro de estado
    if (estado && estado !== "todos") {
      const response = await api.get(`/compras/estado/${id_empresa}`, {
        params: { estado: estado.toUpperCase() }
      });
      return response.data;
    }
    
    // Si hay filtro de proveedor específico
    if (id_proveedor) {
      const response = await api.get(`/compras/empresa/${id_empresa}`);
      // Filtrar del lado del cliente por id_proveedor
      return response.data.filter(c => c.proveedor?.id === id_proveedor);
    }
    
    // Si no hay filtros, mostrar todos
    const response = await api.get(`/compras/empresa/${id_empresa}`);
    return response.data;
  } catch (error) {
    console.error("Error al buscar compras:", error);
    return [];
  }
}

export async function EditarCompra(p) {
  try {
    const compra = {
      numeroFactura: p.numero_factura,
      fechaEmision: p.fecha_emision,
      idProveedor: p.id_proveedor,
      idMetodoPago: p.id_metodo_pago,
      idTipoComprobante: p.id_tipo_comprobante,
      observacion: p.observacion || "",
      estado: p.estado,
      montoTotal: p.monto_total,
      idEmpresa: p.id_empresa,
      idUsuario: p.id_usuario,
      detalles: p.detalles.map(d => ({
        idProducto: d.id_producto,
        cantidadEsperada: d.cantidad_esperada,
        cantidadRecibida: d.cantidad_recibida,
        precioCompra: d.precio_compra,
        subtotal: d.subtotal
      }))
    };

    await api.put(`/compras/${p.id}`, compra);

    Swal.fire({
      icon: "success",
      title: "¡Actualizado!",
      text: "Compra actualizada correctamente",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error al actualizar",
      text: error.response?.data?.message || error.message,
    });
    throw error;
  }
}

export async function EliminarCompra(p) {
  try {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Se eliminará la compra y todos sus detalles",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      await api.delete(`/compras/${p.id}`);
      Swal.fire({
        icon: "success",
        title: "¡Eliminado!",
        text: "Compra eliminada correctamente",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error al eliminar",
      text: error.response?.data?.message || error.message,
    });
    throw error;
  }
}

export async function MostrarCompraDetalle(p) {
  try {
    const response = await api.get(`/compras/${p.id_compra}/detalles`);
    return response.data;
  } catch (error) {
    console.error("Error al mostrar detalle:", error);
    return [];
  }
}

// ==================== DETALLE COMPRA ====================

export async function InsertarDetalleCompra(p) {
  try {
    const detalle = {
      compra: p.id_compra ? { id: p.id_compra } : null,
      producto: p.id_producto ? { id: p.id_producto } : null,
      cantidadEsperada: p.cantidad_esperada || 0,
      cantidadRecibida: p.cantidad_recibida || 0,
      precioCompra: p.precio_compra || 0,
      subtotal: p.subtotal || 0,
    };

    const response = await api.post("/compras/detalles", detalle);
    return response.data;
  } catch (error) {
    console.error("Error al insertar detalle:", error);
    throw error;
  }
}

export async function EditarDetalleCompra(p) {
  try {
    const detalle = {
      cantidadEsperada: p.cantidad_esperada,
      cantidadRecibida: p.cantidad_recibida,
      precioCompra: p.precio_compra,
      subtotal: p.subtotal,
    };

    await api.put(`/compras/detalles/${p.id}`, detalle);
  } catch (error) {
    console.error("Error al editar detalle:", error);
    throw error;
  }
}

export async function EliminarDetalleCompra(p) {
  try {
    await api.delete(`/compras/detalles/${p.id}`);
  } catch (error) {
    console.error("Error al eliminar detalle:", error);
    throw error;
  }
}