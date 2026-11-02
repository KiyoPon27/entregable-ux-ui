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
  
  // Estados para los campos del resumen (independientes)
  const [resumenGravada, setResumenGravada] = useState("");
  const [resumenIGV, setResumenIGV] = useState("");
  const [resumenDescuentoTotal, setResumenDescuentoTotal] = useState("");
  const [resumenTotal, setResumenTotal] = useState("");

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
  const [cantidad, setCantidad] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [precioUnitario, setPrecioUnitario] = useState("");
  const [unidadMedida, setUnidadMedida] = useState("CJA");
  const [factorUnidades, setFactorUnidades] = useState(1);
  
  // Estados para controlar cuál campo fue llenado (para hacer el otro read-only)
  const [campoLlenado, setCampoLlenado] = useState(null); // "unitario", "importe", o null

  // Modal de edición
  const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [indexEditando, setIndexEditando] = useState(null);
  const [editando, setEditando] = useState({
    cantidad: "",
    unidad_medida: "CJA",
    factor_unidades: 1,
    importe: ""
  });
  const [campoLlenadoModal, setCampoLlenadoModal] = useState(null); // Para controlar el modal también

  // Tabla temporal de productos
  const [detallesCompra, setDetallesCompra] = useState([]);

  useEffect(() => {
    if (dataempresa?.id) {
      mostrarCliPro({ id_empresa: dataempresa.id, tipo: 'PROVEEDOR' });
      mostrarProductos({ id_empresa: dataempresa.id });
      mostrarMetodosPago({ id_empresa: dataempresa.id });
    }
  }, [dataempresa]);

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickFuera = (e) => {
      // Si no estamos en un input de búsqueda, cerrar dropdowns
      if (!e.target.closest('input[placeholder*="Busca por"]')) {
        setMostrarListaProveedores(false);
        setMostrarListaProductos(false);
      }
    };
    
    document.addEventListener('click', handleClickFuera);
    return () => document.removeEventListener('click', handleClickFuera);
  }, []);

  // Recalcular el campo bloqueado cuando cambia cantidad o factor
  useEffect(() => {
    if (!campoLlenado) return; // Si no hay campo llenado, no hace nada
    
    const cant = parseFloat(cantidad) || 0;
    const factor = parseFloat(factorUnidades) || 1;
    const unitario = parseFloat(precioUnitario) || 0;
    const importe = parseFloat(precioCompra) || 0;

    // Si campoLlenado es "unitario", recalcular el importe
    if (campoLlenado === "unitario" && unitario >= 0 && cant > 0 && factor > 0) {
      const nuevoImporte = unitario * cant * factor;
      setPrecioCompra(nuevoImporte.toFixed(2));
    }

    // Si campoLlenado es "importe", recalcular el precio unitario
    if (campoLlenado === "importe" && importe >= 0 && cant > 0 && factor > 0) {
      const nuevoUnitario = importe / (cant * factor);
      setPrecioUnitario(nuevoUnitario.toFixed(2));
    }
  }, [cantidad, factorUnidades, campoLlenado]);

  // Recalcular resumen cuando cambia el total de la compra o el descuento
  useEffect(() => {
    const totalCompra = calcularTotal();
    const descuentoTotal = parseFloat(resumenDescuentoTotal) || 0;

    // Gravada = (Total / 1.18) - Descuento
    const gravada = (totalCompra / 1.18) - descuentoTotal;
    
    // IGV = Gravada * 0.18
    const igv = gravada * 0.18;
    
    // Total = Gravada + IGV
    const total = gravada + igv;

    // Actualizar los estados con los valores calculados
    setResumenGravada(gravada > 0 ? gravada.toFixed(2) : "");
    setResumenIGV(igv > 0 ? igv.toFixed(2) : "");
    setResumenTotal(total > 0 ? total.toFixed(2) : "");
  }, [detallesCompra, resumenDescuentoTotal]);

  // Recalcular el campo bloqueado en el MODAL cuando cambia cantidad o factor
  useEffect(() => {
    if (!modalEdicionAbierto || !campoLlenadoModal) return;
    
    const cant = parseFloat(editando.cantidad) || 0;
    const factor = parseFloat(editando.factor_unidades) || 1;
    const unitario = parseFloat(editando.precio_unitario) || 0;
    const importe = parseFloat(editando.importe) || 0;

    // Si campoLlenadoModal es "unitario", recalcular el importe
    if (campoLlenadoModal === "unitario" && unitario >= 0 && cant > 0 && factor > 0) {
      const nuevoImporte = unitario * cant * factor;
      setEditando(prev => ({...prev, importe: nuevoImporte.toFixed(2)}));
    }

    // Si campoLlenadoModal es "importe", recalcular el precio unitario
    if (campoLlenadoModal === "importe" && importe >= 0 && cant > 0 && factor > 0) {
      const nuevoUnitario = importe / (cant * factor);
      setEditando(prev => ({...prev, precio_unitario: nuevoUnitario.toFixed(2)}));
    }
  }, [editando.cantidad, editando.factor_unidades, campoLlenadoModal, modalEdicionAbierto]);

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
        
        // Establecer campos de resumen
        setResumenGravada(compra.resumenGravada ?? compra.resumen_gravada ?? "");
        setResumenIGV(compra.resumenIGV ?? compra.resumen_igv ?? "");
        setResumenDescuentoTotal(compra.resumenDescuentoTotal ?? compra.resumen_descuento_total ?? "");
        setResumenTotal(compra.resumenTotal ?? compra.resumen_total ?? "");
        
        // Cargar detalles
        try {
          const detalles = await mostrarCompraDetalle({ id_compra: compra.id });
          const detallesMapeados = detalles.map(d => {
            const factor = d.factor_unidades ?? d.factor_compra ?? 1;
            const importe = d.importe ?? d.subtotal ?? 0;
            const cantidad = d.cantidad ?? d.cantidad_recibida ?? d.cantidadRecibida ?? 0;
            const valorUnitario = cantidad > 0 && factor > 0 ? importe / (cantidad * factor) : 0;

            return {
              id: d.id,
              id_producto: d.producto?.id ?? d.id_producto,
              nombre_producto: d.producto?.nombre ?? "Producto",
              cantidad: cantidad,
              unidad_medida: d.unidad_medida_compra ?? d.unidad_medida ?? "CJA",
              factor_unidades: factor,
              importe: importe,
              valor_unitario: valorUnitario
            };
          });
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
    setBusquedaProveedor("");  // Limpiar búsqueda, no poner el nombre
    setMostrarListaProveedores(false);
  };

  const seleccionarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setBusquedaProducto("");  // Limpiar búsqueda, no poner el nombre
    setPrecioCompra("");
    setPrecioUnitario("");
    setCampoLlenado(null); // Reset el control de campos
    // Traer valores del producto
    setUnidadMedida(producto.unidad_medida_principal || "CJA");
    setFactorUnidades(producto.factor_unidad_medida || 1);
    // Autocompletar cantidad con 1
    setCantidad("1");
    setMostrarListaProductos(false);
  };

  // Calcular Importe cuando se cambia Precio Unitario
  const handlePrecioUnitarioChange = (value) => {
    setPrecioUnitario(value);
    
    // Si el usuario está borrando el contenido, liberar el otro campo
    if (!value) {
      setCampoLlenado(null);
      setPrecioCompra("");
      return;
    }
    
    // Marcar este campo como el que fue llenado
    setCampoLlenado("unitario");
    
    if (cantidad && factorUnidades) {
      const unitario = parseFloat(value);
      const cant = parseFloat(cantidad);
      const factor = parseFloat(factorUnidades);
      if (unitario >= 0 && cant > 0 && factor > 0) {
        const importe = unitario * cant * factor;
        setPrecioCompra(importe.toFixed(2));
      }
    }
  };

  // Calcular Precio Unitario cuando se cambia Importe
  const handlePrecioCompraChange = (value) => {
    setPrecioCompra(value);
    
    // Si el usuario está borrando el contenido, liberar el otro campo
    if (!value) {
      setCampoLlenado(null);
      setPrecioUnitario("");
      return;
    }
    
    // Marcar este campo como el que fue llenado
    setCampoLlenado("importe");
    
    if (cantidad && factorUnidades) {
      const importe = parseFloat(value);
      const cant = parseFloat(cantidad);
      const factor = parseFloat(factorUnidades);
      if (importe >= 0 && cant > 0 && factor > 0) {
        const unitario = importe / (cant * factor);
        setPrecioUnitario(unitario.toFixed(2));
      }
    }
  };

  const agregarProductoATabla = () => {
    if (!productoSeleccionado) {
      toast.error("Selecciona un producto");
      return;
    }

    const cant = parseFloat(cantidad) || 0;
    const importe = parseFloat(precioCompra) || 0;
    const factor = parseFloat(factorUnidades) || 1;

    if (cant <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }

    if (importe < 0) {
      toast.error("El importe no puede ser negativo");
      return;
    }

    if (factor <= 0) {
      toast.error("El factor debe ser mayor a 0");
      return;
    }

    // Verificar si ya existe el producto
    const existe = detallesCompra.find((d) => d.id_producto === productoSeleccionado.id);
    if (existe) {
      toast.warning("El producto ya está en la lista");
      return;
    }

    const valorUnitario = importe / (cant * factor);

    const nuevoDetalle = {
      id_producto: productoSeleccionado.id,
      nombre_producto: productoSeleccionado.nombre,
      cantidad: cant,
      unidad_medida: unidadMedida,
      factor_unidades: factor,
      importe: importe,
      valor_unitario: valorUnitario,
    };

    setDetallesCompra([...detallesCompra, nuevoDetalle]);

    // Limpiar campos
    setProductoSeleccionado(null);
    setBusquedaProducto("");
    setCantidad("");
    setPrecioCompra("");
    setPrecioUnitario("");
    setUnidadMedida("CJA");
    setFactorUnidades(1);
    setCampoLlenado(null);

    toast.success("Producto agregado");
  };

  const eliminarProductoDeTabla = (index) => {
    const nuevosDetalles = detallesCompra.filter((_, i) => i !== index);
    setDetallesCompra(nuevosDetalles);
    toast.info("Producto eliminado");
  };

  const moverProductoArriba = (index) => {
    if (index === 0) return; // No hacer nada si es el primer elemento
    
    const nuevosDetalles = [...detallesCompra];
    // Intercambiar elemento actual con el anterior
    [nuevosDetalles[index], nuevosDetalles[index - 1]] = [nuevosDetalles[index - 1], nuevosDetalles[index]];
    setDetallesCompra(nuevosDetalles);
  };

  const moverProductoAbajo = (index) => {
    if (index === detallesCompra.length - 1) return; // No hacer nada si es el último elemento
    
    const nuevosDetalles = [...detallesCompra];
    // Intercambiar elemento actual con el siguiente
    [nuevosDetalles[index], nuevosDetalles[index + 1]] = [nuevosDetalles[index + 1], nuevosDetalles[index]];
    setDetallesCompra(nuevosDetalles);
  };

  const abrirModalEdicion = (detalle, index) => {
    // Calcular precio unitario si no existe
    const precioUnitarioCalculado = detalle.valor_unitario || 
      (detalle.importe / (detalle.cantidad * detalle.factor_unidades)) || 0;
    
    setProductoEditando(detalle);
    setIndexEditando(index);
    setEditando({
      cantidad: detalle.cantidad,
      unidad_medida: detalle.unidad_medida || "CJA",
      factor_unidades: detalle.factor_unidades || 1,
      precio_unitario: precioUnitarioCalculado.toFixed(2),
      importe: detalle.importe
    });
    setCampoLlenadoModal(null); // Reset el control
    setModalEdicionAbierto(true);
  };

  const cerrarModalEdicion = () => {
    setModalEdicionAbierto(false);
    setProductoEditando(null);
    setIndexEditando(null);
    setCampoLlenadoModal(null);
    setEditando({
      cantidad: "",
      unidad_medida: "CJA",
      factor_unidades: 1,
      precio_unitario: "",
      importe: ""
    });
  };

  const guardarEdicionProducto = () => {
    const cantidad = parseFloat(editando.cantidad) || 0;
    const precioUnitario = parseFloat(editando.precio_unitario) || 0;
    const precioCompra = parseFloat(editando.importe) || 0;
    const factor = parseFloat(editando.factor_unidades) || 1;

    if (cantidad <= 0) {
      toast.error("Cantidad debe ser mayor a 0");
      return;
    }

    if (precioCompra < 0) {
      toast.error("Importe no puede ser negativo");
      return;
    }

    if (factor <= 0) {
      toast.error("Factor debe ser mayor a 0");
      return;
    }

    // Usar el importe como referencia para calcular valor_unitario (igual que en agregar producto)
    const valorUnitario = precioCompra / (cantidad * factor);

    const detallesActualizados = [...detallesCompra];
    detallesActualizados[indexEditando] = {
      ...detallesActualizados[indexEditando],
      cantidad: cantidad,
      unidad_medida: editando.unidad_medida,
      factor_unidades: factor,
      importe: precioCompra,
      valor_unitario: valorUnitario
    };

    setDetallesCompra(detallesActualizados);
    toast.success("Producto actualizado");
    cerrarModalEdicion();
  };

  const calcularTotal = () => {
    return detallesCompra.reduce((sum, detalle) => sum + (detalle.importe || 0), 0);
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
      const compra = {
        numero_factura: numeroFactura,
        fecha_emision: fechaEmision,
        id_proveedor: proveedorSeleccionado.id,
        id_metodo_pago: metodoPagoSeleccionado,
        id_tipo_comprobante: tipoComprobante === "factura" ? 1 : 2,
        observacion: observacion,
        // Campos de resumen
        resumen_gravada: parseFloat(resumenGravada) || 0,
        resumen_igv: parseFloat(resumenIGV) || 0,
        resumen_descuento_total: parseFloat(resumenDescuentoTotal) || 0,
        resumen_total: parseFloat(resumenTotal) || 0,
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
        setResumenGravada("");
        setResumenIGV("");
        setResumenDescuentoTotal("");
        setResumenTotal("");
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
              {proveedorSeleccionado ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: '#f0f9ff', border: '1px solid #0EA5E9', borderRadius: '4px' }}>
                  <span style={{ flex: 1 }}>
                    <strong>{proveedorSeleccionado.nombres}</strong>
                    <small style={{ display: 'block', color: '#666' }}>RUC: {proveedorSeleccionado.identificador_fiscal || proveedorSeleccionado.identificadorFiscal || "Sin RUC"}</small>
                  </span>
                  <ClearButton onClick={() => {
                    setProveedorSeleccionado(null);
                    setBusquedaProveedor("");
                  }}>
                    <IoMdClose />
                  </ClearButton>
                </div>
              ) : (
                <SearchInputContainer>
                  <BsSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#999" }} />
                  <SearchInput
                    type="text"
                    placeholder="Busca por nombre o RUC..."
                    value={busquedaProveedor}
                    onChange={(e) => setBusquedaProveedor(e.target.value)}
                    onFocus={() => busquedaProveedor && setMostrarListaProveedores(true)}
                  />
                </SearchInputContainer>
              )}

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
          </FormGrid>
        </Section>

        {/* SECCIÓN 3: AGREGAR PRODUCTOS */}
        <Section>
          <SectionTitle>3. Agregar Productos</SectionTitle>
          
          {/* Fila 1: Búsqueda de Producto */}
          <FormGrid style={{marginBottom: "20px"}}>
            <FormGroup style={{ position: "relative", gridColumn: "1 / -1" }}>
              <Label>Buscar Producto *</Label>
              {productoSeleccionado ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: '#f0fdf4', border: '1px solid #22C55E', borderRadius: '4px' }}>
                  <span style={{ flex: 1 }}>
                    <strong>{productoSeleccionado.nombre}</strong>
                    <small style={{ display: 'block', color: '#666' }}>Código: {productoSeleccionado.codigoBarras || productoSeleccionado.codigo_barras || "Sin código"}</small>
                  </span>
                  <ClearButton onClick={() => {
                    setProductoSeleccionado(null);
                    setBusquedaProducto("");
                    setCantidad("");
                    setPrecioCompra("");
                    setUnidadMedida("CJA");
                    setFactorUnidades(1);
                  }}>
                    <IoMdClose />
                  </ClearButton>
                </div>
              ) : (
                <SearchInputContainer>
                  <BsSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#999" }} />
                  <SearchInput
                    type="text"
                    placeholder="Busca por nombre o código..."
                    value={busquedaProducto}
                    onChange={(e) => setBusquedaProducto(e.target.value)}
                    onFocus={() => busquedaProducto && setMostrarListaProductos(true)}
                  />
                </SearchInputContainer>
              )}

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
          </FormGrid>

          {/* Fila 2: Cantidad, Unidad, Factor */}
          <FormGrid style={{marginBottom: "20px"}}>
            <FormGroup>
              <Label>Cantidad *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ej: 1"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label>Unidad Medida *</Label>
              <Select
                value={unidadMedida}
                onChange={(e) => setUnidadMedida(e.target.value)}
              >
                <option value="CJA">Caja</option>
                <option value="UND">Unidad</option>
                <option value="DOC">Docena</option>
                <option value="PQT">Paquete</option>
                <option value="CEN">Cientos</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Factor (Unidades) *</Label>
              <Input
                type="number"
                step="1"
                placeholder="Ej: 300"
                value={factorUnidades}
                onChange={(e) => setFactorUnidades(e.target.value)}
              />
            </FormGroup>
          </FormGrid>

          {/* Fila 3: Precio Unitario, Importe Total, Botón */}
          <FormGrid>
            <FormGroup>
              <Label>Precio Unitario *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ej: 0.67"
                value={precioUnitario}
                onChange={(e) => handlePrecioUnitarioChange(e.target.value)}
                readOnly={campoLlenado === "importe"}
                style={{ 
                  backgroundColor: campoLlenado === "importe" ? "#f5f5f5" : "white",
                  cursor: campoLlenado === "importe" ? "not-allowed" : "auto"
                }}
              />
              <HelperText>
                {campoLlenado === "importe" ? "🔒 Se calcula automáticamente (borra el Importe Total para editar)" : "O llena el Importe Total y se calcula"}
              </HelperText>
            </FormGroup>

            <FormGroup>
              <Label>Importe Total *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ej: 200.00"
                value={precioCompra}
                onChange={(e) => handlePrecioCompraChange(e.target.value)}
                readOnly={campoLlenado === "unitario"}
                style={{ 
                  backgroundColor: campoLlenado === "unitario" ? "#f5f5f5" : "white",
                  cursor: campoLlenado === "unitario" ? "not-allowed" : "auto"
                }}
              />
              <HelperText>
                {campoLlenado === "unitario" ? "🔒 Se calcula automáticamente (borra el Precio Unitario para editar)" : "O llena el Precio Unitario y se calcula"}
              </HelperText>
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
                    <Th style={{width: '30%'}}>Descripción</Th>
                    <Th style={{width: '8%', textAlign: 'center'}}>Cant.</Th>
                    <Th style={{width: '10%', textAlign: 'center'}}>Unidad</Th>
                    <Th style={{width: '10%', textAlign: 'center'}}>Factor</Th>
                    <Th style={{width: '12%', textAlign: 'right'}}>V. Unitario</Th>
                    <Th style={{width: '12%', textAlign: 'right'}}>Importe</Th>
                    <Th style={{width: '18%', textAlign: 'center'}}>Acciones</Th>
                  </tr>
                </thead>
                <tbody>
                  {detallesCompra?.map((detalle, index) => (
                    <tr key={index}>
                      <Td>{detalle.nombre_producto}</Td>
                      <Td style={{textAlign: 'center'}}>
                        <strong>{detalle.cantidad}</strong>
                      </Td>
                      <Td style={{textAlign: 'center'}}>
                        {detalle.unidad_medida || "CJA"}
                      </Td>
                      <Td style={{textAlign: 'center'}}>
                        {detalle.factor_unidades || 1}
                      </Td>
                      <Td style={{textAlign: 'right'}}>
                        S/ {(detalle.valor_unitario || 0).toFixed(2)}
                      </Td>
                      <Td style={{textAlign: 'right'}}>
                        <strong>S/ {(detalle.importe || 0).toFixed(2)}</strong>
                      </Td>
                      <Td style={{textAlign: 'center'}}>
                        <ActionButtonsContainer>
                          <UpButton 
                            onClick={() => moverProductoArriba(index)}
                            disabled={index === 0}
                            title={index === 0 ? "Es el primer producto" : "Mover hacia arriba"}
                          >
                            ⬆️
                          </UpButton>
                          <DownButton 
                            onClick={() => moverProductoAbajo(index)}
                            disabled={index === detallesCompra.length - 1}
                            title={index === detallesCompra.length - 1 ? "Es el último producto" : "Mover hacia abajo"}
                          >
                            ⬇️
                          </DownButton>
                          <EditButton onClick={() => abrirModalEdicion(detalle, index)}>
                            ✏️
                          </EditButton>
                          <DeleteButton onClick={() => eliminarProductoDeTabla(index)}>
                            🗑️
                          </DeleteButton>
                        </ActionButtonsContainer>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <TotalContainer>
                <TotalLabel>Total (Importe Total):</TotalLabel>
                <TotalAmount>S/ {calcularTotal().toFixed(2)}</TotalAmount>
              </TotalContainer>
            </TableContainer>
          </Section>
        )}

        {/* RESUMEN */}
        <Section>
          <SectionTitle>Resumen</SectionTitle>
          <FormGrid>
            <FormGroup>
              <Label>Gravada</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ej: 1000.00"
                value={resumenGravada}
                disabled
                style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
              />
              <HelperText>Se calcula automáticamente: (Total / 1.18) - Descuento</HelperText>
            </FormGroup>

            <FormGroup>
              <Label>IGV (18%)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ej: 180.00"
                value={resumenIGV}
                disabled
                style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
              />
              <HelperText>Se calcula automáticamente: Gravada × 0.18</HelperText>
            </FormGroup>

            <FormGroup>
              <Label>Descuento Total</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ej: 0.00"
                value={resumenDescuentoTotal}
                onChange={(e) => setResumenDescuentoTotal(e.target.value)}
              />
              <HelperText>Ingresa el descuento manual (opcional)</HelperText>
            </FormGroup>

            <FormGroup>
              <Label>Total (Importe Total)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ej: 1180.00"
                value={resumenTotal}
                disabled
                style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
              />
              <HelperText>Se calcula automáticamente: Gravada + IGV</HelperText>
            </FormGroup>
          </FormGrid>
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

      {/* MODAL DE EDICIÓN */}
      {modalEdicionAbierto && productoEditando && (
        <ModalOverlay onClick={cerrarModalEdicion}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>✏️ Editar Producto</ModalTitle>
              <CloseModalButton onClick={cerrarModalEdicion}>✕</CloseModalButton>
            </ModalHeader>

            <ModalBody>
              <ModalField>
                <FieldLabel>Descripción:</FieldLabel>
                <FieldValue>{productoEditando.nombre_producto}</FieldValue>
              </ModalField>

              <FormRow>
                <FormFieldModal>
                  <FieldLabel>Cantidad *</FieldLabel>
                  <ModalInput
                    type="number"
                    step="0.01"
                    value={editando.cantidad}
                    onChange={(e) => setEditando({...editando, cantidad: e.target.value})}
                    placeholder="Ej: 1"
                  />
                </FormFieldModal>

                <FormFieldModal>
                  <FieldLabel>Unidad *</FieldLabel>
                  <ModalSelect
                    value={editando.unidad_medida}
                    onChange={(e) => setEditando({...editando, unidad_medida: e.target.value})}
                  >
                    <option value="CJA">CJA (Caja)</option>
                    <option value="BULTO">BULTO</option>
                    <option value="NIU">NIU (Unidad)</option>
                    <option value="PZA">PZA (Pieza)</option>
                    <option value="METRO">METRO</option>
                    <option value="LITRO">LITRO</option>
                  </ModalSelect>
                </FormFieldModal>
              </FormRow>

              <FormRow>
                <FormFieldModal>
                  <FieldLabel>Factor (Unidades/Caja) *</FieldLabel>
                  <ModalInput
                    type="number"
                    step="1"
                    value={editando.factor_unidades}
                    onChange={(e) => setEditando({...editando, factor_unidades: e.target.value})}
                    placeholder="Ej: 300"
                  />
                </FormFieldModal>

                <FormFieldModal>
                  <FieldLabel>Precio Unitario *</FieldLabel>
                  <ModalInput
                    type="number"
                    step="0.01"
                    value={editando.precio_unitario || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (!value) {
                        setCampoLlenadoModal(null);
                        setEditando({...editando, precio_unitario: value, importe: ""});
                      } else {
                        setCampoLlenadoModal("unitario");
                        setEditando({...editando, precio_unitario: value});
                        // Calcular importe
                        const unitario = parseFloat(value);
                        const cant = parseFloat(editando.cantidad);
                        const factor = parseFloat(editando.factor_unidades);
                        if (unitario > 0 && cant > 0 && factor > 0) {
                          const importe = unitario * cant * factor;
                          setEditando(prev => ({...prev, importe: importe.toFixed(2)}));
                        }
                      }
                    }}
                    placeholder="Ej: 0.67"
                    readOnly={campoLlenadoModal === "importe"}
                    style={{ 
                      backgroundColor: campoLlenadoModal === "importe" ? "#f5f5f5" : "white",
                      cursor: campoLlenadoModal === "importe" ? "not-allowed" : "auto"
                    }}
                  />
                </FormFieldModal>
              </FormRow>

              <FormRow>
                <FormFieldModal>
                  <FieldLabel>Importe Total *</FieldLabel>
                  <ModalInput
                    type="number"
                    step="0.01"
                    value={editando.importe}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (!value) {
                        setCampoLlenadoModal(null);
                        setEditando({...editando, importe: value, precio_unitario: ""});
                      } else {
                        setCampoLlenadoModal("importe");
                        setEditando({...editando, importe: value});
                        // Calcular precio unitario
                        const importe = parseFloat(value);
                        const cant = parseFloat(editando.cantidad);
                        const factor = parseFloat(editando.factor_unidades);
                        if (importe > 0 && cant > 0 && factor > 0) {
                          const unitario = importe / (cant * factor);
                          setEditando(prev => ({...prev, precio_unitario: unitario.toFixed(2)}));
                        }
                      }
                    }}
                    placeholder="Ej: 200.00"
                    readOnly={campoLlenadoModal === "unitario"}
                    style={{ 
                      backgroundColor: campoLlenadoModal === "unitario" ? "#f5f5f5" : "white",
                      cursor: campoLlenadoModal === "unitario" ? "not-allowed" : "auto"
                    }}
                  />
                </FormFieldModal>
              </FormRow>

              <CalculatedField>
                <FieldLabel>V. Unitario (Calculado):</FieldLabel>
                <CalculatedValue>
                  S/ {(parseFloat(editando.importe) / (parseFloat(editando.cantidad) * parseFloat(editando.factor_unidades)) || 0).toFixed(2)}
                </CalculatedValue>
              </CalculatedField>
            </ModalBody>

            <ModalFooter>
              <CancelModalButton onClick={cerrarModalEdicion}>Cancelar</CancelModalButton>
              <SaveModalButton onClick={guardarEdicionProducto}>Guardar Cambios</SaveModalButton>
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
  min-height: 44px;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
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

