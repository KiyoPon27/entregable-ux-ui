import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEmpresaStore } from "..";
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
  const { dataempresa, editarEmpresa } = useEmpresaStore();
  
  return useMutation({
    mutationKey: ["editar empresa ticket"],
    mutationFn: async (data) => {
      console.log("🎫 useUpdateEmpresaTicketMutation - Datos del formulario:", data);
      console.log("🏢 Empresa actual:", dataempresa);
      console.log("📁 Archivo seleccionado:", file);
      
      // SOLO enviar campos relacionados con el ticket, NO modificar datos de la empresa
      const p = {
        id: dataempresa?.id,
        nombre_moneda: data?.nombre_moneda,
        pie_pagina_ticket: data?.pie_pagina_ticket,
      };
      
      console.log("📦 Objeto a enviar (solo ticket config):", p);
      await editarEmpresa(p, dataempresa?.logo, file);
    },
    onError: (error) => {
      console.error("❌ Error en mutación:", error);
      const errorMsg = error?.message || "Error al guardar los cambios";
      toast.error(errorMsg);
    },
    onSuccess: () => {
      toast.success("✅ Configuración guardada correctamente");
      queryClient.invalidateQueries(["mostrar empresa"]);
    },
  });
};
