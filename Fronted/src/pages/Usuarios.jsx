import { useQuery } from "@tanstack/react-query";
import { UsuariosTemplate } from "../components/templates/UsuariosTemplate";
import { useEmpresaStore } from "../store/EmpresaStore";
import { BarLoader } from "react-spinners";
import { useRolesStore } from "../store/RolesStore";
import { useMostrarUsuariosQuery } from "../tanstack/UsuariosStack";

export const Usuarios = () => {
  const { dataempresa } = useEmpresaStore();
  const { mostrarRoles } = useRolesStore();
  
  const { data: dataUsuarios, isLoading, error } = useMostrarUsuariosQuery();
  
  const { data: dataRoles, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["mostrar roles"],
    queryFn: mostrarRoles,
  });
  
  if (isLoading || isLoadingRoles) return <BarLoader color="#6d6d6d" />;
  if (error) return <span>Error: {error.message}</span>;
  
  return <UsuariosTemplate />;
};
