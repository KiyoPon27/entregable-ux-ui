import styled from "styled-components";
import {
  FormatearNumeroDinero,
  useEmpresaStore,
  useUsuariosStore,
} from "../../../..";
import { useMovCajaStore } from "../../../../store/MovCajaStore";
import { useMetodosPagoStore } from "../../../../store/MetodosPagoStore";
import { useState, useEffect } from "react";
import { useCierreCajaStore } from "../../../../store/CierreCajaStore";
import { useFormattedDate } from "../../../../hooks/useFormattedDate";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BarLoader } from "react-spinners";
import {
  FiArrowLeft,
  FiAlertTriangle,
  FiCheckCircle,
  FiDollarSign,
  FiLock,
  FiTrendingDown,
  FiTrendingUp,
  FiInfo,
} from "react-icons/fi";
export function PantallaConteoCaja() {
  const [montoEfectivo, setMontoEfectivo] = useState("");
  const { totalEfectivoTotalCaja, insertarMovCaja } = useMovCajaStore();
  const { datausuarios } = useUsuariosStore();
  const fechaactual = useFormattedDate();
  const { dataempresa } = useEmpresaStore();
  const { dataMetodosPago } = useMetodosPagoStore();
  const {
    cerrarTurnoCaja,
    dataCierreCaja,
    setStateConteoCaja,
    setStateCierraCaja,
  } = useCierreCajaStore();
  const queryClient = useQueryClient();
  const insertar = async (data) => {
    const efectivoReal = parseFloat(data.montoreal) || 0;
    const diferenciaLocal = efectivoReal - totalEfectivoTotalCaja;
    const p = {
      id: dataCierreCaja?.id,
      fechacierre: fechaactual,
      id_usuario: datausuarios?.id,
      total_efectivo_calculado: parseFloat(totalEfectivoTotalCaja),
      total_efectivo_real: efectivoReal,
      estado: 1,
      diferencia_efectivo: diferenciaLocal,
    };
    console.log(p);
    await cerrarTurnoCaja(p);
    
    // Registrar movimiento de cierre de caja con el total calculado
    const id_metodo_pago = dataMetodosPago
      ?.filter((item) => item.nombre === "Efectivo")
      .map((item) => item.id)[0];
    
    if (id_metodo_pago) {
      const pmovcaja = {
        fecha_movimiento: fechaactual,
        tipo_movimiento: "cierre",
        monto: parseFloat(totalEfectivoTotalCaja),
        id_metodo_pago: id_metodo_pago,
        descripcion: `Cierre de caja - Total en caja: ${FormatearNumeroDinero(totalEfectivoTotalCaja, dataempresa?.currency, dataempresa?.iso)}`,
        id_usuario: datausuarios?.id,
        id_cierre_caja: dataCierreCaja?.id,
      };
      console.log("Movimiento cierre:", pmovcaja);
      await insertarMovCaja(pmovcaja);
    }
  };
  const { isPending, mutate: doInsertar } = useMutation({
    mutationKey: ["cerrar turno caja"],
    mutationFn: insertar,
    onSuccess: () => {
      toast.success("🎉 Caja cerrada correctamente!!!");
      setStateConteoCaja(false);
      setStateCierraCaja(false);
      setMontoEfectivo("");
      queryClient.invalidateQueries(["mostrar cierre de caja"]);
      // No cerrar sesión después de cerrar caja
    },
    onError: (error) => {
      toast.error(`Error al cerrar caja: ${error.message}`);
    },
  });
  const handleSub = (e) => {
    e.preventDefault();
    doInsertar({ montoreal: montoEfectivo });
  };

  // Listener para tecla ESC para cerrar el modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setStateConteoCaja(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setStateConteoCaja]);

  // Calcula la diferencia entre el total esperado en caja y el monto ingresado
  const montoEfectivoNumero = parseFloat(montoEfectivo) || 0;
  const diferencia = montoEfectivo !== "" ? montoEfectivoNumero - totalEfectivoTotalCaja : -totalEfectivoTotalCaja;
  const hasDifference = Math.abs(diferencia) > 0.01;
  const estadoCaja = diferencia === 0 ? "cuadrada" : diferencia > 0 ? "sobrante" : "faltante";
  const mensajeDiferencia =
    estadoCaja === "sobrante"
      ? "Se registrará el sobrante. Verifica que no haya errores en el conteo."
      : "Se registrará el faltante y se notificará a gerencia. Esta diferencia quedará en tu historial.";

  return (
    <Overlay>
      <ModalCard>
        <Header>
          <button className="btn-back" onClick={() => setStateConteoCaja(false)}>
            <FiArrowLeft />
            <span>Volver</span>
          </button>
          <div className="header-icon">
            <FiLock />
          </div>
          <h2>Confirmación de Cierre de Caja</h2>
          <p>Verifica el efectivo físico antes de cerrar</p>
        </Header>

        <Content>
          <ExpectedCard>
            <div className="icon-box">
              <FiDollarSign />
            </div>
            <div>
              <span className="label">Efectivo esperado en caja</span>
              <h3>
                {FormatearNumeroDinero(
                  totalEfectivoTotalCaja,
                  dataempresa?.currency,
                  dataempresa?.iso
                )}
              </h3>
              <small>Calculado según movimientos del turno</small>
            </div>
          </ExpectedCard>

          {isPending ? (
            <LoaderWrap>
              <BarLoader color="#2563eb" />
            </LoaderWrap>
          ) : (
            <form onSubmit={handleSub}>
              <FieldGroup>
                <label>
                  <FiDollarSign /> ¿Cuánto de EFECTIVO hay en caja física?
                </label>
                <div className="input-wrap">
                  <span className="currency">$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={montoEfectivo}
                    onChange={(e) => setMontoEfectivo(e.target.value)}
                    autoFocus
                  />
                </div>
              </FieldGroup>

              {montoEfectivo !== "" && (
                <DifferenceCard $state={estadoCaja}>
                  <div className="icon-wrap">
                    {estadoCaja === "cuadrada" ? (
                      <FiCheckCircle />
                    ) : estadoCaja === "sobrante" ? (
                      <FiTrendingUp />
                    ) : (
                      <FiTrendingDown />
                    )}
                  </div>
                  <div>
                    <span className="tag">
                      {estadoCaja === "cuadrada"
                        ? "Caja Cuadrada"
                        : estadoCaja === "sobrante"
                        ? "Sobrante"
                        : "Faltante"}
                    </span>
                    <h4>
                      {diferencia >= 0 ? "+" : ""}
                      {FormatearNumeroDinero(
                        diferencia,
                        dataempresa?.currency,
                        dataempresa?.iso
                      )}
                    </h4>
                    {hasDifference && (
                      <div className="msg-box">
                        <FiInfo />
                        <p>{mensajeDiferencia}</p>
                      </div>
                    )}
                  </div>
                </DifferenceCard>
              )}

              <InfoBox>
                <FiAlertTriangle />
                <div>
                  <strong>Importante</strong>
                  <p>
                    Al confirmar el cierre, no podrás realizar más operaciones en este turno.
                    Asegúrate de haber contado correctamente el efectivo físico.
                  </p>
                </div>
              </InfoBox>

              <Actions>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setStateConteoCaja(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-confirm"
                  disabled={montoEfectivo === ""}
                >
                  <FiLock />
                  Cerrar Turno
                </button>
              </Actions>
            </form>
          )}
        </Content>
      </ModalCard>
    </Overlay>
  );
}
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: linear-gradient(145deg, #0f172a 0%, #1e293b 60%, #0f172a 100%);
  z-index: 9999;
  padding: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalCard = styled.div`
  width: min(100%, 580px);
  border-radius: 16px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 24px 40px rgba(2, 6, 23, 0.45);
  display: flex;
  flex-direction: column;
  min-height: 660px;
  font-family: "Inter", "Segoe UI", "Poppins", sans-serif;

  *, *::before, *::after {
    box-sizing: border-box;
  }
`;

const Header = styled.div`
  background: linear-gradient(135deg, #1e293b 0%, #334155 55%, #1e293b 100%);
  color: #ffffff;
  width: 100%;
  padding: 18px 22px 20px;
  text-align: center;
  position: relative;

  .btn-back {
    position: absolute;
    left: 16px;
    top: 14px;
    border: none;
    background: transparent;
    color: #cbd5e1;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
  }

  .btn-back:hover {
    color: #ffffff;
  }

  .header-icon {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    margin: 10px auto 8px;
    background: rgba(255, 255, 255, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }

  h2 {
    margin: 0 auto;
    max-width: 90%;
    font-size: clamp(24px, 2.2vw, 34px);
    font-weight: 800;
    letter-spacing: -0.4px;
    line-height: 1.12;
    white-space: normal;
    overflow-wrap: break-word;
  }

  p {
    margin: 6px 0 0;
    color: #cbd5e1;
    font-size: 13px;
  }
`;

const Content = styled.div`
  width: 100%;
  padding: 20px;
  background: #f8fafc;
  flex: 1;

  form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    height: 100%;
  }
`;

const ExpectedCard = styled.div`
  border-radius: 14px;
  border: 2px solid #bfdbfe;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  width: 100%;
  padding: 18px;
  display: flex;
  gap: 12px;
  align-items: center;

  .icon-box {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: #2563eb;
    color: #ffffff;
    display: grid;
    place-items: center;
    font-size: 18px;
    flex-shrink: 0;
  }

  .label {
    font-size: 11px;
    text-transform: uppercase;
    color: #1d4ed8;
    letter-spacing: 0.6px;
    font-weight: 700;
  }

  h3 {
    margin: 0 0 3px;
    font-size: clamp(24px, 2.8vw, 38px);
    color: #1e3a8a;
    line-height: 1.1;
  }

  small {
    color: #2563eb;
    font-size: 11px;
    font-weight: 500;
  }
`;

const LoaderWrap = styled.div`
  padding: 20px 0 8px;
  display: flex;
  justify-content: center;
`;

const FieldGroup = styled.div`
  width: 100%;

  label {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 6px;
    font-size: 11px;
    font-weight: 800;
    color: #334155;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .input-wrap {
    position: relative;
    width: 100%;
  }

  .currency {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 18px;
    color: #94a3b8;
    pointer-events: none;
  }

  input {
    width: 100%;
    border: 2px solid #cbd5e1;
    border-radius: 12px;
    padding: 13px 14px 13px 42px;
    font-size: clamp(22px, 2.9vw, 34px);
    text-align: center;
    color: #0f172a;
    font-weight: 500;
    outline: none;
  }

  input:focus {
    border-color: #64748b;
    box-shadow: 0 0 0 4px rgba(100, 116, 139, 0.15);
  }
`;

const DifferenceCard = styled.article`
  width: 100%;
  border-radius: 14px;
  border: 2px solid
    ${({ $state }) =>
      $state === "cuadrada" ? "#86efac" : $state === "sobrante" ? "#fcd34d" : "#fca5a5"};
  background: ${({ $state }) =>
    $state === "cuadrada" ? "#ecfdf5" : $state === "sobrante" ? "#fffbeb" : "#fef2f2"};
  padding: 12px;
  display: flex;
  gap: 12px;

  .icon-wrap {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    color: #ffffff;
    background: ${({ $state }) =>
      $state === "cuadrada" ? "#059669" : $state === "sobrante" ? "#d97706" : "#dc2626"};
    display: grid;
    place-items: center;
    font-size: 18px;
    flex-shrink: 0;
  }

  .tag {
    display: block;
    font-size: 11px;
    text-transform: uppercase;
    font-weight: 700;
    color: ${({ $state }) =>
      $state === "cuadrada" ? "#047857" : $state === "sobrante" ? "#92400e" : "#991b1b"};
    letter-spacing: 0.4px;
    margin-bottom: 2px;
  }

  h4 {
    margin: 0;
    font-size: clamp(20px, 3.1vw, 30px);
    line-height: 1.1;
    color: ${({ $state }) =>
      $state === "cuadrada" ? "#064e3b" : $state === "sobrante" ? "#78350f" : "#7f1d1d"};
  }

  .msg-box {
    margin-top: 8px;
    border-radius: 10px;
    padding: 8px 10px;
    display: flex;
    gap: 8px;
    align-items: flex-start;
    background: ${({ $state }) => ($state === "sobrante" ? "#fef3c7" : "#fee2e2")};
    color: ${({ $state }) => ($state === "sobrante" ? "#92400e" : "#991b1b")};
    font-size: 12px;
    line-height: 1.4;
  }

  .msg-box svg {
    margin-top: 2px;
    flex-shrink: 0;
  }

  .msg-box p {
    margin: 0;
  }
`;

const InfoBox = styled.div`
  width: 100%;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  padding: 11px;
  display: flex;
  gap: 8px;
  color: #475569;

  svg {
    margin-top: 2px;
    font-size: 16px;
    flex-shrink: 0;
  }

  strong {
    display: block;
    margin-bottom: 2px;
    font-size: 13px;
    color: #334155;
  }

  p {
    margin: 0;
    font-size: 11px;
    line-height: 1.45;
  }
`;

const Actions = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: auto;

  button {
    border-radius: 12px;
    font-size: 15px;
    font-weight: 700;
    padding: 12px 14px;
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
  }

  .btn-cancel {
    background: #ffffff;
    border: 2px solid #cbd5e1;
    color: #334155;
  }

  .btn-cancel:hover {
    background: #f8fafc;
  }

  .btn-confirm {
    background: linear-gradient(90deg, #1e293b 0%, #334155 100%);
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.35);
  }

  .btn-confirm svg {
    font-size: 14px;
  }

  .btn-confirm:hover {
    filter: brightness(0.95);
  }

  .btn-confirm:disabled {
    opacity: 0.5;
    box-shadow: none;
    cursor: not-allowed;
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;

    button {
      font-size: 14px;
      padding: 10px 12px;
    }
  }
`;
