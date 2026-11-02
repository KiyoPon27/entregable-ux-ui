import styled from "styled-components";
import {
  BuscadorModerno,
  ButtonUniverse,
  RegistrarClientesProveedores,
  Title,
  useClientesProveedoresStore,
} from "../../index";
import { v } from "../../styles/variables";
import { useRef, useState } from "react";
import ConfettiExplosion from "react-confetti-explosion";
import { useLocation } from "react-router-dom";
import { TablaClientesProveedores } from "../organismos/tablas/TablaClientesProveedores";
export function ClientesProveedoresTemplate() {
  const [openRegistro, SetopenRegistro] = useState(false);
  const { dataclipro,setBuscador } = useClientesProveedoresStore();
  const {setTipo} = useClientesProveedoresStore()
  const [accion, setAccion] = useState("");
  const [dataSelect, setdataSelect] = useState([]);
  const [isExploding, setIsExploding] = useState(false);
  const [inputBusqueda, setInputBusqueda] = useState("");
  const buscadorRef = useRef(null);
  const location = useLocation()

  function handleSetBuscador(value) {
    setInputBusqueda(value);
    setBuscador(value);
  }

  function nuevoRegistro() {
    const tipo= location.pathname==="/configuracion/clientes"?"CLIENTE":"PROVEEDOR"
    setTipo(tipo)
    SetopenRegistro(!openRegistro);
    setAccion("Nuevo");
    setdataSelect([]);
    setIsExploding(false)
  }
  return (
    <Container>
      {openRegistro && (
        <RegistrarClientesProveedores setIsExploding={setIsExploding}
          onClose={() => SetopenRegistro(!openRegistro)}
          dataSelect={dataSelect}
          accion={accion}
        />
      )}
      <section className="header">
        <Title>{location.pathname==="/configuracion/clientes"?"Clientes":"Proveedores"}</Title>
      </section>
      <section className="actions">
        <BuscadorModerno ref={buscadorRef} setBuscador={handleSetBuscador} value={inputBusqueda} />
        <ButtonUniverse
          onClick={nuevoRegistro}
          icon={<v.iconoagregar />}
        >
          nuevo
        </ButtonUniverse>
      </section>

      <section className="main">
        {isExploding && <ConfettiExplosion />}
        <TablaClientesProveedores setdataSelect={setdataSelect} setAccion={setAccion} SetopenRegistro={SetopenRegistro} data={dataclipro} />
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
