import api from "../api/api";

// Adaptadores para backend Spring Boot
// Mapea las respuestas del backend (camelCase) a la forma esperada por los componentes (snake_case y agrupado)

export async function EditarAlmacen(p) {
  try {
    const body = {
      nombre: p.nombre,
      defecto: Boolean(p.defecto),
      eliminar: Boolean(p.eliminar),
    };
    await api.put(`/almacenes/${p.id}`, body);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Error al editar almacén");
  }
}

export async function InsertarAlmacen(p) {
  try {
    const body = {
      nombre: p.nombre,
      defecto: Boolean(p.defecto),
      eliminar: Boolean(p.eliminar),
      sucursal: p.id_sucursal ? { id: p.id_sucursal } : undefined,
    };
    const resp = await api.post(`/almacenes`, body);
    return resp.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Error al insertar almacén");
  }
}

export async function MostrarAlmacenXSucursal(p) {
  try {
    const resp = await api.get(`/almacenes/sucursal/${p.id_sucursal}`);
    // mapear campos a snake_case para compatibilidad
    return (resp.data || []).map((a) => ({
      id: a.id,
      id_sucursal: a.sucursal?.id,
      nombre: a.nombre,
      defecto: a.defecto,
      delete: a.eliminar,
      fecha_creacion: a.fechaCreacion,
    }));
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Error al mostrar almacén por sucursal");
  }
}

export async function MostrarAlmacenesXEmpresa(p) {
  try {
    const resp = await api.get(`/sucursales/empresa/${p.id_empresa}/con-almacenes`);
    return resp.data;
  } catch (error) {
    console.error("Error al mostrar almacenes por empresa:", error);
    return [];
  }
}

export async function MostrarAlmacenesXSucursal(p) {
  try {
    const resp = await api.get(`/almacenes/sucursal/${p.id_sucursal}`);
    return (resp.data || []).map((a) => ({
      id: a.id,
      nombre: a.nombre,
      fecha_creacion: a.fechaCreacion,
      delete: a.eliminar,
      id_sucursal: a.sucursal?.id,
      defecto: a.defecto,
    }));
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Error al mostrar almacenes por sucursal");
  }
}

export async function EliminarAlmacen(p) {
  try {
    await api.delete(`/almacenes/${p.id}`);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Error al eliminar almacén");
  }
}
