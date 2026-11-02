import styled from "styled-components";
import {
  ButtonUniverse,
  Title,
} from "../../index";
import { v } from "../../styles/variables";
import { useState } from "react";
import ConfettiExplosion from "react-confetti-explosion";
import { RegistrarMetodosPago } from "../organismos/formularios/RegistrarMetodosPago";
import { TablaMetodosPago } from "../organismos/tablas/TablaMetodosPago";
import { Toaster } from "sonner";
import { useMetodosPagoStore } from "../../store/MetodosPagoStore";
export function MetodosPagoTemplate() {
  const [openRegistro, SetopenRegistro] = useState(false);
  const { dataMetodosPago } = useMetodosPagoStore();
  const [accion, setAccion] = useState("");
  const [dataSelect, setdataSelect] = useState([]);
  const [isExploding, setIsExploding] = useState(false);
  function nuevoRegistro() {
    SetopenRegistro(!openRegistro);
    setAccion("Nuevo");
    setdataSelect([]);
    setIsExploding(false)
  }
  return (
    <Container>
      <Toaster richColors position="top-right"/>
      {openRegistro && (
        <RegistrarMetodosPago setIsExploding={setIsExploding}
          onClose={() => SetopenRegistro(!openRegistro)}
          dataSelect={dataSelect}
          accion={accion}
        />
      )}
      <section className="header">
        <Title>Métodos de pago</Title>
      </section>

      <section className="actions">
        <ButtonUniverse onClick={nuevoRegistro} icon={<v.iconoagregar />}>
          nuevo
        </ButtonUniverse>
      </section>
     

      <section className="main">
        {isExploding && <ConfettiExplosion />}
        <TablaMetodosPago setdataSelect={setdataSelect} setAccion={setAccion} SetopenRegistro={SetopenRegistro} data={dataMetodosPago} />
      </section>
    </Container>
  );
}
const Container = styled.div`
  height: calc(100vh - 80px);
  margin-top: 50px;
  padding: 0;
  display: grid;
  grid-template:
    "header" auto
    "actions" auto
    "main" 1fr;
  overflow: hidden;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;

  .header {
    grid-area: header;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    padding: 20px 15px;
  }

  .actions {
    grid-area: actions;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 15px;
    padding: 0 15px 20px 15px;
    flex-shrink: 0;
    width: 100%;
    box-sizing: border-box;

    > div:first-child {
      flex: 1;
    }
  }

  .main {
    grid-area: main;
    overflow-y: auto;
    overflow-x: hidden;
    box-sizing: border-box;
    padding: 0 15px;
  }
`;
