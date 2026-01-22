import styled from "styled-components";
import {
  Btn1,
  Buscador,
  RegistrarProductos,
  TablaProductos,
  Title,
  useProductosStore,
} from "../../index";
import { FiltroInventariosProductos } from "../organismos/FiltroInventariosProductos";
import { v } from "../../styles/variables";
import { useEffect, useState } from "react";
import ConfettiExplosion from "react-confetti-explosion";
import { Toaster } from "sonner";
export function ProductosTemplate() {
  const [openRegistro, SetopenRegistro] = useState(false);
  const { dataProductos,setBuscador,generarCodigo } = useProductosStore();
  const [accion, setAccion] = useState("");
  const [dataSelect, setdataSelect] = useState([]);
  const [isExploding, setIsExploding] = useState(false);
  const [filtroInventario, setFiltroInventario] = useState("todos");

  // Filtrar productos según inventario
  const productosFiltrados = Array.isArray(dataProductos)
    ? dataProductos.filter(p => {
        if (filtroInventario === "todos") return true;
        if (filtroInventario === "habilitado") return p.manejaInventarios === true;
        if (filtroInventario === "deshabilitado") return p.manejaInventarios === false;
        return true;
      })
    : [];
  function nuevoRegistro() {
    SetopenRegistro(!openRegistro);
    setAccion("Nuevo");
    setdataSelect([]);
    setIsExploding(false)
    generarCodigo();
   
  }

  return (
    <Container>
      <Toaster/>
   {
    openRegistro &&  <RegistrarProductos setIsExploding={setIsExploding}
          onClose={() => SetopenRegistro(!openRegistro)}
          dataSelect={dataSelect}
          accion={accion} state={openRegistro}
        />
   }
       
     
      <section className="area1">
        <Title>Productos</Title>
        <Btn1
          funcion={nuevoRegistro}
          bgcolor={v.colorPrincipal}
          titulo="nuevo"
          icono={<v.iconoagregar />}
        />
      </section>
      <section className="area2">
        <div className="filtros-buscador">
          <FiltroInventariosProductos value={filtroInventario} onChange={setFiltroInventario} />
          <Buscador setBuscador={setBuscador}/>
        </div>
      </section>

      <section className="main">
        {isExploding && <ConfettiExplosion />}
        <TablaProductos setdataSelect={setdataSelect} setAccion={setAccion} SetopenRegistro={SetopenRegistro} data={productosFiltrados} />
      </section>
    
    </Container>
  );
}
const Container = styled.div`
  height: calc(100vh - 80px);
  
  margin-top:50px;
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
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-bottom: 1em;
  }
  .filtros-buscador {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 2.5em;
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
  }
  .filtros-buscador > div:last-child {
    flex: 1 1 400px;
    min-width: 350px;
    max-width: 500px;
  }
  .main {
    grid-area: main;
    /* background-color: rgba(237, 7, 221, 0.14); */
  }
`;
