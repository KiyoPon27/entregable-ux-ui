import React, { useEffect } from "react";
import styled from "styled-components";
import {
  InputText,
  Btn1,
  useSucursalesStore,
  useEmpresaStore,
  useUsuariosStore,
  Device,
} from "../../../index";
import { useForm } from "react-hook-form";
import { BtnClose } from "../../ui/buttons/BtnClose";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";
import { SelectList } from "../../ui/lists/SelectList";
import { BarLoader } from "react-spinners";
import { PermisosUser } from "../UsuariosDesign/PermisosUser";
import { useRolesStore } from "../../../store/RolesStore";
import { usePermisosStore } from "../../../store/PermisosStore";
import { useInsertarUsuarioMutation, useEditarUsuarioMutation } from "../../../tanstack/UsuariosStack";

export function RegistrarUsuarios({ accion, dataSelect, onClose }) {
  const queryClient = useQueryClient();
  const { itemSelect } = useUsuariosStore();
  const { dataempresa } = useEmpresaStore();
  const { rolesItemSelect, selectRol, mostrarRoles } = useRolesStore();
  const { mostrarPermisos } = usePermisosStore();
  const { mostrarSucursales, sucursalesItemSelect, selectSucursal } = useSucursalesStore();

  const insertarMutation = useInsertarUsuarioMutation();
  const editarMutation = useEditarUsuarioMutation();

  useEffect(() => {
    if (accion === "Editar" && itemSelect?.id) {
      mostrarPermisos({ id_usuario: itemSelect.id });
      if (itemSelect.rol) {
        selectRol(itemSelect.rol);
      }
    }
  }, [accion, itemSelect]);

  const { data: dataRoles, isLoading: isloadingRoles } = useQuery({
    queryKey: ["mostrar roles"],
    queryFn: mostrarRoles,
  });

  const { data: dataSucursales, isLoading: isloadingSucursales } = useQuery({
    queryKey: ["mostrar sucursales", { id_empresa: dataempresa?.id }],
    queryFn: () => mostrarSucursales({ id_empresa: dataempresa?.id }),
    enabled: !!dataempresa,
  });

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: {
      nombres: itemSelect?.nombres || "",
      correo: itemSelect?.correo || "",
      nro_doc: itemSelect?.nroDoc || "",
      telefono: itemSelect?.telefono || "",
      pass: "123",
    },
  });

  const manejadorInsertar = async (data) => {
    if (!rolesItemSelect?.id) {
      toast.error("Debe seleccionar un rol");
      return;
    }
    if (accion !== "Editar" && !sucursalesItemSelect?.id) {
      toast.error("Debe seleccionar una sucursal");
      return;
    }

    if (accion === "Editar") {
      const p = {
        id: itemSelect?.id,
        nombres: data.nombres,
        nro_doc: data.nro_doc,
        telefono: data.telefono,
        correo: data.correo,
        id_rol: rolesItemSelect?.id,
        estado: itemSelect?.estado || "ACTIVO"
      };
      editarMutation.mutate(p, {
        onSuccess: () => {
          onClose();
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
          onClose();
        }
      });
    }
  };

  const isPending = insertarMutation.isPending || editarMutation.isPending;

  const isLoading = isloadingRoles || isloadingSucursales;
  if (isLoading) return <BarLoader color="#6d6d6d" />;
  
  return (
    <Container>
      {isPending ? (
        <span>guardando...🔼</span>
      ) : (
        <Form onSubmit={handleSubmit(manejadorInsertar)}>
          <Header>
            <Title>
              {accion === "Editar" ? "Editar usuario" : "Registrar usuario"}
            </Title>
            <BtnClose funcion={onClose} />
          </Header>
          <section className="main">
            <section className="area1">
              <article>
                <InputText
                  icono={
                    <Icon
                      icon="material-symbols-light:stacked-email-outline-rounded"
                      width="24"
                      height="24"
                    />
                  }
                >
                  <input 
                    disabled={accion === "Editar"}
                    className="form__field"
                    type="text"
                    {...register("email", {
                      required: accion !== "Editar",
                    })}
                  />
                  <label className="form__label">email</label>
                  {errors.email?.type === "required" && <p>Campo requerido</p>}
                </InputText>
              </article>
              
              {accion !== "Editar" && (
                <article>
                  <InputText
                    icono={
                      <Icon
                        icon="material-symbols-light:stacked-email-outline-rounded"
                        width="24"
                        height="24"
                      />
                    }
                  >
                    <input
                      className="form__field"
                      type="password"
                      {...register("pass", {
                        required: accion !== "Editar",
                      })}
                    />
                    <label className="form__label">contraseña</label>
                    {errors.pass?.type === "required" && <p>Campo requerido</p>}
                  </InputText>
                </article>
              )}
              
              <article>
                <InputText
                  icono={
                    <Icon
                      icon="icon-park-solid:edit-name"
                      width="24"
                      height="24"
                    />
                  }
                >
                  <input
                    className="form__field"
                    type="text"
                    {...register("nombres", { required: true })}
                  />
                  <label className="form__label">Nombres</label>
                  {errors.nombres?.type === "required" && (
                    <p>Campo requerido</p>
                  )}
                </InputText>
              </article>
              
              <article>
                <InputText
                  icono={
                    <Icon
                      icon="solar:document-outline"
                      width="24"
                      height="24"
                    />
                  }
                >
                  <input
                    className="form__field"
                    type="text"
                    {...register("nro_doc", { required: false })}
                  />
                  <label className="form__label">Nro. doc</label>
                </InputText>
              </article>
              
              <article>
                <InputText
                  icono={
                    <Icon
                      icon="solar:phone-outline"
                      width="24"
                      height="24"
                    />
                  }
                >
                  <input
                    className="form__field"
                    type="text"
                    {...register("telefono", { required: false })}
                  />
                  <label className="form__label">Teléfono</label>
                </InputText>
              </article>
              
              <span>Asignación de sucursal</span>
              <article className="contentasignacion">
                <span>Sucursal:</span>
                <SelectList
                  onSelect={selectSucursal}
                  itemSelect={sucursalesItemSelect}
                  displayField="nombre"
                  data={dataSucursales}
                />
              </article>

              <Btn1 titulo={"Guardar"} bgcolor={"#2c2ca8"} color={"#fff"} />
            </section>
            <section className="area2">
              <PermisosUser />
            </section>
          </section>
        </Form>
      )}
    </Container>
  );
}

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-y: auto;
  backdrop-filter: blur(5px);
  padding: 1rem;
`;

const Form = styled.form`
  width: 100%;
  max-width: 900px;
  background-color: ${({ theme }) => theme.body};
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 15px;

  .main {
    display: flex;
    flex-direction: column;
    gap: 15px;
    overflow-y: auto;
    justify-content: center;

    @media ${Device.laptop} {
      flex-direction: row;
    }
    .area1 {
      display: flex;
      flex-direction: column;
      height: 100%;
      align-items: center;
      gap: 10px;
    }
    .area2 {
      display: flex;
      flex-direction: column;
      height: 100%;
      align-items: center;
    }
    .contentasignacion {
      display: flex;
      flex-direction: column;
      width: 100%;
      gap: 5px;
    }
  }
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  text-align: center;
  justify-content: center;
`;

const Title = styled.span`
  font-size: 30px;
  font-weight: bold;
`;
