import { useState, useEffect } from "react";
import styled from "styled-components";
import { useComprasStore } from "../store/ComprasStore";
import { useClientesProveedoresStore } from "../store/ClientesProveedoresStore";
import { useProductosStore } from "../store/ProductosStore";
import { useMetodosPagoStore } from "../store/MetodosPagoStore";
import { useEmpresaStore } from "../store/EmpresaStore";
import { UserAuth } from "../context/AuthContent";
import { useNavigate, useLocation } from "react-router-dom";
import { v } from "../styles/variables";
import { BsSearch, BsTrash, BsPlus, BsFileText } from "react-icons/bs";
import { IoMdClose } from "react-icons/io";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { format } from "date-fns";

export function Compras() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dataempresa } = useEmpresaStore();
  const { user } = UserAuth();
  const { insertarCompra, editarCompra, mostrarCompraDetalle } = useComprasStore();
  const { dataclipro, mostrarCliPro } = useClientesProveedoresStore();
  const { dataProductos, mostrarProductos, buscarProductos } = useProductosStore();
  const { dataMetodosPago, mostrarMetodosPago } = useMetodosPagoStore();

  // Estado para saber si es edición
  const [esEdicion, setEsEdicion] = useState(false);
  const [compraId, setCompraId] = useState(null);

  // Estados del formulario principal
  const [numeroFactura, setNumeroFactura] = useState("");
  const [fechaEmision, setFechaEmision] = useState(format(new Date(), "yyyy-MM-dd"));
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState(null);
  const [tipoComprobante, setTipoComprobante] = useState("factura");
  const [observacion, setObservacion] = useState("");
  const [estadoCompra, setEstadoCompra] = useState("completo");

  // Estados para búsqueda de proveedor
  const [busquedaProveedor, setBusquedaProveedor] = useState("");
  const [mostrarListaProveedores, setMostrarListaProveedores] = useState(false);
  const [proveedoresFiltrados, setProveedoresFiltrados] = useState([]);

  // Estados para búsqueda de producto
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [mostrarListaProductos, setMostrarListaProductos] = useState(false);
  const [productosFiltrados, setProductosFiltrados] = useState([]);

  // Estados para el producto actual
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidadEsperada, setCantidadEsperada] = useState("");
  const [cantidadRecibida, setCantidadRecibida] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");

  // Tabla temporal de productos
  const [detallesCompra, setDetallesCompra] = useState([]);

  useEffect(() => {
    if (dataempresa?.id) {
      mostrarCliPro({ id_empresa: dataempresa.id, tipo: 'PROVEEDOR' });
      mostrarProductos({ id_empresa: dataempresa.id });
      mostrarMetodosPago({ id_empresa: dataempresa.id });
    }
  }, [dataempresa]);

  // Cargar datos si es edición
  useEffect(() => {
    const cargarDatosEdicion = async () => {
      if (location.state?.compraEditar) {
        const compra = location.state.compraEditar;
        setEsEdicion(true);
        setCompraId(compra.id);
        setNumeroFactura(compra.numeroFactura || compra.numero_factura || "");
        setFechaEmision(compra.fechaEmision || compra.fecha_emision || format(new Date(), "yyyy-MM-dd"));
        setObservacion(compra.observacion || "");
        setEstadoCompra(compra.estado || "COMPLETO");
        
        // Buscar y establecer proveedor
        const proveedor = dataclipro?.find(p => p.id === compra.proveedor?.id || p.id === compra.id_proveedor);
        if (proveedor) {
          setProveedorSeleccionado(proveedor);
          setBusquedaProveedor(proveedor.nombres);
        }
        
        // Establecer método de pago
        setMetodoPagoSeleccionado(compra.metodoPago?.id || compra.id_metodo_pago || null);
        
        // Establecer tipo comprobante
        const tipoId = compra.tipoComprobante?.id || compra.id_tipo_comprobante;
        setTipoComprobante(tipoId === 1 ? "factura" : "boleta");
        
        // Cargar detalles
        try {
          const detalles = await mostrarCompraDetalle({ id_compra: compra.id });
          const detallesMapeados = detalles.map(d => ({
            id: d.id,
            id_producto: d.producto?.id || d.id_producto,
            nombre_producto: d.producto?.nombre || "Producto",
            cantidad_esperada: d.cantidadEsperada || d.cantidad_esperada,
            cantidad_recibida: d.cantidadRecibida || d.cantidad_recibida,
            precio_compra: d.precioCompra || d.precio_compra,
            subtotal: d.subtotal
          }));
          setDetallesCompra(detallesMapeados);
        } catch (error) {
          console.error("Error al cargar detalles:", error);
        }
      }
    };
    
    if (dataclipro && dataProductos) {
      cargarDatosEdicion();
    }
  }, [location.state, dataclipro, dataProductos]);

  // Filtrar proveedores
  useEffect(() => {
    if (busquedaProveedor) {
      const proveedores = dataclipro?.filter(
        (p) =>
          (p.tipo === "PROVEEDOR" || p.tipo === "proveedor") &&
          (p.nombres?.toLowerCase().includes(busquedaProveedor.toLowerCase()) ||
            p.identificadorFiscal?.includes(busquedaProveedor) ||
            p.identificador_fiscal?.includes(busquedaProveedor))
      ) || [];
      setProveedoresFiltrados(proveedores);
      setMostrarListaProveedores(true);
    } else {
      setProveedoresFiltrados([]);
      setMostrarListaProveedores(false);
    }
  }, [busquedaProveedor, dataclipro]);

  // Filtrar productos
  useEffect(() => {
    if (busquedaProducto) {
      const productos = dataProductos.filter(
        (p) =>
          p.nombre?.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
          p.codigo_barras?.includes(busquedaProducto) ||
          p.codigoBarras?.includes(busquedaProducto)
      );
      setProductosFiltrados(productos);
      setMostrarListaProductos(true);
    } else {
      setProductosFiltrados([]);
      setMostrarListaProductos(false);
    }
  }, [busquedaProducto, dataProductos]);

  const seleccionarProveedor = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setBusquedaProveedor(proveedor.nombres);
    setMostrarListaProveedores(false);
  };

  const seleccionarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setBusquedaProducto(producto.nombre);
    setPrecioCompra(producto.precioCompra || producto.precio_compra || "");
    setMostrarListaProductos(false);
  };

  const agregarProductoATabla = () => {
    if (!productoSeleccionado) {
      toast.error("Selecciona un producto");
      return;
    }

    const cantEsperada = parseFloat(cantidadEsperada) || 0;
    const cantRecibida = parseFloat(cantidadRecibida) || 0;
    const precio = parseFloat(precioCompra) || 0;

    if (cantRecibida <= 0) {
      toast.error("La cantidad recibida debe ser mayor a 0");
      return;
    }

    if (precio <= 0) {
      toast.error("El precio de compra debe ser mayor a 0");
      return;
    }

    // Verificar si ya existe el producto
    const existe = detallesCompra.find((d) => d.id_producto === productoSeleccionado.id);
    if (existe) {
      toast.warning("El producto ya está en la lista");
      return;
    }

    const subtotal = cantRecibida * precio;

    const nuevoDetalle = {
      id_producto: productoSeleccionado.id,
      nombre_producto: productoSeleccionado.nombre,
      cantidad_esperada: cantEsperada,
      cantidad_recibida: cantRecibida,
      precio_compra: precio,
      subtotal: subtotal,
    };

    setDetallesCompra([...detallesCompra, nuevoDetalle]);

    // Limpiar campos
    setProductoSeleccionado(null);
    setBusquedaProducto("");
    setCantidadEsperada("");
    setCantidadRecibida("");
    setPrecioCompra("");

    toast.success("Producto agregado");
  };

  const eliminarProductoDeTabla = (index) => {
    const nuevosDetalles = detallesCompra.filter((_, i) => i !== index);
    setDetallesCompra(nuevosDetalles);
    toast.info("Producto eliminado");
  };

  const calcularTotal = () => {
    return detallesCompra.reduce((sum, detalle) => sum + detalle.subtotal, 0);
  };

  const guardarCompra = async () => {
    if (!proveedorSeleccionado) {
      toast.error("Selecciona un proveedor");
      return;
    }

    if (!numeroFactura.trim()) {
      toast.error("Ingresa el número de factura");
      return;
    }

    if (!metodoPagoSeleccionado) {
      toast.error("Selecciona un método de pago");
      return;
    }

    if (detallesCompra.length === 0) {
      toast.error("Agrega al menos un producto");
      return;
    }

    try {
      // Verificar si todos los productos están completos (cantidad_recibida === cantidad_esperada)
      const todosCompletos = detallesCompra.every(
        d => d.cantidad_recibida >= d.cantidad_esperada
      );
      const estadoFinal = todosCompletos ? "COMPLETO" : "INCOMPLETO";

      const compra = {
        numero_factura: numeroFactura,
        fecha_emision: fechaEmision,
        id_proveedor: proveedorSeleccionado.id,
        id_metodo_pago: metodoPagoSeleccionado,
        id_tipo_comprobante: tipoComprobante === "factura" ? 1 : 2,
        observacion: observacion,
        estado: estadoFinal,
        monto_total: calcularTotal(),
        id_empresa: dataempresa.id,
        id_usuario: user?.idUsuario || user?.id,
        detalles: detallesCompra,
      };

      if (esEdicion && compraId) {
        // Actualizar compra existente
        compra.id = compraId;
        await editarCompra(compra);
        toast.success("Compra actualizada exitosamente");
        navigate("/reporte-compras");
      } else {
        // Insertar nueva compra
        await insertarCompra(compra);
        
        // Limpiar formulario
        setNumeroFactura("");
        setFechaEmision(format(new Date(), "yyyy-MM-dd"));
        setProveedorSeleccionado(null);
        setBusquedaProveedor("");
        setMetodoPagoSeleccionado(null);
        setTipoComprobante("factura");
        setObservacion("");
        setEstadoCompra("COMPLETO");
        setDetallesCompra([]);

        toast.success("Compra registrada exitosamente");
      }
    } catch (error) {
      console.error("Error al guardar compra:", error);
    }
  };

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>{esEdicion ? "✏️ Editar Compra" : "📦 Registro de Compras"}</Title>
          <Subtitle>{esEdicion ? "Modifica los datos de la compra" : "Registra las facturas de compra y controla tu inventario"}</Subtitle>
        </HeaderLeft>
        <HeaderRight>
          <ReportButton onClick={() => navigate("/reporte-compras")}>
            <BsFileText /> Ver Reporte
          </ReportButton>
        </HeaderRight>
      </Header>

      <FormContainer>
        {/* SECCIÓN 1: DATOS DE LA COMPRA */}
        <Section>
          <SectionTitle>1. Información de la Compra</SectionTitle>
          <FormGrid>
            <FormGroup>
              <Label>Número de Factura *</Label>
              <Input
                type="text"
                placeholder="Ej: F001-00001234"
                value={numeroFactura}
                onChange={(e) => setNumeroFactura(e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label>Fecha de Emisión *</Label>
              <Input
                type="date"
                value={fechaEmision}
                onChange={(e) => setFechaEmision(e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label>Tipo de Comprobante *</Label>
              <Select value={tipoComprobante} onChange={(e) => setTipoComprobante(e.target.value)}>
                <option value="factura">Factura</option>
                <option value="boleta">Boleta</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Método de Pago *</Label>
              <Select
                value={metodoPagoSeleccionado || ""}
                onChange={(e) => setMetodoPagoSeleccionado(Number(e.target.value))}
              >
                <option value="">Seleccionar...</option>
                {dataMetodosPago?.map((metodo) => (
                  <option key={metodo.id} value={metodo.id}>
                    {metodo.icono} {metodo.nombre}
                  </option>
                ))}
              </Select>
            </FormGroup>
          </FormGrid>
        </Section>

        {/* SECCIÓN 2: PROVEEDOR */}
        <Section>
          <SectionTitle>2. Datos del Proveedor</SectionTitle>
          <FormGrid>
            <FormGroup style={{ position: "relative" }}>
              <Label>Buscar Proveedor *</Label>
              <SearchInputContainer>
                <BsSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#999" }} />
                <SearchInput
                  type="text"
                  placeholder="Busca por nombre o RUC..."
                  value={busquedaProveedor}
                  onChange={(e) => setBusquedaProveedor(e.target.value)}
                  onFocus={() => busquedaProveedor && setMostrarListaProveedores(true)}
                />
                {proveedorSeleccionado && (
                  <ClearButton onClick={() => {
                    setProveedorSeleccionado(null);
                    setBusquedaProveedor("");
                  }}>
                    <IoMdClose />
                  </ClearButton>
                )}
              </SearchInputContainer>

              {mostrarListaProveedores && proveedoresFiltrados?.length > 0 && (
                <DropdownList>
                  {proveedoresFiltrados?.map((proveedor) => (
                    <DropdownItem key={proveedor.id} onClick={() => seleccionarProveedor(proveedor)}>
                      <div>
                        <strong>{proveedor.nombres}</strong>
                        <small>RUC: {proveedor.identificador_fiscal || proveedor.identificadorFiscal || "Sin RUC"}</small>
                      </div>
                    </DropdownItem>
                  ))}
                </DropdownList>
              )}
            </FormGroup>

            <FormGroup>
              <Label>RUC/DNI</Label>
              <Input
                type="text"
                value={proveedorSeleccionado?.identificador_fiscal || proveedorSeleccionado?.identificadorFiscal || ""}
                disabled
                placeholder="Se completa automáticamente"
              />
            </FormGroup>

            <FormGroup style={{ gridColumn: "1 / -1" }}>
              <Label>Estado de la Compra</Label>
              <RadioGroup>
                <RadioLabel>
                  <input
                    type="radio"
                    value="completo"
                    checked={estadoCompra === "completo"}
                    onChange={(e) => setEstadoCompra(e.target.value)}
                  />
                  ✅ Completo (todos los productos llegaron)
                </RadioLabel>
                <RadioLabel>
                  <input
                    type="radio"
                    value="incompleto"
                    checked={estadoCompra === "incompleto"}
                    onChange={(e) => setEstadoCompra(e.target.value)}
                  />
                  ⚠️ Incompleto (faltan productos)
                </RadioLabel>
              </RadioGroup>
            </FormGroup>
          </FormGrid>
        </Section>

        {/* SECCIÓN 3: AGREGAR PRODUCTOS */}
        <Section>
          <SectionTitle>3. Agregar Productos</SectionTitle>
          <FormGrid>
            <FormGroup style={{ position: "relative" }}>
              <Label>Buscar Producto *</Label>
              <SearchInputContainer>
                <BsSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#999" }} />
                <SearchInput
                  type="text"
                  placeholder="Busca por nombre o código..."
                  value={busquedaProducto}
                  onChange={(e) => setBusquedaProducto(e.target.value)}
                  onFocus={() => busquedaProducto && setMostrarListaProductos(true)}
                />
                {productoSeleccionado && (
                  <ClearButton onClick={() => {
                    setProductoSeleccionado(null);
                    setBusquedaProducto("");
                  }}>
                    <IoMdClose />
                  </ClearButton>
                )}
              </SearchInputContainer>

              {mostrarListaProductos && productosFiltrados?.length > 0 && (
                <DropdownList>
                  {productosFiltrados?.slice(0, 10).map((producto) => (
                    <DropdownItem key={producto.id} onClick={() => seleccionarProducto(producto)}>
                      <div>
                        <strong>{producto.nombre}</strong>
                        <small>Código: {producto.codigoBarras || producto.codigo_barras || "Sin código"}</small>
                      </div>
                    </DropdownItem>
                  ))}
                </DropdownList>
              )}
            </FormGroup>

            <FormGroup>
              <Label>Cant. Esperada (opcional)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ej: 100"
                value={cantidadEsperada}
                onChange={(e) => setCantidadEsperada(e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label>Cant. Recibida *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ej: 100"
                value={cantidadRecibida}
                onChange={(e) => setCantidadRecibida(e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label>Precio de Compra *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ej: 5.50"
                value={precioCompra}
                onChange={(e) => setPrecioCompra(e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label>&nbsp;</Label>
              <AddButton onClick={agregarProductoATabla}>
                <BsPlus size={20} /> Agregar Producto
              </AddButton>
            </FormGroup>
          </FormGrid>
        </Section>

        {/* TABLA DE PRODUCTOS */}
        {detallesCompra.length > 0 && (
          <Section>
            <SectionTitle>Productos Agregados ({detallesCompra.length})</SectionTitle>
            <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <Th>Producto</Th>
                    <Th>Cant. Esperada</Th>
                    <Th>Cant. Recibida</Th>
                    <Th>Precio Unit.</Th>
                    <Th>Subtotal</Th>
                    <Th>Acciones</Th>
                  </tr>
                </thead>
                <tbody>
                  {detallesCompra?.map((detalle, index) => (
                    <tr key={index}>
                      <Td>{detalle.nombre_producto}</Td>
                      <Td>{detalle.cantidad_esperada || "-"}</Td>
                      <Td>
                        <strong>{detalle.cantidad_recibida}</strong>
                        {detalle.cantidad_esperada > 0 &&
                          detalle.cantidad_recibida < detalle.cantidad_esperada && (
                            <Badge type="warning">Falta</Badge>
                          )}
                      </Td>
                      <Td>S/ {detalle.precio_compra.toFixed(2)}</Td>
                      <Td>
                        <strong>S/ {detalle.subtotal.toFixed(2)}</strong>
                      </Td>
                      <Td>
                        <DeleteButton onClick={() => eliminarProductoDeTabla(index)}>
                          <BsTrash />
                        </DeleteButton>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <TotalContainer>
                <TotalLabel>Total de la Compra:</TotalLabel>
                <TotalAmount>S/ {calcularTotal().toFixed(2)}</TotalAmount>
              </TotalContainer>
            </TableContainer>
          </Section>
        )}

        {/* OBSERVACIONES */}
        <Section>
          <SectionTitle>4. Observaciones (Opcional)</SectionTitle>
          <TextArea
            rows="3"
            placeholder="Ej: Faltan 20 unidades del producto XYZ, llegarán la próxima semana..."
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
          />
        </Section>

        {/* BOTONES */}
        <ButtonsContainer>
          <CancelButton
            onClick={() => {
              if (detallesCompra.length > 0) {
                Swal.fire({
                  title: "¿Cancelar compra?",
                  text: "Se perderán todos los datos ingresados",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonText: "Sí, cancelar",
                  cancelButtonText: "No",
                }).then((result) => {
                  if (result.isConfirmed) {
                    setDetallesCompra([]);
                    setProveedorSeleccionado(null);
                    setBusquedaProveedor("");
                    setNumeroFactura("");
                    setObservacion("");
                  }
                });
              }
            }}
          >
            Cancelar
          </CancelButton>
          <SaveButton onClick={guardarCompra} disabled={detallesCompra.length === 0}>
            {esEdicion ? "✏️ Actualizar Compra" : "💾 Guardar Compra"}
          </SaveButton>
        </ButtonsContainer>
      </FormContainer>
    </Container>
  );
}

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background: white;
  padding: 0;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-sizing: border-box;
`;

const HeaderLeft = styled.div``;

const HeaderRight = styled.div``;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 13px;
  color: #64748b;
  margin: 4px 0 0 0;
`;

const ReportButton = styled.button`
  padding: 11px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 3px 10px rgba(102, 126, 234, 0.45);
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.6);
    background: linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%);
  }
`;

const FormContainer = styled.div`
  width: 100%;
`;

const Section = styled.div`
  background: white;
  padding: 24px 32px;
  border-bottom: 1px solid #e2e8f0;
  box-sizing: border-box;
`;

const SectionTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
  display: block;
`;

const Input = styled.input`
  padding: 9px 11px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 13px;
  color: #1e293b;
  background: white;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    background: #f8fafc;
    cursor: not-allowed;
    opacity: 0.6;
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const Select = styled.select`
  padding: 9px 11px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 13px;
  color: #1e293b;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const SearchInputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled(Input)`
  padding-left: 40px;
  padding-right: 40px;
`;

const ClearButton = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.textGray};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.bg3};
    color: ${({ theme }) => theme.text};
  }
`;

const DropdownList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.bgtotal};
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-top: 4px;
`;

const DropdownItem = styled.div`
  padding: 12px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.bg};
  }

  div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  strong {
    color: ${({ theme }) => theme.text};
    font-size: 14px;
  }

  small {
    color: ${({ theme }) => theme.textGray};
    font-size: 12px;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 8px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.text};
  cursor: pointer;

  input {
    cursor: pointer;
  }
`;

const AddButton = styled.button`
  padding: 9px 18px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.25);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 10px;
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  font-size: 12px;
  border-bottom: 2px solid #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Td = styled.td`
  padding: 10px;
  color: #334155;
  font-size: 13px;
  border-bottom: 1px solid #f1f5f9;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  margin-left: 8px;
  background: ${(props) =>
    props.type === "warning" ? "#FFA50020" : props.type === "success" ? "#4CAF5020" : "#f5f5f5"};
  color: ${(props) =>
    props.type === "warning" ? "#FF8C00" : props.type === "success" ? "#4CAF50" : "#666"};
`;

const DeleteButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  font-weight: 500;

  &:hover {
    background: #dc2626;
    transform: scale(1.05);
    box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
  }
`;

const TotalContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
`;

const TotalLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #475569;
`;

const TotalAmount = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: #667eea;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 9px 11px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 13px;
  color: #1e293b;
  background: white;
  resize: vertical;
  font-family: inherit;
  min-height: 70px;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 16px;
`;

const CancelButton = styled.button`
  padding: 10px 24px;
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: #475569;
  }
`;

const SaveButton = styled.button`
  padding: 10px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.25);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

//flavio