import { useState } from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { FiX } from "react-icons/fi";
import { useGlobalStore } from "../../../store/GlobalStore";
import { useAsignacionCajaSucursalStore } from "../../../store/AsignacionCajaSucursalStore";
import { useEditarSerializacionMutation } from "../../../tanstack/SerializacionStack";


export const RegistrarSerializacion = () => {
  const { setStateClose, itemSelect } = useGlobalStore();
  const [cantidadNumeros, setCantidadNumeros] = useState(
    itemSelect?.cantidadNumeros || 8
  );
  const { sucursalesItemSelectAsignadas } = useAsignacionCajaSucursalStore();
  const { mutate, isPending } = useEditarSerializacionMutation();
  const [correlativo, setCorrelativo] = useState(itemSelect?.correlativo || 1);
  const [serie, setSerie] = useState(itemSelect?.serie || "");

  // Función para formatear el correlativo con ceros a la izquierda
  const formatearCorrelativo = (numero, longitud) => {
    return String(numero).padStart(longitud, "0");
  };

  
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: {
      cantidad_numeros: itemSelect?.cantidadNumeros || 8,
      correlativo: itemSelect?.correlativo || 1,
      serie: itemSelect?.serie || "",
      sucursal_id: itemSelect?.sucursal?.id || sucursalesItemSelectAsignadas?.id_sucursal,
    },
  });

  return (
    <Overlay>
      <Container>
        <CloseButton type="button" onClick={() => setStateClose(false)}>
          <FiX />
        </CloseButton>

        <LogoContainer>EDITAR COMPROBANTE</LogoContainer>

        <PreviewCard>
          <span className="title">Comprobante</span>
          <div className="tipo">{itemSelect?.tipoComprobante?.nombre || "SIN TIPO"}</div>
          <div className="numero">
            <span>{serie || "SERIE"}-</span>
            <span>{formatearCorrelativo(correlativo, cantidadNumeros)}</span>
          </div>
        </PreviewCard>

        <Form onSubmit={handleSubmit(mutate)}>
          <input type="hidden" {...register("sucursal_id")} />

          <FormGroup>
            <Label htmlFor="cantidad_numeros">
              Cantidad de numeros <span className="required">*</span>
            </Label>
            <Input
              id="cantidad_numeros"
              type="number"
              placeholder="Ej: 8"
              value={cantidadNumeros}
              {...register("cantidad_numeros", { required: true })}
              onChange={(e) =>
                setCantidadNumeros(Math.max(1, parseInt(e.target.value, 10) || 1))
              }
            />
            {errors.cantidad_numeros?.type === "required" && (
              <FieldError>Campo requerido</FieldError>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="correlativo">
              Correlativo <span className="required">*</span>
            </Label>
            <Input
              id="correlativo"
              type="number"
              placeholder="Ej: 1"
              value={correlativo}
              {...register("correlativo", { required: true })}
              onChange={(e) =>
                setCorrelativo(Math.max(0, parseInt(e.target.value, 10) || 0))
              }
            />
            {errors.correlativo?.type === "required" && <FieldError>Campo requerido</FieldError>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="serie">
              Serie <span className="required">*</span>
            </Label>
            <Input
              id="serie"
              type="text"
              placeholder="Ej: F001"
              value={serie}
              {...register("serie", { required: true })}
              onChange={(e) => setSerie(e.target.value.toUpperCase())}
            />
            {errors.serie?.type === "required" && <FieldError>Campo requerido</FieldError>}
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
};

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
  overflow: hidden;
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
  font-size: clamp(24px, 3.5vw, 34px);
  line-height: 1.05;
  margin-bottom: 18px;
  letter-spacing: -0.2px;
  max-width: 100%;
  white-space: normal;
  word-break: break-word;
`;

const PreviewCard = styled.div`
  display: flex;
  gap: 8px;
  flex-direction: column;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  padding: 15px;
  border-radius: 10px;
  width: 100%;
  text-align: center;
  position: relative;
  margin-bottom: 16px;
  box-sizing: border-box;
  overflow: hidden;

  .title {
    color: #111827;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 12px;
  }

  .tipo {
    background: #ea580c;
    color: #fff;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .numero {
    margin-top: 8px;
    font-size: 18px;
    font-weight: 700;
    background: white;
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #d1d5db;
    max-width: 100%;
    box-sizing: border-box;
    display: inline-flex;
    gap: 0;
    white-space: nowrap;

    span:first-child {
      color: #dc2626;
    }

    span:last-child {
      color: #111827;
    }
  }
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
