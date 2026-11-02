import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useImpresorasStore } from "../store/ImpresorasStore"
import { useUsuariosStore } from "../store/UsuariosStore"
import { toast } from "sonner"

export const useMostrarImpresorasPorUsuarioQuery =()=>{
    const  {mostrarImpresoraXUsuario}= useImpresorasStore()
    const {datausuarios} = useUsuariosStore()
    return useQuery({
        queryKey: ['mostrar impresora por usuario',{
            id_usuario:datausuarios?.id
        }],
        queryFn: async () => mostrarImpresoraXUsuario({
            id_usuario:datausuarios?.id
        }),
        enabled: !!datausuarios?.id,
        refetchOnWindowFocus: false,

    })
}
export const useEditarImpresorasMutation = () => {
    const { dataImpresorasPorUsuario, statePrintDirecto, editarImpresoras } =
      useImpresorasStore();
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationKey: ["editar impresoras"],
      mutationFn: async () => {
        // Validar que exista un ID válido antes de editar
        if (!dataImpresorasPorUsuario?.id) {
          throw new Error("No hay una impresora configurada. Por favor, selecciona una impresora primero.");
        }
        
        const p = {
          id: dataImpresorasPorUsuario.id,
          state: statePrintDirecto,
        };
        await editarImpresoras(p);
      },
      onError: (error) => {
        toast.error(error.message || "Error al editar impresoras");
      },
      onSuccess: () => {
        toast.success("Configuración de impresión actualizada");
        queryClient.invalidateQueries(["mostrar impresora por usuario"]);
      },
    });
  };