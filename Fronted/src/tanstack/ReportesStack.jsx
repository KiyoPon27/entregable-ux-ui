import { useQuery } from "@tanstack/react-query";
import { useEmpresaStore } from "../store/EmpresaStore";

import { useDashboardStore } from "../store/DashboardStore";
import { useReportesStore } from "../store/ReportesStore";
import { useSucursalesStore } from "../store/SucursalesStore";
import { useReportStore } from "../store/ReportStore";
import { useAlmacenesStore } from "../store/AlmacenesStore";
export const useMostrarVentasDashboardQuery = () => {
  const { dataempresa } = useEmpresaStore();
  const { fechaInicio, fechaFin } = useDashboardStore();
  const { mostrarVentasDashboard } = useReportesStore();
  return useQuery({
    queryKey: [
      "mostrar Ventas Dashboard",
      {
        idEmpresa: dataempresa?.id,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
      },
    ],
    queryFn: () =>
      mostrarVentasDashboard({
        id_empresa: dataempresa?.id,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      }),
    enabled: !!dataempresa?.id && !!fechaInicio && !!fechaFin,
  });
};
export const useMostrarCantidadDetalleVentaDashboardQuery = () => {
  const { dataempresa } = useEmpresaStore();
  const { fechaInicio, fechaFin } = useDashboardStore();
  const { mostrarVentasDashboard, mostrarCantidadDetalleVentasDashboard } =
    useReportesStore();
  return useQuery({
    queryKey: [
      "mostrar cantidad detalle Ventas Dashboard",
      {
        idEmpresa: dataempresa?.id,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
      },
    ],
    queryFn: () =>
      mostrarCantidadDetalleVentasDashboard({
        id_empresa: dataempresa?.id,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      }),
    enabled: !!dataempresa?.id && !!fechaInicio && !!fechaFin,
  });
};
export const useMostrarCantidadDetalleVentaPeriodoAnteriorDashboardQuery =
  () => {
    const { dataempresa } = useEmpresaStore();
    const { setFechasAnteriores } = useDashboardStore();
    const { mostrarCantidadDetalleVentasDashboard } = useReportesStore();
    const fechasAnteriores = setFechasAnteriores();
    return useQuery({
      queryKey: [
        "mostrar cantidad detalle Ventas Dashboard",
        {
          idEmpresa: dataempresa?.id,
          fechaInicio: fechasAnteriores?.fechaAnteriorInicio,
          fechaFin: fechasAnteriores?.fechaAnteriorFin,
        },
      ],
      queryFn: () =>
        mostrarCantidadDetalleVentasDashboard({
          id_empresa: dataempresa?.id,
          fecha_inicio: fechasAnteriores?.fechaAnteriorInicio,
          fecha_fin: fechasAnteriores?.fechaAnteriorFin,
        }),
      enabled:
        !!dataempresa?.id &&
        !!fechasAnteriores?.fechaAnteriorInicio &&
        !!fechasAnteriores?.fechaAnteriorFin,
    });
  };
export const useMostrarVentasDashboardPeriodoAnteriorQuery = () => {
  const { dataempresa } = useEmpresaStore();
  const { fechaInicio, fechaFin, setFechasAnteriores } = useDashboardStore();

  const { mostrarVentasDashboardPeriodoAnterior, mostrarVentasDashboard } =
    useReportesStore();
  const fechasAnteriores = setFechasAnteriores();
  return useQuery({
    queryKey: [
      "mostrar Ventas Dashboard periodo anterior",
      {
        idEmpresa: dataempresa?.id,
        fechaInicio: fechasAnteriores?.fechaAnteriorInicio,
        fechaFin: fechasAnteriores?.fechaAnteriorFin,
      },
    ],
    queryFn: () =>
      mostrarVentasDashboardPeriodoAnterior({
        id_empresa: dataempresa?.id,
        fecha_inicio: fechasAnteriores?.fechaAnteriorInicio,
        fecha_fin: fechasAnteriores?.fechaAnteriorFin,
      }),
    enabled:
      !!dataempresa?.id &&
      !!fechasAnteriores?.fechaAnteriorInicio &&
      !!fechasAnteriores?.fechaAnteriorFin,
    refetchOnWindowFocus: false,
  });
};
export const useGananciasDetalleVentaQuery = () => {
  const { dataempresa } = useEmpresaStore();
  const { fechaInicio, fechaFin } = useDashboardStore();

  const { mostrarGananciasDetalleVenta } = useReportesStore();

  return useQuery({
    queryKey: [
      "mostrar ganancias detalle venta",
      {
        idEmpresa: dataempresa?.id,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
      },
    ],
    queryFn: () =>
      mostrarGananciasDetalleVenta({
        id_empresa: dataempresa?.id,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      }),
    enabled: !!dataempresa?.id && !!fechaInicio && !!fechaFin,
    refetchOnWindowFocus: false,
  });
};
export const useReporteInventarioValoradoQuery = () => {
  const { sucursalesItemSelect } = useSucursalesStore();
  const { reportStockPorAlmacenSucursal } = useReportStore();
  const { almacenSelectItem } = useAlmacenesStore();

  return useQuery({
    queryKey: [
      "reporte de inventario valorado",
      {
        sucursalId: sucursalesItemSelect?.id,
        almacenId: almacenSelectItem?.id,
      },
    ],
    queryFn: () =>
      reportStockPorAlmacenSucursal({
        sucursalId: sucursalesItemSelect?.id,
        almacenId: almacenSelectItem?.id,
      }),
    enabled: !!sucursalesItemSelect?.id && !!almacenSelectItem?.id,
    refetchOnWindowFocus: false,
  });
};
