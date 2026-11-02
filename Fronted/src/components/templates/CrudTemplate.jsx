import styled from "styled-components";
import { Buscador, BuscadorModerno, ButtonUniverse, Title } from "../../index";
import { v } from "../../styles/variables";
import { useRef, useState } from "react";
import ConfettiExplosion from "react-confetti-explosion";
import { Toaster } from "sonner";
import { BuscadorList } from "../ui/lists/BuscadorList";
import { useGlobalStore } from "../../store/GlobalStore";
export function CrudTemplate({
  FormularioRegistro,
  title,
  Tabla,
  data,
  setBuscador,
  tipoBuscador,
  dataBuscadorList,
  selectBuscadorList,
  setBuscadorList,stateBtnAdd,stateBuscador
}) {
  const {stateClose,isExploding,setItemSelect,setAccion,setIsExploding,setStateClose} = useGlobalStore() 
  const [inputBusqueda, setInputBusqueda] = useState("");
  const buscadorRef = useRef(null);

  function handleSetBuscador(value) {
    setInputBusqueda(value);
    if (setBuscador) setBuscador(value);
  }
 
  function nuevoRegistro() {
    setStateClose(true);
    setAccion("Nuevo");
    setItemSelect([]);
    setIsExploding(false);
  }
  return (
    <Container>
      <Toaster position="top-right" />
      {stateClose && FormularioRegistro && (
        <FormularioRegistro
        />
      )}
      <section className="header">
        <Title>{title} </Title>
        {
          stateBtnAdd &&
          <ButtonUniverse
            onClick={nuevoRegistro}
            icon={<v.iconoagregar />}
          >
            nuevo
          </ButtonUniverse>
        }
      </section>
      {
          stateBuscador &&
          <section className="actions">
        
        {tipoBuscador === "list" ? (
          <BuscadorList
            data={dataBuscadorList}
            onSelect={selectBuscadorList}
            setBuscador={setBuscadorList}
          />
        ) : (
          <BuscadorModerno
            ref={buscadorRef}
            setBuscador={handleSetBuscador}
            value={inputBusqueda}
          />
        )}
      </section>
        }
     

      <section className="main">
        {isExploding && <ConfettiExplosion />}
        {data?.length > 0 && Tabla}
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