const HelperText = styled.small`
  display: block;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
  font-style: italic;
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
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-radius: 8px;
  overflow: hidden;
`;

const Th = styled.th`
  text-align: left;
  padding: 14px 16px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  font-weight: 700;
  font-size: 13px;
  border-bottom: 2px solid #059669;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Td = styled.td`
  padding: 12px 16px;
  color: #334155;
  font-size: 13px;
  border-bottom: 1px solid #f1f5f9;
  background: white;
  
  &:last-child {
    text-align: center;
  }
  
  tr:hover & {
    background: #f8fafc;
  }
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

const UpButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;

  &:hover:not(:disabled) {
    background: #2563eb;
    transform: scale(1.05);
    box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
  }

  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const DownButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;

  &:hover:not(:disabled) {
    background: #2563eb;
    transform: scale(1.05);
    box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
  }

  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const TotalContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
`;

const TotalLabel = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
`;

const TotalAmount = styled.span`
  font-size: 24px;
  font-weight: 800;
  color: white;
  letter-spacing: 0.5px;
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

// ==================== MODAL DE EDICIÓN ====================

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 2px solid #f1f5f9;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 12px 12px 0 0;
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: white;
  margin: 0;
`;

const CloseModalButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: white;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 6px;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const ModalField = styled.div`
  margin-bottom: 16px;
`;

const FieldLabel = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
`;

const FieldValue = styled.div`
  font-size: 14px;
  color: #1e293b;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
`;

const FormFieldModal = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ModalInput = styled.input`
  padding: 10px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 13px;
  color: #1e293b;
  background: white;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
`;

const ModalSelect = styled.select`
  min-height: 44px;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
  color: #1e293b;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
`;

const CalculatedField = styled.div`
  padding: 12px 16px;
  background: linear-gradient(135deg, #f0fdf4 0%, #f1fdf5 100%);
  border: 2px solid #86efac;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const CalculatedValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #10b981;
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;
  border-radius: 0 0 12px 12px;
  justify-content: flex-end;
`;

const CancelModalButton = styled.button`
  padding: 10px 20px;
  background: #e2e8f0;
  color: #475569;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #cbd5e1;
    transform: translateY(-2px);
  }
`;

const SaveModalButton = styled.button`
  padding: 10px 20px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
`;

const EditButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #fff3cd;
    transform: scale(1.15);
  }

  &:active {
    transform: scale(0.95);
  }
`;

//flavio