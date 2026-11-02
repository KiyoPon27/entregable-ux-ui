import { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { useComprasStore } from "../store/ComprasStore";
import { useEmpresaStore } from "../store/EmpresaStore";
import { useClientesProveedoresStore } from "../store/ClientesProveedoresStore";
import { v } from "../styles/variables";
import { BsSearch, BsEye, BsDownload, BsPencil, BsTrash, BsFilter } from "react-icons/bs";
import { format, startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { DatePicker, ConfigProvider } from "antd";
import esES from "antd/locale/es_ES";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../api/api";

// Configurar dayjs en español
dayjs.locale('es');

const { RangePicker, MonthPicker } = DatePicker;

export function ReporteCompras() {
  const navigate = useNavigate();
  const { dataempresa } = useEmpresaStore();
  const { eliminarCompra, mostrarCompraDetalle } = useComprasStore();
  const { dataclipro, mostrarCliPro } = useClientesProveedoresStore();

  const [buscador, setBuscador] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroProveedor, setFiltroProveedor] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [compraSeleccionada, setCompraSeleccionada] = useState(null);
  const [mostrarModalPDF, setMostrarModalPDF] = useState(false);

  // Estados para filtro por fechas - exacto como ReporteFacturas + mes
  const [filtroFecha, setFiltroFecha] = useState("30dias");
  const [dates, setDates] = useState([null, null]);
  const [singleDate, setSingleDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [activeRange, setActiveRange] = useState("30dias");

  // Calcular fechas según el filtro - con soporte para mes
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

    // Si hay un mes seleccionado
    if (selectedMonth) {
      const start = selectedMonth.startOf('month').toDate();
      const end = selectedMonth.endOf('month').toDate();
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
        fechaInicio = hoy.subtract(30, 'day').startOf('day');
        fechaFin = hoy.endOf('day');
    }

    return { 
      fechaInicio: fechaInicio.toDate(), 
      fechaFin: fechaFin.toDate() 
    };
  }, [filtroFecha, dates, singleDate, selectedMonth]);

  // Query para obtener compras filtradas - EXACTO como ReporteFacturas
  const { data: comprasData, isLoading: loadingCompras, error: errorCompras } = useQuery({
    queryKey: ["compras", dataempresa?.id, filtroEstado, filtroProveedor, fechaInicio, fechaFin, buscador],
    queryFn: async () => {
      const params = new URLSearchParams({
        empresaId: dataempresa?.id,
      });
      
      if (filtroEstado && filtroEstado !== "todos") params.append("estado", filtroEstado);
      if (filtroProveedor) params.append("id_proveedor", filtroProveedor);
      if (fechaInicio) params.append("fechaInicio", dayjs(fechaInicio).format('YYYY-MM-DD'));
      if (fechaFin) params.append("fechaFin", dayjs(fechaFin).format('YYYY-MM-DD'));
      if (buscador) params.append("buscador", buscador);

      console.log('🔍 Parámetros de consulta compras:', Object.fromEntries(params));
      console.log('📅 Rango de fechas:', { fechaInicio, fechaFin });
      
      const response = await api.get(`/compras?${params.toString()}`);
      console.log('📄 Compras recibidas:', response.data?.length || 0);
      return response.data;
    },
    enabled: !!dataempresa?.id,
  });

  // Procesar compras 
  const dataCompras = useMemo(() => {
    if (!comprasData) return [];
    console.log('📊 Procesando compras:', comprasData.length);
    return comprasData;
  }, [comprasData]);

  // Cargar proveedores
  useEffect(() => {
    if (dataempresa?.id) {
      mostrarCliPro({ id_empresa: dataempresa.id, tipo: 'PROVEEDOR' });
    }
  }, [dataempresa]);

  // Funciones para manejo de filtros por fecha - EXACTO como ReporteFacturas
  const setPresetRange = (range) => {
    setActiveRange(range);
    setFiltroFecha(range);
    setDates([null, null]);
    setSingleDate(null);
    setSelectedMonth(null);
  };

  const selectToday = () => setPresetRange("hoy");
  const selectTodo = () => setPresetRange("todo");

  const handleDateChange = (newDates) => {
    setDates(newDates || [null, null]);
    if (newDates && newDates[0] && newDates[1]) {
      setFiltroFecha("rango");
      setActiveRange("rango");
    } else {
      setFiltroFecha("todo");
      setActiveRange("todo");
    }
    setSingleDate(null);
    setSelectedMonth(null);
  };

  const handleSingleDateChange = (date) => {
    setSingleDate(date);
    if (date) {
      setFiltroFecha("dia");
      setActiveRange("dia");
    } else {
      setFiltroFecha("todo");
      setActiveRange("todo");
    }
    setDates([null, null]);
    setSelectedMonth(null);
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    if (month) {
      setFiltroFecha("mes");
      setActiveRange("mes");
    } else {
      setFiltroFecha("todo");
      setActiveRange("todo");
    }
    setDates([null, null]);
    setSingleDate(null);
  };

  const limpiarFechasFiltro = () => {
    setFiltroFecha("30dias");
    setActiveRange("30dias");
    setDates([null, null]);
    setSingleDate(null);
    setSelectedMonth(null);
  };

  const obtenerTextoPeriodo = () => {
    if (filtroFecha === "todo") return "Todo el historial";
    if (filtroFecha === "hoy") return "Hoy";
    if (filtroFecha === "7dias") return "Últimos 7 días";
    if (filtroFecha === "30dias") return "Últimos 30 días";
    if (filtroFecha === "12meses") return "Últimos 12 meses";
    if (filtroFecha === "dia" && singleDate) {
      const fecha = singleDate.format("DD/MM/YYYY");
      return `Día: ${fecha}`;
    }
    if (filtroFecha === "mes" && selectedMonth) {
      const mes = selectedMonth.format("MMMM YYYY");
      return `Mes: ${mes.charAt(0).toUpperCase() + mes.slice(1)}`;
    }
    if (filtroFecha === "rango" && dates[0] && dates[1]) {
      const inicio = dates[0].format("DD/MM/YYYY");
      const fin = dates[1].format("DD/MM/YYYY");
      return `${inicio} - ${fin}`;
    }
    return "Todo el historial";
  };

  const handleLimpiarFiltros = () => {
    setBuscador("");
    setFiltroEstado("todos");
    setFiltroProveedor("");
    limpiarFechasFiltro();
  };

  const handleVerPDF = async (compra) => {
    try {
      const detalles = await mostrarCompraDetalle({ id_compra: compra.id });
      setCompraSeleccionada({ ...compra, detalles });
      setMostrarModalPDF(true);
    } catch (error) {
      toast.error("Error al cargar los detalles");
    }
  };

  const handleEliminar = async (compra) => {
    try {
      await eliminarCompra({ id: compra.id, id_empresa: dataempresa.id });
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const handleEditar = (compra) => {
    navigate("/compras", { state: { compraEditar: compra } });
  };

  const handleDescargarPDF = () => {
    if (!compraSeleccionada) return;
    
    try {
      window.print();
    } catch (error) {
      toast.error("Error al generar PDF");
    }
  };

  const proveedores = (dataclipro || []).filter((c) => c.tipo === "proveedor" || c.tipo === "PROVEEDOR");

  const getEstadoBadge = (estado) => {
    const estadoUpper = (estado || "").toUpperCase();
    if (estadoUpper === "COMPLETO") {
      return <Badge type="success">✅ Completo</Badge>;
    } else if (estadoUpper === "INCOMPLETO") {
      return <Badge type="warning">⚠️ Incompleto</Badge>;
    }
    return <Badge type="default">{estado}</Badge>;
  };

  return (
    <ConfigProvider locale={esES}>
      <Container>
      <Header>
        <HeaderLeft>
          <Title>📊 Reporte de Compras</Title>
          <Subtitle>Historial y gestión de todas las compras realizadas</Subtitle>
        </HeaderLeft>
        <HeaderRight>
          <NewButton onClick={() => navigate("/compras")}>
            + Nueva Compra
          </NewButton>
        </HeaderRight>
      </Header>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <FilterContainer>
        <SearchSection>
          <SearchInputWrapper>
            <BsSearch style={{ position: "absolute", left: "12px", color: "#999" }} />
            <SearchInput
              type="text"
              placeholder="Buscar por número de factura, proveedor..."
              value={buscador}
              onChange={(e) => setBuscador(e.target.value)}
            />
          </SearchInputWrapper>
          <SearchButton disabled={loadingCompras}>
            <BsSearch /> {loadingCompras ? 'Buscando...' : 'Buscar'}
          </SearchButton>
          <FilterButton onClick={() => setMostrarFiltros(!mostrarFiltros)}>
            <BsFilter /> Filtros
          </FilterButton>
        </SearchSection>

        {mostrarFiltros && (
          <FiltersSection>
            <FilterGroup>
              <FilterLabel>Estado:</FilterLabel>
              <FilterSelect value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                <option value="todos">Todos</option>
                <option value="COMPLETO">Completo</option>
                <option value="INCOMPLETO">Incompleto</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Proveedor:</FilterLabel>
              <FilterSelect value={filtroProveedor} onChange={(e) => setFiltroProveedor(e.target.value)}>
                <option value="">Todos los proveedores</option>
                {proveedores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombres}
                  </option>
                ))}
              </FilterSelect>
            </FilterGroup>

            {/* FILTROS POR FECHA */}
            <FilterGroup style={{ gridColumn: "1 / -1", marginTop: "15px" }}>
              <FilterLabel>🗓️ Filtrar por Fechas - {obtenerTextoPeriodo()}:</FilterLabel>
              
              <DateFilterSection>
                <DateButtonGroup>
                  <DateRangeButton
                    $isActive={activeRange === "todo"}
                    onClick={selectTodo}
                  >
                    Todo
                  </DateRangeButton>
                  <DateRangeButton
                    $isActive={activeRange === "hoy"}
                    onClick={selectToday}
                  >
                    Hoy
                  </DateRangeButton>
                  <DateRangeButton
                    $isActive={activeRange === "7dias"}
                    onClick={() => setPresetRange("7dias")}
                  >
                    Últimos 7 días
                  </DateRangeButton>
                  <DateRangeButton
                    $isActive={activeRange === "30dias"}
                    onClick={() => setPresetRange("30dias")}
                  >
                    Últimos 30 días
                  </DateRangeButton>
                  <DateRangeButton
                    $isActive={activeRange === "12meses"}
                    onClick={() => setPresetRange("12meses")}
                  >
                    Últimos 12 meses
                  </DateRangeButton>
                  <DateRangeButton
                    $isActive={activeRange === "dia"}
                    onClick={() => {
                      setActiveRange("dia");
                      setFiltroFecha("dia");
                      setDates([null, null]);
                      setSelectedMonth(null);
                      if (!singleDate) {
                        setSingleDate(dayjs());
                      }
                    }}
                  >
                    Por Día
                  </DateRangeButton>
                  <DateRangeButton
                    $isActive={activeRange === "mes"}
                    onClick={() => {
                      setActiveRange("mes");
                      setFiltroFecha("mes");
                      setDates([null, null]);
                      setSingleDate(null);
                      if (!selectedMonth) {
                        setSelectedMonth(dayjs());
                      }
                    }}
                  >
                    Por Mes
                  </DateRangeButton>
                </DateButtonGroup>

                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", width: "100%" }}>
                  <div style={{ flex: "1", minWidth: "300px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                      📅 Rango de Fechas
                    </label>
                    <StyledRangePicker
                      value={dates}
                      onChange={handleDateChange}
                      format="DD/MM/YYYY"
                      placeholder={["Fecha inicio", "Fecha fin"]}
                    />
                  </div>

                  <div style={{ flex: "1", minWidth: "250px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                      📅 Día Específico
                    </label>
                    <StyledDatePicker
                      value={singleDate}
                      onChange={handleSingleDateChange}
                      format="DD/MM/YYYY"
                      placeholder="Seleccionar día"
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div style={{ flex: "1", minWidth: "200px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                      📅 Mes Específico
                    </label>
                    <MonthPicker
                      value={selectedMonth}
                      onChange={handleMonthChange}
                      format="MMMM YYYY"
                      placeholder="Seleccionar mes"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
              </DateFilterSection>
            </FilterGroup>

            <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center", marginTop: "10px" }}>
              <ClearFiltersButton onClick={handleLimpiarFiltros}>
                Limpiar Filtros
              </ClearFiltersButton>
            </div>
          </FiltersSection>
        )}
      </FilterContainer>

      {/* TABLA DE COMPRAS */}
      <TableContainer>
        <StatsRow>
          <StatCard>
            <StatLabel>Total Compras</StatLabel>
            <StatValue>{(dataCompras || []).length}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Monto Total</StatLabel>
            <StatValue color={v.colorPrincipal}>
              S/ {dataCompras.reduce((sum, c) => sum + (c.montoTotal || c.monto_total || 0), 0).toFixed(2)}
            </StatValue>
          </StatCard>
        </StatsRow>

        {(dataCompras || []).length === 0 ? (
          <EmptyState>
            <EmptyIcon>📦</EmptyIcon>
            <EmptyText>No hay compras registradas</EmptyText>
            <EmptySubtext>Comienza registrando tu primera compra</EmptySubtext>
          </EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Fecha Registro</Th>
                <Th>N° Factura</Th>
                <Th>Proveedor</Th>
                <Th>Tipo</Th>
                <Th>Monto Total</Th>
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {(dataCompras || []).map((compra) => (
                <tr key={compra.id}>
                  <Td>
                    {compra.fechaEmision
                      ? format(new Date(compra.fechaEmision + "T00:00:00"), "dd/MM/yyyy")
                      : compra.fecha_emision
                      ? format(new Date(compra.fecha_emision + "T00:00:00"), "dd/MM/yyyy")
                      : "-"}
                  </Td>
                  <Td>
                    <strong>{compra.numeroFactura || compra.numero_factura}</strong>
                  </Td>
                  <Td>
                    {compra.proveedor?.nombres || 
                     proveedores.find(p => p.id === compra.id_proveedor)?.nombres || 
                     "Sin proveedor"}
                  </Td>
                  <Td>
                    {compra.tipoComprobante?.nombre || 
                     (compra.id_tipo_comprobante === 1 ? "Factura" : "Boleta")}
                  </Td>
                  <Td>
                    <TotalAmount>S/ {(compra.resumenTotal || compra.montoTotal || 0).toFixed(2)}</TotalAmount>
                  </Td>
                  <Td>
                    <ActionsContainer>
                      <ActionButton color="#2196F3" onClick={() => handleVerPDF(compra)}>
                        <BsEye title="Ver PDF" />
                      </ActionButton>
                      <ActionButton color="#FF9800" onClick={() => handleEditar(compra)}>
                        <BsPencil title="Editar" />
                      </ActionButton>
                      <ActionButton color="#F44336" onClick={() => handleEliminar(compra)}>
                        <BsTrash title="Eliminar" />
                      </ActionButton>
                    </ActionsContainer>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </TableContainer>

      {/* MODAL PDF */}
      {mostrarModalPDF && compraSeleccionada && (
        <ModalOverlay onClick={() => setMostrarModalPDF(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Detalle de Compra</ModalTitle>
              <CloseButton onClick={() => setMostrarModalPDF(false)}>✕</CloseButton>
            </ModalHeader>
            <PDFPreview data-print-content>
              <PDFHeader>
                <PDFTitle>{dataempresa?.nombre || "Mi Empresa"}</PDFTitle>
                <PDFSubtitle>RUC: {dataempresa?.idFiscal || "20611076321"}</PDFSubtitle>
                <PDFSubtitle>{dataempresa?.direccionFiscal || ""}</PDFSubtitle>
              </PDFHeader>

              <PDFSection>
                <PDFSectionTitle>Información de la Compra</PDFSectionTitle>
                <PDFGrid>
                  <PDFField>
                    <PDFFieldLabel>N° Factura:</PDFFieldLabel>
                    <PDFFieldValue>{compraSeleccionada.numeroFactura || compraSeleccionada.numero_factura}</PDFFieldValue>
                  </PDFField>
                  <PDFField>
                    <PDFFieldLabel>Fecha Emisión:</PDFFieldLabel>
                    <PDFFieldValue>
                      {compraSeleccionada.fechaEmision 
                        ? format(new Date(compraSeleccionada.fechaEmision + "T00:00:00"), "dd/MM/yyyy")
                        : format(new Date(compraSeleccionada.fecha_emision + "T00:00:00"), "dd/MM/yyyy")}
                    </PDFFieldValue>
                  </PDFField>
                  <PDFField>
                    <PDFFieldLabel>Proveedor:</PDFFieldLabel>
                    <PDFFieldValue>{compraSeleccionada.proveedor?.nombres || "Sin proveedor"}</PDFFieldValue>
                  </PDFField>
                  <PDFField>
                    <PDFFieldLabel>RUC:</PDFFieldLabel>
                    <PDFFieldValue>{compraSeleccionada.proveedor?.identificadorFiscal || compraSeleccionada.proveedor?.identificador_fiscal || "-"}</PDFFieldValue>
                  </PDFField>
                </PDFGrid>
              </PDFSection>

              <PDFSection>
                <PDFSectionTitle>Productos</PDFSectionTitle>
                <PDFTable>
                  <thead>
                    <tr>
                      <PDFTh style={{width: '30%'}}>Descripción</PDFTh>
                      <PDFTh style={{width: '8%', textAlign: 'center'}}>Cant.</PDFTh>
                      <PDFTh style={{width: '10%', textAlign: 'center'}}>Unidad</PDFTh>
                      <PDFTh style={{width: '10%', textAlign: 'center'}}>Factor</PDFTh>
                      <PDFTh style={{width: '12%', textAlign: 'right'}}>V. Unitario</PDFTh>
                      <PDFTh style={{width: '15%', textAlign: 'right'}}>Importe</PDFTh>
                    </tr>
                  </thead>
                  <tbody>
                    {compraSeleccionada.detalles?.map((detalle, index) => (
                      <tr key={index}>
                        <PDFTd>{detalle.producto?.nombre || "Producto"}</PDFTd>
                        <PDFTd style={{textAlign: 'center'}}><strong>{detalle.cantidad || detalle.cantidadRecibida || 0}</strong></PDFTd>
                        <PDFTd style={{textAlign: 'center'}}>{detalle.unidadMedidaCompra || "CJA"}</PDFTd>
                        <PDFTd style={{textAlign: 'center'}}>{detalle.factorCompra || 1}</PDFTd>
                        <PDFTd style={{textAlign: 'right'}}>S/ {(detalle.valorUnitario || (detalle.importe || detalle.subtotal || 0) / (detalle.cantidad || 1) || 0).toFixed(2)}</PDFTd>
                        <PDFTd style={{textAlign: 'right'}}><strong>S/ {(detalle.importe || detalle.subtotal || 0).toFixed(2)}</strong></PDFTd>
                      </tr>
                    ))}
                  </tbody>
                </PDFTable>

                <PDFTotal>
                  <span>Monto Total:</span>
                  <span style={{fontSize: '18px', fontWeight: 'bold', color: '#667eea'}}>S/ {(compraSeleccionada.montoTotal || 0).toFixed(2)}</span>
                </PDFTotal>
              </PDFSection>

              {(compraSeleccionada.resumenGravada || compraSeleccionada.resumenIGV || compraSeleccionada.resumenDescuentoTotal || compraSeleccionada.resumenTotal) && (
                <PDFSection>
                  <PDFSectionTitle>Resumen</PDFSectionTitle>
                  <PDFResumenContainer>
                    <PDFResumenRow>
                      <span>Gravada:</span>
                      <span>S/ {(compraSeleccionada.resumenGravada || 0).toFixed(2)}</span>
                    </PDFResumenRow>
                    <PDFResumenRow>
                      <span>IGV (18%):</span>
                      <span>S/ {(compraSeleccionada.resumenIGV || 0).toFixed(2)}</span>
                    </PDFResumenRow>
                    <PDFResumenRow>
                      <span>Descuento Total:</span>
                      <span>S/ {(compraSeleccionada.resumenDescuentoTotal || 0).toFixed(2)}</span>
                    </PDFResumenRow>
                    <PDFResumenRow style={{fontWeight: 'bold', borderTop: '1px solid #e0e0e0', paddingTop: '8px', marginTop: '8px'}}>
                      <span>Total:</span>
                      <span>S/ {(compraSeleccionada.resumenTotal || 0).toFixed(2)}</span>
                    </PDFResumenRow>
                  </PDFResumenContainer>
                </PDFSection>
              )}

              {compraSeleccionada.observacion && (
                <PDFSection>
                  <PDFSectionTitle>Observaciones</PDFSectionTitle>
                  <PDFObservacion>{compraSeleccionada.observacion}</PDFObservacion>
                </PDFSection>
              )}
            </PDFPreview>
            <ModalFooter>
              <DownloadButton onClick={handleDescargarPDF}>
                <BsDownload /> Descargar PDF
              </DownloadButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
    </ConfigProvider>
  );
}

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px;
  position: relative;
  
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
  margin-bottom: 30px;
  padding: 30px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
  gap: 20px;
  position: relative;
  z-index: 1;
  
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

const HeaderRight = styled.div``;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideInLeft 0.6s ease-out;
  
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

const NewButton = styled.button`
  padding: 16px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  display: flex;
  align-items: center;
  gap: 8px;
  animation: slideInRight 0.6s ease-out;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

const FilterContainer = styled.div`
  background: white;
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 1;
  animation: fadeInUp 0.6s ease-out;
  
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
  min-width: 300px;
  display: flex;
  align-items: center;
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

const SearchButton = styled.button`
  padding: 14px 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #f3f4f6;
  align-items: end;
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

const TableContainer = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 1;
  animation: fadeInUp 0.8s ease-out;
  
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
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
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

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
`;

const Th = styled.th`
  text-align: left;
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  color: #1f2937;
  font-weight: 700;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  border-bottom: 3px solid #667eea;
  
  &:first-child {
    border-top-left-radius: 12px;
  }
  
  &:last-child {
    border-top-right-radius: 12px;
  }
`;

const Td = styled.td`
  padding: 16px;
  color: #374151;
  font-size: 14px;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s ease;
  
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
  background: ${(props) =>
    props.type === "success"
      ? "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)"
      : props.type === "warning"
      ? "linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)"
      : "#e5e7eb"};
  color: ${(props) =>
    props.type === "success" || props.type === "warning" ? "white" : "#6b7280"};
  box-shadow: ${(props) =>
    props.type === "success"
      ? "0 2px 8px rgba(76, 175, 80, 0.3)"
      : props.type === "warning"
      ? "0 2px 8px rgba(255, 165, 0, 0.3)"
      : "none"};
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

// MODAL PDF
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
  background: ${({ theme }) => theme.bgtotal};
  border-radius: 12px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.bg3};
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: ${({ theme }) => theme.textGray};
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.bg};
    color: ${({ theme }) => theme.text};
  }
`;

const PDFPreview = styled.div`
  padding: 16px;
  overflow-y: auto;
  flex: 1;
  background: white;
  color: #333;
  max-height: 80vh;
  
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
  margin-top: 16px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const PDFTh = styled.th`
  text-align: left;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 700;
  font-size: 13px;
  border: 1px solid #e2e8f0;
  
  @media print {
    padding: 10px 12px;
    font-size: 12px;
    background: #667eea;
  }
`;

const PDFTd = styled.td`
  padding: 10px 16px;
  color: #333;
  font-size: 13px;
  border: 1px solid #e2e8f0;
  background: white;
  
  &:nth-child(2),
  &:nth-child(3),
  &:nth-child(4) {
    text-align: right;
  }
  
  @media print {
    padding: 8px 12px;
    font-size: 12px;
  }
`;

const PDFTotal = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  color: white;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  
  @media print {
    margin-top: 12px;
    padding: 10px 12px;
    font-size: 14px;
    page-break-inside: avoid;
  }
`;

const PDFResumenContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
`;

const PDFResumenRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
  color: #333;
  
  span:first-child {
    font-weight: 500;
  }
  
  span:last-child {
    font-weight: 600;
    color: #667eea;
  }
  
  @media print {
    font-size: 12px;
    padding: 6px 0;
  }
`;

const PDFObservacion = styled.p`
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
`;

const ModalFooter = styled.div`
  padding: 20px 24px;
  border-top: 1px solid ${({ theme }) => theme.bg3};
  display: flex;
  justify-content: flex-end;
`;

const DownloadButton = styled.button`
  padding: 12px 24px;
  background: ${v.colorPrincipal};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: ${v.colorPrincipalHover};
    transform: translateY(-2px);
  }
  
  @media print {
    display: none;
  }
`;

// Styled components para filtros de fecha
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
  width: 100%;
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

// Estilos para impresión
const style = document.createElement('style');
style.textContent = `
  @media print {
    * {
      visibility: hidden;
    }
    
    body {
      background: white !important;
      margin: 0;
      padding: 0;
    }
    
    [data-print-content] {
      visibility: visible !important;
      position: fixed;
      left: 0;
      top: 0;
      width: 100%;
      background: white;
      padding: 10px;
      box-sizing: border-box;
    }
    
    [data-print-content] * {
      visibility: visible !important;
    }
    
    button, .modal-overlay, nav, header, footer {
      display: none !important;
      visibility: hidden !important;
    }
    
    @page {
      size: A4;
      margin: 10mm;
    }
    
    /* Evitar saltos de página dentro de elementos */
    table, tr, td, th, div {
      page-break-inside: avoid;
    }
  }
`;
if (typeof document !== 'undefined') {
  document.head.appendChild(style);
}

//flavio