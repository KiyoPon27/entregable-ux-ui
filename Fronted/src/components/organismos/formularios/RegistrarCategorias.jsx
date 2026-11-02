import { useEffect, useState } from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { FiX } from "react-icons/fi";
import { CirclePicker } from "react-color";
import { useMutation } from "@tanstack/react-query";
import { ConvertirCapitalize, useCategoriasStore } from "../../../index";
import { useEmpresaStore } from "../../../store/EmpresaStore";

const COLOR_PALETTE = [
  "#16a34a",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#2563eb",
  "#3b82f6",
  "#4f46e5",
  "#7c3aed",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#65a30d",
  "#64748b",
  "#334155",
  "#111827",
  "#facc15",
];

export function RegistrarCategorias({ onClose, dataSelect, accion, setIsExploding }) {
  const { insertarCategorias, editarCategoria } = useCategoriasStore();
  const { dataempresa } = useEmpresaStore();
  const [currentColor, setColor] = useState("#F44336");

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: {
      descripcion: dataSelect?.nombre || "",
    },
  });

  const { isPending, mutate: doInsertar } = useMutation({
    mutationFn: insertar,
    mutationKey: ["insertar categorias"],
    onError: (err) => {
      console.log("El error", err.message);
    },
    onSuccess: (result) => {
      if (result?.success === false) return;
      cerrarFormulario();
    },
  });

  function cerrarFormulario() {
    onClose();
    setIsExploding(true);
  }

  async function insertar(data) {
    if (accion === "Editar") {
      const p = {
        nombre: ConvertirCapitalize(data.descripcion),
        id_empresa: dataempresa?.id,
        color: currentColor,
        id: dataSelect.id,
      };
      return await editarCategoria(p, dataSelect.icono, null);
    }

    const p = {
      nombre: ConvertirCapitalize(data.descripcion),
      color: currentColor,
      icono: "-",
      id_empresa: dataempresa?.id,
    };

    return await insertarCategorias(p, null);
  }

  useEffect(() => {
    if (accion === "Editar" && dataSelect?.color) {
      setColor(dataSelect.color);
    }
  }, [accion, dataSelect]);

  return (
    <Overlay>
      <Container>
        <CloseButton type="button" onClick={onClose} aria-label="Cerrar" title="Cerrar">
          <FiX />
        </CloseButton>

        <LogoContainer>
          {accion === "Editar" ? "EDITAR CATEGORIA" : "REGISTRAR NUEVA CATEGORIA"}
        </LogoContainer>

        <Form onSubmit={handleSubmit(doInsertar)}>
          <FormGroup>
            <Label>
              Color <span className="required">*</span>
            </Label>
            <div className="colorPickerContent">
              <CirclePicker
                colors={COLOR_PALETTE}
                color={currentColor}
                width="100%"
                onChange={(color) => setColor(color.hex)}
              />
            </div>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="descripcion">
              Descripcion <span className="required">*</span>
            </Label>
            <Input
              id="descripcion"
              type="text"
              placeholder="Ej: Bebidas"
              {...register("descripcion", { required: true })}
            />
            {errors.descripcion?.type === "required" && <FieldError>Campo requerido</FieldError>}
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
  display: flex;
  width: 100%;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  background-color: rgba(10, 9, 9, 0.5);
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
  overflow: hidden;

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
  font-size: clamp(20px, 2.8vw, 30px);
  line-height: 1.1;
  margin-bottom: 18px;
  letter-spacing: -0.2px;
  max-width: 100%;
  padding-right: 44px;
  white-space: normal;
  word-break: break-word;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
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
