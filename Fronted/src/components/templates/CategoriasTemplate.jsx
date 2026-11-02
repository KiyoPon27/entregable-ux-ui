import styled from "styled-components";
import {
  Btn1,
  Buscador,
  BuscadorModerno,
  RegistrarCategorias,
  Title,
  useCategoriasStore,
  ButtonUniverse,
} from "../../index";
import { v } from "../../styles/variables";
import { TablaCategorias } from "../organismos/tablas/TablaCategorias";
import { useState, useRef, useMemo } from "react";
import ConfettiExplosion from "react-confetti-explosion";
export function CategoriasTemplate({ productos = [] }) {
  const [openRegistro, SetopenRegistro] = useState(false);
  const { datacategorias,setBuscador } = useCategoriasStore();
  const [accion, setAccion] = useState("");
  const [dataSelect, setdataSelect] = useState([]);
  const [isExploding, setIsExploding] = useState(false);
  const [inputBusqueda, setInputBusqueda] = useState("");
  const buscadorRef = useRef(null);

  const productosPorCategoria = useMemo(() => {
    return (productos || []).reduce((acc, producto) => {
      const categoriaId =
        producto?.categoria?.id ||
        producto?.idCategoria ||
        producto?.categoriaId ||
        null;

      if (!categoriaId) return acc;
      const key = String(categoriaId);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [productos]);

  function handleSetBuscador(value) {
    setInputBusqueda(value);
    setBuscador(value);
  }

  function nuevoRegistro() {
    SetopenRegistro(!openRegistro);
    setAccion("Nuevo");
    setdataSelect([]);
    setIsExploding(false)
  }
  return (
    <Container>
      {openRegistro && (
        <RegistrarCategorias setIsExploding={setIsExploding}
          onClose={() => SetopenRegistro(!openRegistro)}
          dataSelect={dataSelect}
          accion={accion}
        />
      )}
      <section className="header">
        <Title>Categorias</Title>
      </section>
      <section className="actions">
        <BuscadorModerno ref={buscadorRef} setBuscador={handleSetBuscador} value={inputBusqueda}/>
        <ButtonUniverse 
          onClick={nuevoRegistro}
          icon={<v.iconoagregar />}
        >
          nuevo
        </ButtonUniverse>
      </section>

      <section className="main">
        {isExploding && <ConfettiExplosion />}
        <TablaCategorias
          setdataSelect={setdataSelect}
          setAccion={setAccion}
          SetopenRegistro={SetopenRegistro}
          data={datacategorias}
          productosPorCategoria={productosPorCategoria}
        />
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
