import React, { useState, useEffect } from "react";
import { v } from "../../../styles/variables";
import styled from "styled-components";
import { Btn1 } from "../../../index";

const isDarkMode = (theme) => theme?.bodyRgba === "15,20,25";
export const Paginacion = ({ table, variant = "default" }) => {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const [pageInput, setPageInput] = useState(pageIndex + 1);

  useEffect(() => {
    setPageInput(pageIndex + 1);
  }, [pageIndex, pageCount]);

  const goToPage = (value) => {
    const pageNumber = Number(value);
    if (!Number.isFinite(pageNumber)) return;
    const nextPage = Math.max(1, Math.min(Math.max(1, pageCount), pageNumber));
    table.setPageIndex(nextPage - 1);
  };

  if (variant === "extended") {
    return (
      <Container>
        <ModernButton
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.setPageIndex(0)}
          aria-label="Ir al inicio"
          title="Ir al inicio"
        >
          <v.iconotodos />
        </ModernButton>

        <ModernButton
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.setPageIndex(Math.max(0, pageIndex - 10))}
          aria-label="Retroceder 10 páginas"
          title="Retroceder 10 páginas"
        >
          -10
        </ModernButton>

        <ModernButton
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
          aria-label="Página anterior"
          title="Página anterior"
        >
          <v.iconoflechaizquierda />
        </ModernButton>

        <PageInput
          type="number"
          min={1}
          max={Math.max(1, pageCount)}
          value={pageInput}
          onChange={(e) => setPageInput(e.target.value)}
          onBlur={(e) => goToPage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              goToPage(e.target.value);
            }
          }}
          aria-label="Ir a página"
        />

        <PageInfo>
          <strong>de {pageCount}</strong>
        </PageInfo>

        <ModernButton
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
          aria-label="Página siguiente"
          title="Página siguiente"
        >
          <v.iconoflechaderecha />
        </ModernButton>

        <ModernButton
          disabled={!table.getCanNextPage()}
          onClick={() => table.setPageIndex(Math.min(Math.max(0, pageCount - 1), pageIndex + 10))}
          aria-label="Avanzar 10 páginas"
          title="Avanzar 10 páginas"
        >
          +10
        </ModernButton>

        <ModernButton
          disabled={!table.getCanNextPage()}
          onClick={() => table.setPageIndex(pageCount - 1)}
          aria-label="Ir al final"
          title="Ir al final"
        >
          <v.iconotodos />
        </ModernButton>
      </Container>
    );
  }

  if (variant === "modern") {
    return (
      <Container>
        <ModernButton
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.setPageIndex(0)}
          aria-label="Ir al inicio"
          title="Ir al inicio"
        >
          <v.iconotodos />
        </ModernButton>

        <ModernButton
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
          aria-label="Página anterior"
          title="Página anterior"
        >
          <v.iconoflechaizquierda />
        </ModernButton>

        <PageInfo>
          <strong>{table.getState().pagination.pageIndex + 1}</strong>
          <span>de {table.getPageCount()}</span>
        </PageInfo>

        <ModernButton
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
          aria-label="Página siguiente"
          title="Página siguiente"
        >
          <v.iconoflechaderecha />
        </ModernButton>
      </Container>
    );
  }

  return (
    <Container >
   
      <Btn1 disabled={!table.getCanPreviousPage()} funcion={() => table.setPageIndex(0)} bgcolor="#F3D20C" icono={<v.iconotodos />} />

      <Btn1  disabled={!table.getCanPreviousPage()} funcion={() => table.previousPage()} bgcolor="#F3D20C" icono={<v.iconoflechaizquierda />} />


    
      <span>{table.getState().pagination.pageIndex + 1}</span>
      <p> de {table.getPageCount()} </p>

      <Btn1  disabled={!table.getCanNextPage()} funcion={() => table.nextPage()} bgcolor="#F3D20C" icono={<v.iconoflechaderecha />} />
      
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;

  padding: 8px 0 2px;
`;

const ModernButton = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.color2};
  background: ${({ theme }) => theme.bg3};
  color: ${({ theme }) => theme.text};
  position: relative;
  z-index: 1;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 6px 12px rgba(15, 23, 42, 0.08);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    color: ${({ theme }) => (isDarkMode(theme) ? "#0f172a" : "#ffffff")};
  }

  &::after {
    content: "";
    position: absolute;
    z-index: -1;
    left: -20%;
    right: -20%;
    top: 0;
    bottom: 0;
    background: ${({ theme }) => (isDarkMode(theme) ? "#ffffff" : "#0f172a")};
    transform: skewX(-45deg) scale(0, 1);
    transition: all 0.45s ease;
  }

  &:hover:not(:disabled)::after {
    transform: skewX(-45deg) scale(1, 1);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const PageInfo = styled.div`
  min-width: 82px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: ${({ theme }) => theme.text};
  font-size: 15px;

  strong {
    font-size: 17px;
  }

  span {
    opacity: 0.75;
  }

`;

const PageInput = styled.input`
  width: 64px;
  height: 42px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.color2};
  background: ${({ theme }) => theme.bg3};
  color: ${({ theme }) => theme.text};
  text-align: center;
  font-size: 16px;
  outline: none;
  padding: 0 10px;

  &:focus {
    border-color: ${({ theme }) => theme.color1};
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;
