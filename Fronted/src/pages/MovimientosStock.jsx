import { useState, useEffect } from "react";
import styled from "styled-components";
import { useMovimientosStockStore } from "../store/MovimientosStockStore";
import { useProductosStore } from "../store/ProductosStore";
import { useAlmacenesStore } from "../store/AlmacenesStore";
import { useEmpresaStore } from "../store/EmpresaStore";
import { Title } from "../components/atomos/Title";
import { Btn1 } from "../components/moleculas/Btn1";
import api from "../api/api";

export const MovimientosStock = () => {
  const {
    dataMovimientos,
    loading,
    error,
    filtros,
    setFiltros,
    resetFiltros,
    buscarConFiltros,
  } = useMovimientosStockStore();

  const { dataProductos, mostrarProductos } = useProductosStore();
  const { dataAlmacenes, mostrarAlmacenes } = useAlmacenesStore();
  const { dataempresa } = useEmpresaStore();

  const [filtrosLocales, setFiltrosLocales] = useState({
    idProducto: "",
    idAlmacen: "",
    tipoMovimiento: "",
    fechaInicio: "",
    fechaFin: "",
  });

  const [mostrarDetalles, setMostrarDetalles] = useState(null);
  const [ventaDetalles, setVentaDetalles] = useState(null);
  const [cargandoVenta, setCargandoVenta] = useState(false);

  // Función para cargar detalles de la venta enlazada
  const cargarVentaDetalles = async (idVenta) => {
    if (!idVenta) return;
    
    setCargandoVenta(true);
    try {
      // Obtener el detalle completo de la venta usando el endpoint correcto
      const response = await api.get(`/ventas/${idVenta}/detalle-completo`);
      if (response.data) {
        setVentaDetalles(response.data);
      }
    } catch (error) {
      console.error("Error al cargar venta:", error);
      setVentaDetalles(null);
    } finally {
      setCargandoVenta(false);
    }
  };

  // Manejar apertura del modal
  const handleVerDetalles = (mov) => {
    setMostrarDetalles(mov);
    setVentaDetalles(null);
    
    // Si es una venta, cargar los detalles
    if (mov.origen === "ventas" && mov.detalle?.includes("ID venta:")) {
      const idVenta = mov.detalle.match(/ID venta:\s*(\d+)/)?.[1];
      if (idVenta) {
        cargarVentaDetalles(idVenta);
      }
    }
  };

  // Manejar cierre del modal
  const handleCerrarModal = () => {
    setMostrarDetalles(null);
    setVentaDetalles(null);
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (dataempresa?.id) {
      mostrarProductos({ id_empresa: dataempresa.id });
      mostrarAlmacenes({ id_empresa: dataempresa.id });
      buscarConFiltros({ idEmpresa: dataempresa.id });
    }
  }, [dataempresa]);

  // Aplicar filtros
  const handleBuscar = () => {
    const filtrosActivos = {
      idProducto: filtrosLocales.idProducto || null,
      idAlmacen: filtrosLocales.idAlmacen || null,
      tipoMovimiento: filtrosLocales.tipoMovimiento || null,
      fechaInicio: filtrosLocales.fechaInicio || null,
      fechaFin: filtrosLocales.fechaFin || null,
      idEmpresa: dataempresa?.id || null,
    };
    
    setFiltros(filtrosActivos);
    buscarConFiltros(filtrosActivos);
  };

  // Limpiar filtros
  const handleLimpiar = () => {
    setFiltrosLocales({
      idProducto: "",
      idAlmacen: "",
      tipoMovimiento: "",
      fechaInicio: "",
      fechaFin: "",
    });
    resetFiltros();
    if (dataempresa?.id) {
      buscarConFiltros({ idEmpresa: dataempresa.id });
    }
  };

  // Obtener clase CSS según tipo de movimiento
  const getTipoClass = (tipo) => {
    const tipos = {
      ENTRADA: "entrada",
      SALIDA: "salida",
      AJUSTE_ENTRADA: "ajuste-entrada",
      AJUSTE_SALIDA: "ajuste-salida",
      AJUSTE_SIN_CAMBIO: "ajuste-sin-cambio",
      COMPRA: "entrada",
      VENTA: "salida",
    };
    return tipos[tipo] || "default";
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    const date = new Date(fecha);
    return date.toLocaleString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Container>
      <Header>
        <Title>Movimientos de Stock (Kardex)</Title>
      </Header>

      <FiltrosCard>
        <FiltrosHeader>
          <h3>🔍 Filtros de Búsqueda</h3>
        </FiltrosHeader>
        
        <FiltrosGrid>
          <FiltroItem>
            <label>Producto:</label>
            <select
              value={filtrosLocales.idProducto}
              onChange={(e) =>
                setFiltrosLocales({ ...filtrosLocales, idProducto: e.target.value })
              }
            >
              <option value="">Todos los productos</option>
              {dataProductos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </FiltroItem>

          <FiltroItem>
            <label>Almacén:</label>
            <select
              value={filtrosLocales.idAlmacen}
              onChange={(e) =>
                setFiltrosLocales({ ...filtrosLocales, idAlmacen: e.target.value })
              }
            >
              <option value="">Todos los almacenes</option>
              {dataAlmacenes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </FiltroItem>

          <FiltroItem>
            <label>Tipo de Movimiento:</label>
            <select
              value={filtrosLocales.tipoMovimiento}
              onChange={(e) =>
                setFiltrosLocales({ ...filtrosLocales, tipoMovimiento: e.target.value })
              }
            >
              <option value="">Todos los tipos</option>
              <option value="ENTRADA">ENTRADA</option>
              <option value="SALIDA">SALIDA</option>
              <option value="AJUSTE_ENTRADA">AJUSTE ENTRADA</option>
              <option value="AJUSTE_SALIDA">AJUSTE SALIDA</option>
              <option value="AJUSTE_SIN_CAMBIO">AJUSTE SIN CAMBIO</option>
              <option value="COMPRA">COMPRA</option>
              <option value="VENTA">VENTA</option>
            </select>
          </FiltroItem>

          <FiltroItem>
            <label>Fecha Inicio:</label>
            <input
              type="datetime-local"
              value={filtrosLocales.fechaInicio}
              onChange={(e) =>
                setFiltrosLocales({ ...filtrosLocales, fechaInicio: e.target.value })
              }
            />
          </FiltroItem>

          <FiltroItem>
            <label>Fecha Fin:</label>
            <input
              type="datetime-local"
              value={filtrosLocales.fechaFin}
              onChange={(e) =>
                setFiltrosLocales({ ...filtrosLocales, fechaFin: e.target.value })
              }
            />
          </FiltroItem>
        </FiltrosGrid>

        <FiltrosActions>
          <Btn1 funcion={handleBuscar} bgcolor="#22c55e">
            Buscar
          </Btn1>
          <Btn1 funcion={handleLimpiar} bgcolor="#6b7280">
            Limpiar Filtros
          </Btn1>
        </FiltrosActions>
      </FiltrosCard>

      <TablaCard>
        {loading && <LoadingState>Cargando movimientos...</LoadingState>}
        
        {error && <ErrorState>❌ {error}</ErrorState>}
        
        {!loading && !error && dataMovimientos.length === 0 && (
          <EmptyState>
            <div className="icon">📦</div>
            <p>No hay movimientos registrados con los filtros aplicados</p>
          </EmptyState>
        )}

        {!loading && !error && dataMovimientos.length > 0 && (
          <>
            <ResultadosInfo>
              Mostrando <strong>{dataMovimientos.length}</strong> movimientos
            </ResultadosInfo>
            
            <TablaWrapper>
              <Tabla>
                <thead>
                  <tr>
                    <th>ACCIONES</th>
                    <th>FECHA</th>
                    <th>PRODUCTO</th>
                    <th>ALMACÉN</th>
                    <th>TIPO</th>
                    <th>CANTIDAD</th>
                    <th>DETALLE</th>
                    <th>ORIGEN</th>
                  </tr>
                </thead>
                <tbody>
                  {dataMovimientos.map((mov) => (
                    <tr key={mov.id}>
                      <td className="acciones-cell">
                        <BtnVer onClick={() => handleVerDetalles(mov)}>
                          👁️ Ver
                        </BtnVer>
                      </td>
                      <td>{formatearFecha(mov.fecha)}</td>
                      <td>{mov.producto?.nombre || "-"}</td>
                      <td>{mov.almacen?.nombre || "-"}</td>
                      <td>
                        <TipoBadge className={getTipoClass(mov.tipoMovimiento)}>
                          {mov.tipoMovimiento}
                        </TipoBadge>
                      </td>
                      <td className="cantidad">{mov.cantidad}</td>
                      <td>{mov.detalle || "-"}</td>
                      <td>{mov.origen || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </Tabla>
            </TablaWrapper>
          </>
        )}
      </TablaCard>

      {/* Modal de detalles - DISEÑO PROFESIONAL CON DOS COLUMNAS */}
      {mostrarDetalles && (
        <Modal>
          <ModalOverlay onClick={handleCerrarModal} />
          <ModalContent>
            <ModalHeader>
              <h2>📋 Detalle del Movimiento de Stock</h2>
              <CloseBtn onClick={handleCerrarModal}>✕</CloseBtn>
            </ModalHeader>
            
            <ModalBody>
              {/* GRUPO 1: ID y Comprobante (si es venta) */}
              <InfoGroup>
                <InfoItem>
                  <InfoLabel>ID Movimiento:</InfoLabel>
                  <InfoValue>{mostrarDetalles.id}</InfoValue>
                </InfoItem>
                {mostrarDetalles.origen === "ventas" && mostrarDetalles.detalle?.includes("ID venta:") && (
                  <InfoItem>
                    <InfoLabel>Venta Asociada:</InfoLabel>
                    <InfoValue className="comprobante">
                      {cargandoVenta ? (
                        "Cargando..."
                      ) : ventaDetalles?.nroComprobante ? (
                        <>Comprobante: {ventaDetalles.nroComprobante}</>
                      ) : (
                        <>Venta #{mostrarDetalles.detalle.match(/ID venta:\s*(\d+)/)?.[1] || "-"}</>
                      )}
                    </InfoValue>
                  </InfoItem>
                )}
              </InfoGroup>

              {/* GRUPO 2: Tipo y Fecha */}
              <InfoGroup>
                <InfoItem>
                  <InfoLabel>Tipo de Movimiento:</InfoLabel>
                  <InfoValue>
                    <TipoBadge className={getTipoClass(mostrarDetalles.tipoMovimiento)}>
                      {mostrarDetalles.tipoMovimiento}
                    </TipoBadge>
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Fecha:</InfoLabel>
                  <InfoValue>{formatearFecha(mostrarDetalles.fecha)}</InfoValue>
                </InfoItem>
              </InfoGroup>

              {/* GRUPO 3: Producto y Almacén */}
              <InfoGroup>
                <InfoItem>
                  <InfoLabel>Producto:</InfoLabel>
                  <InfoValue>{mostrarDetalles.producto?.nombre || "-"}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Almacén:</InfoLabel>
                  <InfoValue>{mostrarDetalles.almacen?.nombre || "-"}</InfoValue>
                </InfoItem>
              </InfoGroup>

              {/* GRUPO 4: Cantidad y Origen */}
              <InfoGroup>
                <InfoItem>
                  <InfoLabel>Cantidad:</InfoLabel>
                  <InfoValue className="cantidad-grande">
                    {mostrarDetalles.cantidad}
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Origen:</InfoLabel>
                  <InfoValue>{mostrarDetalles.origen || "-"}</InfoValue>
                </InfoItem>
              </InfoGroup>

              {/* GRUPO 5: Detalle adicional */}
              {mostrarDetalles.detalle && mostrarDetalles.detalle !== "-" && (
                <InfoGroup fullWidth>
                  <InfoItem fullWidth>
                    <InfoLabel>Detalle:</InfoLabel>
                    <InfoValue>{mostrarDetalles.detalle}</InfoValue>
                  </InfoItem>
                </InfoGroup>
              )}

              {/* GRUPO 6: Información de la venta (si se cargó) */}
              {ventaDetalles && mostrarDetalles.origen === "ventas" && (
                <>
                  <SectionDivider />
                  <InfoGroup>
                    <InfoItem>
                      <InfoLabel>Tipo Comprobante:</InfoLabel>
                      <InfoValue className="tipo-comprobante">
                        {ventaDetalles.dataventas?.tipoComprobante || ventaDetalles.nombreComprobante || "-"}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>Número Comprobante:</InfoLabel>
                      <InfoValue className="comprobante">
                        {ventaDetalles.dataventas?.nroComprobante || "-"}
                      </InfoValue>
                    </InfoItem>
                  </InfoGroup>
                  <InfoGroup>
                    <InfoItem>
                      <InfoLabel>Número SUNAT:</InfoLabel>
                      <InfoValue>{ventaDetalles.dataventas?.numeroSunat || "No registrado"}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>Monto Total:</InfoLabel>
                      <InfoValue className="monto-total">
                        S/ {parseFloat(ventaDetalles.dataventas?.montoTotal || 0).toFixed(2)}
                      </InfoValue>
                    </InfoItem>
                  </InfoGroup>
                  <InfoGroup fullWidth>
                    <InfoItem fullWidth>
                      <InfoLabel>Cliente:</InfoLabel>
                      <InfoValue>{ventaDetalles.dataCliente?.nombres || "Cliente Genérico" || "-"}</InfoValue>
                    </InfoItem>
                  </InfoGroup>
                </>
              )}
            </ModalBody>
            
            <ModalFooter>
              <Btn1 funcion={handleCerrarModal} bgcolor="#6b7280">
                Cerrar
              </Btn1>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  width: 100%;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 20px;
`;

const FiltrosCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const FiltrosHeader = styled.div`
  margin-bottom: 20px;
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }
`;

const FiltrosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const FiltroItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  
  label {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
  }
  
  select, input {
    min-height: 44px;
    padding: 10px 14px;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }
`;

const FiltrosActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const TablaCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 60px 20px;
  font-size: 16px;
  color: #6b7280;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 60px 20px;
  font-size: 16px;
  color: #ef4444;
  background: #fee2e2;
  border-radius: 8px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  
  .icon {
    font-size: 64px;
    margin-bottom: 16px;
  }
  
  p {
    font-size: 16px;
    color: #6b7280;
  }
`;

const ResultadosInfo = styled.div`
  margin-bottom: 15px;
  font-size: 14px;
  color: #6b7280;
  
  strong {
    color: #1f2937;
    font-weight: 600;
  }
`;

const TablaWrapper = styled.div`
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
    
    &:hover {
      background: #94a3b8;
    }
  }
`;

const Tabla = styled.table`
  width: 100%;
  min-width: 600px;
  border-collapse: separate;
  border-spacing: 0;
  
  thead {
    tr {
      th {
        text-align: left;
        padding: 12px 14px;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        color: #1f2937;
        font-weight: 700;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        white-space: nowrap;
        border-bottom: 3px solid #667eea;
        
        &:first-child {
          position: sticky;
          left: 0;
          background: linear-gradient(135deg, #667eea 0%, #5568d3 100%);
          color: white;
          border-bottom: 3px solid #4555c0;
          border-top-left-radius: 12px;
          z-index: 20;
          box-shadow: 4px 0 12px rgba(102, 126, 234, 0.2);
        }
        
        &:last-child {
          border-top-right-radius: 12px;
        }
      }
    }
  }
  
  tbody {
    tr {
      transition: background 0.2s ease;
      border-bottom: 1px solid #f3f4f6;
      
      &:hover {
        background: #f9fafb;
      }
      
      &:last-child {
        td {
          &:first-child {
            border-bottom-left-radius: 12px;
          }
          &:last-child {
            border-bottom-right-radius: 12px;
          }
        }
      }
      
      td {
        padding: 14px 14px;
        color: #374151;
        font-size: 13px;
        border-bottom: 1px solid #f3f4f6;
        
        &:first-child {
          position: sticky;
          left: 0;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(85, 104, 211, 0.95) 100%);
          text-align: center;
          z-index: 15;
          box-shadow: 4px 0 12px rgba(102, 126, 234, 0.15);
          padding: 8px 10px;
        }
        
        &.cantidad {
          font-weight: 600;
          text-align: center;
        }
        
        &.acciones-cell {
          padding: 8px 10px;
        }
      }
    }
  }
  
  @media (max-width: 1200px) {
    th:nth-child(2),
    td:nth-child(2) {
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`;

const TipoBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &.entrada {
    background: linear-gradient(135deg, #dcfce7 0%, #c6f6d5 100%);
    color: #166534;
    box-shadow: 0 2px 8px rgba(22, 163, 74, 0.2);
  }
  
  &.salida {
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    color: #991b1b;
    box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2);
  }
  
  &.ajuste-entrada {
    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
    color: #065f46;
    box-shadow: 0 2px 8px rgba(5, 150, 105, 0.2);
  }
  
  &.ajuste-salida {
    background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
    color: #7f1d1d;
    box-shadow: 0 2px 8px rgba(185, 28, 28, 0.2);
  }
  
  &.ajuste-sin-cambio {
    background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
    color: #374151;
    box-shadow: 0 2px 8px rgba(107, 114, 128, 0.2);
  }
  
  &.default {
    background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
    color: #312e81;
    box-shadow: 0 2px 8px rgba(79, 70, 229, 0.2);
  }
`;

const BtnVer = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #5568d3 100%);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  white-space: nowrap;
  
  &:hover {
    background: linear-gradient(135deg, #5568d3 0%, #4555c0 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }
`;

// Modal
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.div`
  position: relative;
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  
  h2 {
    font-size: 20px;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }
`;

const CloseBtn = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  
  &:hover {
    background: #e5e7eb;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
`;

// Estilos profesionales para InfoGroup (dos columnas)
const InfoGroup = styled.div`
  display: grid;
  grid-template-columns: ${props => props.fullWidth ? '1fr' : 'repeat(2, 1fr)'};
  gap: 20px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const SectionDivider = styled.div`
  height: 2px;
  background: linear-gradient(90deg, transparent, #d1d5db, transparent);
  margin: 20px 0;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InfoLabel = styled.label`
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6b7280;
`;

const InfoValue = styled.span`
  font-size: 15px;
  font-weight: 500;
  color: #1f2937;
  word-break: break-word;
  
  &.cantidad-grande {
    font-size: 28px;
    font-weight: 700;
    color: #3b82f6;
  }

  &.comprobante {
    font-size: 16px;
    font-weight: 700;
    color: #059669;
    background: #d1fae5;
    padding: 8px 12px;
    border-radius: 6px;
    display: inline-block;
  }

  &.tipo-comprobante {
    font-size: 16px;
    font-weight: 700;
    color: #ffffff;
    background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
    padding: 8px 14px;
    border-radius: 6px;
    display: inline-block;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &.monto-total {
    font-size: 24px;
    font-weight: 700;
    color: #059669;
  }
`;

const DetalleItem = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  
  label {
    font-weight: 600;
    color: #374151;
    min-width: 150px;
  }
  
  span {
    color: #1f2937;
    
    &.cantidad-grande {
      font-size: 24px;
      font-weight: 700;
      color: #3b82f6;
    }
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
`;
