import styled from "styled-components";
import { forwardRef } from "react";
import { v } from "../../styles/variables";
export const Buscador = forwardRef(function Buscador({ setBuscador, value }, ref) {
  function buscar(e) {
    setBuscador(e.target.value);
  }

  return (
    <Container>
      <section className="content">
        <v.iconobuscar className="icono" />
        <input
          ref={ref}
          className="input-grande"
          placeholder="...buscar"
          value={value ?? ""}
          onChange={buscar}
        />
      </section>
    </Container>
  );
});
const Container = styled.div`
  border-radius: 10px;
  height: 60px;
  align-items: center;
  display: flex;
  color: ${(props) => props.theme.text};
  border: 2px solid ${({ theme }) => theme.color2};
  flex-shrink: 0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  
  .content {
    padding: 15px;
    gap: 10px;
    display: flex;
    align-items: center;
    position: relative;
    width: 100%;
    box-sizing: border-box;
    
    .icono {
      font-size: 18px;
      flex-shrink: 0;
    }
    
    input {
      font-size: 20px;
      width: 100%;
      outline: none;
      background: none;
      border: 0;
      color: ${(props) => props.theme.text};
      padding: 10px 8px;
      box-sizing: border-box;
    }
    
    .input-grande {
      font-size: 22px;
      padding: 14px 12px;
    }
  }
`;
