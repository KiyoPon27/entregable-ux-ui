import styled from "styled-components";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

const MAX_DROPDOWN_ITEMS = 80;

export function BuscadorList({
  setBuscador,
  data,
  onSelect,
  displayField = "nombre",
  itemSelect,
  externalValue,
  inputRef,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const safeData = Array.isArray(data) ? data : [];
  const effectiveValue = externalValue !== undefined ? externalValue : inputValue;

  useEffect(() => {
    if (!effectiveValue) {
      setIsOpen(false);
    }
  }, [effectiveValue]);
  const [selected, setSelected] = useState(
    itemSelect?.[displayField] || "Selecciona una opcion"
  );

  function buscar(e) {
    const value = e.target.value;
    if (externalValue === undefined) {
      setInputValue(value);
    }
    setBuscador(value);
    setIsOpen(!!value);
  }
  const handleSelect = (item) => {
    setSelected(item);
    setIsOpen(false);
    onSelect(item);
  };

  const visibleItems = safeData.slice(0, MAX_DROPDOWN_ITEMS);
  const hasHiddenItems = safeData.length > MAX_DROPDOWN_ITEMS;

  return (
    <Container>
      <section className="content">
      <Icon icon="ic:outline-search" width="25" height="25" />
        <input
          ref={inputRef}
          placeholder="...buscar"
          value={effectiveValue}
          onChange={buscar}
          onFocus={() => setIsOpen(!!effectiveValue && safeData.length > 0)}
        />
        {isOpen && (
          <DropdownList>
            {visibleItems.map((item, index) => {
              return (
                <DropdownItem
                  key={index}
                  onClick={() => handleSelect(item)}
                  isSelected={item?.[displayField] === selected?.[displayField]}
                >
                  {item === selected && <CheckMark>✔</CheckMark>}
                  {item?.[displayField]}
                </DropdownItem>
              );
            })}
            {hasHiddenItems && (
              <DropdownInfo>
                Mostrando {MAX_DROPDOWN_ITEMS} de {safeData.length} resultados
              </DropdownInfo>
            )}
          </DropdownList>
        )}
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
      font-size: 18px;
      width: 100%;
      outline: none;
      background: none;
      border: 0;
      color: ${(props) => props.theme.text};
    }
  }
`;
const DropdownList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background-color: ${({ theme }) => theme.body};
  border: 1px solid #333;
  border-radius: 5px;
  margin-top: 10px;
  max-height: 150px;
  overflow-y: auto;
  z-index: 1000;

  // Evita que se adapte al tamaño del header
  min-width: 200px; /* Ancho mínimo */
  width: max-content; /* Ancho según el contenido */
  max-width: 300px; /* Ancho máximo */
`;

const DropdownItem = styled.div`
  padding: 10px 15px;
  color: ${({ theme }) => theme.text};
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  background-color: ${({ isSelected }) =>
    isSelected ? (theme) => theme.bg : "transparent"};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.bg};
  }
`;

const CheckMark = styled.span`
  color: ${({ theme }) => theme.text};
  font-size: 14px;
`;

const DropdownInfo = styled.div`
  padding: 8px 12px;
  font-size: 12px;
  opacity: 0.8;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;
