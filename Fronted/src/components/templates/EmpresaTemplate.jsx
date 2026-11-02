import { NavLink, Outlet } from "react-router-dom";
import styled from "styled-components";
import { FiLayers, FiDollarSign } from "react-icons/fi";

export const EmpresaTemplate = () => {
  return (
    <Container>
      <TopBar>
        <ActionsPanel>
          <PanelTitle>Empresas</PanelTitle>
          <TabsWrap>
            <TabItem to="empresabasicos">
              <FiLayers />
              <span>Básico</span>
            </TabItem>
            <TabItem to="monedaconfig">
              <FiDollarSign />
              <span>Moneda</span>
            </TabItem>
          </TabsWrap>
        </ActionsPanel>
      </TopBar>

      <MainArea>
        <Outlet />
      </MainArea>
    </Container>
  );
};

const Container = styled.div`
  margin-top: 0;
  padding: 18px 15px 14px;
  width: 100%;
  box-sizing: border-box;
  max-width: 1460px;
  margin-left: auto;
  margin-right: auto;
`;

const TopBar = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 24px;

  @media (max-width: 980px) {
    justify-content: flex-start;
  }
`;

const MainArea = styled.section`
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
`;

const ActionsPanel = styled.div`
  border: 1.8px solid #111111;
  border-radius: 14px;
  background: ${({ theme }) => theme.bg3};
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 330px;
`;

const PanelTitle = styled.span`
  font-size: 13px;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const TabsWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TabItem = styled(NavLink)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 16px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.color2};
  background: ${({ theme }) => theme.bg3};
  text-decoration: none;
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  transition: transform 0.18s ease, background 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    transform: translateY(-1px);
    background: ${({ theme }) => theme.bg};
  }

  &.active {
    background: linear-gradient(120deg, #0f172a 0%, #1e293b 55%, #334155 100%);
    color: #f8fafc;
    border-color: rgba(148, 163, 184, 0.35);
    box-shadow: 0 10px 18px rgba(15, 23, 42, 0.15);
  }
`;