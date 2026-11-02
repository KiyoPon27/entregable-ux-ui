import styled from "styled-components";
import {
  BuscadorModerno,
  ButtonUniverse,
  Title,
  useUsuariosStore,
} from "../../index";
import { RegistrarUsuarios } from "../organismos/formularios/RegistrarUsuarios";
import { v } from "../../styles/variables";
import { useState, useRef } from "react";
import ConfettiExplosion from "react-confetti-explosion";
import { Toaster } from "sonner";
import { TablaUsuarios } from "../organismos/tablas/TablaUsuarios";
import { useMostrarUsuariosQuery } from "../../tanstack/UsuariosStack";

export function UsuariosTemplate() {
  const [openRegistro, SetopenRegistro] = useState(false);
  const [dataSelect, setdataSelect] = useState([]);
  const { setItemSelect } = useUsuariosStore();
  const [isExploding, setIsExploding] = useState(false);
  const [accion, setAccion] = useState("Nuevo");
  const [inputBusqueda, setInputBusqueda] = useState("");
  const buscadorRef = useRef(null);
  
  const { data: usuarios, isLoading } = useMostrarUsuariosQuery();
  
  // Filtrar usuarios por buscador
  const usuariosFiltrados = usuarios?.filter(u => 
    inputBusqueda === "" || 
    u.nombres?.toLowerCase().includes(inputBusqueda.toLowerCase()) ||
    u.correo?.toLowerCase().includes(inputBusqueda.toLowerCase()) ||
    u.nroDoc?.toLowerCase().includes(inputBusqueda.toLowerCase())
  ) || [];

  function handleSetBuscador(value) {
    setInputBusqueda(value);
  }
  
  function nuevoRegistro() {
    SetopenRegistro(!openRegistro);
    setAccion("Nuevo");
    setdataSelect([]);
    setIsExploding(false);
    setItemSelect(null);
  }
  
  return (
    <Container>
      <Toaster />
      {openRegistro && (
        <RegistrarUsuarios
          setIsExploding={setIsExploding}
          onClose={() => SetopenRegistro(!openRegistro)}
          dataSelect={dataSelect}
          accion={accion}
        />
      )}

      <section className="header">
        <Title>Usuarios</Title>
      </section>

      <section className="actions">
        <BuscadorModerno 
          ref={buscadorRef} 
          setBuscador={handleSetBuscador} 
          value={inputBusqueda} 
        />
        <ButtonUniverse
          onClick={nuevoRegistro}
          icon={<v.iconoagregar />}
        >
          nuevo
        </ButtonUniverse>
      </section>

      <section className="main">
        {isExploding && <ConfettiExplosion />}
        {isLoading ? (
          <LoadingState>Cargando usuarios...</LoadingState>
        ) : (
          <TablaUsuarios
            setdataSelect={setItemSelect}
            setAccion={setAccion}
            SetopenRegistro={SetopenRegistro}
            data={usuariosFiltrados}
          />
        )}
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

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  font-size: 16px;
  color: #6b7280;
  background: ${({ theme }) => theme.bg3};
  border: 1px solid ${({ theme }) => theme.color2};
  border-radius: 20px;
`;


