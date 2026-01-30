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
    const selectModules = usePermisosStore.getState().selectedModules || [];
    console.log("Módulos seleccionados:", selectModules);

    if (!Array.isArray(selectModules) || selectModules.length === 0) {
      throw new Error("No hay módulos seleccionados");
    }

    // Crear usuario
    const dataUserNew = await InsertarUsuarios({
      nombres: p.nombres,
      nro_doc: p.nro_doc,
      telefono: p.telefono,
      id_rol: p.id_rol,
      correo: p.email,
      password: p.pass,
      id_auth: null,
      id_tipodocumento: p.id_tipodocumento || null
    });

    // Asignar sucursal y caja si se proveen (debe venir de formulario o lógica superior)
    if (p.id_sucursal && p.id_caja && dataUserNew?.id) {
      await InsertarAsignacionCajaSucursal({
        id_sucursal: p.id_sucursal,
        id_usuario: dataUserNew.id,
        id_caja: p.id_caja,
      });
    }

    // Insertar permisos en paralelo
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
    const selectModules = usePermisosStore.getState().selectedModules || [];
    
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
