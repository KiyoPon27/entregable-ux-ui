import { create } from "zustand";
import {
  EditarUsuarios,
  EliminarUsuario,
  InsertarUsuarios,
  MostrarUsuarios,
  MostrarUsuarioPorId,
  CambiarPasswordUsuario
} from "../supabase/crudUsuarios";
import { InsertarAsignacionCajaSucursal } from "../supabase/crudAsignacionCajaSucursal";
import { usePermisosStore } from "./PermisosStore";
import { InsertarPermisos, EliminarPermisos } from "../supabase/crudPermisos";
import api from "../api/api";

export const useUsuariosStore = create((set) => ({
  refetchs: null,
  datausuarios: null,
  itemSelect: null,
  setItemSelect: (p) => set({ itemSelect: p }),
  setUsuario: (datausuarios) => set({ datausuarios }),
  
  mostrarusuarios: async () => {
    try {
      const data = await MostrarUsuarios();
      set({ datausuarios: data });
      return data;
    } catch (err) {
      console.error("Error al mostrar usuarios:", err);
      throw err;
    }
  },
  
  eliminarUsuarioAsignado: async (p) => {
    // Primero eliminar permisos del usuario
    try {
      await EliminarPermisos({ id_usuario: p.id });
    } catch (error) {
      console.log("No hay permisos para eliminar o ya fueron eliminados");
    }
    
    // Luego eliminar el usuario
    await EliminarUsuario(p);
  },
  
  insertarUsuario: async (p) => {
    let selectModules = usePermisosStore.getState().selectedModules || [];
    // Deduplicate modules before inserting
    selectModules = [...new Set(selectModules)];
    console.log("Módulos seleccionados (deduplicados):", selectModules);

    if (!Array.isArray(selectModules) || selectModules.length === 0) {
      throw new Error("No hay módulos seleccionados");
    }

    // Crear usuario - pasar id_sucursal al backend
    const dataUserNew = await InsertarUsuarios({
      nombres: p.nombres,
      nro_doc: p.nro_doc,
      telefono: p.telefono,
      id_rol: p.id_rol,
      correo: p.email,
      password: p.pass,
      id_auth: null,
      id_tipodocumento: p.id_tipodocumento || null,
      id_sucursal: p.id_sucursal  // Pasar la sucursal al backend
    });

    console.log("👤 Usuario creado:", dataUserNew);  // DEBUG
    console.log("👤 ID del usuario:", dataUserNew?.id);  // DEBUG

    // IMPORTANTE: Primero eliminar los permisos por defecto asignados por el backend
    if (dataUserNew?.id) {
      try {
        await EliminarPermisos({ id_usuario: dataUserNew.id });
        console.log("🗑️ Permisos por defecto eliminados para usuario:", dataUserNew.id);
      } catch (error) {
        console.log("⚠️ No había permisos para eliminar o ya fueron eliminados");
      }
    }

    // Luego insertar los permisos seleccionados en paralelo
    await Promise.all(
      selectModules.map((idModule) => {
        const perm = {
          id_usuario: dataUserNew?.id,
          idmodulo: idModule,
        };
        return InsertarPermisos(perm);
      })
    );
  },
  
  editarUsuarios: async (p) => {
    let selectModules = usePermisosStore.getState().selectedModules || [];
    // Deduplicate modules before updating
    selectModules = [...new Set(selectModules)];
    console.log("Módulos seleccionados para edición (deduplicados):", selectModules);

    // Actualizar datos básicos del usuario
    await EditarUsuarios(p);

    // Si hay módulos seleccionados, actualizar permisos
    if (Array.isArray(selectModules) && selectModules.length > 0 && p.id) {
      // Primero eliminar permisos existentes
      await EliminarPermisos({ id_usuario: p.id });

      // Luego insertar los nuevos permisos
      await Promise.all(
        selectModules.map((idModule) => {
          const perm = {
            id_usuario: p.id,
            idmodulo: idModule,
          };
          return InsertarPermisos(perm);
        })
      );
    }
  },
  
  cambiarPasswordUsuario: async (p) => {
    await CambiarPasswordUsuario(p);
  },
  
  editarThemeUser: async (p) => {
    try {
      await api.put(`/usuarios/${p.id}`, { tema: p.tema });
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  },
}));
