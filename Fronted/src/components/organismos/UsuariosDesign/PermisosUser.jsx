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

export const PermisosUser = ({ accionUsuario = "Nuevo" }) => {
  const {
    mostrarPermisos,
    toggleModule,
    selectedModules,
    setSelectedModules,
    mostrarPermisosDefault,
    actualizarPermisos,
    datapermisos,
  } = usePermisosStore();
  const { accion: accionAsignacion, selectItem: selectItemAsignaciones } =
    useAsignacionCajaSucursalStore();
  const { mostrarModulos } = useModulosStore();
  const { mostrarRoles, rolesItemSelect, setRolesItemSelect, dataroles } = useRolesStore();
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
    enabled: !!itemSelect && accionUsuario === "Editar",
  });
  const mutation = useMutation({
    mutationKey: ["actualizar permisos"],
    mutationFn: () => actualizarPermisos(),
  });

  // Filtrar roles: NO mostrar superadmin (permitir OG)
  const rolesPermitidos = dataroles?.filter(rol =>
    rol.nombre &&
    !rol.nombre.toLowerCase().includes("superadmin")
  ) || [];

  // Detectar si el usuario actual es superadmin u OG (protección)
  const rolUsuario = itemSelect?.rol?.toLowerCase?.();
  const isProtectedUser = rolUsuario === "superadmin" || rolUsuario === "super_admin" || rolUsuario === "og";
  const isSuperadminUser = isProtectedUser; // Mantener compatibilidad

  console.log("📋 Roles permitidos para crear usuario:", rolesPermitidos);
  console.log("🔐 ¿Es superadmin?", isSuperadminUser, "| rol:", itemSelect?.rol);

  // Efecto principal para manejar permisos según el modo
  useEffect(() => {
    console.log("🔄 useEffect disparado - accionUsuario:", accionUsuario);
    console.log("📊 rolesItemSelect:", rolesItemSelect);
    console.log("📋 dataPermisosDefault:", dataPermisosDefault);

    if (accionUsuario === "Nuevo") {
      console.log("➡️ Modo NUEVO activado");
      // Modo nuevo: aplicar permisos por rol si hay un rol seleccionado
      if (rolesItemSelect?.id && dataPermisosDefault) {
        console.log("✅ Tiene rol ID y dataPermisosDefault");
        const permisosPorRol = dataPermisosDefault
          .filter((permiso) => {
            console.log("🔍 Comparando permiso.id_rol:", permiso.id_rol, "con rolesItemSelect.id:", rolesItemSelect.id);
            return permiso.id_rol === rolesItemSelect.id;
          })
          .map((permiso) => permiso.id_modulo);

        // Deduplicar para evitar entradas duplicadas
        const modulosUnicos = [...new Set(permisosPorRol)];
        console.log("✅ Preseleccionando módulos para rol:", rolesItemSelect.nombre, "IDs únicos:", modulosUnicos);
        setSelectedModules(modulosUnicos);
      } else {
        console.log("⚠️ No hay rol o dataPermisosDefault vacío");
        // Si no hay rol seleccionado, limpiar permisos
        setSelectedModules([]);
      }
    } else if (accionUsuario === "Editar") {
      console.log("➡️ Modo EDITAR activado");
      // Modo edición: cargar rol del usuario
      if (itemSelect?.id_rol && itemSelect?.rol && !rolesItemSelect) {
        setRolesItemSelect({
          id: itemSelect.id_rol,
          nombre: itemSelect.rol,
        });
      }

      // Cargar permisos del usuario
      if (permisosUsuario && permisosUsuario.length > 0) {
        let modulosIds = permisosUsuario.map((p) => p.modulo?.id).filter(Boolean);
        // Deduplicar también en edición
        modulosIds = [...new Set(modulosIds)];
        console.log("📋 Permisos del usuario (deduplicados):", modulosIds);
        setSelectedModules(modulosIds);
      } else if (permisosUsuario && permisosUsuario.length === 0) {
        // Si no tiene permisos, limpiar
        setSelectedModules([]);
      }
    } else {
      console.log("⚠️ accionUsuario desconocida:", accionUsuario);
    }
  }, [rolesItemSelect, dataPermisosDefault, accionUsuario, permisosUsuario, itemSelect, setSelectedModules]);

  const isLoading =
    isLoadingModulos ||
    isLoadingPermisosDefault ||
    isLoadingPermisosUser;
  if (isLoading) return <BarLoader />;

  // Si estamos editando un superadmin u OG, mostrar solo mensaje protector
  if (accionUsuario === "Editar" && isSuperadminUser) {
    const rol = itemSelect?.rol?.toLowerCase?.();
    const nombreRol = rol === "og" ? "OG" : "Superadmin";
    const tipoRol = rol === "og" ? "un usuario OG" : "un usuario Superadmin";
    return (
      <Container>
        <Title>permisos</Title>
        <ProtectionWarning>
          ⚠️ No se pueden modificar los permisos de {tipoRol}.<br />
          Solo el mismo {nombreRol} puede modificar su información.
        </ProtectionWarning>
      </Container>
    );
  }

  return (
    <Container>
      <Title>permisos</Title>
      <div className="roleSelect">
        <label>Tipo:</label>
        <SelectList
          appearance="product"
          data={rolesPermitidos}
          displayField="nombre"
          onSelect={setRolesItemSelect}
          itemSelect={rolesItemSelect}
        />
      </div>
      <Subtitle>
        ✓ Los módulos se preseleccionan según el rol. Puedes agregar o remover módulos adicionales.
      </Subtitle>
      <List>
        {datamodulos?.map((module) => {
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
  padding: 0;
  gap: 10px;

  .roleSelect {
    display: flex;
    flex-direction: column;
    gap: 4px;

    > label {
      font-size: 1rem;
      color: ${({ theme }) => theme.text};
    }

    > div {
      width: 100%;
    }

    [data-appearance="product"] button {
      min-height: 46px;
      border: 1px solid #d1d5db;
      border-radius: 10px;
      background: #ffffff;
      color: #111827;
      font-size: 16px;
    }

    [data-appearance="product"] > div:nth-child(2) {
      border: 1px solid #d1d5db;
      border-radius: 10px;
      background: #ffffff;
    }
  }
`;
const Title = styled.span`
  font-size: clamp(1.75rem, 2.5vw, 2.2rem);
  text-align: center;
  text-transform: lowercase;
  margin-bottom: 4px;
`;
const Subtitle = styled.span`
  font-size: 0.88rem;
  color: #666;
  font-style: italic;
  text-align: center;
  margin: 6px 0 8px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 6px;
`;
const List = styled.ul`
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 26px;
  margin-top: 0;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;
const ListItem = styled.li`
  display: flex;
  align-items: center;
  padding: 0.2rem 0;
`;
const Label = styled.span`
  font-size: 1rem;
  color: #555;
  margin-left: 13px;
`;

const ProtectionWarning = styled.div`
  font-size: 0.95rem;
  color: #d9534f;
  background-color: #f9e8e7;
  border: 1px solid #ddd5d4;
  padding: 15px;
  border-radius: 4px;
  margin-top: 20px;
  text-align: center;
  font-weight: 500;
  line-height: 1.5;
`;
