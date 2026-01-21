import { useState, useEffect } from "react";
import styled from "styled-components";
import { useComprasStore } from "../store/ComprasStore";
import { useEmpresaStore } from "../store/EmpresaStore";
import { useClientesProveedoresStore } from "../store/ClientesProveedoresStore";
import { v } from "../styles/variables";
import { BsSearch, BsEye, BsDownload, BsPencil, BsTrash, BsFilter } from "react-icons/bs";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function ReporteCompras() {
  const navigate = useNavigate();
  const { dataempresa } = useEmpresaStore();
  const { dataCompras, mostrarCompras, buscarCompras, eliminarCompra, mostrarCompraDetalle } = useComprasStore();
  const { dataclipro, mostrarCliPro } = useClientesProveedoresStore();

  const [buscador, setBuscador] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroProveedor, setFiltroProveedor] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [compraSeleccionada, setCompraSeleccionada] = useState(null);
  const [mostrarModalPDF, setMostrarModalPDF] = useState(false);

  useEffect(() => {
    if (dataempresa?.id) {
      mostrarCompras({ id_empresa: dataempresa.id });
      mostrarCliPro({ id_empresa: dataempresa.id, tipo: 'PROVEEDOR' });
    }
  }, [dataempresa]);

  const handleBuscar = async () => {
    if (!dataempresa?.id) return;

    const params = {
      id_empresa: dataempresa.id,
      buscador: buscador,
    };

    if (filtroEstado !== "todos") {
      params.estado = filtroEstado;
    }

    if (filtroProveedor) {
      params.id_proveedor = Number(filtroProveedor);
    }

    await buscarCompras(params);
  };

  const handleLimpiarFiltros = async () => {
    setBuscador("");
    setFiltroEstado("todos");
    setFiltroProveedor("");
    if (dataempresa?.id) {
      await mostrarCompras({ id_empresa: dataempresa.id });
    }
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
              onKeyPress={(e) => e.key === "Enter" && handleBuscar()}
            />
          </SearchInputWrapper>
          <SearchButton onClick={handleBuscar}>
            <BsSearch /> Buscar
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

            <ClearFiltersButton onClick={handleLimpiarFiltros}>
              Limpiar Filtros
            </ClearFiltersButton>
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
            <StatLabel>Completas</StatLabel>
            <StatValue color="#4CAF50">
              {(dataCompras || []).filter((c) => (c.estado || "").toUpperCase() === "COMPLETO").length}
            </StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Incompletas</StatLabel>
            <StatValue color="#FFA500">
              {(dataCompras || []).filter((c) => (c.estado || "").toUpperCase() === "INCOMPLETO").length}
            </StatValue>
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
                <Th>Estado</Th>
                <Th>Monto Total</Th>
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {(dataCompras || []).map((compra) => (
                <tr key={compra.id}>
                  <Td>
                    {compra.fechaEmision
                      ? format(new Date(compra.fechaEmision), "dd/MM/yyyy")
                      : compra.fecha_emision
                      ? format(new Date(compra.fecha_emision), "dd/MM/yyyy")
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
                  <Td>{getEstadoBadge(compra.estado)}</Td>
                  <Td>
                    <TotalAmount>S/ {(compra.montoTotal || compra.monto_total || 0).toFixed(2)}</TotalAmount>
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
                <PDFSubtitle>RUC: {dataempresa?.id_fiscal || "-"}</PDFSubtitle>
                <PDFSubtitle>{dataempresa?.direccion_fiscal || ""}</PDFSubtitle>
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
                        ? format(new Date(compraSeleccionada.fechaEmision), "dd/MM/yyyy")
                        : format(new Date(compraSeleccionada.fecha_emision), "dd/MM/yyyy")}
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
                      <PDFTh>Producto</PDFTh>
                      <PDFTh>Cant. Esperada</PDFTh>
                      <PDFTh>Cant. Recibida</PDFTh>
                      <PDFTh>P. Unit.</PDFTh>
                      <PDFTh>Subtotal</PDFTh>
                    </tr>
                  </thead>
                  <tbody>
                    {compraSeleccionada.detalles?.map((detalle, index) => (
                      <tr key={index}>
                        <PDFTd>{detalle.producto?.nombre || "Producto"}</PDFTd>
                        <PDFTd>{detalle.cantidadEsperada || detalle.cantidad_esperada || "-"}</PDFTd>
                        <PDFTd><strong>{detalle.cantidadRecibida || detalle.cantidad_recibida}</strong></PDFTd>
                        <PDFTd>S/ {(detalle.precioCompra || detalle.precio_compra || 0).toFixed(2)}</PDFTd>
                        <PDFTd><strong>S/ {(detalle.subtotal || 0).toFixed(2)}</strong></PDFTd>
                      </tr>
                    ))}
                  </tbody>
                </PDFTable>

                <PDFTotal>
                  <span>Total:</span>
                  <span>S/ {(compraSeleccionada.montoTotal || compraSeleccionada.monto_total || 0).toFixed(2)}</span>
                </PDFTotal>
              </PDFSection>

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

const PDFTotal = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 700;
  color: #333;
  width: 100%;
  box-sizing: border-box;
  
  @media print {
    margin-top: 8px;
    padding: 8px;
    font-size: 14px;
    page-break-inside: avoid;
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