import { Navigate, useLocation } from "react-router-dom";
import { UserAuth } from "../context/AuthContent";
import { usePermisosStore } from "../store/PermisosStore";
import { useQuery } from "@tanstack/react-query";
import { useUsuariosStore } from "../store/UsuariosStore";
import { Spinner1 } from "../components/moleculas/Spinner1";

export const ProtectedRoute = ({ children, accessBy }) => {
  const { user, checking } = UserAuth();
  const {mostrarPermisosGlobales } = usePermisosStore();
  const location = useLocation();
  const {datausuarios} = useUsuariosStore()

  const {
    data:dataPermisosGlobales,
    isLoading: isLoadingPermisosGlobales,
    error: errorPermisosGlobales,
  } = useQuery({
    queryKey: ["mostrar permisos globales", datausuarios?.id],
    queryFn: () => mostrarPermisosGlobales({ id_usuario: datausuarios?.id }),
    enabled: !!datausuarios?.id,
  });
  if(isLoadingPermisosGlobales){
    return <span>cargando permisos...</span>
  }

  // Si aún estamos comprobando la sesión, no redirigir: mostrar carga
  if (checking === true) {
    return <Spinner1 />;
  }
  const hasPermission = dataPermisosGlobales?.some(
    (item) => item.modulos?.link === location.pathname
  );

  if (accessBy === "non-authenticated") {
    if (!user) {
      return children;
    } else {
      return <Navigate to="/" replace />;
    }
  } else if (accessBy === "authenticated") {
    if (user) {
      if (!hasPermission) {
        // return <Navigate to="/404" />;
      } 
 
      return children;
    }
  }
  return <Navigate to="/login" replace />;
};
