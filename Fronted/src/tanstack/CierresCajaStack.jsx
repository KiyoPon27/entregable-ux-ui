import { useQuery } from "@tanstack/react-query";
import { useCierreCajaStore } from "../store/CierreCajaStore";
import { useEmpresaStore } from "../store/EmpresaStore";
import { useUsuariosStore } from "../store/UsuariosStore";
import { toast } from "sonner";

export const useMostrarCierreCajaPorEmpresaQuery = () => {
  const { mostrarCierreCajaPorEmpresa } = useCierreCajaStore();

  const { dataempresa } = useEmpresaStore();
  return useQuery({
    queryKey: [
      "mostrar cierre caja por empresa",
      {
        idEmpresa: dataempresa?.id,
      },
    ],
    queryFn: () =>
      mostrarCierreCajaPorEmpresa({
        idEmpresa: dataempresa?.id,
      }).catch((err) => {
        // Mostrar un toast y devolver un arreglo vacío para evitar errores en UI
        toast.error("Error al obtener aperturas de caja: " + (err?.message || ""));
        return [];
      }),
    enabled: !!dataempresa,
  });
};
export const useMostrarAperturasCajaPorUsuarioQuery = () => {
  const { mostrarCierreCajaPorUsuario } = useCierreCajaStore();

  const { datausuarios } = useUsuariosStore();
  return useQuery({
    queryKey: [
      "mostrar caja aperturada por usuario",
      {
        id_usuario: datausuarios?.id,
      },
    ],
    queryFn: () =>
      mostrarCierreCajaPorUsuario({
        id_usuario: datausuarios?.id,
      }).catch((err) => {
        // Evitar que la promesa rechace sin control y mostrar mensaje amigable
        toast.error("Error al mostrar cierre de caja por usuario: " + (err?.message || ""));
        return null;
      }),
    enabled: !!datausuarios?.id,
  });
};
