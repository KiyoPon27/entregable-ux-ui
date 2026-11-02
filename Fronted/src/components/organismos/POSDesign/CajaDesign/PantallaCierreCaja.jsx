import styled from "styled-components";
import { useEffect } from "react";
import { Btn1 } from "../../../moleculas/Btn1";
import { useCierreCajaStore } from "../../../../store/CierreCajaStore";
import { useFormattedDate } from "../../../../hooks/useFormattedDate";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useMovCajaStore } from "../../../../store/MovCajaStore";
import { FormatearNumeroDinero } from "../../../../utils/Conversiones";
import { useEmpresaStore } from "../../../../store/EmpresaStore";
import { PantallaConteoCaja } from "./PantallaConteoCaja";
import { useUsuariosStore } from "../../../../store/UsuariosStore";
import { useCajasStore } from "../../../../store/CajasStore";

export function PantallaCierreCaja() {
  const { setStateCierraCaja, dataCierreCaja, stateConteoCaja, setStateConteoCaja } = useCierreCajaStore();
  const {
    mostrarEfectivoSinVentasMovcierrecaja,
    mostrarVentasMetodoPagoMovCaja,
    mostrarIngresosYSalidasDetallados,
    totalVentasMetodoPago,
    totalVentasEfectivo,
    totalAperturaCaja,
    totalGastosVariosCaja,
    totalIngresosVariosCaja,
    totalEfectivoCajaSinVentas,
    totalEfectivoTotalCaja,
    movimientosIngresos,
    movimientosSalidas,
  } = useMovCajaStore();
  const { dataempresa } = useEmpresaStore();
  const { datausuarios } = useUsuariosStore();
  const { cajaSelectItem } = useCajasStore();
  const fechaactual = useFormattedDate();
  
  // Formatear fecha de inicio de forma segura
  let fechaInicioFormateada = "Sin fecha";
  let horaFormateada = "Sin hora";
  if (dataCierreCaja?.fechainicio) {
    try {
      const fecha = new Date(dataCierreCaja.fechainicio);
      if (!isNaN(fecha.getTime())) {
        fechaInicioFormateada = format(fecha, "dd/MM/yyyy");
        horaFormateada = format(fecha, "HH:mm a");
      }
    } catch (error) {
      console.error("Error al formatear fecha:", error);
    }
  }
  
  // Calcular duración del turno
  const calcularDuracion = () => {
    if (!dataCierreCaja?.fechainicio) return "Sin datos";
    try {
      const inicio = new Date(dataCierreCaja.fechainicio);
      const fin = new Date();
      const diferencia = fin - inicio;
      const horas = Math.floor(diferencia / (1000 * 60 * 60));
      const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
      return `${horas} horas ${minutos} minutos`;
    } catch (error) {
      return "Calculando...";
    }
  };

  const duracionTurno = calcularDuracion();
  
  const {
    isLoading: isloading1,
    isError: iserror1,
    error: error1,
  } = useQuery({
    queryKey: ["mostrar efectivo sin ventas movCaja"],
    queryFn: () =>
      mostrarEfectivoSinVentasMovcierrecaja({
        _id_cierre_caja: dataCierreCaja?.id,
      }),
  });
  
  const {
    data: dataventasmetodopago,
    isLoading: isloading2,
    isError: iserror2,
    error: error2,
  } = useQuery({
    queryKey: ["mostrar ventas metodoPago movCaja"],
    queryFn: () =>
      mostrarVentasMetodoPagoMovCaja({ _id_cierre_caja: dataCierreCaja?.id }),
  });

  const { isLoading: isloading3 } = useQuery({
    queryKey: ["mostrar ingresos salidas detallados movCaja"],
    queryFn: () =>
      mostrarIngresosYSalidasDetallados({
        _id_cierre_caja: dataCierreCaja?.id,
      }),
  });

  const isLoading = isloading1 || isloading2 || isloading3;
  const isError = iserror1 || iserror2;
  const error = error1 || error2;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setStateCierraCaja(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setStateCierraCaja]);

  if (isLoading) {
    return <Container><LoadingText>Cargando datos...</LoadingText></Container>;
  }
  if (isError) {
    return <Container><ErrorText>Error: {error?.message}</ErrorText></Container>;
  }

  return (
    <OverlayModal>
      <ModalCard>
        <ModalHeader>
          <HeaderLeft>
            <ModalTitle>💳 Cierre de Caja</ModalTitle>
            <ModalSubtitle>{cajaSelectItem?.descripcion || "Caja"} - Sucursal Principal</ModalSubtitle>
          </HeaderLeft>
          <CloseButton onClick={() => setStateCierraCaja(false)}>✕</CloseButton>
        </ModalHeader>

        <ModalContent>
          {/* SECCIÓN SUPERIOR - INFORMACIÓN GENERAL */}
          <InfoSection>
            <InfoBlock>
              <InfoLabel>📅 FECHA DE APERTURA</InfoLabel>
              <InfoValue>{fechaInicioFormateada}, {horaFormateada}</InfoValue>
            </InfoBlock>
            <Divider />
            <InfoBlock>
              <InfoLabel>⏱️ DURACIÓN DE TURNO</InfoLabel>
              <InfoValue>{duracionTurno}</InfoValue>
            </InfoBlock>
            <Divider />
            <InfoBlock>
              <InfoLabel>👤 CAJERO</InfoLabel>
              <InfoValue>{datausuarios?.nombre || "Usuario"}</InfoValue>
            </InfoBlock>
          </InfoSection>

          {/* VENTAS TOTALES Y SALDO ESPERADO */}
          <SaldoSection>
            <SaldoCard $type="initial">
              <SaldoLabel>VENTAS TOTALES</SaldoLabel>
              <SaldoValue>
                {FormatearNumeroDinero(
                  totalVentasMetodoPago,
                  dataempresa?.currency,
                  dataempresa?.iso
                )}
              </SaldoValue>
            </SaldoCard>
            <SaldoCard $type="expected">
              <SaldoLabel>EFECTIVO EN CAJA</SaldoLabel>
              <SaldoValue>
                {FormatearNumeroDinero(
                  totalEfectivoTotalCaja,
                  dataempresa?.currency,
                  dataempresa?.iso
                )}
              </SaldoValue>
            </SaldoCard>
          </SaldoSection>

          {/* DOS COLUMNAS - DINERO EN CAJA Y VENTAS POR MÉTODOS */}
          <TransactionSection>
            {/* COLUMNA IZQUIERDA - DINERO EN CAJA */}
            <TransactionColumn>
              <ColumnHeader $type="ingresos">💰 Dinero en Caja</ColumnHeader>
              <TransactionList>
                <TransactionItem>
                  <TransactionLabel>Fondo inicial de caja</TransactionLabel>
                  <TransactionValue>
                    {FormatearNumeroDinero(
                      totalAperturaCaja,
                      dataempresa?.currency,
                      dataempresa?.iso
                    )}
                  </TransactionValue>
                </TransactionItem>
                <TransactionItem>
                  <TransactionLabel>Ventas en efectivo</TransactionLabel>
                  <TransactionValue>
                    {FormatearNumeroDinero(
                      totalVentasEfectivo,
                      dataempresa?.currency,
                      dataempresa?.iso
                    )}
                  </TransactionValue>
                </TransactionItem>
                <TransactionItem>
                  <TransactionLabel>Ingresos varios</TransactionLabel>
                  <TransactionValue>
                    {FormatearNumeroDinero(
                      totalIngresosVariosCaja,
                      dataempresa?.currency,
                      dataempresa?.iso
                    )}
                  </TransactionValue>
                </TransactionItem>
                <TransactionItem>
                  <TransactionLabel>Retiros varios</TransactionLabel>
                  <TransactionValue $negativo>
                    -{FormatearNumeroDinero(
                      totalGastosVariosCaja,
                      dataempresa?.currency,
                      dataempresa?.iso
                    )}
                  </TransactionValue>
                </TransactionItem>
                <TotalItem>
                  <TotalLabel>Total</TotalLabel>
                  <TotalValue $type="ingresos">
                    {FormatearNumeroDinero(
                      totalAperturaCaja + totalVentasEfectivo + totalIngresosVariosCaja - totalGastosVariosCaja,
                      dataempresa?.currency,
                      dataempresa?.iso
                    )}
                  </TotalValue>
                </TotalItem>
              </TransactionList>
            </TransactionColumn>

            {/* COLUMNA DERECHA - VENTAS POR MÉTODOS */}
            <TransactionColumn>
              <ColumnHeader $type="egresos">💳 Ventas por Métodos</ColumnHeader>
              <TransactionList>
                {dataventasmetodopago && dataventasmetodopago.length > 0 ? (
                  <>
                    {dataventasmetodopago.map((item, index) => (
                      <TransactionItem key={index}>
                        <TransactionLabel>{item?.metodo_pago || "Método desconocido"}</TransactionLabel>
                        <TransactionValue>
                          {FormatearNumeroDinero(
                            item?.total || 0,
                            dataempresa?.currency,
                            dataempresa?.iso
                          )}
                        </TransactionValue>
                      </TransactionItem>
                    ))}
                    <TotalItem>
                      <TotalLabel>Total Ventas</TotalLabel>
                      <TotalValue $type="egresos">
                        {FormatearNumeroDinero(
                          totalVentasMetodoPago,
                          dataempresa?.currency,
                          dataempresa?.iso
                        )}
                      </TotalValue>
                    </TotalItem>
                  </>
                ) : (
                  <TransactionItem>
                    <TransactionLabel>Sin datos de ventas</TransactionLabel>
                    <TransactionValue>
                      {FormatearNumeroDinero(0, dataempresa?.currency, dataempresa?.iso)}
                    </TransactionValue>
                  </TransactionItem>
                )}
              </TransactionList>
            </TransactionColumn>
          </TransactionSection>

          {/* BOTONES DE ACCIÓN */}
          <ActionButtonsSection>
            <ActionButton $variant="secondary" onClick={() => setStateCierraCaja(false)}>
              Cancelar
            </ActionButton>
            <ActionButton $variant="info">
              📄 Imprimir Reporte
            </ActionButton>
            <ActionButton $variant="primary" onClick={() => setStateConteoCaja(true)}>
              ✓ Confirmar Cierre
            </ActionButton>
          </ActionButtonsSection>
        </ModalContent>

        {stateConteoCaja && <PantallaConteoCaja />}
      </ModalCard>
    </OverlayModal>
  );
}

