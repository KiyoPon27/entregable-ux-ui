import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Icon } from '@iconify/react';
import { Device } from '../../../styles/breakpoints';
import { FormatearNumeroDinero } from '../../../utils/Conversiones';
import { useMostrarMultipreciosQuery } from '../../../tanstack/MultipreciosStack';

export function MultipreciosSelector({ 
  producto, 
  onSeleccionarOpcion, 
  onCancelar, 
  isVisible,
  empresa 
}) {
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);
  
  // Cargar multiprecios del producto
  const { data: multiprecios, isLoading } = useMostrarMultipreciosQuery(producto?.id);
  
  // Opciones disponibles (precio base + multiprecios)
  const opciones = [
    // Opción por defecto: venta individual
    {
      id: 'individual',
      cantidad: 1,
      nombreReferencial: 'Venta individual',
      precioVenta: producto?.precioVenta || 0,
      esMultiprecio: false
    },
    // Multiprecios del producto
    ...(multiprecios || []).map(mp => ({
      id: mp.id,
      cantidad: mp.cantidad,
      nombreReferencial: mp.nombreReferencial,
      precioVenta: mp.precioVenta,
      esMultiprecio: true
    }))
  ];
  
  // Auto-seleccionar la opción individual por defecto
  useEffect(() => {
    if (opciones.length > 0 && !opcionSeleccionada) {
      setOpcionSeleccionada(opciones[0]);
    }
  }, [opciones.length, opcionSeleccionada]);
  
  const handleSeleccionarOpcion = (opcion) => {
    setOpcionSeleccionada(opcion);
  };
  
  const handleConfirmar = () => {
    if (opcionSeleccionada) {
      onSeleccionarOpcion({
        cantidad: opcionSeleccionada.cantidad,
        precioVenta: opcionSeleccionada.precioVenta,
        descripcion: `${producto?.nombre} (${opcionSeleccionada.nombreReferencial})`,
        esMultiprecio: opcionSeleccionada.esMultiprecio
      });
    }
  };
  
  if (!isVisible || !producto) return null;
  
  return (
    <Overlay>
      <Modal>
        <Header>
          <div>
            <h3>Seleccionar opción de venta</h3>
            <ProductoInfo>
              <Icon icon="mdi:package-variant" width="20" height="20" />
              <span>{producto.nombre}</span>
            </ProductoInfo>
          </div>
          <CloseButton onClick={onCancelar}>
            <Icon icon="mdi:close" width="24" height="24" />
          </CloseButton>
        </Header>
        
        <Content>
          {isLoading ? (
            <Loading>
              <Icon icon="mdi:loading" className="loading-icon" />
              <span>Cargando opciones...</span>
            </Loading>
          ) : (
            <>
              <OpccionesGrid>
                {opciones.map((opcion, index) => (
                  <OpcionCard
                    key={opcion.id}
                    $isSelected={opcionSeleccionada?.id === opcion.id}
                    onClick={() => handleSeleccionarOpcion(opcion)}
                  >
                    <OpcionHeader>
                      <RadioButton $isSelected={opcionSeleccionada?.id === opcion.id}>
                        {opcionSeleccionada?.id === opcion.id && 
                          <Icon icon="mdi:check" width="16" height="16" />
                        }
                      </RadioButton>
                      <OpcionTitulo>{opcion.nombreReferencial}</OpcionTitulo>
                    </OpcionHeader>
                    
                    <OpcionDetalles>
                      <Detalle>
                        <Icon icon="mdi:counter" width="16" height="16" />
                        <span>Cantidad: {opcion.cantidad} unidad{opcion.cantidad > 1 ? 'es' : ''}</span>
                      </Detalle>
                      <Detalle>
                        <Icon icon="mdi:currency-usd" width="16" height="16" />
                        <span>
                          Precio: {FormatearNumeroDinero(
                            opcion.precioVenta, 
                            empresa?.currency || 'PEN', 
                            empresa?.iso || 'PE'
                          )}
                        </span>
                      </Detalle>
                      {opcion.cantidad > 1 && (
                        <Detalle>
                          <Icon icon="mdi:calculator" width="16" height="16" />
                          <span>
                            Precio por unidad: {FormatearNumeroDinero(
                              opcion.precioVenta / opcion.cantidad, 
                              empresa?.currency || 'PEN', 
                              empresa?.iso || 'PE'
                            )}
                          </span>
                        </Detalle>
                      )}
                    </OpcionDetalles>
                  </OpcionCard>
                ))}
              </OpccionesGrid>
              
              {opcionSeleccionada && (
                <ResumenSeleccion>
                  <ResumenTitulo>Resumen</ResumenTitulo>
                  <ResumenDetalle>
                    <strong>{opcionSeleccionada.nombreReferencial}</strong>
                    <span>
                      {opcionSeleccionada.cantidad} unidad{opcionSeleccionada.cantidad > 1 ? 'es' : ''} por {FormatearNumeroDinero(
                        opcionSeleccionada.precioVenta, 
                        empresa?.currency || 'PEN', 
                        empresa?.iso || 'PE'
                      )}
                    </span>
                  </ResumenDetalle>
                  {opcionSeleccionada.cantidad > 1 && (
                    <AvisoStock>
                      <Icon icon="mdi:information" width="16" height="16" />
                      <span>Se descontarán {opcionSeleccionada.cantidad} unidades del stock</span>
                    </AvisoStock>
                  )}
                </ResumenSeleccion>
              )}
            </>
          )}
        </Content>
        
        <Footer>
          <CancelButton onClick={onCancelar}>
            <Icon icon="mdi:close" width="18" height="18" />
            Cancelar
          </CancelButton>
          <ConfirmButton 
            onClick={handleConfirmar}
            disabled={!opcionSeleccionada || isLoading}
          >
            <Icon icon="mdi:check" width="18" height="18" />
            Agregar al carrito
          </ConfirmButton>
        </Footer>
      </Modal>
    </Overlay>
  );
}

