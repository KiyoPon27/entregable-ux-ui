import styled from "styled-components";
import { AccionTabla } from "../../../index";
import { v } from "../../../styles/variables";
import { Icon } from "@iconify/react";

export function ContentAccionesTabla({
  funcionEditar,
  funcionEliminar,
  funcionDeshabilitar,
  switchValue,
  funcionToggleEstado,
  esProtegido,
}) {
  const mostrarSwitch = typeof funcionToggleEstado === "function";

  return (
    <Container $esProtegido={esProtegido}>
      {funcionEditar && (
        <div className={`accionWrapper ${esProtegido ? "disabled" : ""}`}>
          <AccionTabla
            funcion={esProtegido ? null : funcionEditar}
            fontSize="18px"
            color="#7d7d7d"
            icono={<v.iconeditarTabla />}
          />
        </div>
      )}
      {funcionEliminar && (
        <div className={`accionWrapper ${esProtegido ? "disabled" : ""}`}>
          <AccionTabla
            funcion={esProtegido ? null : funcionEliminar}
            fontSize="20px"
            color="#f76e8e"
            icono={<Icon icon="fluent-emoji-high-contrast:skull" />}
          />
        </div>
      )}

      {mostrarSwitch && (
        <div className={`accionWrapper ${esProtegido ? "disabled" : ""}`}>
          <button
            type="button"
            className={`toggleSwitchBtn ${switchValue ? "isOn" : "isOff"}`}
            onClick={esProtegido ? null : funcionToggleEstado}
            disabled={esProtegido}
            aria-pressed={switchValue}
            title={esProtegido ? "Protegido" : (switchValue ? "Habilitado" : "Deshabilitado")}
          >
            <span className="switchKnob" />
          </button>
        </div>
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;

  .accionWrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .accionWrapper.disabled {
    opacity: 0.5;
    cursor: not-allowed !important;
    pointer-events: none;
  }

  .toggleSwitchBtn {
    display: inline-flex;
    align-items: center;
    position: relative;
    width: 50px;
    height: 30px;
    border-radius: 20px;
    cursor: pointer;
    transition-duration: 0.2s;
    border: 1px solid ${({ theme }) => theme.color2};
    padding: 0;
  }

  .toggleSwitchBtn:disabled {
    cursor: not-allowed;
  }

  .toggleSwitchBtn .switchKnob {
    position: absolute;
    height: 10px;
    width: 10px;
    left: 5px;
    background-color: transparent;
    border-radius: 50%;
    transition-duration: 0.2s;
    box-shadow: 5px 2px 7px rgba(8, 8, 8, 0.26);
    border: 5px solid #ffffff;
  }

  .toggleSwitchBtn.isOn {
    background-color: #111111;
  }

  .toggleSwitchBtn.isOff {
    background-color: #ffffff;
  }

  .toggleSwitchBtn.isOff .switchKnob {
    border-color: #111111;
    box-shadow: 5px 2px 7px rgba(8, 8, 8, 0.2);
  }

  .toggleSwitchBtn.isOn .switchKnob {
    transform: translateX(20px);
    background-color: #ffffff;
    border-color: #ffffff;
  }

  @media (max-width: 48em) {
    justify-content: end;
  }
`;
