import { useState, useEffect } from "react";
import styled from "styled-components";
import { useMovimientosStockStore } from "../store/MovimientosStockStore";
import { useProductosStore } from "../store/ProductosStore";
import { useAlmacenesStore } from "../store/AlmacenesStore";
import { useEmpresaStore } from "../store/EmpresaStore";
import { Title } from "../components/atomos/Title";
import { Btn1 } from "../components/moleculas/Btn1";

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
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Producto</th>
                    <th>Almacén</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Detalle</th>
                    <th>Origen</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {dataMovimientos.map((mov) => (
                    <tr key={mov.id}>
                      <td>{mov.id}</td>
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
                      <td>
                        <BtnVer onClick={() => setMostrarDetalles(mov)}>
                          👁️ Ver
                        </BtnVer>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tabla>
            </TablaWrapper>
          </>
        )}
      </TablaCard>

      {/* Modal de detalles */}
      {mostrarDetalles && (
        <Modal>
          <ModalOverlay onClick={() => setMostrarDetalles(null)} />
          <ModalContent>
            <ModalHeader>
              <h2>📋 Detalles del Movimiento</h2>
              <CloseBtn onClick={() => setMostrarDetalles(null)}>✕</CloseBtn>
            </ModalHeader>
            
            <ModalBody>
              <DetalleItem>
                <label>ID:</label>
                <span>{mostrarDetalles.id}</span>
              </DetalleItem>
              
              <DetalleItem>
                <label>Fecha y Hora:</label>
                <span>{formatearFecha(mostrarDetalles.fecha)}</span>
              </DetalleItem>
              
              <DetalleItem>
                <label>Producto:</label>
                <span>{mostrarDetalles.producto?.nombre || "-"}</span>
              </DetalleItem>
              
              <DetalleItem>
                <label>Almacén:</label>
                <span>{mostrarDetalles.almacen?.nombre || "-"}</span>
              </DetalleItem>
              
              <DetalleItem>
                <label>Tipo de Movimiento:</label>
                <TipoBadge className={getTipoClass(mostrarDetalles.tipoMovimiento)}>
                  {mostrarDetalles.tipoMovimiento}
                </TipoBadge>
              </DetalleItem>
              
              <DetalleItem>
                <label>Cantidad:</label>
                <span className="cantidad-grande">{mostrarDetalles.cantidad}</span>
              </DetalleItem>
              
              <DetalleItem>
                <label>Detalle:</label>
                <span>{mostrarDetalles.detalle || "Sin detalle"}</span>
              </DetalleItem>
              
              <DetalleItem>
                <label>Origen:</label>
                <span>{mostrarDetalles.origen || "Sin origen"}</span>
              </DetalleItem>
            </ModalBody>
            
            <ModalFooter>
              <Btn1 funcion={() => setMostrarDetalles(null)} bgcolor="#6b7280">
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
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
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
`;

const Tabla = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  thead {
    background: #f9fafb;
    
    th {
      padding: 12px;
      text-align: left;
      font-size: 13px;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
    }
  }
  
  tbody {
    tr {
      border-bottom: 1px solid #e5e7eb;
      transition: background 0.2s;
      
      &:hover {
        background: #f9fafb;
      }
    }
    
    td {
      padding: 12px;
      font-size: 14px;
      color: #1f2937;
      
      &.cantidad {
        font-weight: 600;
        text-align: center;
      }
    }
  }
`;

const TipoBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  
  &.entrada {
    background: #dcfce7;
    color: #16a34a;
  }
  
  &.salida {
    background: #fee2e2;
    color: #dc2626;
  }
  
  &.ajuste-entrada {
    background: #d1fae5;
    color: #059669;
  }
  
  &.ajuste-salida {
    background: #fecaca;
    color: #b91c1c;
  }
  
  &.ajuste-sin-cambio {
    background: #e5e7eb;
    color: #6b7280;
  }
  
  &.default {
    background: #e0e7ff;
    color: #4f46e5;
  }
`;

const BtnVer = styled.button`
  padding: 6px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #2563eb;
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
  max-width: 600px;
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
