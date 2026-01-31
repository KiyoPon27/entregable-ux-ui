import { useState, useMemo, useEffect } from "react";
import { useMetodosPagoStore } from "../store/MetodosPagoStore";
import styled from "styled-components";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
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

const { RangePicker } = DatePicker;

export function ReporteFacturas() {
  const { dataempresa } = useEmpresaStore();
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroMetodoPago, setFiltroMetodoPago] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("7dias");
  const [buscador, setBuscador] = useState("");
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [descargandoPDF, setDescargandoPDF] = useState(false);

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
    queryKey: ["facturas", dataempresa?.id, filtroTipo, filtroMetodoPago, fechaInicio, fechaFin, buscador],
    queryFn: async () => {
      const params = new URLSearchParams({
        empresaId: dataempresa?.id,
      });
      if (filtroTipo) params.append("tipo", filtroTipo);
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
  // Aplicar filtro de tipo y método de pago en el frontend (por si el backend no filtra)
  const facturas = facturasRaw.filter((venta) => {
    // Filtro por tipo
    const tipoOk = !filtroTipo || venta.tipoComprobante === filtroTipo;
    // Filtro por método de pago
    const metodoOk = !filtroMetodoPago || venta.metodoPago === filtroMetodoPago;
    return tipoOk && metodoOk;
  });
  console.log("📊 Facturas procesadas para mostrar:", facturas);

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
          <Table>
            <thead>
              <tr>
                <Th>Fecha</Th>
                <Th>N° Comprobante</Th>
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
              <button className="btn-secondary" onClick={() => setModalDetalle(false)}>
                Cerrar
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
