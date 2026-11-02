import styled from "styled-components";
import { Icono } from "../../index";
export function Btngenerarcodigo({
  funcion,
  titulo,
  bgcolor,
  icono,
  url,
  color,
  disabled,width
}) {
  return (
    <Container $width={width}
     
      $color={color}
      
      $bgcolor={bgcolor}
      onClick={funcion} 
    >
      <section className="content">
        <Icono $color={color}>{icono}</Icono>
        {titulo && (
          <span className="btn">
            <a >
              {titulo}
            </a>
          </span>
        )}
      </section>
    </Container>
  );
}
const Container = styled.div`
  position: relative;
  z-index: 1;
  overflow: hidden;
  font-weight: 700;
  display: flex;
  font-size: 15px;
  padding: 10px 25px;
  border-radius: 16px;
  background-color: ${(props) => props.$bgcolor || "#212121"};
  border: 2px solid rgba(50, 50, 50, 0.2);
  border-bottom: 5px solid rgba(50, 50, 50, 0.2);
  transform: translate(0, -3px);
  cursor: pointer;
  transition: 0.2s;
  transition-timing-function: linear;
  color: ${(props) => (props.$color ? `rgb(${props.$color})` : "#ffffff")};
  align-items: center;
  justify-content: center;
 width:${(props)=>props.$width};

  &::after {
    content: "";
    background: #ffffff;
    position: absolute;
    z-index: -1;
    left: -20%;
    right: -20%;
    top: 0;
    bottom: 0;
    transform: skewX(-45deg) scale(0, 1);
    transition: all 0.5s;
  }

  .content {
    display: flex;
    gap: 12px;
  }

  &:hover {
    color: #212121;
  }

  &:hover::after {
    transform: skewX(-45deg) scale(1, 1);
  }

  &:active {
    transform: translate(0, 0);
    border-bottom: 2px solid rgba(50, 50, 50, 0.2);
  }
  &[disabled] {
    background-color: #646464;
    cursor: no-drop;
    box-shadow: none;
  }
`;