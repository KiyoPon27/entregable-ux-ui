import { useQuery } from "@tanstack/react-query";
import api from "../../api/api";
import styled from "styled-components";

export function VerificadorVenta({ ventaId, origen = "-" }) {
  // Si es ajuste manual, mostrar lápiz sin consultar
  if (origen === "AJUSTE_MANUAL") {
    return <StatusIcon title="Ajuste manual de inventario">✏️</StatusIcon>;
  }

  // Si es compra, mostrar caja
  if (origen === "COMPRA") {
    return <StatusIcon title="Movimiento por compra">📦</StatusIcon>;
  }

  // Si es traspaso, mostrar flechas
  if (origen === "TRASPASO") {
    return <StatusIcon title="Traspaso entre almacenes">🔄</StatusIcon>;
  }

  // Si no hay ID de venta y no es de los orígenes anteriores, mostrar interrogación
  if (!ventaId) {
    return <StatusIcon title="Sin venta asociada">❓</StatusIcon>;
  }

  // Si llegamos aquí, es una venta y tenemos ID, verificar existencia
  return <VerificadorVentaQuery ventaId={ventaId} />;
}

function VerificadorVentaQuery({ ventaId }) {
  const { data } = useQuery({
    queryKey: ["verificar-venta", ventaId],
    queryFn: async () => {
      if (!ventaId) return { existe: false };
      try {
        const response = await api.get(`/ventas/existe/${ventaId}`);
        return response.data;
      } catch (error) {
        console.error("Error verificando venta:", error);
        return { existe: false };
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hora
  });

  if (data?.existe) {
    return <StatusIcon title={`Venta #${ventaId} existe`} $valid={true}>✅</StatusIcon>;
  }

  return <StatusIcon title={`Venta #${ventaId} fue eliminada`} $valid={false}>❌</StatusIcon>;
}

const StatusIcon = styled.span`
  font-size: 16px;
  cursor: help;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: ${(props) => {
    if (props.$valid === null) return "#999";
    if (props.$valid) return "#22c55e";
    if (props.$valid === false) return "#ef4444";
    return "inherit";
  }};
  font-weight: bold;
`;