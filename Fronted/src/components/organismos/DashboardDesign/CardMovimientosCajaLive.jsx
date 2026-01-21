import styled from "styled-components";
import { LiveIndicator } from "../../moleculas/LiveIndicator";
import { TablaMovimientosCajaLive } from "../../organismos/tablas/TablaMovimientosCajaLive";
import { useEmpresaStore } from "../../..";
import { useMovCajaStore } from "../../../store/MovCajaStore";
import { useQuery } from "@tanstack/react-query";
import { BarLoader } from "react-spinners";
// import { useSupabaseSubscription } from "../../../hooks/useSupabaseSubscription"; // TODO: Migrar a WebSocket o polling

export const CardMovimientosCajaLive = () => {
  const { dataempresa } = useEmpresaStore();
  const { mostrarmovimientoscajalive } = useMovCajaStore();
  const { data, isLoading, error } = useQuery({
    queryKey: ["mostrar movimientos caja live"],
    queryFn: () => mostrarmovimientoscajalive({ idEmpresa: dataempresa?.id }),
    enabled: !!dataempresa,
    refetchInterval: 5000, // Polling cada 5 segundos (temporal hasta implementar WebSocket)
  });
  
  // TODO: Migrar suscripción Supabase a WebSocket o Server-Sent Events
  // useSupabaseSubscription({
  //   channelName: "public:movimientos_caja",
  //   options: { event: "*", schema: "public", table: "movimientos_caja" },
  //   queryKey: ["mostrar movimientos caja live"],  
  // });
  if (isLoading) return <BarLoader color="#6d6d6d" />;
  if (error) return <span>error...{error.message} </span>;

  return (
    <Container>
      <HeaderCard>
        <Title>Movimientos de caja</Title>
        <LiveIndicator />
      </HeaderCard>
      <TablaMovimientosCajaLive data={data} />
    </Container>
  );
};
const Container = styled.div`
  width: 100%;
  border: 2px solid ${({ theme }) => theme.bordercolorDash};
  border-radius: 20px;
  background-color: ${({ theme }) => theme.body};
`;
const HeaderCard = styled.div`
  text-align: center;
  display: flex;
  gap: 15px;
  align-items: center;
  padding-left: 20px;
`;
const Title = styled.h3`
  font-size: 25px;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
`;
