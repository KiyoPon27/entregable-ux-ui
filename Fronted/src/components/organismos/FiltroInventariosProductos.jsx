import styled from "styled-components";
import { FaCheck, FaRegSquare } from "react-icons/fa";

export function FiltroInventariosProductos({ value, onChange }) {
  return (
    <Container>
      <span className="label">Filtrar por inventario:</span>
      <div className="filtros">
        <button
          className={value === "todos" ? "activo" : ""}
          onClick={() => onChange("todos")}
        >
          Todos
        </button>
        <button
          className={value === "habilitado" ? "activo" : ""}
          onClick={() => onChange("habilitado")}
        >
          <FaCheck style={{ color: "#2196f3" }} /> Habilitado
        </button>
        <button
          className={value === "deshabilitado" ? "activo" : ""}
          onClick={() => onChange("deshabilitado")}
        >
          <FaRegSquare style={{ color: "#757575" }} /> Deshabilitado
        </button>
      </div>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5em;
  margin: 0 0 2em 0;
  justify-content: flex-end;
  .label {
    font-weight: 700;
    font-size: 1.1em;
    color: ${({ theme }) => theme.text};
  }
  .filtros {
    display: flex;
    gap: 0.5em;
    button {
      background: #f5f5f5;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 0.5em 1.2em;
      font-size: 1em;
      font-weight: 600;
      color: #333;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5em;
      transition: background 0.2s, color 0.2s, border 0.2s;
      &.activo {
        background: #2196f3;
        color: #fff;
        border: 2px solid #2196f3;
      }
      &:hover {
        background: #e3f2fd;
        color: #1976d2;
      }
    }
  }
`