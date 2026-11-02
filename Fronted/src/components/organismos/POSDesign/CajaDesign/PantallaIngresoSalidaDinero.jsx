import styled from "styled-components";
import { useCierreCajaStore } from "../../../../store/CierreCajaStore";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMovCajaStore } from "../../../../store/MovCajaStore";
import { useMetodosPagoStore } from "../../../../store/MetodosPagoStore";
import { useUsuariosStore } from "../../../../store/UsuariosStore";
import { useFormattedDate } from "../../../../hooks/useFormattedDate";
export function PantallaIngresoSalidaDinero() {
  const fechaActual = useFormattedDate();
  const { tipoRegistro, setStateIngresoSalida } = useCierreCajaStore();
  const { insertarMovCaja } = useMovCajaStore();
  const { dataMetodosPago } = useMetodosPagoStore();
  const { datausuarios } = useUsuariosStore();
  const { dataCierreCaja } = useCierreCajaStore();

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Efectivo");
  const [reason, setReason] = useState("");

  const insertar = async (amount, method, reason) => {
    const pmovcaja = {
      fecha_movimiento: fechaActual,
      tipo_movimiento: tipoRegistro,
      monto: parseFloat(amount),
      id_metodo_pago: dataMetodosPago?.find((m) => m.nombre === method)?.id,
      descripcion: `${tipoRegistro === "ingreso" ? "Ingreso" : "Salida"} de dinero con ${method} ${
        reason ? `- detalle: ${reason}` : ""
      }`,
      id_usuario: datausuarios?.id,
      id_cierre_caja: dataCierreCaja?.id,
    };
    await insertarMovCaja(pmovcaja);
  };

  const manejadorEnvio = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Por favor ingrese un monto válido");
      return;
    }
    if (tipoRegistro === "salida" && !reason.trim()) {
      toast.error("Por favor ingrese el motivo del retiro");
      return;
    }
    doInsertar({ amount, method, reason });
  };

  const { isPending, mutate: doInsertar } = useMutation({
    mutationKey: ["insertar ingresos salidas caja"],
    mutationFn: ({ amount, method, reason }) => insertar(amount, method, reason),
    onSuccess: () => {
      toast.success("🎉 Registrado!!!");
      setStateIngresoSalida(false);
      setAmount("");
      setReason("");
      setMethod("Efectivo");
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || "Error al registrar !!!";
      toast.error(`Error: ${errorMessage}`);
    },
  });

  useEffect(() => {
    setMethod("Efectivo");
  }, [tipoRegistro]);

  const isIncome = tipoRegistro === "ingreso";
  const btnColor = isIncome ? "#16a34a" : "#dc2626";
  const previewBg = isIncome ? "#dcfce7" : "#fee2e2";
  const labelColor = isIncome ? "#166534" : "#b91c1c";
  return (
    <Container>
      <ModalOverlay onClick={() => setStateIngresoSalida(false)} />
      <ModalCard isIncome={isIncome}>
        {/* Header */}
        <ModalHeader isIncome={isIncome}>
          <HeaderContent>
            <HeaderIcon>{isIncome ? "📈" : "📉"}</HeaderIcon>
            <HeaderTexts>
              <HeaderTitle>{isIncome ? "Ingresar Dinero a Caja" : "Retirar Dinero de Caja"}</HeaderTitle>
              <HeaderSubtitle>{isIncome ? "Registrar ingreso de efectivo" : "Registrar retiro de efectivo"}</HeaderSubtitle>
            </HeaderTexts>
          </HeaderContent>
          <CloseBtn onClick={() => setStateIngresoSalida(false)}>✕</CloseBtn>
        </ModalHeader>

        {/* Body */}
        <ModalBody>
          {/* Método de Pago */}
          <FormGroup>
            <Label>Método de {isIncome ? "Ingreso" : "Retiro"}</Label>
            <MethodsGrid>
              {["Efectivo", "Tarjeta", "Digital"].map((m) => (
                <MethodBtn
                  key={m}
                  isSelected={method === m}
                  isIncome={isIncome}
                  onClick={() => setMethod(m)}
                >
                  <MethodIcon>{m === "Efectivo" ? "💵" : m === "Tarjeta" ? "💳" : "📱"}</MethodIcon>
                  <MethodName>{m}</MethodName>
                </MethodBtn>
              ))}
            </MethodsGrid>
          </FormGroup>

          {/* Monto */}
          <FormGroup>
            <Label>Monto a {isIncome ? "Ingresar" : "Retirar"}</Label>
            <InputWrapper>
              <CurrencySymbol>S/</CurrencySymbol>
              <AmountInput
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                isIncome={isIncome}
              />
            </InputWrapper>
            <HelperText>Ingrese el monto en soles (S/)</HelperText>
          </FormGroup>

          {/* Motivo */}
          <FormGroup>
            <LabelWithRequired>
              <Label>Motivo</Label>
              {isIncome ? <Optional>(opcional)</Optional> : <Required>*</Required>}
            </LabelWithRequired>
            <ReasonInput
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={isIncome ? "Describa el motivo del ingreso..." : "Describa el motivo del retiro (obligatorio)..."}
              isIncome={isIncome}
            />
            {!isIncome && (
              <RequiredMsg>
                <Warning>⚠️</Warning>
                El motivo es obligatorio para retiros
              </RequiredMsg>
            )}
          </FormGroup>
        </ModalBody>

        {/* Footer */}
        <ModalFooter>
          <CancelBtn onClick={() => setStateIngresoSalida(false)}>Cancelar</CancelBtn>
          <SubmitBtn onClick={manejadorEnvio} disabled={isPending} btnColor={btnColor}>
            {isPending ? "Registrando..." : `Registrar ${isIncome ? "Ingreso" : "Retiro"}`}
          </SubmitBtn>
        </ModalFooter>
      </ModalCard>
    </Container>
  );
}

