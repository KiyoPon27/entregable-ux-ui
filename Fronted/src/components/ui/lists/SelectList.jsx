import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

export const SelectList = ({
  data,
  placeholder,
  onSelect,
  displayField = "nombre",
  itemSelect,
  appearance = "default",
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(itemSelect || null);
  const containerRef = useRef(null);

  useEffect(() => {
    setSelected(itemSelect || null);
  }, [itemSelect]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const handleSelect = (item) => {
    setSelected(item);
    setIsOpen(false);
    if (onSelect) {
      onSelect(item);
    }
  };

  const selectedLabel =
    itemSelect?.[displayField] ||
    selected?.[displayField] ||
    placeholder ||
    "Seleccionar";

  return (
    <DropdownContainer ref={containerRef} data-appearance={appearance} className={className}>
      <DropdownHeader
        type="button"
        $isOpen={isOpen}
        $appearance={appearance}
        onClick={toggleDropdown}
      >
        <ValueText>{selectedLabel}</ValueText>
        <Arrow isOpen={isOpen}>
          <Icon icon="iconamoon:arrow-up-2-bold" width="20" height="20" />
        </Arrow>
      </DropdownHeader>
      {isOpen && (
        <DropdownList $appearance={appearance}>
          {(data || []).map((item, index) => {
            const label = item?.[displayField];
            const isSelected =
              (itemSelect && itemSelect?.id === item?.id) ||
              (selected && selected?.id === item?.id);
            return (
              <DropdownItem
                key={item?.id || `${label}-${index}`}
                onClick={() => handleSelect(item)}
                isSelected={isSelected}
                $appearance={appearance}
              >
                <ItemIndicator>{isSelected ? "✓" : ""}</ItemIndicator>
                <ItemText>{label}</ItemText>
              </DropdownItem>
            );
          })}
        </DropdownList>
      )}
    </DropdownContainer>
  );
};

// Estilos usando Styled Components
const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownHeader = styled.button`
  width: 100%;
  min-height: 44px;
  background-color: #ffffff;
  color: #111827;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  text-align: left;

  &:focus {
    outline: 2px solid #2563eb;
    outline-offset: 1px;
  }

  &:hover {
    background-color: #f9fafb;
  }
`;

const ValueText = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Arrow = styled.span`
  transform: ${({ isOpen }) => (isOpen ? "rotate(180deg)" : "rotate(0deg)")};
  transition: transform 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const DropdownList = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  max-height: 260px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.16);
`;

const DropdownItem = styled.div`
  padding: 10px 12px;
  color: ${({ theme }) => theme.text};
  display: grid;
  grid-template-columns: 14px 1fr;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  background-color: ${({ isSelected }) => {
    if (!isSelected) return "transparent";
    return "#111827";
  }};
  color: ${({ isSelected }) => {
    if (isSelected) return "#f8fafc";
    return "#111827";
  }};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ isSelected }) => (isSelected ? "#0f172a" : "#f3f4f6")};
    color: ${({ isSelected, theme }) => (isSelected ? "#f8fafc" : theme.text)};
  }
`;

const ItemIndicator = styled.span`
  font-size: 12px;
  font-weight: 700;
  text-align: center;
`;

const ItemText = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