// Styled Components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 600px;
  width: 90vw;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  @media ${Device.tablet} {
    width: 100%;
    max-width: 500px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
  
  h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #111827;
  }
`;

const ProductoInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
  margin-top: 4px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  border-radius: 6px;
  color: #6b7280;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const Content = styled.div`
  padding: 20px 24px;
  flex: 1;
  overflow-y: auto;
`;

const Loading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
  color: #6b7280;
  padding: 40px 20px;
  
  .loading-icon {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const OpccionesGrid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr;
  
  @media ${Device.tablet} {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
`;

const OpcionCard = styled.div`
  border: 2px solid ${props => props.$isSelected ? '#10b981' : '#e5e7eb'};
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$isSelected ? '#f0fdf4' : 'white'};
  
  &:hover {
    border-color: ${props => props.$isSelected ? '#10b981' : '#cbd5e1'};
    background: ${props => props.$isSelected ? '#f0fdf4' : '#f8fafc'};
  }
`;

const OpcionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const RadioButton = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid ${props => props.$isSelected ? '#10b981' : '#d1d5db'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$isSelected ? '#10b981' : 'white'};
  color: white;
  flex-shrink: 0;
`;

const OpcionTitulo = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;

const OpcionDetalles = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Detalle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
`;

const ResumenSeleccion = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const ResumenTitulo = styled.h4`
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
`;

const ResumenDetalle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  
  strong {
    color: #111827;
    font-size: 15px;
  }
  
  span {
    color: #6b7280;
    font-size: 14px;
  }
`;

const AvisoStock = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #fef3c7;
  border-radius: 6px;
  color: #92400e;
  font-size: 13px;
`;

const Footer = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 24px 20px;
  border-top: 1px solid #e5e7eb;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
`;

const ConfirmButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #10b981;
  border: 1px solid #10b981;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: #059669;
    border-color: #059669;
  }
  
  &:disabled {
    background: #9ca3af;
    border-color: #9ca3af;
    cursor: not-allowed;
  }
`;