// ESTILOS
const Container = styled.div`
  height: 100vh;
  position: fixed;
  width: 100%;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
`;

const ModalOverlay = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  cursor: pointer;
`;

const ModalCard = styled.div`
  position: relative;
  z-index: 51;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

const ModalHeader = styled.div`
  background: ${(props) => (props.isIncome ? "linear-gradient(135deg, #16a34a 0%, #15803d 100%)" : "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)")};
  color: white;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 12px 12px 0 0;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
`;

const HeaderIcon = styled.span`
  font-size: 32px;
`;

const HeaderTexts = styled.div`
  display: flex;
  flex-direction: column;
`;

const HeaderTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: white;
`;

const HeaderSubtitle = styled.p`
  font-size: 13px;
  margin: 4px 0 0 0;
  color: rgba(255, 255, 255, 0.9);
`;

const CloseBtn = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 24px;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ModalBody = styled.div`
  padding: 28px 24px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

const ModalFooter = styled.div`
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  background: #f9fafb;
  border-radius: 0 0 12px 12px;
`;

const FormGroup = styled.div`
  width: 100%;
  margin-bottom: 20px;
  box-sizing: border-box;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
`;

const LabelWithRequired = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;

  ${Label} {
    margin-bottom: 0;
  }
`;

const Required = styled.span`
  color: #dc2626;
  font-weight: bold;
  font-size: 14px;
`;

const Optional = styled.span`
  color: #9ca3af;
  font-size: 12px;
  font-weight: 400;
`;

const MethodsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

const MethodBtn = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 12px;
  border: 2px solid ${(props) => (props.isSelected ? (props.isIncome ? "#16a34a" : "#dc2626") : "#d1d5db")};
  background-color: ${(props) => (props.isSelected ? (props.isIncome ? "#f0fdf4" : "#fef2f2") : "white")};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;

  &:hover {
    border-color: ${(props) => (props.isIncome ? "#16a34a" : "#dc2626")};
  }
`;

const MethodIcon = styled.span`
  font-size: 28px;
`;

const MethodName = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #1f2937;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const CurrencySymbol = styled.span`
  position: absolute;
  left: 14px;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
`;

const AmountInput = styled.input`
  width: 100%;
  padding: 11px 14px 11px 40px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 16px;
  background: white;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-weight: 500;

  &:focus {
    outline: none;
    border-color: ${(props) => (props.isIncome ? "#16a34a" : "#dc2626")};
  }

  &::placeholder {
    color: #d1d5db;
  }
`;

const HelperText = styled.p`
  font-size: 12px;
  color: #9ca3af;
  margin-top: 6px;
  margin: 6px 0 0 0;
`;

const ReasonInput = styled.textarea`
  width: 100%;
  padding: 11px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  resize: none;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
  height: 100px;
  overflow: hidden;

  &:focus {
    outline: none;
    border-color: ${(props) => (props.isIncome ? "#16a34a" : "#dc2626")};
  }

  &::placeholder {
    color: #d1d5db;
  }
`;

const RequiredMsg = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 12px;
  color: #b45309;
`;

const Warning = styled.span`
  font-size: 14px;
`;

const ButtonsContainer = styled.div`
  width: 100%;
  display: flex;
  gap: 12px;
`;

const CancelBtn = styled.button`
  flex: 1;
  padding: 11px 16px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;

  &:hover {
    background-color: #f3f4f6;
  }

  &:active {
    background-color: #e5e7eb;
  }
`;

const SubmitBtn = styled.button`
  flex: 1;
  padding: 11px 16px;
  background-color: ${(props) => props.btnColor};
  color: white;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:active:not(:disabled) {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
