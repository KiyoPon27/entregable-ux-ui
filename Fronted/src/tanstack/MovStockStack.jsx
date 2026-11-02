import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEmpresaStore } from "../store/EmpresaStore";
import { useSucursalesStore } from "../store/SucursalesStore";
import { useImpresorasStore } from "../store/ImpresorasStore";
import { toast } from "sonner";
import { useAsignacionCajaSucursalStore } from "../store/AsignacionCajaSucursalStore";
import { useUsuariosStore } from "../store/UsuariosStore";
import { useProductosStore } from "../store/ProductosStore";
import { ConvertirMinusculas } from "../utils/Conversiones";
import { useCategoriasStore } from "../store/CategoriasStore";
import { useMovStockStore } from "../store/MovStockStore";
import { useAlmacenesStore } from "../store/AlmacenesStore";
import { useFormattedDate } from "../hooks/useFormattedDate";
import { useStockStore } from "../store/StockStore";
import { useGlobalStore } from "../store/GlobalStore";

// export const useBuscarProductosQuery = () => {
//   const { buscador, buscarProductos } = useProductosStore();
//   const { dataempresa } = useEmpresaStore();

//   return useQuery({
//     queryKey: ["buscar productos", buscador],
//     queryFn: () =>
//       buscarProductos({
//         id_empresa: dataempresa?.id,
//         buscador: buscador,
//       }),
//     enabled: !!dataempresa,
//   });
// };
export const useInsertarMovStockMutation = () => {
  const queryClient = useQueryClient();
  const { productosItemSelect, resetProductosItemSelect } = useProductosStore();
  const { setStateClose } = useGlobalStore();
  const { tipo } = useMovStockStore();
  const { editarStock } = useStockStore();
  const { almacenSelectItem } = useAlmacenesStore();

  const { editarPreciosProductos } = useProductosStore();
  const fechaActual = useFormattedDate();
  return useMutation({
    mutationKey: ["insertar movimiento stock"],
    mutationFn: async (data) => {
      const pStock = {
        id_almacen: almacenSelectItem?.id,
        id_producto: productosItemSelect?.id,
        cantidad: parseFloat(data.cantidad),
      };
      const pProductos = {
        id: productosItemSelect?.id,
        nombre: productosItemSelect?.nombre,
        precioCompra: parseFloat(
          (productosItemSelect?.precioCompra + data.precio_compra) / 2
        ),
        precioVenta: parseFloat(
          (productosItemSelect?.precioVenta + data.precio_venta) / 2
        ),
        codigoBarras: productosItemSelect?.codigoBarras,
        codigoInterno: productosItemSelect?.codigoInterno,
        seVendePor: productosItemSelect?.seVendePor,
        manejaInventarios: productosItemSelect?.manejaInventarios,
        manejaMultiprecios: productosItemSelect?.manejaMultiprecios,
        categoria: productosItemSelect?.categoria ? { id: productosItemSelect.categoria.id } : null,
        empresa: productosItemSelect?.empresa ? { id: productosItemSelect.empresa.id } : null,
      };

       await editarStock(pStock, tipo);
       await editarPreciosProductos(pProductos);
    },
    onError: (error) => {
      toast.error("Error:" + error.message);
    },
    onSuccess: () => {
      toast.success("Registro guardado correctamente");
      queryClient.invalidateQueries(["buscar productos"]);
      setStateClose(false);
      resetProductosItemSelect();
      
      setTimeout(() => {
        queryClient.invalidateQueries(["mostrar movimientos de stock"]);
      }, 300);
    },
  });
};
