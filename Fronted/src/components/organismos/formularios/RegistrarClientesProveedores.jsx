import { useState } from "react";
import styled from "styled-components";
import {
  ConvertirCapitalize,
  useClientesProveedoresStore,
} from "../../../index";
import { FiX } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { useEmpresaStore } from "../../../store/EmpresaStore";
import { useMutation } from "@tanstack/react-query";

export function RegistrarClientesProveedores({
  onClose,
  dataSelect,
  accion,
  setIsExploding,
}) {
  const { insertarCliPro, editarCliPro, tipo } = useClientesProveedoresStore();
  const { dataempresa } = useEmpresaStore();

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: {
      nombres: dataSelect?.nombres || "",
      direccion: dataSelect?.direccion || "",
      telefono: dataSelect?.telefono || "",
      email: dataSelect?.email || "",
      identificador_nacional:
        dataSelect?.identificador_nacional || dataSelect?.identificadorNacional || "",
      identificador_fiscal:
        dataSelect?.identificador_fiscal || dataSelect?.identificadorFiscal || "",
    },
  });
  const [errorBackend, setErrorBackend] = useState("");
  
  const { isPending, mutate: doInsertar } = useMutation({
    mutationFn: insertar,
    mutationKey: "insertar clientes proveedores mutation",
    onError: (err) => {
      console.log("El error", err.message);
      setErrorBackend(err.message || "Error al guardar");
    },
    onSuccess: () => cerrarFormulario(),
  });
  const handlesub = (data) => {
    doInsertar(data);
  };

  const cerrarFormulario = () => {
    onClose();
    setIsExploding(true);
  };

  async function insertar(data) {
    setErrorBackend("");
    
    if (accion === "Editar") {
      const p = {
        id: dataSelect.id,
        _nombres: ConvertirCapitalize(data.nombres),
        idEmpresa: dataempresa?.id,
        _direccion: data.direccion,
        _telefono: data.telefono,
        _email: data.email,
        _identificador_nacional: data.identificador_nacional,
        _identificador_fiscal: data.identificador_fiscal,
        _tipo: tipo.toUpperCase(),
      };
      await editarCliPro(p);
    } else {
      const p = {
        _nombres: ConvertirCapitalize(data.nombres),
        idEmpresa: dataempresa?.id,
        _direccion: data.direccion,
        _telefono: data.telefono,
        _email: data.email,
        _identificador_nacional: data.identificador_nacional,
        _identificador_fiscal: data.identificador_fiscal,
        _tipo: tipo.toUpperCase(),
      };

      await insertarCliPro(p);
    }
  }

  const titulo = accion === "Editar" ? `EDITAR ${tipo}` : `REGISTRAR NUEVO ${tipo}`;

  return (
    <Overlay>
      <Container>
        <CloseButton type="button" aria-label="Cerrar" title="Cerrar" onClick={onClose}>
          <FiX />
        </CloseButton>

        <LogoContainer>{titulo}</LogoContainer>

        <Form onSubmit={handleSubmit(handlesub)}>
          {errorBackend && (
            <ErrorBox>
              ❌ {errorBackend}
            </ErrorBox>
          )}
          <SectionLabel>Datos</SectionLabel>

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
              <Label htmlFor="direccion">
                Direccion <span className="required">*</span>
              </Label>
              <Input
                id="direccion"
                type="text"
                placeholder="Ej: Av. Principal 123"
                {...register("direccion", { required: true })}
              />
              {errors.direccion?.type === "required" && <FieldError>Campo requerido</FieldError>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="telefono">
                Telefono <span className="required">*</span>
              </Label>
              <Input
                id="telefono"
                type="text"
                placeholder="Ej: 987654321"
                {...register("telefono", { required: true })}
              />
              {errors.telefono?.type === "required" && <FieldError>Campo requerido</FieldError>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="email">
                Email <span className="required">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Ej: cliente@correo.com"
                {...register("email", { required: true })}
              />
              {errors.email?.type === "required" && <FieldError>Campo requerido</FieldError>}
            </FormGroup>

            <SectionDivider />

            <FormGroup>
              <Label htmlFor="identificador_nacional">
                Ciudad <span className="required">*</span>
              </Label>
              <Input
                id="identificador_nacional"
                type="text"
                placeholder="Ej: Lima"
                {...register("identificador_nacional", { required: true })}
              />
              {errors.identificador_nacional?.type === "required" && (
                <FieldError>Campo requerido</FieldError>
              )}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="identificador_fiscal">
                RUC <span className="required">*</span>
              </Label>
              <Input
                id="identificador_fiscal"
                type="text"
                placeholder="Ej: 20123456789"
                {...register("identificador_fiscal", { required: true })}
              />
              {errors.identificador_fiscal?.type === "required" && (
                <FieldError>Campo requerido</FieldError>
              )}
            </FormGroup>

          <ButtonsContainer>
            <Button primary type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </ButtonsContainer>
        </Form>
      </Container>
    </Overlay>
  );
}

const Overlay = styled.div`
  transition: 0.5s;
  top: 0;
  left: 0;
  position: fixed;
  background-color: rgba(10, 9, 9, 0.5);
  display: flex;
  width: 100%;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Container = styled.div`
  position: relative;
  max-width: 520px;
  width: min(520px, calc(100vw - 32px));
  margin: 0 auto;
  background: #ffffff;
  border-radius: 12px;
  box-shadow:
    0px 0px 3px rgba(0, 0, 0, 0.084),
    0px 2px 3px rgba(0, 0, 0, 0.168);
  padding: 26px 22px;
  box-sizing: border-box;
  animation: slideIn 0.6s ease-out;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  color: #212121;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    padding: 22px 16px;
  }
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

const LogoContainer = styled.div`
  text-align: center;
  font-weight: 600;
  font-size: clamp(28px, 4.2vw, 42px);
  line-height: 1.12;
  max-width: calc(100% - 56px);
  padding-right: 6px;
  margin-bottom: 18px;
  letter-spacing: -0.3px;
  margin-left: auto;
  margin-right: auto;
  white-space: normal;
  word-break: break-word;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ErrorBox = styled.div`
  padding: 10px;
  background-color: #fee;
  border: 1px solid #f66;
  border-radius: 5px;
  color: #c33;
  margin-bottom: 8px;
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
  margin-bottom: 6px;
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
  font-family: inherit;
  border: 1px solid #ccc;
  font-size: 14px;
  box-sizing: border-box;

  &::placeholder {
    opacity: 0.5;
  }

  &:focus {
    outline: none;
    border-color: #1778f2;
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

const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1;
  overflow: hidden;
  font-family: inherit;
  border: none;
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ primary }) =>
    primary
      ? `
    background-color: #212121;
    color: white;
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
  `
      : `
    background: #ffffff;
    color: #212121;
    border: 1px solid #ccc;

    &:hover {
      background: #f7f7f7;
    }

    &:active {
      scale: 0.98;
    }
  `}
`;
