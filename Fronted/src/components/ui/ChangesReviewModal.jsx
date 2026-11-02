import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Btn1 } from "../../index";
import { toast } from "sonner";

export default function ChangesReviewModal({ open, onClose }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!open) return;
    fetch("/changes_review.json")
      .then((r) => r.json())
      .then(setData)
      .catch((e) => {
        console.error("Error loading changes_review.json", e);
        setData({ summary: "No se pudo cargar el resumen de cambios", modified: [], created: [] });
      });
  }, [open]);

  if (!open) return null;
  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <h3>Resumen de cambios</h3>
          <p style={{ marginTop: 4 }}>{data?.summary}</p>
        </Header>
        <Body>
          <Section>
            <h4>Modificados</h4>
            {data?.modified?.length ? (
              <ul>
                {data.modified.map((m, i) => (
                  <li key={i}>
                    <strong>{m.file}</strong>
                    <div style={{ fontSize: 13, opacity: 0.9 }}>{m.desc}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div>No hay archivos modificados listados.</div>
            )}
          </Section>

          <Section>
            <h4>Creados</h4>
            {data?.created?.length ? (
              <ul>
                {data.created.map((m, i) => (
                  <li key={i}>
                    <strong>{m.file}</strong>
                    <div style={{ fontSize: 13, opacity: 0.9 }}>{m.desc}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div>No hay archivos nuevos listados.</div>
            )}
          </Section>
        </Body>
        <Footer>
          <Btn1
            onClick={() => {
              // Rehacer: explain limitations and suggest git revert
              if (confirm("Revertir los cambios en el repositorio requiere usar git. ¿Deseas abrir la terminal para ver instrucciones?")) {
                alert("Para revertir: use 'git status' y 'git restore <file>' o 'git checkout -- <file>' en su entorno. Si los cambios ya fueron commit, use 'git revert <commit>' o 'git reset --hard <commit>' con precaución.");
              }
            }}
          >
            Rehacer
          </Btn1>

          <Btn1
            onClick={() => {
              // Guardar: just confirm and close
              toast.success("Cambios confirmados. Si quieres que cree un commit y PR, indícamelo.");
              onClose && onClose();
            }}
          >
            Guardar
          </Btn1>

          <Btn1
            onClick={() => {
              onClose && onClose();
            }}
          >
            Cerrar
          </Btn1>
        </Footer>
      </Modal>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20000;
`;
const Modal = styled.div`
  width: 720px;
  max-width: 95vw;
  background: ${({ theme }) => theme.bg3};
  border: 1px solid ${({ theme }) => theme.color2};
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
`;
const Header = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.color2};
  padding-bottom: 8px;
`;
const Body = styled.div`
  max-height: 56vh;
  overflow: auto;
  padding: 12px 0;
`;
const Section = styled.div`
  margin-bottom: 12px;
  ul {
    list-style: none;
    padding: 0;
    li {
      margin-bottom: 8px;
    }
  }
`;
const Footer = styled.div`
  display:flex;
  gap:8px;
  justify-content: flex-end;
  padding-top:8px;
`;