// STYLED COMPONENTS PROFESIONALES - DISEÑO EMPRESARIAL

const OverlayModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  box-sizing: border-box;
`;

const ModalCard = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.1);
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(0, 0, 0, 0.08);
`;

const ModalHeader = styled.div`
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 3px solid #3498db;
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ModalTitle = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #ffffff;
`;

const ModalSubtitle = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 0.2px;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 24px;
  cursor: pointer;
  border-radius: 8px;
  padding: 6px 12px;
  transition: all 0.3s ease;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.5);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ModalContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #3498db;
    border-radius: 10px;

    &:hover {
      background: #2980b9;
    }
  }
`;

const InfoSection = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: linear-gradient(135deg, #ecf0f1 0%, #f5f7fa 100%);
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid #d5dbdb;
`;

const InfoBlock = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #2c3e50;
  text-transform: uppercase;
  letter-spacing: 0.8px;
`;

const InfoValue = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #34495e;
`;

const Divider = styled.div`
  width: 1px;
  height: 30px;
  background: #bdc3c7;
`;

const SaldoSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const SaldoCard = styled.div`
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  border: 2px solid;
  background: ${props => props.$type === "initial" ? "linear-gradient(135deg, #3498db15 0%, #3498db08 100%)" : "linear-gradient(135deg, #27ae6015 0%, #27ae6008 100%)"};
  border-color: ${props => props.$type === "initial" ? "#3498db" : "#27ae60"};
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SaldoLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #2c3e50;
  text-transform: uppercase;
  letter-spacing: 0.8px;
`;

