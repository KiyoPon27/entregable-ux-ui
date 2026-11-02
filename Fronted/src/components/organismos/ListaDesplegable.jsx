import styled from "styled-components";
import { Device } from "../../index";
import { useEffect, useRef, useState } from "react";
export function ListaDesplegable({
  data,
  setState,
  funcion,
  scroll,
  top,
  state,
  refetch,
  funcioncrud,
}) {
  if (!state) return;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef(null);

  const obtenerStock = (item) => {
    const stock = item?.stockTotal ?? item?.stock ?? item?.stock_total ?? 0;
    const numero = Number(stock);
    return Number.isFinite(numero) ? numero : 0;
  };

  function seleccionar(p) {
    console.log("📋 ListaDesplegable - seleccionando producto:", p);
    if (refetch) {
      refetch();
    }

    funcion(p);
    console.log("📋 Llamando setState para cerrar lista");
    setState();
    if (funcioncrud) {
      console.log("📋 Llamando funcioncrud para insertar");
      funcioncrud();
    }
  }
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      seleccionar(data[selectedIndex]);
    } else if (e.key === "ArrowUp") {
      setSelectedIndex((prevIndex) =>
        prevIndex === 0 ? data.length - 1 : prevIndex - 1
      );
    } else if (e.key === "ArrowDown") {
      setSelectedIndex((prevIndex) =>
        prevIndex === 0 ? data.length - 1 : prevIndex + 1
      );
    }
  };

  return (
    <Container
      scroll={scroll}
      $top={top}
      ref={dropdownRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <section className="contentClose" onClick={setState}>
        x
      </section>
      <section className="contentItems">
        {data?.map((item, index) => {
          const stock = obtenerStock(item);
          const esSinStock = stock === 0;

          return (
            <ItemContainer
              $sinStock={esSinStock}
              style={{
                background: index === selectedIndex ? "rgba(47,48,52,0.3)" : "",
              }}
              key={index}
              onClick={() => seleccionar(item)}
            >
              <span>🌫️</span>
              <span>{item?.nombre}</span>
              {item?.precioVenta != null && (
                <>
                  <span className="separador">|</span>
                  <span className="precio">S/ {Number(item.precioVenta).toFixed(2)}</span>
                </>
              )}
              <>
                <span className="separador">|</span>
                <span className={`stock ${esSinStock ? "agotado" : ""}`}>
                  {esSinStock ? "Agotado" : `${stock} uds.`}
                </span>
              </>
            </ItemContainer>
          );
        })}
      </section>
    </Container>
  );
}
const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
  position: absolute;
  margin-bottom: 15px;
  top: ${(props) => props.$top};
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  gap: 10px;
  z-index: 3;

  width: 95%;
  &:focus {
    outline: none;
  }
  @media ${() => Device.tablet} {
  }
  .contentClose {
    font-weight: 700;
    cursor: pointer;
    font-size: 20px;
  }
  .contentItems {
    overflow-y: auto;
    max-height: min(55vh, 420px);
    padding-right: 4px;
  }

  .contentItems::-webkit-scrollbar {
    width: 8px;
  }
  .contentItems::-webkit-scrollbar-thumb {
    background: rgba(100, 116, 139, 0.45);
    border-radius: 9999px;
  }
  .contentItems::-webkit-scrollbar-track {
    background: rgba(148, 163, 184, 0.12);
    border-radius: 9999px;
  }
`;
const ItemContainer = styled.div`
  gap: 10px;
  display: flex;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.3s;
  background: ${({ $sinStock, theme }) => $sinStock ? theme.bgtotal : "transparent"};
  opacity: ${({ $sinStock }) => ($sinStock ? 0.72 : 1)};

  &:hover {
    background-color: ${({ theme }) => theme.bgtotal};
  }
  gap: 10px;
  display: flex;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background-color: ${({ theme }) => theme.bgtotal};
  }

  .separador {
    color: #1e3a5f;
    font-weight: 700;
    opacity: 0.6;
  }

  .precio {
    color: #ef4444;
    font-weight: 600;
    white-space: nowrap;
  }

  .stock {
    color: #16a34a;
    font-weight: 600;
    white-space: nowrap;
    font-size: 0.85em;
    opacity: 0.9;
  }
`;
