import { useQuery } from "@tanstack/react-query";
import { ConfiguracionesTemplate, Spinner1, UserAuth } from "../index";
import { usePermisosStore } from "../store/PermisosStore";

export function Configuraciones() {
  const { user } = UserAuth();
  const { mostrarPermisosConfiguracion } = usePermisosStore();
  
  const { isLoading, error } = useQuery({
    queryKey: ["mostrar permisos configuracion", user?.id],
    queryFn: () => mostrarPermisosConfiguracion({ id_usuario: user?.id }),
    enabled: !!user?.id, // Solo ejecutar si hay usuario
  });
  
  if (isLoading) {
    return <Spinner1 />;
  }
  
  if (error) {
    return <span>Error al cargar configuraciones...</span>;
  }
  
  return <ConfiguracionesTemplate />;
}