const SaldoValue = styled.span`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.$type === "initial" ? "#2980b9" : "#27ae60"};
`;

const TransactionSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

const TransactionColumn = styled.div`
  border: 1px solid #ecf0f1;
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const ColumnHeader = styled.div`
  background: ${props => props.$type === "ingresos" ? "linear-gradient(135deg, #27ae60 0%, #229954 100%)" : "linear-gradient(135deg, #3498db 0%, #2980b9 100%)"};
  color: white;
  padding: 14px 16px;
  font-weight: 700;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TransactionList = styled.div`
  display: flex;
  flex-direction: column;
`;

const TransactionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #ecf0f1;
  font-size: 13px;

  &:last-of-type {
    border-bottom: none;
  }
`;

const TransactionLabel = styled.span`
  color: #2c3e50;
  font-weight: 500;
`;

const TransactionValue = styled.span`
  color: ${props => props.$negativo ? "#c0392b" : "#34495e"};
  font-weight: 600;
`;

const TotalItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: ${props => props.$type === "ingresos" ? "#ecf5ec" : "#ebf5fb"};
  border-top: 2px solid ${props => props.$type === "ingresos" ? "#27ae60" : "#3498db"};
  font-size: 13px;
`;

const TotalLabel = styled.span`
  color: #2c3e50;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.4px;
`;

const TotalValue = styled.span`
  font-weight: 700;
  font-size: 16px;
  color: ${props => props.$type === "ingresos" ? "#27ae60" : "#3498db"};
`;

const ActionButtonsSection = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 24px;
  background: #f8f9fa;
  border-top: 1px solid #ecf0f1;
`;

const ActionButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  text-align: center;
  min-width: 140px;

  ${props => {
    if (props.$variant === "primary") {
      return `
        background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(39, 174, 96, 0.4);
        }
      `;
    } else if (props.$variant === "info") {
      return `
        background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4);
        }
      `;
    } else {
      return `
        background: #e0e6ed;
        color: #2c3e50;
        border: 1px solid #d5dbdb;

        &:hover {
          background: #d5dbdb;
          transform: translateY(-2px);
        }
      `;
    }
  }}

  &:active {
    transform: translateY(0);
  }
`;

const LoadingText = styled.div`
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  padding: 40px;
`;

const ErrorText = styled.div`
  color: #c0392b;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  padding: 40px;
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
`;
