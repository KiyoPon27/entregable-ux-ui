import styled from "styled-components";

import { blur_in } from "../../../styles/keyframes";
import { FormatearNumeroDinero } from "../../../utils/Conversiones";
import {
  Btn1,
  InputText2,
  Lottieanimacion,
 
  useDetalleVentasStore,
  useEmpresaStore,
  useVentasStore,
} from "../../../index";
import { ListarMultipreciosPorProducto } from "../../../supabase/crudMultiprecios";
import animacionvacio from "../../../assets/vacioanimacion.json";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useState, useRef, useEffect } from "react";
import { Device } from "../../../styles/breakpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
export function AreaDetalleventaPos() {

  const { dataempresa } = useEmpresaStore();
  const [editIndex, setEditIndex] = useState(null);
  const [newCantidad, setNewCantidad] = useState(1);
  const [multiprecioOpenId, setMultiprecioOpenId] = useState(null);
  const [multipreciosData, setMultipreciosData] = useState({});
  const [loadingMultiprecios, setLoadingMultiprecios] = useState(null);
  const carritoRef = useRef(null);
  const dropdownRef = useRef(null);
  const { mostrardetalleventa, editarCantidadDetalleVenta, eliminardetalleventa, cambiarMultiprecioDetalleVenta } =
    useDetalleVentasStore();
    const queryClient = useQueryClient()
  const { idventa } = useVentasStore();
  const EditarCantidadDv = async (data) => {
    const p = {
      _id: data.id,
      _cantidad: data.cantidad,
    };
    await editarCantidadDetalleVenta(p);
  };
  const {mutate:mutateEditarCantidadDV} = useMutation({
    mutationKey: ["editar cantidad detalle venta"],
    mutationFn: EditarCantidadDv,
    onError:(error)=>{
      toast.error(`Error: ${error.message}`)
    },
    onSuccess:()=>{
      queryClient.invalidateQueries(["mostrar detalle venta"])
    }
  });
  const EliminarDV =async(p) =>{
    await eliminardetalleventa({id:p.id})
  }
  const {mutate:mutateEliminarDV} = useMutation({
    mutationKey: ["editar cantidad detalle venta"],
    mutationFn: EliminarDV,
    onError:(error)=>{
      toast.error(`Error: ${error.message}`)
    },
    onSuccess:()=>{
      queryClient.invalidateQueries(["mostrar detalle venta"])
    }
  });

  // Mutation para cambiar multiprecio de un detalle
  const CambiarMultiprecionDV = async (data) => {
    await cambiarMultiprecioDetalleVenta({
      id: data.id,
      cantidad: data.cantidad,
      precioVenta: data.precioVenta,
      descripcion: data.descripcion,
    });
  };
  const { mutate: mutateCambiarMultiprecio } = useMutation({
    mutationKey: ["cambiar multiprecio detalle venta"],
    mutationFn: CambiarMultiprecionDV,
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["mostrar detalle venta"]);
      toast.success("Precio actualizado");
      setMultiprecioOpenId(null);
    },
  });

  // Función para abrir/cerrar el dropdown de multiprecios
  const toggleMultiprecioDropdown = async (item) => {
    const itemId = item.id;
    if (multiprecioOpenId === itemId) {
      setMultiprecioOpenId(null);
      return;
    }

    const productoId = item.productos?.id || item.id_producto;
    if (!productoId) return;

    // Si ya tenemos los datos cacheados, solo abrir
    if (multipreciosData[productoId]) {
      setMultiprecioOpenId(itemId);
      return;
    }

    // Cargar multiprecios
    setLoadingMultiprecios(itemId);
    try {
      const data = await ListarMultipreciosPorProducto(productoId);
      setMultipreciosData((prev) => ({ ...prev, [productoId]: data || [] }));
      setMultiprecioOpenId(itemId);
    } catch (error) {
      console.error("Error cargando multiprecios:", error);
    } finally {
      setLoadingMultiprecios(null);
    }
  };

  // Manejar selección de una opción de multiprecio
  const handleSeleccionarMultiprecio = (item, opcion) => {
    // opcion puede ser un multiprecio o "unidad"
    if (opcion === "unidad") {
      // Cambiar a precio por unidad (precio original del producto)
      const precioUnitario = item.productos?.precioVenta || item.precio_venta;
      mutateCambiarMultiprecio({
        id: item.id,
        cantidad: 1,
        precioVenta: precioUnitario,
        descripcion: item.productos?.nombre || item.descripcion?.split(" (")[0],
      });
    } else {
      // Cambiar a un multiprecio: precio total / cantidad = precio unitario para el backend
      const precioUnitario = opcion.precioVenta / opcion.cantidad;
      const nombreBase = item.productos?.nombre || item.descripcion?.split(" (")[0];
      mutateCambiarMultiprecio({
        id: item.id,
        cantidad: opcion.cantidad,
        precioVenta: precioUnitario,
        descripcion: `${nombreBase} (${opcion.nombreReferencial})`,
      });
    }
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMultiprecioOpenId(null);
      }
    };
    if (multiprecioOpenId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [multiprecioOpenId]);

  // Función para incrementar cantidad con detección automática de multiprecio
  const handleIncrementarCantidad = async (item) => {
    const nuevaCantidad = item.cantidad + 1;
    const productoId = item.productos?.id || item.id_producto;

    // Cargar multiprecios si no están cacheados
    let multiprecios = multipreciosData[productoId];
    if (!multiprecios && productoId) {
      try {
        multiprecios = await ListarMultipreciosPorProducto(productoId);
        setMultipreciosData((prev) => ({ ...prev, [productoId]: multiprecios || [] }));
      } catch (error) {
        console.error("Error cargando multiprecios:", error);
        multiprecios = [];
      }
    }

    // Verificar si la nueva cantidad coincide con algún multiprecio
    const multiprecioCoincidente = (multiprecios || []).find(
      (mp) => Number(mp.cantidad) === nuevaCantidad
    );

    if (multiprecioCoincidente) {
      // Cambiar automáticamente al multiprecio
      const precioUnitario = multiprecioCoincidente.precioVenta / multiprecioCoincidente.cantidad;
      const nombreBase = item.productos?.nombre || item.descripcion?.split(" (")[0];
      mutateCambiarMultiprecio({
        id: item.id,
        cantidad: multiprecioCoincidente.cantidad,
        precioVenta: precioUnitario,
        descripcion: `${nombreBase} (${multiprecioCoincidente.nombreReferencial})`,
      });
      toast.success(`Cambiado a ${multiprecioCoincidente.nombreReferencial}`);
    } else {
      // Solo incrementar cantidad
      mutateEditarCantidadDV({ id: item.id, cantidad: nuevaCantidad });
    }
  };

  // Función para decrementar cantidad con detección automática
  const handleDecrementarCantidad = async (item) => {
    const nuevaCantidad = item.cantidad - 1;
    if (nuevaCantidad < 1) return;

    const productoId = item.productos?.id || item.id_producto;

    // Cargar multiprecios si no están cacheados
    let multiprecios = multipreciosData[productoId];
    if (!multiprecios && productoId) {
      try {
        multiprecios = await ListarMultipreciosPorProducto(productoId);
        setMultipreciosData((prev) => ({ ...prev, [productoId]: multiprecios || [] }));
      } catch (error) {
        console.error("Error cargando multiprecios:", error);
        multiprecios = [];
      }
    }

    // Verificar si la nueva cantidad coincide con algún multiprecio
    const multiprecioCoincidente = (multiprecios || []).find(
      (mp) => Number(mp.cantidad) === nuevaCantidad
    );

    if (multiprecioCoincidente) {
      // Cambiar automáticamente al multiprecio
      const precioUnitario = multiprecioCoincidente.precioVenta / multiprecioCoincidente.cantidad;
      const nombreBase = item.productos?.nombre || item.descripcion?.split(" (")[0];
      mutateCambiarMultiprecio({
        id: item.id,
        cantidad: multiprecioCoincidente.cantidad,
        precioVenta: precioUnitario,
        descripcion: `${nombreBase} (${multiprecioCoincidente.nombreReferencial})`,
      });
      toast.success(`Cambiado a ${multiprecioCoincidente.nombreReferencial}`);
    } else if (item.descripcion?.includes("(")) {
      // Si está en multiprecio y la nueva cantidad NO coincide con ninguno, volver a unidad
      const precioUnitario = item.productos?.precioVenta;
      const nombreBase = item.productos?.nombre || item.descripcion?.split(" (")[0];
      mutateCambiarMultiprecio({
        id: item.id,
        cantidad: nuevaCantidad,
        precioVenta: precioUnitario,
        descripcion: nombreBase,
      });
      toast.success("Cambiado a unidad");
    } else {
      // Solo decrementar cantidad
      mutateEditarCantidadDV({ id: item.id, cantidad: nuevaCantidad });
    }
  };
  const handleEditClick = (index, cantidad) => {
    setEditIndex(index);
    setNewCantidad(cantidad);
  };
  const handleInputChange = (e) => {
    const value = Math.max(0, parseFloat(e.target.value));
    setNewCantidad(value);
  };
  const handleInputBlur = (item) => {
    mutateEditarCantidadDV({id:item.id,cantidad:newCantidad})
    setEditIndex(null); // Salir del modo edición
  };
  const handleKeyDown = (e, item) => {
    if (e.key === "Enter") {
      handleInputBlur(item); // Llama a `handleInputBlur` cuando se presiona Enter
    }
  };
  const { data: items } = useQuery({
    queryKey: ["mostrar detalle venta", { id_venta: idventa }],
    queryFn: () => mostrardetalleventa({ id_venta: idventa }),
  });
  
  // Scroll automático cuando se agregue un nuevo producto
  useEffect(() => {
    if (items?.length > 0 && carritoRef.current) {
      carritoRef.current.scrollTo({
        top: carritoRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [items?.length]);
  
  return (
    <AreaDetalleventa ref={carritoRef} className={items?.length > 0 ? "" : "animacion"}>
    {items?.length > 0 ? (
      items?.map((item, index) => {
        const igvBase = Number(item.precio_venta || 0) / 1.18; // Precio sin IGV (division solicitada)
        const productoId = item.productos?.id || item.id_producto;
        const multipreciosProducto = multipreciosData[productoId] || [];
        const tieneMultiprecios = multipreciosProducto.length > 0;
        const isDropdownOpen = multiprecioOpenId === item.id;
        const isLoading = loadingMultiprecios === item.id;

        return (
          <Itemventa key={index}>
            <article className="contentdescripcion">
              <div className="header-producto">
                <span className="descripcion">{item.descripcion}</span>
                {item.productos?.tipoComprobante && (
                  <TipoComprobanteTag $tipo={item.productos.tipoComprobante}>
                    {item.productos.tipoComprobante}
                  </TipoComprobanteTag>
                )}
                {/* Botón para cambiar multiprecio */}
                <MultiprecioWrapper ref={isDropdownOpen ? dropdownRef : null}>
                  <MultiprecioBtn
                    onClick={() => toggleMultiprecioDropdown(item)}
                    title="Cambiar precio (unidad, docena, caja...)"
                    $active={isDropdownOpen}
                    $hasMultiprecio={tieneMultiprecios}
                  >
                    {isLoading ? (
                      <>
                        <Icon icon="eos-icons:loading" width="18" height="18" />
                        <span>Cargando...</span>
                      </>
                    ) : (
                      <>
                        <Icon icon="mdi:package-variant-closed" width="18" height="18" />
                        <span>
                          {item.descripcion?.includes("(") 
                            ? item.descripcion.match(/\(([^)]+)\)/)?.[1] || "Unidad"
                            : "Unidad"}
                        </span>
                        <Icon icon={isDropdownOpen ? "mdi:chevron-up" : "mdi:chevron-down"} width="16" height="16" />
                      </>
                    )}
                    {tieneMultiprecios && !isDropdownOpen && (
                      <Badge>{multipreciosProducto.length + 1} opciones</Badge>
                    )}
                  </MultiprecioBtn>
                  {isDropdownOpen && (
                    <MultiprecioDropdown>
                      {/* Opción: Unidad (precio original del producto) */}
                      <MultiprecioOption
                        onClick={() => handleSeleccionarMultiprecio(item, "unidad")}
                        $active={item.cantidad == 1 && !item.descripcion?.includes("(")}
                      >
                        <span className="nombre">Unidad</span>
                        <span className="detalle">×1</span>
                        <span className="precio">
                          {FormatearNumeroDinero(
                            item.productos?.precioVenta || item.precio_venta,
                            dataempresa?.currency,
                            dataempresa?.iso
                          )}
                        </span>
                      </MultiprecioOption>
                      {/* Opciones de multiprecios */}
                      {multipreciosProducto.map((mp) => (
                        <MultiprecioOption
                          key={mp.id}
                          onClick={() => handleSeleccionarMultiprecio(item, mp)}
                          $active={item.descripcion?.includes(mp.nombreReferencial)}
                        >
                          <span className="nombre">{mp.nombreReferencial}</span>
                          <span className="detalle">×{mp.cantidad}</span>
                          <span className="precio">
                            {FormatearNumeroDinero(
                              mp.precioVenta,
                              dataempresa?.currency,
                              dataempresa?.iso
                            )}
                          </span>
                        </MultiprecioOption>
                      ))}
                      {!tieneMultiprecios && (
                        <MultiprecioOption $disabled>
                          <span className="nombre">Sin multiprecios</span>
                        </MultiprecioOption>
                      )}
                    </MultiprecioDropdown>
                  )}
                </MultiprecioWrapper>
              </div>
              
              <span className="importe">
                <strong>precio unit:</strong>
                🪵
                {FormatearNumeroDinero(
                  item.precio_venta,
                  dataempresa?.currency,
                  dataempresa?.iso
                )}
              </span>
              {/* Mostrar división precio / 1.18 con 5 decimales (solo vista) */}
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                <strong>IGV 18%:</strong>&nbsp;{(igvBase).toFixed(5)}
              </div>
              <ContentTotalResponsive>
                <span className="importerespo">
                  <strong>precio unit:</strong>
                  🪵
                  {FormatearNumeroDinero(
                    item.precio_venta,
                    dataempresa?.currency,
                    dataempresa?.iso
                  )}
                </span>
                <article className="contentTotaldetalleventarespon">
                  <span className="cantidad">
                    <strong>
                      {FormatearNumeroDinero(
                        item.total,
                        dataempresa?.currency,
                        dataempresa?.iso
                      )}
                    </strong>
                  </span>
                  <span
                    className="delete"
                    onClick={() => mutateEliminarDV(item)}
                  >
                    <Icon icon="weui:delete-filled" width="24" height="24" />
                  </span>
                </article>
              </ContentTotalResponsive>
            </article>
            <article className="contentbtn">
              <Btn1
                funcion={() => handleIncrementarCantidad(item)}
                width="20px"
                height="35px"
                icono={<Icon icon="mdi:add-bold" />}
              ></Btn1>
              {editIndex === index ? (
                <InputText2>
                  <input
                    type="number"
                    value={newCantidad}
                    onChange={handleInputChange}
                    onBlur={() => handleInputBlur(item)}
                    onKeyDown={(e) => handleKeyDown(e, item)}
                    className="form__field"
                    min="1"
                  />
                </InputText2>
              ) : (
                <>
                  <span className="cantidad">{item.cantidad}</span>
                  <Icon
                    icon="mdi:pencil"
                    onClick={() => handleEditClick(index, item.cantidad)}
                    className="edit-icon"
                  />
                </>
              )}

              <Btn1
                funcion={() => handleDecrementarCantidad(item)}
                width="20px"
                height="35px"
                icono={<Icon icon="subway:subtraction-1" />}
              ></Btn1>
            </article>
            <article className="contentTotaldetalleventa">
              <span className="cantidad">
                <strong>
                  {FormatearNumeroDinero(
                    item.total,
                    dataempresa?.currency,
                    dataempresa?.iso
                  )}
                </strong>
              </span>
              <span className="delete" onClick={() => mutateEliminarDV(item)}>
                <Icon icon="weui:delete-filled" width="24" height="24" />
              </span>
            </article>
          </Itemventa>
        );
      })
    ) : (
      <Lottieanimacion animacion={animacionvacio} alto="200" ancho="200" />
    )}
  </AreaDetalleventa>
  );
}
const ContentTotalResponsive = styled.div`
  display: flex;
  flex-direction: flex;
  gap: 8px;
  width: 100%;
  justify-content: space-between;
  .descripcionrespon {
    font-weight: 700;
    font-size: 20px;
  }
  .importerespo {
    font-size: 15px;
    display: flex;
    width: 100%;
  }
  @media ${Device.laptop} {
    display: none;
  }
  .contentTotaldetalleventarespon {
    display: flex;
    flex-direction: row-reverse;
    justify-content: end;
    text-align: end;
    align-items: center;
gap:8px;
    width: 100%;
    .delete {
      cursor: pointer;
      width: 20px;
      align-self: center;
    }
  }
`;
const AreaDetalleventa = styled.section`
  display: flex;
  width: 100%;
  margin-top: 10px;
  flex-direction: column;
  gap: 10px;
  max-height:calc(100vh - 500px);
  overflow-y: auto; /* Activa el scroll solo en Y */
  overflow-x: hidden; /* Oculta el scroll en X */
      
  &::-webkit-scrollbar {
  width: 12px;
  background: rgba(24, 24, 24, 0.2);
}

&::-webkit-scrollbar-thumb {
  background: rgba(148, 148, 148, 0.9);
  border-radius: 10px;
  filter: blur(10px);
}

  &.animacion {
    height: 100%;
    justify-content: center;
  }
  @media ${Device.laptop} {
    max-height:initial;
  }
`;
const Itemventa = styled.section`
  display: flex;
  justify-content: space-between;
  width: 100%;
  border-bottom: 1px dashed ${({ theme }) => theme.color2};
  animation: ${blur_in} 0.2s linear both;
  flex-direction: column;
  gap: 10px;
  .contentdescripcion {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    .header-producto {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      width: 100%;
    }
    .descripcion {
      font-weight: 700;
      font-size: 20px;
      flex: 1;
      min-width: 0;
    }
    .importe {
      font-size: 15px;
      display: none;
      @media ${Device.laptop} {
        display: block;
      }
    }
  }
  .contentbtn {
    display: flex;
    width: 100%;
    height: 100%;
    gap: 10px;
    align-items: center;
    justify-content: center;
    .cantidad {
      font-size: 1.8rem;
      font-weight: 700;
    }
    .edit-icon {
      cursor: pointer;
      font-size: 18px;
    }
  }
  .contentTotaldetalleventa {
    display: none;
    @media ${Device.laptop} {
      display: flex;
      flex-direction: row;
      justify-content: center;
      text-align: end;
      align-items: center;
      margin-bottom: 10px;
      width: 100%;
      .delete {
        cursor: pointer;
        width: 20px;
        align-self: center;
      }
    }
  }
  @media ${Device.tablet} {
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    .contentdescripcion {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
      .header-producto {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .descripcion {
        font-weight: 700;
        font-size: 20px;
      }
      .importe {
        font-size: 15px;
      }
    }
    .contentbtn {
      display: flex;
      width: 100%;
      height: 100%;
      gap: 10px;
      align-items: center;
      justify-content: center;
      .cantidad {
        font-size: 1.8rem;
        font-weight: 700;
      }
      .edit-icon {
        cursor: pointer;
        font-size: 18px;
      }
    }
  }
`;

const TipoComprobanteTag = styled.span`
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  background-color: ${({ $tipo }) => 
    $tipo === 'FACTURADO' ? '#dcfce7' : 
    $tipo === 'MANUALIDAD' ? '#fef3c7' : 
    '#f3f4f6'};
  color: ${({ $tipo }) => 
    $tipo === 'FACTURADO' ? '#166534' : 
    $tipo === 'MANUALIDAD' ? '#92400e' : 
    '#4b5563'};
  border: 1px solid ${({ $tipo }) => 
    $tipo === 'FACTURADO' ? '#bbf7d0' : 
    $tipo === 'MANUALIDAD' ? '#fde68a' : 
    '#e5e7eb'};
`;

const MultiprecioWrapper = styled.div`
  position: relative;
  display: inline-flex;
  flex: 1;
  min-width: 120px;
`;

const Badge = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
  animation: ${blur_in} 0.3s ease, pulse 2s ease infinite;
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
`;

const MultiprecioBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  min-width: 120px;
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  border: 2px solid ${({ theme, $active, $hasMultiprecio }) => 
    $active ? '#6366f1' : 
    $hasMultiprecio ? '#e0e7ff' : 
    '#e5e7eb'};
  background: ${({ $active, $hasMultiprecio }) => 
    $active ? 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)' : 
    $hasMultiprecio ? 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)' : 
    'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'};
  color: ${({ $active, $hasMultiprecio }) => 
    $active ? '#ffffff' : 
    $hasMultiprecio ? '#4f46e5' : 
    '#6b7280'};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  font-weight: 600;
  box-shadow: ${({ $active }) => 
    $active ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 
    '0 2px 4px rgba(0, 0, 0, 0.05)'};

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${({ $active }) => 
      $active ? '0 6px 16px rgba(99, 102, 241, 0.4)' : 
      '0 4px 8px rgba(0, 0, 0, 0.1)'};
    border-color: ${({ $active }) => $active ? '#4f46e5' : '#c7d2fe'};
  }

  &:active {
    transform: translateY(0);
  }
`;

const MultiprecioDropdown = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 100;
  min-width: 240px;
  background: ${({ theme }) => theme.body || '#fff'};
  border: 2px solid #e0e7ff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(99, 102, 241, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 8px;
  animation: ${blur_in} 0.2s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: -6px;
    left: 20px;
    width: 12px;
    height: 12px;
    background: ${({ theme }) => theme.body || '#fff'};
    border-left: 2px solid #e0e7ff;
    border-top: 2px solid #e0e7ff;
    transform: rotate(45deg);
  }
`;

const MultiprecioOption = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 8px;
  cursor: ${({ $disabled }) => $disabled ? 'default' : 'pointer'};
  opacity: ${({ $disabled }) => $disabled ? 0.5 : 1};
  background: ${({ $active }) => 
    $active ? 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)' : 
    'transparent'};
  color: ${({ $active }) => $active ? '#ffffff' : 'inherit'};
  font-weight: ${({ $active }) => $active ? '700' : '500'};
  transition: all 0.15s ease;
  border: 2px solid ${({ $active }) => $active ? '#4f46e5' : 'transparent'};

  &:hover {
    background: ${({ $disabled, $active }) => 
      $disabled ? 'transparent' : 
      $active ? 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)' :
      'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)'};
    transform: ${({ $disabled }) => $disabled ? 'none' : 'translateX(2px)'};
  }

  .nombre {
    flex: 1;
    font-size: 15px;
    font-weight: ${({ $active }) => $active ? '700' : '600'};
  }

  .detalle {
    font-size: 13px;
    padding: 2px 8px;
    background: ${({ $active }) => 
      $active ? 'rgba(255, 255, 255, 0.25)' : 
      'rgba(99, 102, 241, 0.1)'};
    border-radius: 6px;
    font-weight: 600;
    color: ${({ $active }) => $active ? '#ffffff' : '#4f46e5'};
  }

  .precio {
    font-size: 15px;
    font-weight: 700;
    color: ${({ $active }) => $active ? '#ffffff' : '#6366f1'};
    min-width: 80px;
    text-align: right;
  }
`;