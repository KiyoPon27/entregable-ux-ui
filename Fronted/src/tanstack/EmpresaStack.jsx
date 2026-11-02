import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEmpresaStore, UserAuth } from "..";
import { toast } from "sonner";
import { useGlobalStore } from "../store/GlobalStore";

export const useUpdateEmpresaMutation = ( ) => {
  const queyClient = useQueryClient();
  const { dataempresa, editarEmpresa } = useEmpresaStore();
  const {file} = useGlobalStore()
  return useMutation({
    mutationKey: ["editar empresa"],
    mutationFn: async (data) => {
 
    const p = {
        id: dataempresa?.id,
        nombre: data.nombre,
        id_fiscal: data.id_fiscal,
        direccion_fiscal: data.direccion,
        correo: data.correo,
        impuesto: data.impuesto,
        valor_impuesto: parseFloat(data.valor_impuesto),
      };
      await editarEmpresa(p,dataempresa?.logo,file);
    },
    onError: (error) => toast.error(error.message),
    onSuccess: () => {
      toast.success("Datos guardados");
      queyClient.invalidateQueries(["mostrar empresa"]);
    },
  });
};
export const useUpdateEmpresaTicketMutation = () => {
  const {file} = useGlobalStore();
  const queryClient = useQueryClient();
  const { dataempresa, editarEmpresa, mostrarempresa } = useEmpresaStore();
  const { user } = UserAuth();
  
  return useMutation({
    mutationKey: ["editar empresa ticket"],
    mutationFn: async (data) => {
      console.log("🎫 useUpdateEmpresaTicketMutation - Datos del formulario:", data);
      console.log("🏢 Empresa actual:", dataempresa);
      console.log("📁 Archivo seleccionado:", file);
      
      // Enviar en camelCase para que el backend lo reconozca
      const p = {
        id: dataempresa?.id,
        nombreMoneda: data?.nombre_moneda,      // camelCase
        piePaginaTicket: data?.pie_pagina_ticket  // camelCase
      };
      
      console.log("📦 Objeto a enviar (camelCase):", p);
      await editarEmpresa(p, dataempresa?.logo, file);
    },
    onError: (error) => {
      console.error("❌ Error en mutación:", error);
      const errorMsg = error?.message || "Error al guardar los cambios";
      toast.error(errorMsg);
    },
    onSuccess: async () => {
      toast.success("✅ Configuración guardada correctamente");
      
      // Invalidar la query de React Query
      await queryClient.invalidateQueries(["mostrar empresa", user?.id]);
      
      // Recargar los datos en el store de Zustand
      await mostrarempresa({ _id_usuario: user?.id });
      
      console.log("✅ Datos de empresa recargados");
    },
  });
};
