import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useThemeStore, useUsuariosStore } from "..";
import { useGlobalStore } from "../store/GlobalStore";
import { toast } from "sonner";
import { Dark, Light } from "../styles/themes";
import { MostrarUsuarios } from "../supabase/crudUsuarios";

export const useMostrarUsuariosQuery = () => {
  return useQuery({
    queryKey: ["mostrar usuarios"],
    queryFn: MostrarUsuarios,
    refetchOnWindowFocus: false
  });
};

export const useInsertarUsuarioMutation = () => {
  const queryClient = useQueryClient();
  const { insertarUsuario } = useUsuariosStore();

  return useMutation({
    mutationKey: ["insertar usuario"],
    mutationFn: insertarUsuario,
    onError: (error) => {
      toast.error("Error al crear usuario: " + error.message);
    },
    onSuccess: () => {
      toast.success("Usuario creado exitosamente");
      queryClient.invalidateQueries(["mostrar usuarios"]);
    },
  });
};

export const useEditarUsuarioMutation = () => {
  const queryClient = useQueryClient();
  const { editarUsuarios } = useUsuariosStore();

  return useMutation({
    mutationKey: ["editar usuario"],
    mutationFn: editarUsuarios,
    onError: (error) => {
      toast.error("Error al editar usuario: " + error.message);
    },
    onSuccess: () => {
      toast.success("Usuario actualizado exitosamente");
      queryClient.invalidateQueries(["mostrar usuarios"]);
    },
  });
};

export const useEliminarUsuarioMutation = () => {
  const queryClient = useQueryClient();
  const { eliminarUsuarioAsignado } = useUsuariosStore();

  return useMutation({
    mutationKey: ["eliminar usuario"],
    mutationFn: eliminarUsuarioAsignado,
    onError: (error) => {
      toast.error("Error al eliminar usuario: " + error.message);
    },
    onSuccess: () => {
      toast.success("Usuario eliminado exitosamente");
      queryClient.invalidateQueries(["mostrar usuarios"]);
    },
  });
};

export const useCambiarPasswordMutation = () => {
  const queryClient = useQueryClient();
  const { cambiarPasswordUsuario } = useUsuariosStore();

  return useMutation({
    mutationKey: ["cambiar password"],
    mutationFn: cambiarPasswordUsuario,
    onError: (error) => {
      toast.error("Error al cambiar contraseña: " + error.message);
    },
    onSuccess: () => {
      toast.success("Contraseña actualizada exitosamente");
      queryClient.invalidateQueries(["mostrar usuarios"]);
    },
  });
};

export const useEditarPerfilMutation = () => {
  const queryClient = useQueryClient();
  const { editarUsuarios, datausuarios, setUsuario } = useUsuariosStore();
  const { file, setFile } = useGlobalStore();

  return useMutation({
    mutationKey: ["editar perfil"],
    mutationFn: async (data) => {
      const p = {
        id: datausuarios?.id,
        nombres: data.nombres,
        nro_doc: data.nro_doc,
        telefono: data.telefono,
        avatar: data.avatar, // Incluir avatar
      };
      await editarUsuarios(p);
      
      // Limpiar archivo seleccionado después de guardar
      if (setFile) setFile(null);
      
      return p;
    },
    onError: (error) => {
      toast.error("Error al editar mi perfil: " + error.message);
    },
    onSuccess: (p) => {
      // Actualización optimista: actualizar el store inmediatamente
      setUsuario({
        ...datausuarios,
        nombres: p.nombres,
        nroDoc: p.nro_doc,
        telefono: p.telefono,
        avatar: p.avatar,
      });
      toast.success("Datos guardados");
    },
  });
};

export const useEditarUserTheme = () => {
  const queryClient = useQueryClient();
  const { editarThemeUser, datausuarios } = useUsuariosStore();

  return useMutation({
    mutationKey: ["editar theme"],
    mutationFn: async () => {
      const { setTheme, theme } = useThemeStore();
      const themeUse = theme === "light" ? "dark" : "light";
      const themeStyle = datausuarios?.tema === "light" ? Dark : Light;
      setTheme({
        tema: themeUse,
        style: themeStyle,
      });
      const p = {
        id: datausuarios?.id,
        tema: themeUse,
      };

      await editarThemeUser(p);
    },
    onError: (error) => {
      toast.error("Error al editar tema: " + error.message);
    },
    onSuccess: () => {
      toast.success("Tema guardado");
      queryClient.invalidateQueries(["mostrar usuarios"]);
    },
  });
};
