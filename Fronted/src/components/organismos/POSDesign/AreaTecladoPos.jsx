import styled from "styled-components";
import { Btn1 } from "../../moleculas/Btn1";
import { TotalPos } from "./TotalPos";
import { Device } from "../../../styles/breakpoints";
import { useVentasStore } from "../../../store/VentasStore";

import { useEmpresaStore } from "../../../store/EmpresaStore";
import { useMetodosPagoStore } from "../../../store/MetodosPagoStore";
import { useQuery } from "@tanstack/react-query";
import { useValidarPermisosOperativos } from "../../../hooks/useValidarPermisosOperativos";
import { useDetalleVentasStore } from "../../../store/DetalleVentasStore";
export function AreaTecladoPos() {
  const { setStatePantallaCobro, stateMetodosPago } = useVentasStore();
  const { dataempresa } = useEmpresaStore();
  const { dataMetodosPago: datametodospago } = useMetodosPagoStore();
  const { datadetalleventa } = useDetalleVentasStore()
  const { validarPermiso } = useValidarPermisosOperativos();
  // const { data: datametodospago } = useQuery({
  //   queryKey: ["mostrar metodos de pago"],
  //   queryFn: () => mostrarMetodosPago({ id_empresa: dataempresa?.id }),
  //   enabled: !!dataempresa,
  // });
  const ValidarPermisocobrar = (p) => {
    const response = validarPermiso("Cobrar venta");
    if (!response) return;
    console.log("tipocobro", p.nombre)
    setStatePantallaCobro({ data: datadetalleventa, tipocobro: p.nombre });
  };

  return (
    <Container $stateMetodosPago={stateMetodosPago}>
      <section className="areatipopago">
        {datametodospago?.map((item, index) => {
          const nombre = item.nombre || "";
          const colors = {
            Efectivo: { bg: "#16a34a", color: "#ffffff" },
            Tarjeta: { bg: "#0ea5e9", color: "#ffffff" },
            Yape: { bg: "#7c3aed", color: "#ffffff" },
            Mixto: { bg: "#f59e0b", color: "#ffffff" },
          };
          const def = colors[nombre] || { bg: "#ffffff", color: "#111111" };
          return (
            <article className="box" key={index}>
              <Btn1
                icono={item.icono != "-" ? item.icono : null}
                funcion={() => ValidarPermisocobrar(item)}
                titulo={item.nombre}
                border="0"
                height="70px"
                width="100%"
                bgcolor={def.bg}
                color={def.color}
              />
            </article>
          );
        })}
        {/* Botón Factura SUNAT siempre visible */}
        <article className="box" key="factura-sunat">
          <Btn1
            icono={<img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" style={{width:'28px',height:'28px'}} alt="Factura SUNAT" />} // Puedes cambiar el ícono si tienes uno propio
            funcion={() => window.open("https://e-menu.sunat.gob.pe/cl-ti-itmenu/MenuInternet.htm?pestana=*&agrupacion=*", "_blank")}
            titulo="Factura SUNAT"
            border="0"
            height="70px"
            width="100%"
            bgcolor="#1976d2"
            color="#fff"
          />
        </article>
      </section>
      <section className="totales">
        <TotalPos />
      </section>
    </Container>
  );
}
const Container = styled.div`
  border: 1px solid ${({ theme }) => theme.color2};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: absolute;
  bottom: 10px;
  width: calc(100% - 5px);
  border-radius: 15px;
  @media ${Device.desktop} {
    position: relative;
    width: 450px;
    bottom: initial;
  }
  .areatipopago {
    display: ${({ $stateMetodosPago }) => ($stateMetodosPago ? "flex" : "none")};
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    align-items: stretch;
    @media ${Device.desktop} {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 12px;
    }
    .box {
      width: 100%;
      display: block;
      gap: 0;
    }
  }
  .totales {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px;
    .subtotal {
      display: none;
      flex-direction: column;
      justify-content: end;
      text-align: end;
      gap: 10px;
      font-weight: 500;
      @media ${Device.desktop} {
        display: flex;
      }
    }
  }
`;
