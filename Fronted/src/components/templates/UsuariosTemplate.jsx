import styled from "styled-components";
import {
  Btn1,
  Buscador,
  Title,
  useUsuariosStore,
} from "../../index";
import { RegistrarUsuarios } from "../organismos/formularios/RegistrarUsuarios";
import { v } from "../../styles/variables";
import { useState } from "react";
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
  const [buscador, setBuscador] = useState("");
  
  const { data: usuarios, isLoading } = useMostrarUsuariosQuery();
  
  // Filtrar usuarios por buscador
  const usuariosFiltrados = usuarios?.filter(u => 
    buscador === "" || 
    u.nombres?.toLowerCase().includes(buscador.toLowerCase()) ||
    u.correo?.toLowerCase().includes(buscador.toLowerCase()) ||
    u.nroDoc?.toLowerCase().includes(buscador.toLowerCase())
  ) || [];
  
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

      <section className="area1">
        <Title>Usuarios</Title>
        <Btn1
          funcion={nuevoRegistro}
          bgcolor={v.colorPrincipal}
          titulo="nuevo"
          icono={<v.iconoagregar />}
        />
      </section>
      <section className="area2">
        <Buscador setBuscador={setBuscador} />
      </section>

      <section className="main">
        {isExploding && <ConfettiExplosion />}
        {isLoading ? (
          <div>Cargando usuarios...</div>
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
  padding: 15px;
  display: grid;
  grid-template:
    "area1" 60px
    "area2" 60px
    "main" auto;
  .area1 {
    grid-area: area1;
    /* background-color: rgba(103, 93, 241, 0.14); */
    display: flex;
    justify-content: end;
    align-items: center;
    gap: 15px;
  }
  .area2 {
    grid-area: area2;
    /* background-color: rgba(7, 237, 45, 0.14); */
    display: flex;
    justify-content: end;
    align-items: center;
  }
  .main {
    grid-area: main;
    /* background-color: rgba(237, 7, 221, 0.14); */
  }
`;
