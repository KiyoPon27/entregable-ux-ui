import React, { useEffect } from "react";
import styled from "styled-components";
import {
  useSucursalesStore,
  useEmpresaStore,
  useUsuariosStore,
} from "../../../index";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FiX } from "react-icons/fi";
import { SelectList } from "../../ui/lists/SelectList";
import { BarLoader } from "react-spinners";
import { PermisosUser } from "../UsuariosDesign/PermisosUser";
import { useRolesStore } from "../../../store/RolesStore";
import { usePermisosStore } from "../../../store/PermisosStore";
import { useInsertarUsuarioMutation, useEditarUsuarioMutation } from "../../../tanstack/UsuariosStack";

export function RegistrarUsuarios({ accion, dataSelect, onClose }) {
  const queryClient = useQueryClient();
  const { itemSelect, datausuarios } = useUsuariosStore();
  const { dataempresa } = useEmpresaStore();
  const { rolesItemSelect, selectRol, mostrarRoles, setRolesItemSelect } = useRolesStore();
  const { mostrarPermisos } = usePermisosStore();
  const { mostrarSucursales, sucursalesItemSelect, selectSucursal } = useSucursalesStore();

  const insertarMutation = useInsertarUsuarioMutation();
  const editarMutation = useEditarUsuarioMutation();

  // Detectar si intentan editar un superadmin u OG que no es ellos mismos
  const rolUsuario = itemSelect?.rol?.toLowerCase?.();
  const isProtectedRoleBeingEdited = accion === "Editar" &&
    (rolUsuario === "superadmin" || rolUsuario === "og") &&
    datausuarios?.id !== itemSelect?.id;
  const isSuperadminBeingEdited = isProtectedRoleBeingEdited; // Mantener compatibilidad

  const { isLoading: isloadingRoles } = useQuery({
    queryKey: ["mostrar roles"],
    queryFn: mostrarRoles,
  });

  const { data: dataSucursales, isLoading: isloadingSucursales } = useQuery({
    queryKey: ["mostrar sucursales", { id_empresa: dataempresa?.id }],
    queryFn: () => mostrarSucursales({ id_empresa: dataempresa?.id }),
    enabled: !!dataempresa,
  });

  useEffect(() => {
    if (accion === "Nuevo") {
      // En modo NUEVO, limpiar el rol seleccionado
      setRolesItemSelect(null);
    } else if (accion === "Editar" && itemSelect?.id) {
      mostrarPermisos({ id_usuario: itemSelect.id });
      if (itemSelect.rol) {
        selectRol(itemSelect.rol);
      }
    }
  }, [accion, itemSelect]);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: {
      nombres: itemSelect?.nombres || "",
      email: itemSelect?.correo || "",
      nro_doc: itemSelect?.nroDoc || "",
      telefono: itemSelect?.telefono || "",
      pass: "",
    },
  });

  const manejadorInsertar = async (data) => {
    if (!rolesItemSelect?.id) {
      toast.error("⚠️ Debes seleccionar un Rol para el usuario");
      return;
    }
    if (accion !== "Editar" && !sucursalesItemSelect?.id) {
      toast.error("⚠️ Debes seleccionar una Sucursal");
      return;
    }

    if (accion === "Editar") {
      const p = {
        id: itemSelect?.id,
        nombres: data.nombres,
        nro_doc: data.nro_doc,
        telefono: data.telefono,
        correo: data.email || itemSelect?.correo,
        id_rol: rolesItemSelect?.id,
        estado: itemSelect?.estado || "ACTIVO"
      };
      editarMutation.mutate(p, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["mostrar usuarios"] });
          setTimeout(() => onClose(), 500);
        }
      });
    } else {
      const p = {
        nombres: data.nombres,
        nro_doc: data.nro_doc,
        telefono: data.telefono,
        correo: data.email,
        email: data.email,
        pass: data.pass,
        id_rol: rolesItemSelect?.id,
        id_sucursal: sucursalesItemSelect?.id,
        id_tipodocumento: data.id_tipodocumento || null
      };
      insertarMutation.mutate(p, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["mostrar usuarios"] });
          setTimeout(() => onClose(), 500);
        }
      });
    }
  };

  const isPending = insertarMutation.isPending || editarMutation.isPending;

  const isLoading = isloadingRoles || isloadingSucursales;
  if (isLoading) return <BarLoader color="#6d6d6d" />;

  // PROTECCIÓN: No permitir editar superadmin u OG si no es el mismo usuario
  if (isSuperadminBeingEdited) {
    const rol = itemSelect?.rol?.toLowerCase?.();
    const mensajeRol = rol === "og" ? "un usuario OG" : "un usuario Superadmin";
    return (
      <Overlay>
        <ProtectionContainer>
          <CloseButton type="button" aria-label="Cerrar" title="Cerrar" onClick={onClose}>
            <FiX />
          </CloseButton>
          <ProtectionTitle>⛔ Acceso Denegado</ProtectionTitle>
          <ProtectionMessage>
            No puedes editar a {mensajeRol}.<br/>
            Solo el mismo {rol === "og" ? "OG" : "Superadmin"} puede modificar su información.
          </ProtectionMessage>
        </ProtectionContainer>
      </Overlay>
    );
  }

  return (
    <Overlay>
      {isPending ? (
        <LoadingContent>guardando...</LoadingContent>
      ) : (
        <Container onSubmit={handleSubmit(manejadorInsertar)}>
          <CloseButton type="button" aria-label="Cerrar" title="Cerrar" onClick={onClose}>
            <FiX />
          </CloseButton>
          <Header>
            <Title>
              {accion === "Editar" ? "Editar usuario" : "Registrar usuario"}
            </Title>
          </Header>
          <MainGrid>
            <section className="leftPanel">
              <SectionLabel>Datos</SectionLabel>

              <FormGroup>
                <Label htmlFor="email">
                  Email <span className="required">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Ej: usuario@correo.com"
                  disabled={accion === "Editar"}
                  {...register("email", {
                    required: accion !== "Editar",
                  })}
                />
                {errors.email?.type === "required" && <FieldError>Campo requerido</FieldError>}
              </FormGroup>

              {accion !== "Editar" && (
                <FormGroup>
                  <Label htmlFor="pass">
                    Contraseña <span className="required">*</span>
                  </Label>
                  <Input
                    id="pass"
                    type="password"
                    placeholder="Minimo 6 caracteres"
                    {...register("pass", {
                      required: accion !== "Editar",
                    })}
                  />
                  {errors.pass?.type === "required" && <FieldError>Campo requerido</FieldError>}
                </FormGroup>
              )}

              <FormGroup>
                <Label htmlFor="nombres">
                  Nombres <span className="required">*</span>
                </Label>
                <Input
                  id="nombres"
                  type="text"
                  placeholder="Ej: Juan Perez"
                  {...register("nombres", { required: true })}
                />
                {errors.nombres?.type === "required" && <FieldError>Campo requerido</FieldError>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="nro_doc">Nro. doc</Label>
                <Input
                  id="nro_doc"
                  type="text"
                  placeholder="Ej: 76319345"
                  {...register("nro_doc", { required: false })}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="telefono">Telefono</Label>
                <Input
                  id="telefono"
                  type="text"
                  placeholder="Ej: 987654321"
                  {...register("telefono", { required: false })}
                />
              </FormGroup>

              <SectionDivider />

              <FormGroup>
                <Label htmlFor="sucursal">
                  Sucursal <span className="required">*</span>
                </Label>
                <div id="sucursal" className="selectWrap">
                  <SelectList
                    appearance="product"
                    onSelect={selectSucursal}
                    itemSelect={sucursalesItemSelect}
                    displayField="nombre"
                    data={dataSucursales}
                  />
                </div>
              </FormGroup>

              <ButtonsContainer>
                <PrimaryButton type="submit" disabled={isPending}>
                  {isPending ? "Guardando..." : "Guardar"}
                </PrimaryButton>
              </ButtonsContainer>
            </section>

            <section className="rightPanel">
              <PermisosUser accionUsuario={accion} />
            </section>
          </MainGrid>
        </Container>
      )}
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100vh;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
  background-color: rgba(10, 9, 9, 0.5);
  backdrop-filter: blur(2px);
  padding: 16px;
`;

const Container = styled.form`
  position: relative;
  width: 100%;
  max-width: 1060px;
  background: #ffffff;
  padding: 26px 22px;
  border-radius: 12px;
  box-shadow:
    0px 0px 3px rgba(0, 0, 0, 0.084),
    0px 2px 3px rgba(0, 0, 0, 0.168);
  box-sizing: border-box;

  @media (max-width: 820px) {
    padding: 22px 16px;
  }
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
`;

const Title = styled.span`
  font-size: clamp(2rem, 4vw, 3.2rem);
  font-weight: 600;
  text-align: center;
  letter-spacing: -0.3px;
  color: #212121;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 34px;
  height: 34px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  color: #111827;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const MainGrid = styled.section`
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;

  @media (min-width: 980px) {
    grid-template-columns: 48% 52%;
  }

  .leftPanel,
  .rightPanel {
    width: 100%;
  }
`;

const SectionLabel = styled.div`
  margin-top: 6px;
  margin-bottom: 4px;
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;

  .selectWrap {
    width: 100%;

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

const Label = styled.label`
  display: block;
  margin-bottom: 2px;
  color: #212121;
  font-weight: 600;
  font-size: 14px;

  .required {
    color: #e74c3c;
    margin-left: 3px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
  box-sizing: border-box;
  color: #212121;
  background: #ffffff;

  &::placeholder {
    opacity: 0.5;
  }

  &:focus {
    outline: none;
    border-color: #1778f2;
  }

  &:disabled {
    background: #e8eef7;
  }
`;

const FieldError = styled.small`
  color: #d12f2f;
  font-size: 12px;
`;

const SectionDivider = styled.div`
  height: 1px;
  background: #eceff3;
  margin: 12px 0;
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: 12px;
`;

const PrimaryButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1;
  overflow: hidden;
  border: none;
  width: 100%;
  padding: 12px 16px;
  font-size: 18px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #212121;
  color: #ffffff;
  box-shadow:
    0px 0px 3px rgba(0, 0, 0, 0.084),
    0px 2px 3px rgba(0, 0, 0, 0.168);

  &:hover:not(:disabled) {
    color: #212121;
  }

  &:active {
    scale: 0.98;
  }

  &::after {
    content: "";
    background: #ffffff;
    position: absolute;
    z-index: -1;
    left: -20%;
    right: -20%;
    top: 0;
    bottom: 0;
    transform: skewX(-45deg) scale(0, 1);
    transition: all 0.5s;
  }

  &:hover::after {
    transform: skewX(-45deg) scale(1, 1);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const LoadingContent = styled.span`
  color: #fff;
  font-size: 1rem;
`;

const ProtectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 40px;
  position: relative;
`;

const ProtectionTitle = styled.h2`
  font-size: 24px;
  color: #d9534f;
  margin: 0;
`;

const ProtectionMessage = styled.p`
  font-size: 16px;
  color: #666;
  text-align: center;
  line-height: 1.6;
  margin: 0;
  max-width: 400px;
`;
