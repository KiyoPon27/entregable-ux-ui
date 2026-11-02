import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSerializacionStore } from "../store/SerializacionStore";
import { useAsignacionCajaSucursalStore } from "../store/AsignacionCajaSucursalStore";
import { useGlobalStore } from "../store/GlobalStore";
import { toast } from "sonner";
import { useCierreCajaStore } from "../store/CierreCajaStore";
import { useEmpresaStore } from "../store/EmpresaStore";

export const useMostrarSerializacionesQuery = () => {
  const { mostrarSerializaciones } = useSerializacionStore();
  const { dataempresa } = useEmpresaStore();
  const { sucursalesItemSelectAsignadas } = useAsignacionCajaSucursalStore();
  
  // Usar sucursal asignada si existe, sino mostrar todas de la empresa
  const queryKey = sucursalesItemSelectAsignadas 
    ? ["mostrar serializaciones", sucursalesItemSelectAsignadas.id_sucursal]
    : ["mostrar serializaciones empresa", dataempresa?.id];
    
  return useQuery({
    queryKey,
    queryFn: () => {
      if (sucursalesItemSelectAsignadas) {
        return mostrarSerializaciones({
          id_sucursal: sucursalesItemSelectAsignadas.id_sucursal,
        });
      } else {
        // Mostrar todas las serializaciones de la empresa
        return mostrarSerializaciones({
          id_empresa: dataempresa?.id,
        });
      }
    },
    enabled: !!(sucursalesItemSelectAsignadas || dataempresa),
  });
};
export const useMostrarSerializacionesVentasQuery = () => {
  const { mostrarSerializacionesVentas } = useSerializacionStore();
  const {dataCierreCaja} = useCierreCajaStore()
  return useQuery({
    queryKey: ["mostrar serializaciones ventas"],
    queryFn: () =>
      mostrarSerializacionesVentas({
        id_sucursal: dataCierreCaja?.caja?.id_sucursal,
      }),
    enabled: !!dataCierreCaja,
  });
};
export const useEditarSerializacionDefaultMutation = () => {
    const queryClient = useQueryClient();
  const { itemSelect } = useGlobalStore();
  const { editarSerializacionDefault } = useSerializacionStore();
  return useMutation({
    mutationKey: ["editar serializacion default"],
    mutationFn: async () => {
      const p = {
        id: itemSelect?.id,
      };
      await editarSerializacionDefault(p);
    },
    onError: (error) => {
        toast.error("Error al editar por default: " + error.message);
      },
      onSuccess: () => {
        toast.success("Serialización por defecto establecida");
        queryClient.invalidateQueries(["mostrar serializaciones"]);
        queryClient.invalidateQueries(["mostrar serializaciones empresa"]);
      }
  });
};
export const useEditarSerializacionMutation = () => {
  const queryClient = useQueryClient();
const { itemSelect,setStateClose } = useGlobalStore();
const { editarSerializacion } = useSerializacionStore();
return useMutation({
  mutationKey: ["editar serializacion"],
  mutationFn: async (data) => {
    const p = {
      id: itemSelect?.id,
      cantidad_numeros: data?.cantidad_numeros,
      correlativo: data?.correlativo,
      serie: data?.serie,
    };
    await editarSerializacion(p);
  },
  onError: (error) => {
      toast.error("Error al editar: " + error.message);
    },
    onSuccess: () => {
      toast.success("Datos guardados");
      queryClient.invalidateQueries(["mostrar serializaciones"])
      setStateClose(false)
    }
});
};

