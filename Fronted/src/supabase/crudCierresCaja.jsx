import Swal from "sweetalert2";
import api from "../api/api";

export async function MostrarCierreCajaAperturada(p) {
  try {
    const response = await api.get(`/cierre-caja/caja/${p.id_caja}/aperturada`);
    return response.data;
  } catch (error) {
    console.error("Error al mostrar cierre caja aperturada:", error);
    return null;
  }
}

export async function AperturarCierreCaja(p) {
  try {
      const payload = {
          id_caja: p.id_caja,
          id_usuario: p.id_usuario
          // saldo_inicial: p.saldo_inicial
      };
      const response = await api.post("/cierre-caja/aperturar", payload);
      return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

export async function CerrarTurnoCaja(p) {
  try {
      const payload = {
          total_efectivo_calculado: p.total_efectivo_calculado,
          total_efectivo_real: p.total_efectivo_real,
          diferencia_efectivo: p.diferencia_efectivo
      };
      await api.put(`/cierre-caja/${p.id}/cerrar`, payload);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

export async function MostrarCierreCajaPorEmpresa(p) {
    try {
        const response = await api.get(`/cierre-caja/empresa/${p.idEmpresa}/abiertas`);
        // The RPC 'mostrarcajasabiertasporempresa' returns simplified columns: 
        // id_cierre_caja, id_caja, usuario, rol
        // The backend returns full CierreCaja object.
        // We might need to map it if the store expects flat structure.
        // CierreCaja entity has: id, caja (obj), usuario (obj).
        return response.data.map(cc => ({
            id_cierre_caja: cc.id,
            id_caja: cc.caja.id,
            usuario: cc.usuario.nombres,
            rol: cc.usuario.rol?.nombre || 'N/A' // Assuming access to role
        }));
    } catch (error) {
        console.error("Error al mostrar cierre caja por empresa:", error);
        return [];
    }
}

export async function MostrarCierreCajaPorUsuario(p) {
  try {
      const response = await api.get(`/cierre-caja/usuario/${p.id_usuario}/abierta`);
      const data = response.data;
      if(data) {
           // Map nested objects: caja, caja.sucursales
           // Backend entities: caja -> sucursal (singular)
           return {
               ...data,
               caja: {
                   ...data.caja,
                   sucursales: data.caja.sucursal // Alias for frontend
               }
           };
      }
      return data; 
  } catch (error) {
      console.error("Error al mostrar cierre caja por usuario:", error);
      return null;
  }
}