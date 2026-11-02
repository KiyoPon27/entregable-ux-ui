import { Icon } from "@iconify/react/dist/iconify.js";
import styled from "styled-components";
import { Buscador } from "../Buscador";
import { Btn1 } from "../../..";
export function PanelBuscador({
  setStateBuscador,
  setBuscador,
  displayField,
  data,selector,funcion
}) {
  return (
    <Container>
      <div className="subcontent">
        <HeaderSection>
          <Icon
            className="icono"
            icon="ep:arrow-left-bold"
            onClick={setStateBuscador}
          />
          <Btn1 titulo={"Agregar"} funcion={funcion}/>
        </HeaderSection>
       
        <Buscador setBuscador={setBuscador}  />
        
        <ListContainer>
          {data?.map((item, index) => {
            return <Item onClick={()=>{
              selector(item) 
              setStateBuscador()
            }} key={index}>👓{item[displayField]}</Item>;
          })}
        </ListContainer>
      </div>
    </Container>
  );
}
const Container = styled.div`
  background-color: #fff;
  height: 100%;
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  
  .subcontent{
    display: flex;
    flex-direction: column;
    gap: 10px;
    height: 100%;
    box-sizing: border-box;
    padding: 20px;
    flex: 1;
    overflow: hidden;
  }
`;
const HeaderSection = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  flex-wrap: nowrap;
  
  .icono {
    cursor: pointer;
    font-size: 24px;
    flex-shrink: 0;
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.1);
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
  
  > div {
    flex-shrink: 0;
    margin-left: auto;
  }
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #999;
  }
`;

const Item = styled.div`
  border-radius: 8px;
  font-size: 14px;
  padding: 12px 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  word-break: break-word;
  white-space: normal;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #e8e8e8;
    border-color: #ccc;
    cursor: pointer;
    transform: translateX(4px);
  }
  
  &:active {
    background-color: #ddd;
  }
`;
