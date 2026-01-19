import styled from "styled-components";
import { SelectList } from "../../ui/lists/SelectList";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useModulosStore } from "../../../store/ModulosStore";
import { Check } from "../../ui/toggles/Check";
import { useRolesStore } from "../../../store/RolesStore";
import { usePermisosStore } from "../../../store/PermisosStore";
import { useEffect } from "react";
import { useAsignacionCajaSucursalStore } from "../../../store/AsignacionCajaSucursalStore";
import { BarLoader } from "react-spinners";
import { useUsuariosStore } from "../../../store/UsuariosStore";
export const PermisosUser = () => {
  const {
    mostrarPermisos,
    toggleModule,
    selectedModules,
    setSelectedModules,
    mostrarPermisosDefault,
    actualizarPermisos,
    datapermisos,
  } = usePermisosStore();
  const { accion, selectItem: selectItemAsignaciones } =
    useAsignacionCajaSucursalStore();
  const { mostrarModulos } = useModulosStore();
  const { mostrarRoles, rolesItemSelect, setRolesItemSelect,dataroles } = useRolesStore();
  const { itemSelect } = useUsuariosStore();

  const { data: datamodulos, isLoading: isLoadingModulos } = useQuery({
    queryKey: ["mostrar modulos"],
    queryFn: mostrarModulos,
  });

  const { data: dataPermisosDefault, isLoading: isLoadingPermisosDefault } =
    useQuery({
      queryKey: ["mostrar permisos default"],
      queryFn: mostrarPermisosDefault,
    });
  const { isLoading: isLoadingPermisosUser, data: permisosUsuario } = useQuery({
    queryKey: [
      "mostrar permisos por usuario",
      { id_usuario: itemSelect?.id },
    ],
    queryFn: () => {
      console.log("🔍 Cargando permisos para usuario ID:", itemSelect?.id);
      return mostrarPermisos({ id_usuario: itemSelect?.id });
    },
    enabled: !!itemSelect && accion === "Editar",
  });
  const mutation = useMutation({
    mutationKey: ["actualizar permisos"],
    mutationFn: () => actualizarPermisos(),
  });
  
  // Efecto principal para manejar permisos según el modo
  useEffect(() => {
    if (accion === "Nuevo") {
      // Modo nuevo: aplicar permisos por rol si hay un rol seleccionado
      if (rolesItemSelect?.id && dataPermisosDefault) {
        const permisosPorRol = dataPermisosDefault
          .filter((permiso) => permiso.id_rol === rolesItemSelect.id)
          .map((permiso) => permiso.id_modulo) || [];
        setSelectedModules(permisosPorRol);
      } else {
        // Si no hay rol seleccionado, limpiar permisos
        setSelectedModules([]);
      }
    } else if (accion === "Editar") {
      // Modo edición: cargar rol del usuario
      if (itemSelect?.id_rol && itemSelect?.rol && !rolesItemSelect) {
        setRolesItemSelect({
          id: itemSelect.id_rol,
          nombre: itemSelect.rol,
        });
      }
      
      // Cargar permisos del usuario
      if (permisosUsuario && permisosUsuario.length > 0) {
        const modulosIds = permisosUsuario.map((p) => p.modulo?.id).filter(Boolean);
        console.log("📋 Permisos del usuario:", modulosIds);
        setSelectedModules(modulosIds);
      } else if (permisosUsuario && permisosUsuario.length === 0) {
        // Si no tiene permisos, limpiar
        setSelectedModules([]);
      }
    }
  }, [rolesItemSelect, dataPermisosDefault, accion, permisosUsuario, itemSelect]);
  const isLoading =
    isLoadingModulos ||
   
    isLoadingPermisosDefault ||
    isLoadingPermisosUser;
  if (isLoading) return <BarLoader />;
  return (
    <Container>
      <Title>permisos</Title>
      <label>Tipo: </label>
      <SelectList
        data={dataroles}
        displayField="nombre"
        onSelect={setRolesItemSelect}
        itemSelect={rolesItemSelect}
      />
      <List>
        {datamodulos?.map((module, index) => {
          const isChecked = selectedModules.includes(module.id);
          return (
            <ListItem key={module.id}>
              <Check
                checked={isChecked}
                onChange={() => toggleModule(module.id)}
              />
              <Label>{module.nombre} </Label>
            </ListItem>
          );
        })}
      </List>
    </Container>
  );
};
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 1.5rem;
`;
const Title = styled.span`
  font-size: 1.5rem;
  text-align: center;
`;
const List = styled.ul`
  list-style: none;
  padding: 0;
`;
const ListItem = styled.li`
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
`;
const Label = styled.span`
  font-size: 1rem;
  color: #555;
  margin-left: 15px;
`;
