import { useState, useMemo, useEffect } from "react";
import { useMetodosPagoStore } from "../store/MetodosPagoStore";
import styled from "styled-components";
import { Icon } from "@iconify/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEmpresaStore } from "../store/EmpresaStore";
import { FormatearNumeroDinero } from "../utils/Conversiones";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import api from "../api/api";
import { v } from "../styles/variables";
import { BsSearch, BsEye, BsFilter, BsDownload } from "react-icons/bs";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import TicketVenta from "../reports/TicketVenta";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

const { RangePicker } = DatePicker;

export function ReporteFacturas() {
  const { dataempresa } = useEmpresaStore();
  const queryClient = useQueryClient();
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroMetodoPago, setFiltroMetodoPago] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("7dias");
  const [buscador, setBuscador] = useState("");
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  // 🚀 OPTIMIZACIÓN: Add pagination state
  const [paginaActual, setPaginaActual] = useState(1);
  const ITEMS_POR_PAGINA = 50;
  const [descargandoPDF, setDescargandoPDF] = useState(false);
  const [modalIGV, setModalIGV] = useState(false);
  const [editandoSunat, setEditandoSunat] = useState(null); // ID de venta editando
  const [numeroSunatTemp, setNumeroSunatTemp] = useState(""); // Valor temporal
  const [modalExportExcel, setModalExportExcel] = useState(false);

  // Métodos de pago
  const { dataMetodosPago, mostrarMetodosPago } = useMetodosPagoStore();
  useEffect(() => {
    if (dataempresa?.id) {
      mostrarMetodosPago({ id_empresa: dataempresa.id });
    }
  }, [dataempresa?.id, mostrarMetodosPago]);
  
  // Estados para el selector de fechas
  const [dates, setDates] = useState([]);
  const [singleDate, setSingleDate] = useState(null);
  const [activeRange, setActiveRange] = useState("7 días");

  // Calcular fechas según el filtro - MEMOIZADO para evitar bucles infinitos
  const { fechaInicio, fechaFin } = useMemo(() => {
    // Si hay un rango de fechas seleccionado
    if (dates && dates.length === 2 && dates[0] && dates[1]) {
      return {
        fechaInicio: dates[0].toDate(),
        fechaFin: dates[1].toDate()
      };
    }
    
    // Si hay una fecha única seleccionada
    if (singleDate) {
      const start = singleDate.startOf('day').toDate();
      const end = singleDate.endOf('day').toDate();
      return { fechaInicio: start, fechaFin: end };
    }

    // Rangos predefinidos
    const hoy = dayjs();
    let fechaInicio = dayjs();
    let fechaFin = dayjs();

    switch (filtroFecha) {
      case "hoy":
        fechaInicio = hoy.startOf('day');
        fechaFin = hoy.endOf('day');
        break;
      case "7dias":
        fechaInicio = hoy.subtract(7, 'day').startOf('day');
        fechaFin = hoy.endOf('day');
        break;
      case "30dias":
        fechaInicio = hoy.subtract(30, 'day').startOf('day');
        fechaFin = hoy.endOf('day');
        break;
      case "12meses":
        fechaInicio = hoy.subtract(12, 'month').startOf('day');
        fechaFin = hoy.endOf('day');
        break;
      case "todo":
        return { fechaInicio: null, fechaFin: null };
      default:
        fechaInicio = hoy.subtract(7, 'day').startOf('day');
        fechaFin = hoy.endOf('day');
    }

    return { 
      fechaInicio: fechaInicio.toDate(), 
      fechaFin: fechaFin.toDate() 
    };
  }, [filtroFecha, dates, singleDate]);

  // Query para obtener facturas filtradas
  const { data: facturasData, isLoading: loadingFacturas, error: errorFacturas } = useQuery({
    queryKey: ["facturas", dataempresa?.id, filtroTipo, filtroMetodoPago, fechaInicio, fechaFin, buscador, paginaActual],
    queryFn: async () => {
      const params = new URLSearchParams({
        empresaId: dataempresa?.id,
        // 🚀 OPTIMIZACIÓN: Send pagination params to backend
        page: paginaActual,
        pageSize: ITEMS_POR_PAGINA,
      });
      
      // Si el filtro es F-SUNAT o B-SUNAT, enviar al backend el tipo base (FACTURA o BOLETA)
      // Si el filtro es CON-SUNAT, no enviar tipo para obtener todos y filtrar en frontend
      // El filtrado por numeroSunat se hará en el frontend
      let tipoParaBackend = filtroTipo;
      if (filtroTipo === "F-SUNAT") {
        tipoParaBackend = "FACTURA";
      } else if (filtroTipo === "B-SUNAT") {
        tipoParaBackend = "BOLETA";
      } else if (filtroTipo === "CON-SUNAT") {
        tipoParaBackend = "";  // No enviar tipo al backend, filtrar en frontend
      }
      
      if (tipoParaBackend) params.append("tipo", tipoParaBackend);
      if (filtroMetodoPago) params.append("metodoPago", filtroMetodoPago);
      if (fechaInicio) params.append("fechaInicio", fechaInicio.toISOString());
      if (fechaFin) params.append("fechaFin", fechaFin.toISOString());
      if (buscador) params.append("buscador", buscador);

      const response = await api.get(
        `/ventas/facturas?${params.toString()}`
      );
      // IMPORTANTE: El backend puede devolver string JSON en lugar de objeto parseado
      let data;
      try {
        if (typeof response.data === 'string') {
          data = JSON.parse(response.data);
        } else {
          data = response.data;
        }
      } catch (parseError) {
        throw new Error(`Error al parsear respuesta del servidor: ${parseError.message}`);
      }
      return data;
    },
    enabled: !!dataempresa?.id,
  });

  // Asegurar que facturas sea siempre un array
  const facturasRaw = Array.isArray(facturasData) ? facturasData : [];
  
  // Debug: mostrar datos crudos
  if (process.env.NODE_ENV === 'development') {
    console.log("🔍 Datos crudos (facturasRaw):", facturasRaw);
    console.log("🔍 Filtro activo:", filtroTipo);
  }
  
  // 🚀 OPTIMIZACIÓN: Wrap filter en useMemo para evitar re-filtrar en cada render
  const facturas = useMemo(() => {
    return facturasRaw.filter((venta) => {
      // Debug: mostrar cada venta (solo en development)
      if (process.env.NODE_ENV === 'development' && (filtroTipo === "F-SUNAT" || filtroTipo === "B-SUNAT" || filtroTipo === "CON-SUNAT")) {
        console.log("🔍 Venta:", {
          id: venta.id,
          tipo: venta.tipoComprobante,
          numeroSunat: venta.numeroSunat,
          numeroSunatLength: venta.numeroSunat?.length,
          numeroSunatTrimLength: venta.numeroSunat?.trim()?.length
        });
      }
      
      // Filtro por tipo
      let tipoOk = true;
      if (filtroTipo === "F-SUNAT") {
        // Facturas con número SUNAT (debe existir y no estar vacío)
        tipoOk = venta.tipoComprobante === "FACTURA" && 
                 venta.numeroSunat !== null && 
                 venta.numeroSunat !== undefined && 
                 venta.numeroSunat.trim().length > 0;
      } else if (filtroTipo === "B-SUNAT") {
        // Boletas con número SUNAT (debe existir y no estar vacío)
        tipoOk = venta.tipoComprobante === "BOLETA" && 
                 venta.numeroSunat !== null && 
                 venta.numeroSunat !== undefined && 
                 venta.numeroSunat.trim().length > 0;
      } else if (filtroTipo === "CON-SUNAT") {
        // Cualquier venta con número SUNAT (debe existir y no estar vacío)
        tipoOk = venta.numeroSunat !== null && 
                 venta.numeroSunat !== undefined && 
                 venta.numeroSunat.trim().length > 0;
      } else if (filtroTipo) {
        tipoOk = venta.tipoComprobante === filtroTipo;
      }
      
      // Filtro por método de pago
      const metodoOk = !filtroMetodoPago || venta.metodoPago === filtroMetodoPago;
      return tipoOk && metodoOk;
    });
  }, [facturasRaw, filtroTipo, filtroMetodoPago]);
  
  if (process.env.NODE_ENV === 'development') {
    console.log("📊 Facturas filtradas para mostrar:", facturas);
    console.log("📊 Total de facturas después del filtro:", facturas.length);
  }

  // 🚀 OPTIMIZACIÓN: Pre-compute sorted Excel data to avoid expensive sort on export click
  const datosExcelMemoizado = useMemo(() => {
    if (!facturas || facturas.length === 0) {
      return [];
    }

    // Ordenar por N° F-SUNAT numéricamente, luego por fecha
    return facturas
      .sort((a, b) => {
        const numA = parseInt((a.numeroSunat?.trim() || "0").split('-').pop() || "0", 10);
        const numB = parseInt((b.numeroSunat?.trim() || "0").split('-').pop() || "0", 10);
        
        if (numA !== numB) {
          return numA - numB;
        }
        
        const fechaA = new Date(a.fecha).getTime();
        const fechaB = new Date(b.fecha).getTime();
        return fechaA - fechaB;
      })
      .map((venta) => {
        const documento = venta.rucDni || "-";
        const esDNI = documento.length === 8;
        const esRUC = documento.length === 11;
        
        return {
          "Fecha": venta.fecha
            ? format(new Date(venta.fecha), "dd/MM/yyyy HH:mm", { locale: es })
            : "-",
          "N° Comprobante": venta.nroComprobante || "-",
          "N° F-SUNAT": venta.numeroSunat || "-",
          "Tipo": venta.tipoComprobante || venta.tipo || "-",
          "DNI": esDNI ? documento : "-",
          "RUC": esRUC ? documento : "-",
          "Monto Total": `S/ ${venta.montoTotal?.toFixed(2) || "0.00"}`,
        };
      });
  }, [facturas]);

  // Query para estadísticas
  const { data: estadisticas } = useQuery({
    queryKey: ["estadisticas-facturas", dataempresa?.id, fechaInicio, fechaFin],
    queryFn: async () => {
      const params = new URLSearchParams({
        empresaId: dataempresa?.id,
      });
      if (fechaInicio) params.append("fechaInicio", fechaInicio.toISOString());
      if (fechaFin) params.append("fechaFin", fechaFin.toISOString());

      const response = await api.get(
        `/ventas/facturas/estadisticas?${params.toString()}`
      );
      return response.data;
    },
    enabled: !!dataempresa?.id,
  });

  // 🚀 OPTIMIZACIÓN: Reset pagination when filters change
  useEffect(() => {
    setPaginaActual(1);
  }, [filtroTipo, filtroMetodoPago, fechaInicio, fechaFin, buscador]);

  // Funciones para manejar rangos de fechas
  const setPresetRange = (days, rangeName) => {
    const startDate = dayjs().subtract(days, "day").startOf("day");
    const endDate = dayjs().endOf("day");
    setDates([startDate, endDate]);
    setActiveRange(rangeName);
    setSingleDate(null);
    setFiltroFecha("custom");
  };

  const selectToday = () => {
    const today = dayjs().startOf("day");
    setSingleDate(today);
    setDates([]);
    setActiveRange("Hoy");
    setFiltroFecha("hoy");
  };

  const selectTodo = () => {
    setDates([]);
    setSingleDate(null);
    setActiveRange("Todo");
    setFiltroFecha("todo");
  };

  const handleDateChange = (val) => {
    setDates(val || []);
    setActiveRange("Rango");
    setFiltroFecha("custom");
  };

  const handleSingleDateChange = (date) => {
    setSingleDate(date);
    setDates([]);
    setActiveRange("Por Día");
    setFiltroFecha("custom");
  };

  const limpiarFechasFiltro = () => {
    setDates([]);
    setSingleDate(null);
    setActiveRange("7 días");
    setFiltroFecha("7dias");
  };

  const obtenerTextoPeriodo = () => {
    if (activeRange === "Todo") {
      return "Todos los Períodos";
    }
    
    if (activeRange === "Hoy") {
      return format(new Date(), "dd/MM/yyyy", { locale: es });
    }
    
    if (activeRange === "Por Día" && singleDate) {
      return format(singleDate.toDate(), "dd/MM/yyyy", { locale: es });
    }
    
    if (activeRange === "Rango" && dates && dates.length === 2) {
      const inicio = format(dates[0].toDate(), "dd/MM/yyyy", { locale: es });
      const fin = format(dates[1].toDate(), "dd/MM/yyyy", { locale: es });
      return `${inicio} al ${fin}`;
    }
    
    // Rangos predefinidos (7 días, 30 días, 12 meses)
    if (fechaInicio && fechaFin) {
      const inicio = format(fechaInicio, "dd/MM/yyyy", { locale: es });
      const fin = format(fechaFin, "dd/MM/yyyy", { locale: es });
      return `${inicio} al ${fin}`;
    }
    
    return "Periodo no especificado";
  };

  const exportarAExcel = () => {
    if (!datosExcelMemoizado || datosExcelMemoizado.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    // Usar datos pre-computados (ya están sorteados y transformados)
    const datosExcel = datosExcelMemoizado;

    // Crear libro de trabajo
    const ws = XLSX.utils.json_to_sheet(datosExcel, { origin: "A2" });
    
    // Agregar título en la primera fila
    const textoPeriodo = obtenerTextoPeriodo();
    XLSX.utils.sheet_add_aoa(ws, [[`Ventas Electrónicas Emitidas del Periodo: ${textoPeriodo}`]], { origin: "A1" });
    
    // Fusionar celdas para el título (A1:G1)
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];
    
    // Calcular última fila de datos para la fórmula dinámica
    const lastDataRow = 2 + datosExcel.length;
    
    // Solo agregar fila de total si hay datos
    if (datosExcel.length > 0) {
      const totalRow = lastDataRow + 1;
      
      // Agregar fila de total
      XLSX.utils.sheet_add_aoa(ws, [["", "", "", "", "", "TOTAL", ""]], { origin: `A${totalRow}` });
      
      // Agregar fórmula dinámica en G{totalRow}
      // Usar SUMPRODUCT con SUBSTITUTE en lugar de SUSTITUIR (sintaxis compatible con XLSX)
      ws[`G${totalRow}`] = { 
        t: 'f', 
        f: `SUMPRODUCT(--SUBSTITUTE(G3:G${lastDataRow},"S/ ",""))`,
        v: 0 
      };
    }
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte de Ventas");

    // Ajustar anchos de columna
    const colWidths = [
      { wch: 18 }, // Fecha
      { wch: 18 }, // N° Comprobante
      { wch: 18 }, // N° F-SUNAT
      { wch: 12 }, // Tipo
      { wch: 15 }, // DNI
      { wch: 15 }, // RUC
      { wch: 15 }, // Monto Total
    ];
    ws["!cols"] = colWidths;

    // Generar archivo con nombre personalizado
    const fechaActual = format(new Date(), "dd-MM-yyyy_HH-mm", { locale: es });
    const nombreArchivo = `Reporte_Ventas_${fechaActual}.xlsx`;
    
    XLSX.writeFile(wb, nombreArchivo);
    toast.success(`Archivo "${nombreArchivo}" descargado exitosamente`);
    setModalExportExcel(false);
  };

  const obtenerColorTipo = (tipo) => {
    switch (tipo) {
      case "FACTURA":
        return "#8b5cf6"; // morado
      case "BOLETA":
        return "#f59e0b"; // amarillo/naranja
      case "TICKET":
        return "#3b82f6"; // azul
      default:
        return "#6b7280";
    }
  };

  const handleVerDetalle = (venta) => {
    // Solicitar detalle completo antes de mostrar el modal para asegurar cajero y sucursal
    (async () => {
      try {
        const response = await api.get(`/ventas/${venta.id}/detalle-completo`);
        const detalle = response.data;
        // Normalizar nombre del cajero a un campo rápido para la plantilla si hace falta
        if (detalle && detalle.dataventas && detalle.dataventas.usuario) {
          detalle.nombrecajero = detalle.dataventas.usuario.nombres;
        }
        setVentaSeleccionada(detalle);
        setModalDetalle(true);
      } catch (err) {
        console.error('Error al obtener detalle completo', err);
        toast.error('No se pudo obtener detalle de la venta');
      }
    })();
  };

  const handleDescargarPDF = async () => {
    if (!ventaSeleccionada) {
      toast.error("No hay venta seleccionada");
      return;
    }

    setDescargandoPDF(true);
    try {
      // Determinar ID de la venta robustamente: puede venir en ventaSeleccionada.id o en dataventas.id
      const idVenta = ventaSeleccionada?.id || ventaSeleccionada?.dataventas?.id || ventaSeleccionada?.dataventas?.id;
      if (!idVenta) {
        toast.error("ID de venta no disponible para descargar PDF");
        setDescargandoPDF(false);
        return;
      }

      console.log("🎫 Descargando PDF de venta ID:", idVenta);

      // Obtener detalle completo de la venta desde el backend
      const response = await api.get(`/ventas/${idVenta}/detalle-completo`);
      let detalleCompleto = response.data;

      // Algunos endpoints devuelven JSON como string; manejarlo
      if (typeof detalleCompleto === "string") {
        try {
          detalleCompleto = JSON.parse(detalleCompleto);
        } catch (e) {
          console.warn("Respuesta detalle-completo no es JSON parseable", e);
        }
      }

      console.log("✅ Detalle completo recibido:", detalleCompleto);

      // Agregar el nombre del cajero en el formato que espera TicketVenta
      const dataParaPDF = {
        ...detalleCompleto,
        nombrecajero: detalleCompleto?.dataventas?.usuario?.nombres || ventaSeleccionada?.nombrecajero || "Sin cajero",
      };

      // Regenerar el PDF usando TicketVenta
      await TicketVenta("download", dataParaPDF);

      toast.success("PDF descargado correctamente");
    } catch (error) {
      console.error("❌ Error al descargar PDF:", error);
      toast.error("Error al generar el PDF: " + (error.response?.data?.message || error.message));
    } finally {
      setDescargandoPDF(false);
    }
  };

  // Funciones para editar número SUNAT
  const handleEditarSunat = (venta) => {
    setEditandoSunat(venta.id);
    setNumeroSunatTemp(venta.numeroSunat || "");
  };

  const handleGuardarSunat = async (ventaId) => {
    try {
      await api.put(`/ventas/${ventaId}/numero-sunat`, {
        numeroSunat: numeroSunatTemp
      });
      toast.success("Número SUNAT actualizado correctamente");
      setEditandoSunat(null);
      
      // Actualizar los datos localmente en lugar de recargar la página
      queryClient.setQueryData(
        ["facturas", dataempresa?.id, filtroTipo, filtroMetodoPago, fechaInicio, fechaFin, buscador],
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.map(venta => 
            venta.id === ventaId 
              ? { ...venta, numeroSunat: numeroSunatTemp }
              : venta
          );
        }
      );
      
      // Refrescar estadísticas
      queryClient.invalidateQueries(["estadisticas-facturas", dataempresa?.id, fechaInicio, fechaFin]);
    } catch (error) {
      console.error("Error al actualizar número SUNAT:", error);
      toast.error("Error al actualizar: " + (error.response?.data?.message || error.message));
    }
  };

  const handleCancelarSunat = () => {
    setEditandoSunat(null);
    setNumeroSunatTemp("");
  };

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>📄 Reporte de Facturas / Boletas</Title>
          <Subtitle>Historial y gestión de comprobantes de venta</Subtitle>
        </HeaderLeft>
      </Header>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <FilterContainer>
        <SearchSection>
          <SearchInputWrapper>
            <BsSearch style={{ position: "absolute", left: "12px", color: "#999" }} />
            <SearchInput
              type="text"
              placeholder="Buscar por N° Comprobante, RUC, DNI..."
              value={buscador}
              onChange={(e) => setBuscador(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && {}}
            />
          </SearchInputWrapper>
          <FilterButton onClick={() => setMostrarFiltros(!mostrarFiltros)}>
            <BsFilter /> Filtros
          </FilterButton>
        </SearchSection>

        {mostrarFiltros && (
          <FiltersSection>

            <FilterGroup>
              <FilterLabel>Tipo:</FilterLabel>
              <FilterSelect value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                <option value="">Todos</option>
                <option value="FACTURA">Facturas</option>
                <option value="BOLETA">Boletas</option>
                <option value="TICKET">Tickets</option>
                <option value="F-SUNAT">F-SUNAT (Facturas con N° SUNAT)</option>
                <option value="B-SUNAT">B-SUNAT (Boletas con N° SUNAT)</option>
                <option value="CON-SUNAT">CON-SUNAT (Cualquier venta con N° SUNAT)</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Método de Pago:</FilterLabel>
              <FilterSelect value={filtroMetodoPago} onChange={(e) => setFiltroMetodoPago(e.target.value)}>
                <option value="">Todos</option>
                {dataMetodosPago && dataMetodosPago.map((metodo) => (
                  <option key={metodo.id} value={metodo.nombre}>{metodo.nombre}</option>
                ))}
              </FilterSelect>
            </FilterGroup>

            <DateFilterSection>
              <FilterLabel>Período:</FilterLabel>
              <DateButtonGroup>
                <DateRangeButton
                  $isActive={activeRange === "Todo"}
                  onClick={selectTodo}
                >
                  Todo
                </DateRangeButton>
                <DateRangeButton
                  $isActive={activeRange === "Hoy"}
                  onClick={selectToday}
                >
                  Hoy
                </DateRangeButton>
                <DateRangeButton
                  $isActive={activeRange === "7 días"}
                  onClick={() => setPresetRange(7, "7 días")}
                >
                  Últimos 7 días
                </DateRangeButton>
                <DateRangeButton
                  $isActive={activeRange === "30 días"}
                  onClick={() => setPresetRange(30, "30 días")}
                >
                  Últimos 30 días
                </DateRangeButton>
                <DateRangeButton
                  $isActive={activeRange === "12 meses"}
                  onClick={() => setPresetRange(365, "12 meses")}
                >
                  Últimos 12 meses
                </DateRangeButton>
                <DateRangeButton
                  $isActive={activeRange === "Por Día"}
                  onClick={() => setActiveRange("Por Día")}
                >
                  Por Día
                </DateRangeButton>
              </DateButtonGroup>

              {(activeRange === "30 días" ||
                activeRange === "12 meses" ||
                activeRange === "7 días" ||
                activeRange === "Rango") && (
                <StyledRangePicker
                  format="YYYY-MM-DD"
                  onChange={handleDateChange}
                  value={dates}
                  placeholder={["Fecha inicio", "Fecha fin"]}
                />
              )}
              {activeRange === "Por Día" && (
                <StyledDatePicker
                  format="YYYY-MM-DD"
                  onChange={handleSingleDateChange}
                  value={singleDate}
                  placeholder="Seleccionar fecha"
                />
              )}
            </DateFilterSection>

            <ExportExcelButton onClick={() => setModalExportExcel(true)}>
              <BsDownload /> Exportar a Excel
            </ExportExcelButton>

            <ClearFiltersButton onClick={() => {
              setBuscador("");
              setFiltroTipo("");
              limpiarFechasFiltro();
            }}>
              Limpiar Filtros
            </ClearFiltersButton>
          </FiltersSection>
        )}
      </FilterContainer>

      {/* TARJETAS DE ESTADÍSTICAS */}
      <StatsContainer>
        <StatsRow>
          <StatCard>
            <StatLabel>Total Ventas</StatLabel>
            <StatValue>
              {FormatearNumeroDinero(
                estadisticas?.totalVentas || 0,
                dataempresa?.currency,
                dataempresa?.iso
              )}
            </StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Facturas ({estadisticas?.facturas?.count || 0})</StatLabel>
            <StatValue color="#8b5cf6">
              {FormatearNumeroDinero(
                estadisticas?.facturas?.total || 0,
                dataempresa?.currency,
                dataempresa?.iso
              )}
            </StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Boletas ({estadisticas?.boletas?.count || 0})</StatLabel>
            <StatValue color="#f59e0b">
              {FormatearNumeroDinero(
                estadisticas?.boletas?.total || 0,
                dataempresa?.currency,
                dataempresa?.iso
              )}
            </StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Tickets ({estadisticas?.tickets?.count || 0})</StatLabel>
            <StatValue color="#3b82f6">
              {FormatearNumeroDinero(
                estadisticas?.tickets?.total || 0,
                dataempresa?.currency,
                dataempresa?.iso
              )}
            </StatValue>
          </StatCard>
          {/* Nuevos cuadros SUNAT */}
          <StatCard>
            <StatLabel>Comprobantes SUNAT ({estadisticas?.comprobantesSunat?.count || 0})</StatLabel>
            <StatValue color="#ef4444">
                  {FormatearNumeroDinero(
                  estadisticas?.comprobantesSunat?.total || 0,
                  dataempresa?.currency,
                  dataempresa?.iso
                )}            </StatValue>
          </StatCard>
          {/* TOTAL IGV SUNAT - Comentado temporalmente, descomentar si se necesita */}
          {/* <StatCard>
            <StatLabel>Total IGV (SUNAT)</StatLabel>
            <StatValue color="#dc2626">
              {FormatearNumeroDinero(
                estadisticas?.comprobantesSunat?.totalIgv || 0,
                dataempresa?.currency,
                dataempresa?.iso
              )}
            </StatValue>
          </StatCard> */}
          {/* Totales por método de pago */}
          {/* Calcular totales por método de pago usando el desglose de cada factura */}
          {dataMetodosPago && dataMetodosPago
            .filter((metodo) => metodo.nombre.toLowerCase() !== 'mixto')
            .map((metodo) => {
              let totalMetodo = 0;
              console.log(`\nMétodo de pago: ${metodo.nombre}`);
              facturas.forEach((venta, idx) => {
                console.log(`  Venta #${idx + 1} | ID: ${venta.id} | metodoPago: ${venta.metodoPago} | montoTotal: ${venta.montoTotal} | totalPagar: ${venta.totalPagar}`);
                if (Array.isArray(venta.metodosPagoDetalle)) {
                  console.log('    metodosPagoDetalle:', venta.metodosPagoDetalle);
                  venta.metodosPagoDetalle.forEach((detalle, i) => {
                    if (detalle.nombre === metodo.nombre) {
                      console.log(`      [${i}] Suma detalle: ${detalle.monto} (nombre: ${detalle.nombre})`);
                      totalMetodo += detalle.monto || 0;
                    }
                  });
                } else if (venta.metodoPago === metodo.nombre) {
                  // fallback por si no hay desglose
                  console.log('    Suma por metodoPago directo:', venta.montoTotal);
                  totalMetodo += venta.montoTotal || 0;
                }
              });
              console.log(`  Total calculado para ${metodo.nombre}:`, totalMetodo);
              return (
                <StatCard key={metodo.id}>
                  <StatLabel>{metodo.nombre}</StatLabel>
                  <StatValue color="#059669">
                    {FormatearNumeroDinero(
                      totalMetodo,
                      dataempresa?.currency,
                      dataempresa?.iso
                    )}
                  </StatValue>
                </StatCard>
              );
            })}
        </StatsRow>
      </StatsContainer>

      <TableContainer>
        {loadingFacturas ? (
          <EmptyState>
            <EmptyIcon>⏳</EmptyIcon>
            <EmptyText>Cargando facturas...</EmptyText>
          </EmptyState>
        ) : errorFacturas ? (
          <EmptyState>
            <EmptyIcon>⚠️</EmptyIcon>
            <EmptyText>Error al cargar facturas</EmptyText>
            <EmptySubtext>{errorFacturas.message}</EmptySubtext>
          </EmptyState>
        ) : facturas.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📄</EmptyIcon>
            <EmptyText>No hay comprobantes registrados</EmptyText>
            <EmptySubtext>Comienza registrando tu primera venta</EmptySubtext>
          </EmptyState>
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th>Fecha</Th>
                  <Th>N° Comprobante</Th>
                  <Th>N° F-SUNAT</Th>
                  <Th>Tipo</Th>
                  <Th>RUC / DNI</Th>
                  <Th>Método de Pago</Th>
                  <Th>Monto Total</Th>
                  <Th>Acciones</Th>
                </tr>
              </thead>
              <tbody>
                {facturas.map((venta) => (
                <tr key={venta.id}>
                  <Td>
                    {venta.fecha
                      ? format(new Date(venta.fecha), "dd/MM/yyyy HH:mm", { locale: es })
                      : "-"}
                  </Td>
                  <Td><strong>{venta.nroComprobante || "-"}</strong></Td>
                  <Td>
                    {editandoSunat === venta.id ? (
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={numeroSunatTemp}
                          onChange={(e) => setNumeroSunatTemp(e.target.value)}
                          style={{
                            padding: '4px 8px',
                            border: '2px solid #667eea',
                            borderRadius: '6px',
                            fontSize: '13px',
                            width: '140px'
                          }}
                          placeholder="Ej: F001-00000123"
                          autoFocus
                        />
                        <button
                          onClick={() => handleGuardarSunat(venta.id)}
                          style={{
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelarSunat}
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div 
                        style={{ 
                          display: 'flex', 
                          gap: '8px', 
                          alignItems: 'center',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleEditarSunat(venta)}
                      >
                        {venta.numeroSunat ? (
                          <Badge color="#dc2626" style={{ fontWeight: '700' }}>
                            {venta.numeroSunat}
                          </Badge>
                        ) : (
                          <span style={{ color: '#999', fontSize: '13px' }}>
                            Click para agregar
                          </span>
                        )}
                      </div>
                    )}
                  </Td>
                  <Td>
                    <Badge color={obtenerColorTipo(venta.tipoComprobante)}>
                      {venta.tipoComprobante || "-"}
                    </Badge>
                  </Td>
                  <Td>{venta.rucDni || "-"}</Td>
                  <Td>{venta.metodoPago || "-"}</Td>
                  <Td>
                    <TotalAmount>
                      {FormatearNumeroDinero(
                        venta.totalPagar || venta.montoTotal || 0,
                        dataempresa?.currency,
                        dataempresa?.iso
                      )}
                    </TotalAmount>
                  </Td>
                  <Td>
                    <ActionsContainer>
                      <ActionButton color="#2196F3" onClick={() => handleVerDetalle(venta)} title="Ver detalle">
                        <BsEye />
                      </ActionButton>
                    </ActionsContainer>
                  </Td>
                </tr>
              ))}
            </tbody>
            </Table>
            
            {/* 🚀 OPTIMIZACIÓN: Pagination controls */}
            <PaginationContainer>
              <PaginationButton 
                onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
                disabled={paginaActual === 1}
              >
                ← Anterior
              </PaginationButton>
              
              <PaginationInfo>
                Página {paginaActual} de {Math.ceil(facturas.length / ITEMS_POR_PAGINA) || 1}
              </PaginationInfo>
              
              <PaginationButton 
                onClick={() => setPaginaActual(prev => prev + 1)}
                disabled={paginaActual >= Math.ceil(facturas.length / ITEMS_POR_PAGINA)}
                active={false}
              >
                Siguiente →
              </PaginationButton>
            </PaginationContainer>
          </>
        )}
      </TableContainer>

      {modalDetalle && ventaSeleccionada && (
        <ModalOverlay onClick={() => setModalDetalle(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Detalle de Venta</h2>
              <button onClick={() => setModalDetalle(false)}>
                <Icon icon="mdi:close" />
              </button>
            </ModalHeader>
            <ModalBody>
              <InfoGroup>
                <InfoItem>
                  <label>N° Comprobante:</label>
                  <span>{ventaSeleccionada?.dataventas?.nroComprobante || ventaSeleccionada?.nroComprobante || "-"}</span>
                </InfoItem>
                <InfoItem>
                  <label>
                    {(ventaSeleccionada?.dataventas?.tipoComprobante || ventaSeleccionada?.nombreComprobante) === "FACTURA" 
                      ? "N° FACTURA SUNAT:" 
                      : (ventaSeleccionada?.dataventas?.tipoComprobante || ventaSeleccionada?.nombreComprobante) === "BOLETA"
                      ? "N° BOLETA SUNAT:"
                      : "N° SUNAT:"}
                  </label>
                  <span style={{ color: ventaSeleccionada?.dataventas?.numeroSunat ? '#dc2626' : '#999', fontWeight: '700' }}>
                    {ventaSeleccionada?.dataventas?.numeroSunat || "No registrado"}
                  </span>
                </InfoItem>
              </InfoGroup>
              <InfoGroup>
                <InfoItem>
                  <label>Tipo:</label>
                  <Badge color={obtenerColorTipo(ventaSeleccionada?.nombreComprobante || ventaSeleccionada?.dataventas?.tipoComprobante)}>
                    {ventaSeleccionada?.nombreComprobante || ventaSeleccionada?.dataventas?.tipoComprobante || "-"}
                  </Badge>
                </InfoItem>
              </InfoGroup>
              <InfoGroup>
                <InfoItem>
                  <label>Fecha:</label>
                  <span>
                    {ventaSeleccionada?.dataventas?.fecha
                      ? format(new Date(ventaSeleccionada.dataventas.fecha), "dd/MM/yyyy HH:mm", {
                          locale: es,
                        })
                      : "-"}
                  </span>
                </InfoItem>
                <InfoItem>
                  <label>Cliente:</label>
                  <span>{ventaSeleccionada?.dataCliente?.nombres || "Público General"}</span>
                </InfoItem>
              </InfoGroup>
              <InfoGroup>
                <InfoItem>
                  <label>
                    {(ventaSeleccionada?.dataventas?.tipoComprobante || ventaSeleccionada?.nombreComprobante)?.toUpperCase() === "FACTURA" 
                      ? "RUC:" 
                      : (ventaSeleccionada?.dataventas?.tipoComprobante || ventaSeleccionada?.nombreComprobante)?.toUpperCase() === "BOLETA"
                      ? "DNI:"
                      : "Documento:"}
                  </label>
                  <span>
                    {ventaSeleccionada?.dataventas?.rucDni || ventaSeleccionada?.dataventas?.ruc_dni || ventaSeleccionada?.dataventas?._ruc_dni || ventaSeleccionada?.dataCliente?.identificador_fiscal || ventaSeleccionada?.rucDni || "-"}
                  </span>
                  {(ventaSeleccionada?.dataventas?.tipoComprobante || ventaSeleccionada?.nombreComprobante)?.toUpperCase() === "FACTURA" && (
                    <DocumentTypeHint>
                      (Registro Único de Contribuyentes)
                    </DocumentTypeHint>
                  )}
                  {(ventaSeleccionada?.dataventas?.tipoComprobante || ventaSeleccionada?.nombreComprobante)?.toUpperCase() === "BOLETA" && (
                    <DocumentTypeHint>
                      (Documento Nacional de Identidad)
                    </DocumentTypeHint>
                  )}
                </InfoItem>
                <InfoItem>
                  <label>Monto Total:</label>
                  <span className="total">
                    {FormatearNumeroDinero(
                      ventaSeleccionada?.dataventas?.montoTotal || ventaSeleccionada?.totalPagar || ventaSeleccionada?.montoTotal || 0,
                      dataempresa?.currency,
                      dataempresa?.iso
                    )}
                  </span>
                </InfoItem>
              </InfoGroup>
              <InfoGroup>
                <InfoItem>
                  <label>Cajero:</label>
                  <span>{ventaSeleccionada?.dataventas?.usuario?.nombres || ventaSeleccionada?.nombrecajero || "-"}</span>
                </InfoItem>
                <InfoItem>
                  <label>Sucursal:</label>
                  <span>{ventaSeleccionada?.sucursal?.nombre || "-"}</span>
                </InfoItem>
              </InfoGroup>
            </ModalBody>
            <ModalFooter>
              <DownloadButton onClick={handleDescargarPDF} disabled={descargandoPDF}>
                <BsDownload /> {descargandoPDF ? "Generando..." : "Descargar PDF"}
              </DownloadButton>
              <DownloadButton onClick={() => { setModalDetalle(false); setModalIGV(true); }} style={{background: "linear-gradient(135deg, #10b981 0%, #059669 100%)"}}>
                <BsDownload /> Descargar IGV
              </DownloadButton>
              <button className="btn-secondary" onClick={() => setModalDetalle(false)}>
                Cerrar
              </button>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* MODAL IGV */}
      {modalIGV && ventaSeleccionada && (
        <ModalOverlay onClick={() => setModalIGV(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()} style={{maxWidth: '1000px'}}>
            <ModalHeader>
              <h2>Detalle de Venta con IGV</h2>
              <button onClick={() => setModalIGV(false)}>
                <Icon icon="mdi:close" />
              </button>
            </ModalHeader>
            <PDFPreview data-print-content>
              <PDFHeader>
                <PDFTitle>{dataempresa?.nombre || "Mi Empresa"}</PDFTitle>
                <PDFSubtitle>RUC: {dataempresa?.id_fiscal || "-"}</PDFSubtitle>
              </PDFHeader>

              <PDFSection>
                <PDFSectionTitle>Información de la Venta</PDFSectionTitle>
                <PDFGrid>
                  <PDFField>
                    <PDFFieldLabel>N° {ventaSeleccionada?.dataventas?.tipoComprobante || "Comprobante"}:</PDFFieldLabel>
                    <PDFFieldValue>{ventaSeleccionada?.dataventas?.nroComprobante || ventaSeleccionada?.nroComprobante || "-"}</PDFFieldValue>
                  </PDFField>
                  {ventaSeleccionada?.dataventas?.numeroSunat && (
                    <PDFField>
                      <PDFFieldLabel>
                        {ventaSeleccionada?.dataventas?.tipoComprobante === "FACTURA" 
                          ? "N° FACTURA SUNAT:" 
                          : ventaSeleccionada?.dataventas?.tipoComprobante === "BOLETA"
                          ? "N° BOLETA SUNAT:"
                          : "N° SUNAT:"}
                      </PDFFieldLabel>
                      <PDFFieldValue style={{ color: '#dc2626', fontWeight: '800' }}>
                        {ventaSeleccionada.dataventas.numeroSunat}
                      </PDFFieldValue>
                    </PDFField>
                  )}
                  <PDFField>
                    <PDFFieldLabel>Fecha Emisión:</PDFFieldLabel>
                    <PDFFieldValue>
                      {ventaSeleccionada?.dataventas?.fecha
                        ? format(new Date(ventaSeleccionada.dataventas.fecha), "dd/MM/yyyy HH:mm", { locale: es })
                        : "-"}
                    </PDFFieldValue>
                  </PDFField>
                  <PDFField>
                    <PDFFieldLabel>Cajero:</PDFFieldLabel>
                    <PDFFieldValue>{ventaSeleccionada?.dataventas?.usuario?.nombres || ventaSeleccionada?.nombrecajero || "-"}</PDFFieldValue>
                  </PDFField>
                  <PDFField>
                    <PDFFieldLabel>RUC/DNI:</PDFFieldLabel>
                    <PDFFieldValue>{ventaSeleccionada?.dataventas?.rucDni || ventaSeleccionada?.rucDni || "-"}</PDFFieldValue>
                  </PDFField>
                </PDFGrid>
              </PDFSection>

              <PDFSection>
                <PDFSectionTitle>Productos</PDFSectionTitle>
                <PDFTable>
                  <thead>
                    <tr>
                      <PDFTh>Cant.</PDFTh>
                      <PDFTh>Producto</PDFTh>
                      <PDFTh>Precio</PDFTh>
                      <PDFTh>Cálculo</PDFTh>
                      <PDFTh>IGV</PDFTh>
                      <PDFTh>Total</PDFTh>
                    </tr>
                  </thead>
                  <tbody>
                    {ventaSeleccionada?.productos?.map((producto, index) => {
                      const precioVenta = Number(producto.precio_venta || 0);
                      const cantidad = Number(producto.cantidad || 1);
                      const total = Number(producto.total || precioVenta * cantidad);
                      const calculoUnitario = precioVenta / 1.18;
                      const igvTotal = total - (total / 1.18);
                      
                      return (
                        <tr key={index}>
                          <PDFTd>{cantidad}</PDFTd>
                          <PDFTd>{producto.productos?.nombre || producto.descripcion || "Producto"}</PDFTd>
                          <PDFTd>S/ {precioVenta.toFixed(2)}</PDFTd>
                          <PDFTd>S/ {calculoUnitario.toFixed(5)}</PDFTd>
                          <PDFTd>S/ {igvTotal.toFixed(2)}</PDFTd>
                          <PDFTd><strong>S/ {total.toFixed(2)}</strong></PDFTd>
                        </tr>
                      );
                    })}
                  </tbody>
                </PDFTable>

                <PDFTotalsContainer>
                  <PDFTotalRow>
                    <span>SUBTOTAL:</span>
                    {/* ✅ Usar subTotal (sin descuento) si existe para cálculos correctos */}
                    <span>S/ {(Number(ventaSeleccionada?.dataventas?.subTotal || ventaSeleccionada?.dataventas?.montoTotal || 0)).toFixed(2)}</span>
                  </PDFTotalRow>
                  <PDFTotalRow>
                    <span>IGV (18%):</span>
                    {/* ✅ Calcular IGV basado en subTotal */}
                    <span>S/ {(Number(ventaSeleccionada?.dataventas?.subTotal || ventaSeleccionada?.dataventas?.montoTotal || 0) * 0.18).toFixed(2)}</span>
                  </PDFTotalRow>
                  <PDFTotalRow style={{fontSize: '18px', fontWeight: '800', borderTop: '2px solid #333', paddingTop: '10px'}}>
                    <span>TOTAL:</span>
                    {/* ✅ Total es el monto final cobrado (ya con descuento aplicado si corresponde) */}
                    <span>S/ {(ventaSeleccionada?.dataventas?.montoTotal || 0).toFixed(2)}</span>
                  </PDFTotalRow>
                </PDFTotalsContainer>
              </PDFSection>
            </PDFPreview>
            <ModalFooter>
              <DownloadButton onClick={() => window.print()} style={{background: "linear-gradient(135deg, #10b981 0%, #059669 100%)"}}>
                <BsDownload /> Descargar PDF
              </DownloadButton>
              <button className="btn-secondary" onClick={() => setModalIGV(false)}>
                Cerrar
              </button>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Modal de Exportación a Excel */}
      {modalExportExcel && (
        <ModalOverlay onClick={() => setModalExportExcel(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
            <ModalHeader>
              <h2>Exportar a Excel</h2>
              <button onClick={() => setModalExportExcel(false)}>
                <Icon icon="mdi:close" />
              </button>
            </ModalHeader>
            <ModalBody>
              <div style={{ marginBottom: '20px', color: '#6b7280', fontSize: '14px' }}>
                Se exportarán <strong>{facturas.length}</strong> registros al archivo Excel
              </div>
              
              <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <Table style={{ margin: 0 }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6' }}>
                      <Th colSpan={7} style={{ textAlign: 'center', padding: '12px', fontSize: '15px', fontWeight: '700', color: '#1f2937', background: '#f3f4f6' }}>
                        Ventas Electrónicas Emitidas del Periodo: {obtenerTextoPeriodo()}
                      </Th>
                    </tr>
                    <tr>
                      <Th>Fecha</Th>
                      <Th>N° Comprobante</Th>
                      <Th>N° F-SUNAT</Th>
                      <Th>Tipo</Th>
                      <Th>DNI</Th>
                      <Th>RUC</Th>
                      <Th>Monto Total</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {facturas.slice(0, 10).map((venta) => {
                      const documento = venta.rucDni || "-";
                      const esDNI = documento.length === 8;
                      const esRUC = documento.length === 11;
                      
                      return (
                        <tr key={venta.id}>
                          <Td>
                            {venta.fecha
                              ? format(new Date(venta.fecha), "dd/MM/yyyy HH:mm", { locale: es })
                              : "-"}
                          </Td>
                          <Td><strong>{venta.nroComprobante || "-"}</strong></Td>
                          <Td>{venta.numeroSunat || "-"}</Td>
                          <Td>
                            <Badge color={obtenerColorTipo(venta.tipoComprobante || venta.tipo)}>
                              {venta.tipoComprobante || venta.tipo || "-"}
                            </Badge>
                          </Td>
                          <Td>{esDNI ? documento : "-"}</Td>
                          <Td>{esRUC ? documento : "-"}</Td>
                          <Td style={{ fontWeight: "700", color: "#059669" }}>
                            S/ {venta.montoTotal?.toFixed(2) || "0.00"}
                          </Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
              
              {facturas.length > 10 && (
                <div style={{ marginTop: '10px', color: '#9ca3af', fontSize: '13px', textAlign: 'center' }}>
                  Mostrando primeros 10 registros. Se exportarán todos los {facturas.length} registros.
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <DownloadButton onClick={exportarAExcel} style={{background: "linear-gradient(135deg, #10b981 0%, #059669 100%)"}}>
                <BsDownload /> Descargar Excel
              </DownloadButton>
              <button className="btn-secondary" onClick={() => setModalExportExcel(false)}>
                Cancelar
              </button>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 15px;
  position: relative;
  overflow-x: hidden;
  box-sizing: border-box;
  
  @media (min-width: 768px) {
    padding: 30px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grid)" /></svg>');
    pointer-events: none;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
  gap: 15px;
  position: relative;
  z-index: 1;
  
  @media (min-width: 768px) {
    margin-bottom: 30px;
    padding: 30px;
    border-radius: 20px;
    gap: 20px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 5px;
    height: 100%;
    background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px 0 0 20px;
  }
`;

const HeaderLeft = styled.div``;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: slideInLeft 0.6s ease-out;
  
  @media (min-width: 768px) {
    font-size: 36px;
    gap: 12px;
  }
  
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #6b7280;
  font-weight: 500;
`;

const FilterContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 1;
  animation: fadeInUp 0.6s ease-out;
  
  @media (min-width: 768px) {
    border-radius: 20px;
    padding: 25px;
    margin-bottom: 30px;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const SearchSection = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  
  @media (min-width: 768px) {
    min-width: 300px;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 14px 14px 14px 44px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  color: #1f2937;
  background: #f9fafb;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const FilterButton = styled.button`
  padding: 14px 28px;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);

  &:hover {
    background: #667eea;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }
`;

const FiltersSection = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #f3f4f6;
  flex-wrap: wrap;
  align-items: flex-end;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
`;

const FilterLabel = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FilterSelect = styled.select`
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  color: #1f2937;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  }
`;

const ExportExcelButton = styled.button`
  padding: 12px 24px;
  background: #dcfce7;
  color: #16a34a;
  border: 2px solid #86efac;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #16a34a;
    color: white;
    border-color: #16a34a;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ClearFiltersButton = styled.button`
  padding: 12px 24px;
  background: #fee2e2;
  color: #dc2626;
  border: 2px solid #fca5a5;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #dc2626;
    color: white;
    border-color: #dc2626;
    transform: translateY(-2px);
  }
`;

const StatsContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 1;
  animation: fadeInUp 0.7s ease-out;
  
  @media (min-width: 768px) {
    border-radius: 20px;
    padding: 30px;
    margin-bottom: 30px;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
  }
`;

const StatCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  animation: scaleIn 0.5s ease-out;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  }
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(102, 126, 234, 0.2);
  }
  
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 800;
  background: ${(props) => props.color ? `linear-gradient(135deg, ${props.color} 0%, ${props.color}dd 100%)` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 15px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 1;
  animation: fadeInUp 0.8s ease-out;
  overflow-x: auto;
  
  @media (min-width: 768px) {
    border-radius: 20px;
    padding: 30px;
  }
  
  /* Estilizar scrollbar */
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Table = styled.table`
  width: 100%;
  min-width: 700px;
  border-collapse: separate;
  border-spacing: 0;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  color: #1f2937;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  border-bottom: 3px solid #667eea;
  
  @media (min-width: 768px) {
    padding: 16px;
    font-size: 13px;
  }
  
  &:first-child {
    border-top-left-radius: 12px;
  }
  
  &:last-child {
    border-top-right-radius: 12px;
  }
`;

const Td = styled.td`
  padding: 12px;
  color: #374151;
  font-size: 13px;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s ease;
  
  @media (min-width: 768px) {
    padding: 16px;
    font-size: 14px;
  }
  
  tr:hover & {
    background: #f9fafb;
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  background: ${(props) => props.color || "#e5e7eb"};
  color: white;
  box-shadow: 0 2px 8px ${(props) => props.color || "#e5e7eb"}40;
`;

const TotalAmount = styled.span`
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 16px;
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: ${(props) => props.color || v.colorPrincipal};
  color: white;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px ${(props) => props.color || v.colorPrincipal}40;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  animation: fadeIn 0.8s ease-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const EmptyIcon = styled.div`
  font-size: 100px;
  margin-bottom: 20px;
  animation: bounce 2s ease-in-out infinite;
  
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }
`;

const EmptyText = styled.h3`
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 10px;
`;

const EmptySubtext = styled.p`
  font-size: 16px;
  color: #6b7280;
  font-weight: 500;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 30px;
  border-bottom: 2px solid #f3f4f6;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: white;
  }

  button {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    width: 36px;
    height: 36px;

    svg {
      font-size: 24px;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: rotate(90deg);
    }
  }
`;

const ModalBody = styled.div`
  padding: 30px;
  overflow-y: auto;
  flex: 1;
`;

const InfoGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 12px;
    font-weight: 700;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  span {
    font-size: 16px;
    color: #1f2937;
    font-weight: 600;

    &.total {
      font-size: 24px;
      font-weight: 800;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }
`;

const DocumentTypeHint = styled.div`
  font-size: 10px;
  color: #9ca3af;
  font-style: italic;
  margin-top: 2px;
  font-weight: 400;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 30px;
  border-top: 2px solid #f3f4f6;
  background: #f9fafb;

  button {
    padding: 12px 24px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;

    &.btn-secondary {
      background: white;
      color: #6b7280;
      border: 2px solid #e5e7eb;

      &:hover {
        background: #f3f4f6;
        color: #374151;
        transform: translateY(-2px);
      }
    }
  }
`;

const DownloadButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Estilos para el modal IGV
const PDFPreview = styled.div`
  padding: 16px;
  overflow-y: auto;
  flex: 1;
  background: white;
  color: #333;
  max-height: 60vh;
  
  @media print {
    max-height: none;
    overflow: visible;
    padding: 10px;
  }
`;

const PDFHeader = styled.div`
  text-align: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #eee;
  
  @media print {
    margin-bottom: 10px;
    padding-bottom: 8px;
  }
`;

const PDFTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin-bottom: 6px;
  
  @media print {
    font-size: 18px;
    margin-bottom: 4px;
  }
`;

const PDFSubtitle = styled.p`
  font-size: 14px;
  color: #666;
  margin: 4px 0;
`;

const PDFSection = styled.div`
  margin-bottom: 16px;
  
  @media print {
    margin-bottom: 10px;
  }
`;

const PDFSectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
`;

const PDFGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const PDFField = styled.div``;

const PDFFieldLabel = styled.span`
  font-size: 13px;
  color: #666;
  font-weight: 500;
`;

const PDFFieldValue = styled.span`
  font-size: 14px;
  color: #333;
  font-weight: 600;
  margin-left: 8px;
`;

const PDFTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
`;

const PDFTh = styled.th`
  text-align: left;
  padding: 8px;
  background: #f5f5f5;
  color: #333;
  font-weight: 600;
  font-size: 12px;
  border: 1px solid #ddd;
  
  @media print {
    padding: 6px;
    font-size: 11px;
  }
`;

const PDFTd = styled.td`
  padding: 8px;
  color: #333;
  font-size: 12px;
  border: 1px solid #ddd;
  
  @media print {
    padding: 6px;
    font-size: 11px;
  }
`;

// 🚀 OPTIMIZACIÓN: Pagination styles
const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  background: white;
  border-top: 1px solid #f3f4f6;
  flex-wrap: wrap;
`;

const PaginationButton = styled.button`
  padding: 10px 16px;
  background: ${(props) => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white'};
  color: ${(props) => props.active ? 'white' : '#667eea'};
  border: 2px solid #667eea;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${(props) => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${(props) => props.disabled ? '0.5' : '1'};
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
`;

const PaginationInfo = styled.span`
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
`;

const PDFTotalsContainer = styled.div`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
`;

const PDFTotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  min-width: 300px;
  padding: 8px 12px;
  background: #f9f9f9;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  
  span:last-child {
    text-align: right;
    min-width: 100px;
  }
  
  @media print {
    padding: 6px 10px;
    font-size: 13px;
  }
`;

// Nuevos componentes para el selector de fechas
const DateFilterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-width: 100%;
  
  @media (min-width: 768px) {
    min-width: 600px;
  }
`;

const DateButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px;
  background: #f9fafb;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
`;

const DateRangeButton = styled.button`
  color: ${({ $isActive }) => ($isActive ? "white" : "#374151")};
  background: ${({ $isActive }) =>
    $isActive ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "white"};
  border: 2px solid ${({ $isActive }) => ($isActive ? "#667eea" : "#e5e7eb")};
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: ${({ $isActive }) => ($isActive ? "700" : "500")};
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: ${({ $isActive }) =>
    $isActive ? "0 4px 12px rgba(102, 126, 234, 0.3)" : "none"};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    border-color: #667eea;
  }
`;

const StyledRangePicker = styled(RangePicker)`
  width: 100%;
  padding: 10px;
  border: 2px solid #e5e7eb !important;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea !important;
  }

  &.ant-picker-focused {
    border-color: #667eea !important;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1) !important;
  }

  .ant-picker-input > input {
    color: #1f2937;
    font-weight: 600;
    font-size: 13px;
  }

  .ant-picker-input input::placeholder {
    color: #9ca3af;
  }

  .ant-picker-suffix {
    color: #667eea;
  }

  .ant-picker-separator {
    color: #667eea;
  }
`;

const StyledDatePicker = styled(DatePicker)`
  width: 100%;
  padding: 10px;
  border: 2px solid #e5e7eb !important;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea !important;
  }

  &.ant-picker-focused {
    border-color: #667eea !important;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1) !important;
  }

  .ant-picker-input > input {
    color: #1f2937;
    font-weight: 600;
    font-size: 13px;
  }

  .ant-picker-input input::placeholder {
    color: #9ca3af;
  }

  .ant-picker-suffix {
    color: #667eea;
  }
`;