import { useState, useMemo } from "react";
import styled from "styled-components";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { useEmpresaStore } from "../store/EmpresaStore";
import { FormatearNumeroDinero } from "../utils/Conversiones";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import api from "../api/api";
import { v } from "../styles/variables";
import { BsSearch, BsEye, BsFilter } from "react-icons/bs";

export function ReporteFacturas() {
  const { dataempresa } = useEmpresaStore();
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("7dias");
  const [buscador, setBuscador] = useState("");
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Calcular fechas según el filtro - MEMOIZADO para evitar bucles infinitos
  const { fechaInicio, fechaFin } = useMemo(() => {
    const hoy = new Date();
    let fechaInicio = new Date();
    let fechaFin = new Date();

    switch (filtroFecha) {
      case "hoy":
        fechaInicio.setHours(0, 0, 0, 0);
        fechaFin.setHours(23, 59, 59, 999);
        break;
      case "7dias":
        fechaInicio.setDate(hoy.getDate() - 7);
        break;
      case "30dias":
        fechaInicio.setDate(hoy.getDate() - 30);
        break;
      case "12meses":
        fechaInicio.setMonth(hoy.getMonth() - 12);
        break;
      default:
        fechaInicio = null;
        fechaFin = null;
    }

    return { fechaInicio, fechaFin };
  }, [filtroFecha]); // Solo recalcular cuando cambia el filtro de fecha

  // Query para obtener facturas filtradas
  const { data: facturasData, isLoading: loadingFacturas, error: errorFacturas } = useQuery({
    queryKey: ["facturas", dataempresa?.id, filtroTipo, fechaInicio, fechaFin, buscador],
    queryFn: async () => {
      const params = new URLSearchParams({
        empresaId: dataempresa?.id,
      });
      if (filtroTipo) params.append("tipo", filtroTipo);
      if (fechaInicio) params.append("fechaInicio", fechaInicio.toISOString());
      if (fechaFin) params.append("fechaFin", fechaFin.toISOString());
      if (buscador) params.append("buscador", buscador);

      const response = await api.get(
        `/ventas/facturas?${params.toString()}`
      );
      
      console.log("📊 URL completa:", `/ventas/facturas?${params.toString()}`);
      console.log("📊 Tipo de response.data:", typeof response.data);
      
      // IMPORTANTE: El backend puede devolver string JSON en lugar de objeto parseado
      let data;
      try {
        if (typeof response.data === 'string') {
          console.log("⚠️ Respuesta es string, intentando parsear...");
          console.log("📝 Primeros 500 caracteres:", response.data.substring(0, 500));
          console.log("📝 Últimos 200 caracteres:", response.data.substring(response.data.length - 200));
          data = JSON.parse(response.data);
        } else {
          data = response.data;
        }
      } catch (parseError) {
        console.error("❌ Error al parsear JSON:", parseError);
        console.error("📄 Respuesta completa:", response.data);
        throw new Error(`Error al parsear respuesta del servidor: ${parseError.message}`);
      }
      
      console.log("✅ Datos parseados correctamente:", data);
      console.log("📊 Es array:", Array.isArray(data));
      return data;
    },
    enabled: !!dataempresa?.id,
  });

  // Asegurar que facturas sea siempre un array
  const facturas = Array.isArray(facturasData) ? facturasData : [];
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
    setVentaSeleccionada(venta);
    setModalDetalle(true);
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
              <FilterLabel>Periodo:</FilterLabel>
              <FilterSelect value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)}>
                <option value="hoy">Hoy</option>
                <option value="7dias">Últimos 7 días</option>
                <option value="30dias">Últimos 30 días</option>
                <option value="12meses">Últimos 12 meses</option>
              </FilterSelect>
            </FilterGroup>

            <ClearFiltersButton onClick={() => {
              setBuscador("");
              setFiltroTipo("");
              setFiltroFecha("7dias");
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
                  <span>{ventaSeleccionada.nroComprobante || "-"}</span>
                </InfoItem>
                <InfoItem>
                  <label>Tipo:</label>
                  <Badge color={obtenerColorTipo(ventaSeleccionada.tipoComprobante)}>
                    {ventaSeleccionada.tipoComprobante || "-"}
                  </Badge>
                </InfoItem>
              </InfoGroup>
              <InfoGroup>
                <InfoItem>
                  <label>Fecha:</label>
                  <span>
                    {ventaSeleccionada.fecha
                      ? format(new Date(ventaSeleccionada.fecha), "dd/MM/yyyy HH:mm", {
                          locale: es,
                        })
                      : "-"}
                  </span>
                </InfoItem>
                <InfoItem>
                  <label>Cliente:</label>
                  <span>{ventaSeleccionada.cliente?.nombres || "Público General"}</span>
                </InfoItem>
              </InfoGroup>
              <InfoGroup>
                <InfoItem>
                  <label>
                    {ventaSeleccionada.tipoComprobante === "FACTURA" ? "RUC:" : "DNI:"}
                  </label>
                  <span>
                    {ventaSeleccionada.rucDni || "-"}
                  </span>
                </InfoItem>
                <InfoItem>
                  <label>Monto Total:</label>
                  <span className="total">
                    {FormatearNumeroDinero(
                      ventaSeleccionada.totalPagar || ventaSeleccionada.montoTotal || 0,
                      dataempresa?.currency,
                      dataempresa?.iso
                    )}
                  </span>
                </InfoItem>
              </InfoGroup>
              <InfoGroup>
                <InfoItem>
                  <label>Cajero:</label>
                  <span>{ventaSeleccionada.usuario?.nombres || "-"}</span>
                </InfoItem>
                <InfoItem>
                  <label>Sucursal:</label>
                  <span>{ventaSeleccionada.sucursal?.nombre || "-"}</span>
                </InfoItem>
              </InfoGroup>
            </ModalBody>
            <ModalFooter>
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
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 1;
  animation: fadeInUp 0.7s ease-out;
  
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
