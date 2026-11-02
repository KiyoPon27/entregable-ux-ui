import { useEffect, useState } from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { FiX } from "react-icons/fi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ConvertirCapitalize } from "../../../index";
import { useEmpresaStore } from "../../../store/EmpresaStore";
import { useMetodosPagoStore } from "../../../store/MetodosPagoStore";
import { CirclePicker } from "react-color";

const POS_METHODS = {
  EFECTIVO: { icon: "💵", color: "#16a34a", label: "Efectivo" },
  TARJETA: { icon: "💳", color: "#0ea5e9", label: "Tarjeta" },
  MIXTO: { icon: "🏦", color: "#f59e0b", label: "Mixto" },
  YAPE: { icon: "📱", color: "#7c3aed", label: "Yape" },
};

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

function normalizeName(value = "") {
  return value.trim().toUpperCase();
}

function isHexColor(value = "") {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(String(value));
}

function resolveIcon(nombre, icono) {
  const preset = POS_METHODS[normalizeName(nombre)];
  if (icono && icono !== "-" && !isHexColor(icono)) {
    return icono;
  }
  return preset?.icon || "💵";
}

function resolveColor(nombre, color) {
  const preset = POS_METHODS[normalizeName(nombre)];
  if (isHexColor(color)) {
    return color;
  }
  return preset?.color || "#16a34a";
}

export function RegistrarMetodosPago({ onClose, dataSelect, accion, setIsExploding }) {
  const { insertarMetodosPago, editarMetodosPago } = useMetodosPagoStore();
  const { dataempresa } = useEmpresaStore();
  const queryClient = useQueryClient();
  const [currentIcon, setCurrentIcon] = useState(resolveIcon(dataSelect?.nombre, dataSelect?.icono));
  const [currentColor, setCurrentColor] = useState(resolveColor(dataSelect?.nombre, dataSelect?.color));

  const iconOptions = [
    "💵",
    "💳",
    "📱",
    "🏦",
    "🪙",
    "💰",
    "🏛️",
    "💸",
    "📲",
    "💱",
    "🧾",
    "🏧",
    "📑",
    "💼",
    "🧮",
    "🪪",
  ];
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: {
      nombre: dataSelect?.nombre || "",
    },
  });

  const { isPending, mutate: doInsertar } = useMutation({
    mutationFn: insertar,
    mutationKey: ["insertar metodos pago"],
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
    onSuccess: () => {
      toast.success("Metodo de pago guardado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["mostrar metodos pago"] });
      cerrarFormulario();
    },
  });

  function cerrarFormulario() {
    onClose();
    setIsExploding(true);
  }

  async function insertar(data) {
    if (accion === "Editar") {
      await editarMetodosPago(
        {
          nombre: ConvertirCapitalize(data.nombre),
          icono: currentIcon,
          color: currentColor,
          id: dataSelect.id,
        },
        null,
        null
      );
      return;
    }

    await insertarMetodosPago(
      {
        nombre: ConvertirCapitalize(data.nombre),
        icono: currentIcon,
        color: currentColor,
        id_empresa: dataempresa?.id,
        delete_update: true,
      },
      null
    );
  }

  useEffect(() => {
    if (accion === "Editar") {
      setCurrentIcon(resolveIcon(dataSelect?.nombre, dataSelect?.icono));
      setCurrentColor(resolveColor(dataSelect?.nombre, dataSelect?.color));
    }
  }, [accion, dataSelect]);

  return (
    <Overlay>
      <Container>
        <CloseButton type="button" onClick={onClose} aria-label="Cerrar" title="Cerrar">
          <FiX />
        </CloseButton>

        <LogoContainer>
          {accion === "Editar" ? "EDITAR MÉTODO DE PAGO" : "REGISTRAR MÉTODO DE PAGO"}
        </LogoContainer>

        <Form onSubmit={handleSubmit(doInsertar)}>
          <PreviewCard>
            <div className="icon-preview" style={{ backgroundColor: currentColor }}>
              <span className="icon-symbol">{currentIcon}</span>
            </div>
            <div className="preview-text">
              <span className="title">Icono y color</span>
              <span className="subtitle">Selecciona cómo se verá el método de pago en el POS</span>
            </div>
          </PreviewCard>

          <FormGroup>
            <Label>
              Icono <span className="required">*</span>
            </Label>
            <IconGrid>
              {iconOptions.map((icono) => (
                <IconButton
                  key={icono}
                  type="button"
                  $selected={currentIcon === icono}
                  onClick={() => setCurrentIcon(icono)}
                >
                  {icono}
                </IconButton>
              ))}
            </IconGrid>
          </FormGroup>

          <FormGroup>
            <Label>
              Color <span className="required">*</span>
            </Label>
            <div className="colorPickerContent">
              <CirclePicker
                colors={COLOR_PALETTE}
                color={currentColor}
                width="100%"
                onChange={(color) => setCurrentColor(color.hex)}
              />
            </div>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="nombre">
              Descripcion <span className="required">*</span>
            </Label>
            <Input
              id="nombre"
              type="text"
              placeholder="Ej: Efectivo"
              {...register("nombre", { required: true })}
            />
            {errors.nombre?.type === "required" && <FieldError>Campo requerido</FieldError>}
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

const PreviewCard = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background-color: #f8fafc;
  padding: 14px;
  margin-bottom: 8px;
  overflow: hidden;
  min-height: 92px;

  .icon-preview {
    width: 72px;
    height: 72px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    flex-shrink: 0;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18), 0 8px 18px rgba(15, 23, 42, 0.14);

    .icon-symbol {
      font-size: 34px;
      line-height: 1;
    }
  }

  .preview-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .title {
    color: #111827;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 12px;
  }

  .subtitle {
    color: #6b7280;
    font-size: 12px;
    line-height: 1.3;
  }
`;

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
`;

const IconButton = styled.button`
  width: 100%;
  min-height: 48px;
  border-radius: 10px;
  border: 1px solid ${({ $selected }) => ($selected ? "#111827" : "#d1d5db")};
  background: ${({ $selected }) => ($selected ? "#eef2ff" : "#ffffff")};
  cursor: pointer;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: #111827;
  }
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
