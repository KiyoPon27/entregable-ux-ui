import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";

export const BackButton = ({ label = "Volver" }) => {
  const navigate = useNavigate();
  return (
    <Button onClick={() => navigate(-1)} title="Volver">
      <Icon icon="akar-icons:chevron-left" width="20" height="20" />
      <span>{label}</span>
    </Button>
  );
};

const Button = styled.button`
  position: absolute;
  top: 12px;
  left: 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.9);
  border: 1px solid rgba(0,0,0,0.08);
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  z-index: 50;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  font-weight: 600;

  &:hover {
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    top: 8px;
    left: 8px;
    padding: 6px 10px;
    span { display: none; }
  }
`;
