import styled from "styled-components";
import { v } from "../../styles/variables";
export function Buscador({ setBuscador }) {
  function buscar(e) {
    setBuscador(e.target.value);
  }

  return (
    <Container>
      <section className="content">
        <v.iconobuscar className="icono" />
        <input className="input-grande" placeholder="...buscar" onChange={buscar} />
      </section>
    </Container>
  );
}
const Container = styled.div`
  border-radius: 10px;
  height: 60px;
  align-items: center;
  display: flex;
  color: ${(props) => props.theme.text};
  border: 2px solid ${({ theme }) => theme.color2};
  .content {
    padding: 15px;
    gap: 10px;
    display: flex;
    align-items: center;
    position: relative;
    width: 100%;
    .icono {
      font-size: 18px;
    }
    input {
      font-size: 20px;
      width: 100%;
      min-width: 320px;
      max-width: 500px;
      outline: none;
      background: none;
      border: 0;
      color: ${(props) => props.theme.text};
      padding: 10px 8px;
    }
    .input-grande {
      font-size: 22px;
      min-width: 350px;
      max-width: 600px;
      padding: 14px 12px;
    }
  }
`;
