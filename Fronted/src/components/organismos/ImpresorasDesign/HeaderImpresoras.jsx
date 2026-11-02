import styled from "styled-components";
import { useImpresorasStore } from "../../../store/ImpresorasStore";
import { useUsuariosStore } from "../../../store/UsuariosStore";

export const HeaderImpresoras = () => {
  const {dataImpresorasPorUsuario} = useImpresorasStore()
  const {datausuarios} = useUsuariosStore()
  
  return (
    <Container>
      <SubContainer>
        <ContainerInfo>
          <span>Usuario:</span>
          <span>PC:</span>
        </ContainerInfo>
        <ContainerData>
          <span>{datausuarios?.nombres || "Sin asignar"} </span>
          <span>{dataImpresorasPorUsuario?.nombrePc || "-"} </span>
        </ContainerData>

      </SubContainer>
      <InfoText>
        💡 Tu configuración de impresora se guarda automáticamente y está disponible en todas las cajas
      </InfoText>
    </Container>
  );
};
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 20px;
  position: relative;
  border-top: solid 1px ${({ theme }) => theme.bg};
  border-bottom: solid 1px ${({ theme }) => theme.bg};
  margin-bottom: 20px;
`;
const SubContainer = styled.div`
  display: flex;
  gap: 12px;
`;
const ContainerInfo = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: column;
  text-align: end;
  font-weight: bold;
`;
const ContainerData = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: column;
  text-align: start;
`;
const InfoText = styled.p`
  color: #28a745;
  font-size: 13px;
  margin: 0;
  text-align: center;
  font-weight: 500;
`;
