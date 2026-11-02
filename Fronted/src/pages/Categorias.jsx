import { useQuery } from "@tanstack/react-query";
import {
  CategoriasTemplate,
  Spinner1,
  useCategoriasStore,
  useEmpresaStore,
  useProductosStore,
} from "../index";

export function Categorias() {
  const { mostrarCategorias, buscarCategorias, buscador } =
    useCategoriasStore();
  const { mostrarProductos } = useProductosStore();
  const { dataempresa } = useEmpresaStore();
  const { isLoading, error } = useQuery({
    queryKey: ["mostrar categorias", dataempresa?.id],
    queryFn: () => mostrarCategorias({ id_empresa: dataempresa?.id }),
    enabled: !!dataempresa,
    refetchOnWindowFocus: false,
  });
  //buscar categorias
  const {  } = useQuery({
    queryKey: ["buscar categorias", buscador],
    queryFn: () =>
      buscarCategorias({ id_empresa: dataempresa?.id, descripcion: buscador }),
    enabled: !!dataempresa,
    refetchOnWindowFocus: false,
  });

  const { data: dataProductos = [], isLoading: isLoadingProductos } = useQuery({
    queryKey: ["mostrar productos para categorias", dataempresa?.id],
    queryFn: () => mostrarProductos({ id_empresa: dataempresa?.id }),
    enabled: !!dataempresa,
    refetchOnWindowFocus: false,
  });

  if (isLoading || isLoadingProductos) {
    return <Spinner1 />;
  }
  if (error) {
    return <span>error...</span>;
  }
  return <CategoriasTemplate productos={dataProductos || []} />;
}
