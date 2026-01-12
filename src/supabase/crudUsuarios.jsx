import Swal from "sweetalert2";
import { supabase } from "../index";
import { EliminarPermisos, InsertarPermisos, MostrarPermisos } from "./crudPermisos";
import { usePermisosStore } from "../store/PermisosStore";
const tabla = "usuarios";
export async function MostrarUsuarios(p) {
  const { data, error } = await supabase
    .from(tabla)
    .select(`*, roles(*)`)
    .eq("id_auth", p.id_auth)
    .maybeSingle();
  if (error) {
    return;
  }
  return data;
}
export async function InsertarAdmin(p) {
  const { error } = await supabase.from(tabla).insert(p);
  if (error) {
    throw new Error(error.message);
  }
}
export async function InsertarUsuarios(p) {
  const { error, data } = await supabase
    .from(tabla)
    .insert(p)
    .select()
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function InsertarCredencialesUser(p) {
  const { data, error } = await supabase.rpc("crearcredencialesuser", p);
  if (error) {
    throw new Error(error.message);
  }
  return data;
}
export async function ObtenerIdAuthSupabase() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session != null) {
    const { user } = session;
    const idauth = user.id;
    return idauth;
  }
}
export async function EliminarUsuarioAsignado(p) {
  const { error } = await supabase.from(tabla).delete().eq("id", p.id);
  if (error) {
    throw new Error(error.message);
  }
}
export async function EditarUsuarios(p) {
  // actualizar datos del usuario primero
  const { error } = await supabase.from(tabla).update(p).eq("id", p.id);

  // obtener módulos seleccionados desde el store (si hay)
  let selectModules = usePermisosStore.getState().selectedModules || [];

  // si no hay módulos seleccionados en el UI, traer los permisos actuales desde la BD
  if (!Array.isArray(selectModules) || selectModules.length === 0) {
    try {
      const actuales = await MostrarPermisos({ id_usuario: p.id });
      selectModules = Array.isArray(actuales) ? actuales.map((it) => it.idmodulo) : [];
    } catch (err) {
      // si falla al obtener permisos actuales, dejamos selectModules como vacío
      selectModules = [];
    }
  }

  // eliminar permisos existentes y volver a insertar los que correspondan
  await EliminarPermisos({ id_usuario: p.id });

  if (Array.isArray(selectModules) && selectModules.length > 0) {
    for (const idModule of selectModules) {
      const pp = {
        id_usuario: p.id,
        idmodulo: idModule,
      };
      await InsertarPermisos(pp);
    }
  }

  if (error) {
    throw new Error(error.message);
  }
}