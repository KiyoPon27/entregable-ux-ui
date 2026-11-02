import React, { forwardRef } from 'react';
import styled from 'styled-components';

export const BuscadorModerno = forwardRef(function BuscadorModerno({ setBuscador, value }, ref) {
  function buscar(e) {
    setBuscador(e.target.value);
  }

  return (
    <Container>
      <InputWrapper>
        <input
          ref={ref}
          className="input-search"
          placeholder="...buscar"
          name="buscar"
          type="text"
          value={value ?? ""}
          onChange={buscar}
        />
        <SearchButton type="button">
          <svg
            className="icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 64 64"
            height={50}
            width={50}
          >
            <path fillOpacity="0.01" fill="white" d="M63.6689 29.0491L34.6198 63.6685L0.00043872 34.6194L29.0496 1.67708e-05L63.6689 29.0491Z" />
            <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="3.76603" stroke="white" d="M42.8496 18.7067L21.0628 44.6712" />
            <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="3.76603" stroke="white" d="M26.9329 20.0992L42.85 18.7067L44.2426 34.6238" />
          </svg>
          <AnimateLeft />
          <AnimateRight />
        </SearchButton>
      </InputWrapper>
    </Container>
  );
});

const Container = styled.div`
  width: 100%;
  max-width: 85%;
  flex: 1;
  box-sizing: border-box;
`;

const InputWrapper = styled.div`
  position: relative;
  border-radius: 50px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  padding: 8px 8px 8px 24px;
  gap: 12px;
  box-sizing: border-box;
  width: 100%;

  .input-search {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 16px;
    font-weight: 500;
    color: #333;
    font-family: 'Segoe UI', 'Trebuchet MS', sans-serif;
    padding: 8px;
    box-sizing: border-box;

    &::placeholder {
      color: #999;
    }
  }
`;

const SearchButton = styled.button`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: hsl(261deg 80% 48%);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(147, 112, 219, 0.4);
  flex-shrink: 0;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 8px 25px rgba(147, 112, 219, 0.6);

    .icon {
      z-index: 10;
    }
  }

  .icon {
    width: 28px;
    height: 28px;
    position: relative;
    z-index: 10;
    flex-shrink: 0;
  }
`;

const AnimateLeft = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: black;
  transform: rotate(45deg);
  left: 32%;
  top: 32%;
  transition: all 1s ease;

  ${SearchButton}:hover & {
    left: -100%;
    top: -100%;
  }
`;

const AnimateRight = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: black;
  transform: rotate(-45deg);
  left: -32%;
  top: -32%;
  transition: all 1s ease;

  ${SearchButton}:hover & {
    left: 100%;
    top: 100%;
  }
`;
