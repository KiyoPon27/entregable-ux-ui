import styled from "styled-components";
import { InputText2 } from "../../formularios/InputText2";
import { Btn1 } from "../../../moleculas/Btn1";
import { useState, useEffect } from "react";
import { useSucursalesStore } from "../../../../store/SucursalesStore";
import { useUsuariosStore } from "../../../../store/UsuariosStore";

import { useCierreCajaStore } from "../../../../store/CierreCajaStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";
import { useFormattedDate } from "../../../../hooks/useFormattedDate";
import { useMetodosPagoStore } from "../../../../store/MetodosPagoStore";
import { useMovCajaStore } from "../../../../store/MovCajaStore";
import { useAsignacionCajaSucursalStore } from "../../../../store/AsignacionCajaSucursalStore";
import { CardListCajas } from "./CardListCajas";
import { Device } from "../../../../styles/breakpoints";
import { useMostrarCierreCajaPorEmpresaQuery } from "../../../../tanstack/CierresCajaStack";
import { useEmpresaStore } from "../../../../store/EmpresaStore";
import { useCajasStore } from "../../../../store/CajasStore";
// Import the query hook
import { useMostrarSucursalAsignadasQuery } from "../../../../tanstack/AsignacionesSucursalStack";

export function PantallaAperturaCaja() {
  const { dataSucursalesAsignadas } = useAsignacionCajaSucursalStore();
  // Ensure data is fetched
  const { isLoading, error } = useMostrarSucursalAsignadasQuery();

  // Obtener sucursal del usuario desde asignaciones y métodos de cajas
  const { setCajaSelectItem, mostrarCajaXSucursal, cajaSelectItem, dataCaja } = useCajasStore();
  const { setCierreCajaItemSelect } = useCierreCajaStore();
  const { data: dataCierreCajaPorEmpresa } = useMostrarCierreCajaPorEmpresaQuery();

  const { dataempresa } = useEmpresaStore();
  const { mostrarSucursales, dataSucursales } = useSucursalesStore();

  // idSucursalState: control local para decidir qué sucursal usar. Se preferirán
  // las asignaciones del usuario; si no existen, se intentará usar la primera
  // sucursal de la empresa (cargando la lista si es necesario).
  const [idSucursalState, setIdSucursalState] = useState(
    dataSucursalesAsignadas?.[0]?.sucursales?.id || dataSucursalesAsignadas?.[0]?.sucursal?.id || null
  );

  // Sincronizar cuando cambian los datos externos
  const { datausuarios } = useUsuariosStore();
  const { mostrarempresa } = useEmpresaStore();

  useEffect(() => {
    const assigned = dataSucursalesAsignadas?.[0]?.sucursales?.id || dataSucursalesAsignadas?.[0]?.sucursal?.id;
    if (assigned) {
      setIdSucursalState(assigned);
      return;
    }
    // Si no hay empresa cargada pero sí usuario, intentar cargar empresa
    if (!dataempresa && datausuarios?.id) {
      mostrarempresa({ id_usuario: datausuarios.id }).then(() => {
        // the dataempresa will be available in the store; the effect will re-run
      }).catch(() => {});
      return;
    }
    // Si no hay asignaciones y tenemos info de empresa, intentar cargar sucursales
    if (!assigned && dataempresa && (!dataSucursales || dataSucursales.length === 0)) {
      mostrarSucursales({ id_empresa: dataempresa?.id }).then((res) => {
        if (res && res.length > 0) setIdSucursalState(res[0].id);
      }).catch(() => {});
      return;
    }
    // Si ya tenemos sucursales en store, usar la primera
    if (!assigned && dataSucursales && dataSucursales.length > 0) {
      setIdSucursalState(dataSucursales[0].id);
    }
  }, [dataSucursalesAsignadas, dataempresa, dataSucursales, mostrarSucursales, datausuarios, mostrarempresa]);

  // Estado para controlar la carga de cajas
  const [loadingCajas, setLoadingCajas] = useState(false);

  // Efecto para cargar todas las cajas de la sucursal al montar y cuando cambia idSucursal
  useEffect(() => {
    if (idSucursalState) {
      console.log("[POS] idSucursal usado para mostrar cajas:", idSucursalState);
      setLoadingCajas(true);
      mostrarCajaXSucursal({ id_sucursal: idSucursalState })
        .then((res) => {
          console.log("[POS] Respuesta mostrarCajaXSucursal:", res);
        })
        .finally(() => setLoadingCajas(false));
    }
    // si no hay idSucursalState simplemente esperamos a que se resuelva el efecto
  }, [idSucursalState]);

  // Renderizar todas las cajas de la sucursal
  if (!idSucursalState) return <div>Cargando sucursales...</div>;
  if (loadingCajas) return <div>Cargando cajas...</div>;
  if (!dataCaja || !Array.isArray(dataCaja)) return <div>No hay cajas disponibles en la sucursal.</div>;

  return (
    <Container>
      <ContainerCajas>
        <div className="title">Cajas disponibles en la sucursal</div>
        {dataCaja.map((caja, idx) => {
          // Determinar si la caja está aperturada y por quién
          const cierreCaja = dataCierreCajaPorEmpresa?.find(cc => cc.id_caja === caja.id);
          const state = !!cierreCaja;
          const aperturaActiva = cierreCaja ? cierreCaja : null;
          return (
            <CardListCajas
              key={caja.id}
              title={caja.descripcion}
              subtitle={state ? `${aperturaActiva?.rol}-${aperturaActiva?.usuario}` : 0}
              bgcolor={state ? "#e0e0e0" : "#b6fcd5"}
              funcion={() => setCajaSelectItem(caja)}
              sucursal={caja.sucursal?.nombre || ""}
              state={state}
            />
          );
        })}
      </ContainerCajas>
    </Container>
  );

  return (
    <Container>
      <Toaster  position="top-center" />
      <ContainerCajas>
        <span className="title">Seleccione una caja a aperturar</span>
        {dataSucursalesAsignadas?.map((item, index) => {
          let state = Boolean(false);
          let aperturaActiva = null;
          if (Array.isArray(dataCierreCajaPorEmpresa)) {
            aperturaActiva = dataCierreCajaPorEmpresa.find(
              (a) => a.id_caja === item.id
            );
            state = Boolean(aperturaActiva);
          }
          return (
            <CardListCajas key={index}
              title={item.caja?.descripcion}
              sucursal={item.sucursales?.nombre}
              funcion={() => {
                setCajaSelectItem(item);
                if (state) {
                  setCierreCajaItemSelect(aperturaActiva);
                }
              }}
              bgcolor={state ? "#f34a4a" : "#58CC02"}
              state={state}
              subtitle={
                state ? `${aperturaActiva?.rol}-${aperturaActiva?.usuario}` : 0
              }
            />
          );
        })}
      </ContainerCajas>
    </Container>
  );
}
const Container = styled.div`
  padding-top: 40px;
  width: 100%;
  background-color: ${({ theme }) => theme.bgtotal};
  align-items: center;
  justify-content: center;
  display: flex;
`;
const ContainerCajas = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  margin: 10px;
  @media ${Device.tablet} {
    width: 550px;
  }
  .title {
    font-weight: bold;
    font-size: 18px;
  }
`;
