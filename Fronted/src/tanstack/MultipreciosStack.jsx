import { useQuery } from "@tanstack/react-query";
import { ListarMultipreciosPorProducto } from "../supabase/crudMultiprecios";

export const useMostrarMultipreciosQuery = (idProducto) => {
  return useQuery({
    queryKey: ["mostrar multiprecios", { id_producto: idProducto }],
    queryFn: () => ListarMultipreciosPorProducto(idProducto),
    enabled: !!idProducto,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2
  });
};