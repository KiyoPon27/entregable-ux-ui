import styled from "styled-components";
import {
  Btn1,
  InputText2,
  ListaDesplegable,
  Reloj,
  useProductosStore,
  useVentasStore,
  useUsuariosStore,
  useEmpresaStore,
  useAlmacenesStore,
  useDetalleVentasStore,
  useBarcodeScanner,
} from "../../../index";
import { v } from "../../../styles/variables";
import { Device } from "../../../styles/breakpoints";
import { Icon } from "@iconify/react";
import { useEffect, useRef, useState, useMemo } from "react";
import api from "../../../api/api";
import { ListarMultipreciosPorProducto } from "../../../supabase/crudMultiprecios";
import { CambiarMultiprecioDetalleVenta } from "../../../supabase/crudDetalleVenta";

import { useFormattedDate } from "../../../hooks/useFormattedDate";
import { useCierreCajaStore } from "../../../store/CierreCajaStore";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { SelectList } from "../../ui/lists/SelectList";
import ChangesReviewModal from "../../ui/ChangesReviewModal";
import { useStockStore } from "../../../store/StockStore";
import { useEliminarVentasIncompletasMutate } from "../../../tanstack/VentasStack";


export function HeaderPos() {
  const [stateLectora, setStateLectora] = useState(true);
  const [cantidadInput, setCantidadInput] = useState(1);
  const [stateTeclado, setStateTeclado] = useState(false);
  const [stateListaproductos, setStateListaproductos] = useState(false);
  const [modalCoincidencias, setModalCoincidencias] = useState({
    abierto: false,
    codigo: "",
    productos: [],
  });
  const [showChangesModal, setShowChangesModal] = useState(false);
  const { setBuscador, dataProductos, selectProductos, buscador } =
    useProductosStore();

  const { datausuarios } = useUsuariosStore();
  const { dataStockXAlmacenesYProducto, setStateModal } = useStockStore();

  const { idventa, insertarVentas } = useVentasStore();

  const { dataempresa } = useEmpresaStore();
  const { dataCierreCaja } = useCierreCajaStore();
  const { almacenSelectItem, dataAlmacenesXsucursal, setAlmacenSelectItem } =
    useAlmacenesStore();
  const { insertarDetalleVentas, mostrardetalleventa } = useDetalleVentasStore();
  const queryClient = useQueryClient();

  const buscadorRef = useRef(null);
  const fechaactual = useFormattedDate();

  function normalizarCodigo(valor) {
    return String(valor ?? "").trim();
  }

  function obtenerStockProducto(producto) {
    const stock = producto?.stockTotal ?? producto?.stock ?? producto?.stock_total ?? 0;
    const numeroStock = Number(stock);
    return Number.isFinite(numeroStock) ? numeroStock : 0;
  }

  function obtenerPrecioVenta(producto) {
    const precio = producto?.precioVenta ?? producto?.precio_venta ?? 0;
    const numeroPrecio = Number(precio);
    return Number.isFinite(numeroPrecio) ? numeroPrecio : 0;
  }

  function abrirSelectorCoincidencias(codigo, productos) {
    setModalCoincidencias({
      abierto: true,
      codigo: normalizarCodigo(codigo),
      productos: Array.isArray(productos) ? productos : [],
    });
  }

  function cerrarSelectorCoincidencias() {
    setModalCoincidencias({
      abierto: false,
      codigo: "",
      productos: [],
    });
  }

  async function agregarProductoAlCarrito(producto, mensaje) {
    if (!producto) return;
    selectProductos(producto);
    await mutationInsertarVentas({ noFocus: true });
    setBuscador("");
    cerrarSelectorCoincidencias();
    toast.success(mensaje || `${producto.nombre} agregado al carrito`);
  }

  function obtenerCoincidenciasExactas(productos, codigo) {
    const codigoNormalizado = normalizarCodigo(codigo).toLowerCase();
    if (!codigoNormalizado || !Array.isArray(productos)) return [];

    return productos.filter((producto) => {
      const codigoBarras = normalizarCodigo(producto?.codigoBarras).toLowerCase();
      const codigoInterno = normalizarCodigo(producto?.codigoInterno).toLowerCase();
      return codigoBarras === codigoNormalizado || codigoInterno === codigoNormalizado;
    });
  }

  async function resolverCodigoDeProducto(codigo, origen = "escaneo") {
    const codigoNormalizado = normalizarCodigo(codigo);
    if (!codigoNormalizado) return;
    if (modalCoincidencias.abierto) return; // 🛡️ BLOQUEAR ESCANEO SI MODAL ABIERTO

    const coincidenciasLocales = obtenerCoincidenciasExactas(dataProductos, codigoNormalizado);

    if (coincidenciasLocales.length === 1) {
      await agregarProductoAlCarrito(
        coincidenciasLocales[0],
        `${coincidenciasLocales[0].nombre} agregado al carrito`
      );
      return;
    }

    if (coincidenciasLocales.length > 1) {
      abrirSelectorCoincidencias(codigoNormalizado, coincidenciasLocales);
      return;
    }

    console.log("📷 No encontrado en memoria, buscando en servidor...");
    const response = await api.get(
      `/productos/buscar-lectora/${dataempresa?.id}?q=${encodeURIComponent(codigoNormalizado)}`
    );

    const coincidenciasServidor = Array.isArray(response.data)
      ? response.data.filter(Boolean)
      : [];

    if (coincidenciasServidor.length === 1) {
      await agregarProductoAlCarrito(
        coincidenciasServidor[0],
        `${coincidenciasServidor[0].nombre} agregado al carrito`
      );
      return;
    }

    if (coincidenciasServidor.length > 1) {
      abrirSelectorCoincidencias(codigoNormalizado, coincidenciasServidor);
      return;
    }

    Swal.fire({
      icon: "error",
      title: "❌ Producto No Encontrado",
      html: `<p style="font-size: 18px;">El código <strong>${codigoNormalizado}</strong> no corresponde a ningún producto registrado.</p>`,
      confirmButtonText: "Entendido",
      confirmButtonColor: "#d33",
      width: "500px",
      padding: "2em",
    });
    setBuscador("");
    if (origen === "buscador") {
      setStateListaproductos(false);
    }
  }

  // Calcula la distancia de Levenshtein entre dos cadenas
  function calcularDistanciaLevenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  // Filtra productos con matching bidireccional y fuzzy
  function filtrarPorPalabras(texto, nombre) {
    if (!texto || !nombre) return false;
    
    const palabrasBusqueda = texto.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const palabrasNombre = nombre.toLowerCase().split(/\s+/).filter(Boolean);
    
    const MIN_LENGTH_SUBSTRING = 2;
    const MIN_LENGTH_FUZZY = 4;
    const THRESHOLD_PERCENT = 0.25;
    const MIN_RATIO_SUBSTRING = 0.5;

    return palabrasBusqueda.every((pb) => {
      // Nivel 1: Matching exacto
      if (palabrasNombre.some((pn) => {
        const minLength = Math.min(pb.length, pn.length);
        const maxLength = Math.max(pb.length, pn.length);
        
        if (minLength < MIN_LENGTH_SUBSTRING) return false;
        if (minLength / maxLength < MIN_RATIO_SUBSTRING) return false;
        
        return pn.includes(pb) || pb.includes(pn);
      })) {
        return true;
      }

      // Nivel 2: Fuzzy matching con Levenshtein
      if (pb.length >= MIN_LENGTH_FUZZY) {
        return palabrasNombre.some((pn) => {
          if (pn.length < MIN_LENGTH_FUZZY) return false;
          const distancia = calcularDistanciaLevenshtein(pb, pn);
          const maxLength = Math.max(pb.length, pn.length);
          const similitud = 1 - (distancia / maxLength);
          return similitud >= (1 - THRESHOLD_PERCENT);
        });
      }

      return false;
    });
  }

  // Filtra productos según búsqueda fuzzy y pone los productos con 0 stock al final
  const productosFiltrados = useMemo(() => {
    if (!Array.isArray(dataProductos)) return [];

    const texto = buscador.trim();
    const filtrados = texto
      ? dataProductos.filter(
          (p) =>
            filtrarPorPalabras(texto, p.nombre) ||
            (p.codigoBarras && p.codigoBarras.toString().includes(texto)) ||
            (p.codigoInterno && p.codigoInterno.toString().toLowerCase().includes(texto.toLowerCase()))
        )
      : dataProductos;

    return filtrados
      .map((item, index) => ({ item, index }))
      .sort((a, b) => {
        const stockA = obtenerStockProducto(a.item);
        const stockB = obtenerStockProducto(b.item);
        const ceroA = stockA === 0 ? 1 : 0;
        const ceroB = stockB === 0 ? 1 : 0;

        if (ceroA !== ceroB) return ceroA - ceroB;
        return a.index - b.index;
      })
      .map(({ item }) => item);
  }, [dataProductos, buscador]);

  // Obtener detalles de venta para calcular recomendación
  const { data: items } = useQuery({
    queryKey: ["mostrar detalle venta", { id_venta: idventa }],
    queryFn: () => mostrardetalleventa({ id_venta: idventa }),
    enabled: idventa > 0,
  });

  // Calcular recomendación de tipo de comprobante
  const recomendacion = useMemo(() => {
    if (!items || items.length === 0) return null;
    
    let facturados = 0;
    let manualidades = 0;
    
    items.forEach(item => {
      const tipo = item.productos?.tipoComprobante;
      const cantidad = parseFloat(item.cantidad) || 1;
      
      if (tipo === 'FACTURADO') facturados += cantidad;
      else if (tipo === 'MANUALIDAD') manualidades += cantidad;
    });
    
    if (facturados === 0 && manualidades === 0) return null;
    
    if (facturados > manualidades) {
      return {
        tipo: 'FACTURA',
        icon: 'mdi:file-document',
        mensaje: 'Se recomienda FACTURA',
        color: '#059669',
        bg: '#d1fae5',
        detalle: `${facturados} unidad${facturados > 1 ? 'es' : ''} facturada${facturados > 1 ? 's' : ''}`
      };
    } else if (manualidades > facturados) {
      return {
        tipo: 'TICKET',
        icon: 'mdi:receipt',
        mensaje: 'Se recomienda TICKET',
        color: '#7c3aed',
        bg: '#ede9fe',
        detalle: `${manualidades} unidad${manualidades > 1 ? 'es' : ''} de manualidad`
      };
    } else {
      return {
        tipo: 'MIXTO',
        icon: 'mdi:scale-balance',
        mensaje: 'Productos mixtos',
        color: '#d97706',
        bg: '#fef3c7',
        detalle: `${facturados} facturada${facturados > 1 ? 's' : ''}, ${manualidades} manualidad${manualidades > 1 ? 'es' : ''}`
      };
    }
  }, [items]);

  function focusclick() {
    buscadorRef.current.focus();
    buscadorRef.current.value.trim() === ""
      ? setStateListaproductos(false)
      : setStateListaproductos(true);
  }
  function buscar(e) {
    setBuscador(e.target.value);
    let texto = e.target.value;
    if (texto.trim() === "" || stateLectora) {
      setStateListaproductos(false);
    } else {
      setStateListaproductos(true);
    }
  }

  async function insertarventas(opts = {}) {
    console.log("🔵 INICIANDO insertarventas, opts:", opts);
    console.log("🔵 idventa actual:", idventa);
    console.log("🔵 productosItemSelect:", useProductosStore.getState().productosItemSelect);
    
    if (idventa === 0) {
      const pventas = {
        fecha: fechaactual,
        id_usuario: datausuarios?.id,
        id_sucursal: dataCierreCaja?.caja?.id_sucursal,
        id_empresa: dataempresa?.id,
        id_cierre_caja: dataCierreCaja?.id,
      };
      console.log("🔵 Creando nueva venta con:", pventas);

      const result = await insertarVentas(pventas);
      console.log("🔵 Venta creada con ID:", result?.id);
      if (result?.id > 0) {
        await insertarDVentas(result?.id);
      }
    } else {
      console.log("🔵 Usando venta existente:", idventa);
      await insertarDVentas(idventa);
    }
    setBuscador("");
    // if caller requests no focus (e.g. barcode scanner flow), don't focus the buscador
    if (!opts?.noFocus) {
      try {
        buscadorRef.current.focus();
      } catch (e) {}
    }
    setCantidadInput(1);
    console.log("🟢 insertarventas completado");
  }
  async function insertarDVentas(idventa) {
    console.log("🟡 INICIANDO insertarDVentas con idventa:", idventa);
    const productosItemSelect =
      useProductosStore.getState().productosItemSelect;
    
    console.log("🟡 Producto seleccionado:", productosItemSelect);
    console.log("🟡 cantidadInput:", cantidadInput);
    console.log("🟡 dataCierreCaja:", dataCierreCaja);
    
    // Validar que haya un producto seleccionado
    if (!productosItemSelect || !productosItemSelect.id) {
      console.error("❌ No hay producto seleccionado");
      toast.error("Por favor selecciona un producto primero");
      return;
    }

    // 🔍 VERIFICAR SI YA EXISTE EN EL CARRITO Y SI DEBE CAMBIAR A MULTIPRECIO
    const detallesActuales = queryClient.getQueryData(["mostrar detalle venta", { id_venta: idventa }]) || [];
    const detalleExistente = detallesActuales.find(
      (d) => (d.productos?.id || d.id_producto) === productosItemSelect.id && 
             !d.descripcion?.includes("(") // Solo buscar items en "unidad"
    );

    if (detalleExistente) {
      const cantidadActual = parseFloat(detalleExistente.cantidad) || 0;
      const nuevaCantidad = cantidadActual + (parseFloat(cantidadInput) || 1);
      
      console.log("🔵 Producto ya existe en carrito. Cantidad actual:", cantidadActual, "Nueva cantidad:", nuevaCantidad);

      // Cargar multiprecios del producto
      try {
        const multiprecios = await ListarMultipreciosPorProducto(productosItemSelect.id);
        const multiprecioCoincidente = (multiprecios || []).find(
          (mp) => Number(mp.cantidad) === nuevaCantidad
        );

        if (multiprecioCoincidente) {
          // ✅ CAMBIAR A MULTIPRECIO
          console.log("🎯 Cantidad coincide con multiprecio:", multiprecioCoincidente.nombreReferencial);
          const precioUnitario = multiprecioCoincidente.precioVenta / multiprecioCoincidente.cantidad;
          await CambiarMultiprecioDetalleVenta({
            id: detalleExistente.id,
            cantidad: multiprecioCoincidente.cantidad,
            precioVenta: precioUnitario,
            descripcion: `${productosItemSelect.nombre} (${multiprecioCoincidente.nombreReferencial})`,
          });
          toast.success(`Cambiado a ${multiprecioCoincidente.nombreReferencial}`);
          queryClient.invalidateQueries(["mostrar detalle venta"]);
          return;
        }
      } catch (error) {
        console.error("Error verificando multiprecios:", error);
        // Continuar con inserción normal si falla
      }
    }
    
    const pDetalleVentas = {
      _id_venta: idventa,
      _cantidad: parseFloat(cantidadInput) || 1,
      _precio_venta: productosItemSelect.precioVenta,
      _descripcion: productosItemSelect.nombre,
      _id_producto: productosItemSelect.id,
      _precio_compra: productosItemSelect.precioCompra,
      idSucursal: dataCierreCaja?.caja?.id_sucursal,
      idAlmacen: almacenSelectItem?.id,
    };
    console.log("🟡 pDetalleVentas construido:", pDetalleVentas);
    
    try {
      console.log("🟡 Llamando a insertarDetalleVentas...");
      await insertarDetalleVentas(pDetalleVentas);
      console.log("🟢 Detalle insertado exitosamente");
    } catch (error) {
      console.error("❌ Error insertar detalle venta:", error);
      const msg = error?.message || "";
      const isFK = msg.toLowerCase().includes("foreign key") || msg.toLowerCase().includes("violates foreign key");
      if (isFK) {
        console.log("⚠️ Error de FK, intentando recrear venta...");
        // probable: the venta id was deleted (incomplete sales removed). Create a new venta and retry.
        try {
          const pventas = {
            fecha: fechaactual,
            id_usuario: datausuarios?.id,
            id_sucursal: dataCierreCaja?.caja?.id_sucursal,
            id_empresa: dataempresa?.id,
            id_cierre_caja: dataCierreCaja?.id,
          };
          const nuevo = await insertarVentas(pventas);
          const nuevoId = nuevo?.id;
          console.log("🟡 Nueva venta creada con ID:", nuevoId);
          if (nuevoId) {
            // update detalle with new venta id and retry
            pDetalleVentas._id_venta = nuevoId;
            await insertarDetalleVentas(pDetalleVentas);
            // ensure query state reflects new detalle
            queryClient.invalidateQueries(["mostrar detalle venta"]);
            console.log("🟢 Detalle insertado después de recrear venta");
            return;
          }
        } catch (err2) {
          console.error("❌ Error recreando venta y reintentando detalle:", err2);
          toast.error(err2?.message || "Error al crear venta");
          throw err2;
        }
      }
      // if not FK or after failing to recover, rethrow
      toast.error(error?.message || "Error al insertar detalle");
      throw error;
    }
  }
  const { mutate: mutationInsertarVentas } = useMutation({
    mutationKey: ["insertar ventas"],
    mutationFn: insertarventas,
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
      queryClient.invalidateQueries(["mostrar Stock XAlmacenes YProducto"]);
      if (dataStockXAlmacenesYProducto) {
        setStateModal(true);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["mostrar detalle venta"]);
    },
  });
  //validar cantidad
  const ValidarCantidad = (e) => {
    const value = Math.max(0, parseFloat(e.target.value));
    setCantidadInput(value);
  };

  // Antes: eliminábamos ventas incompletas al montar el header, lo que
  // provocaba que el carrito/pedido se borrara al navegar. Ahora solo
  // eliminamos ventas incompletas cuando el usuario recarga o cierra la
  // página (F5 / refresh), manteniendo el carrito al navegar internamente.
  const { mutate } = useEliminarVentasIncompletasMutate();
  useEffect(() => {
    buscadorRef.current.focus();

    const handleBeforeUnload = (event) => {
      try {
        const token = localStorage.getItem("token");
        const idUsuario = useUsuariosStore.getState().datausuarios?.id;
        const idCierreCaja = useCierreCajaStore.getState().dataCierreCaja?.id;
        if (!idUsuario || !idCierreCaja) return;
        const base = api.defaults?.baseURL || "http://localhost:8081/api";
        const url = `${base.replace(/\/$/, "")}/ventas/incompletas?idUsuario=${idUsuario}&idCierreCaja=${idCierreCaja}`;
        // Usar fetch con keepalive para enviar la petición de borrado en unload
        fetch(url, {
          method: "DELETE",
          keepalive: true,
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }).catch(() => {});
      } catch (e) {
        // no hacer nada si falla
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // global barcode scanner: when a code is read, try to find the product and add it
  useBarcodeScanner(async (code) => {
    console.log("📷 Barcode escaneado:", code);
    try {
      await resolverCodigoDeProducto(code, "escaneo");
    } catch (err) {
      console.error("❌ barcode handler error", err);
      Swal.fire({
        icon: "error",
        title: "Error al Buscar Producto",
        text: "Ocurrió un error al intentar buscar el producto. Por favor, intenta nuevamente.",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#d33",
      });
      setBuscador("");
    }
  });
  useEffect(() => {
    let timeout;
    const texto = buscador.trim();
    const isCodigoDeBarras = /^[0-9]{3,}$/.test(texto);
    
    console.log("🔍 useEffect buscador - texto:", texto, "isCodigoDeBarras:", isCodigoDeBarras);
    
    if (isCodigoDeBarras) {
      setStateListaproductos(false);
      timeout = setTimeout(async () => {
        console.log("🔍 Buscando producto con código:", texto);
        await resolverCodigoDeProducto(texto, "buscador");
      }, 100);
    } else {
      if (texto.length > 1) {
        timeout = setTimeout(() => {
          setStateListaproductos(true);
        }, 200);
      } else {
        setStateListaproductos(false);
      }
    }
    return () => clearTimeout(timeout);
  }, [buscador]);

  // 🔒 CIERRE CON TECLA ESC
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && modalCoincidencias.abierto) {
        cerrarSelectorCoincidencias();
      }
    };
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [modalCoincidencias.abierto]);

  return (
    <Header>
      <ContentSucursal>
        <div>
          <strong>SUCURSAL:&nbsp; </strong>{" "}
          {dataCierreCaja?.caja?.sucursales?.nombre || "-"}
        </div>
        |
        <div>
          <strong>CAJA:&nbsp; </strong>{" "}
          {dataCierreCaja?.caja?.descripcion || "-"}
        </div>

      </ContentSucursal>
      <section className="contentprincipal">
        <Contentuser className="area1">
          <div className="textos">
            <span className="usuario">{datausuarios?.nombres} </span>
            <span>{datausuarios?.roles?.nombre} </span>
          </div>
        </Contentuser>
        <Btn1 onClick={() => setShowChangesModal(true)} style={{ marginLeft: 12 }}>Cambios</Btn1>
 
        <article className="contentfecha area3">
          <Reloj />
        </article>
      </section>
      <section className="contentbuscador">
        <article className="area1">
          <div className="contentCantidad">
            <InputText2>
              <input
                type="number"
                min="1"
                value={cantidadInput}
                onChange={ValidarCantidad}
                placeholder="cantidad..."
                className="form__field"
              />
            </InputText2>
          </div>
          <InputText2>
            <input
              value={buscador}
              ref={buscadorRef}
              onChange={buscar}
              className="form__field"
              type="search"
              placeholder="buscar..."
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" && stateListaproductos) {
                  e.preventDefault(); // Evita que el input capture el foco
                  document.querySelector("[tabindex='0'").focus(); //mandar el foco a la lista
                }
              }}
            />
            <ListaDesplegable
              funcioncrud={mutationInsertarVentas}
              top="59px"
              funcion={selectProductos}
              setState={() => setStateListaproductos(!stateListaproductos)}
              data={productosFiltrados}
              state={stateListaproductos}
            />
          </InputText2>
        </article>
        <article className="area2">
          {recomendacion && (
            <Recomendacion $color={recomendacion.color} $bg={recomendacion.bg}>
              <Icon icon={recomendacion.icon} width="20" height="20" />
              <div className="contenido">
                <span className="mensaje">{recomendacion.mensaje}</span>
                <span className="detalle">{recomendacion.detalle}</span>
              </div>
            </Recomendacion>
          )}
        </article>
      </section>
      {modalCoincidencias.abierto && (
        <SelectorOverlay onClick={cerrarSelectorCoincidencias}>
          <SelectorModal onClick={(e) => e.stopPropagation()}>
            <SelectorHeader>
              <div className="headerContent">
                <SelectorTitle>⚠️ Múltiples Productos</SelectorTitle>
                <SelectorSubtitle>Código: <strong>{modalCoincidencias.codigo}</strong></SelectorSubtitle>
              </div>
              <CloseButton type="button" onClick={cerrarSelectorCoincidencias} title="Cerrar">✕</CloseButton>
            </SelectorHeader>
 
            <SelectorContent>
              <ProductGrid>
                {modalCoincidencias.productos.map((producto) => (
                  <ProductCard
                    key={`${producto.id}-${producto.codigoBarras || producto.codigoInterno || producto.nombre}`}
                    type="button"
                    onClick={() => agregarProductoAlCarrito(producto, `${producto.nombre} agregado al carrito`)}
                  >
                    <ProductCardInner>
                      <ProductImage
                        src={
                          producto?.imagenBase64 ??
                          producto?.imagen ??
                          producto?.imagenUrl ??
                          producto?.imagen_url ??
                          producto?.image ??
                          producto?.url_imagen ??
                          ""
                        }
                        alt={producto?.nombre || "producto"}
                        onError={(e) => {
                          // ocultar imagen si hay error de carga
                          e.currentTarget.style.display = "none";
                        }}
                      />
 
                      <ProductName>{producto.nombre}</ProductName>
                       
                      <PriceContainer>
                        <PriceLabel>Precio</PriceLabel>
                        <ProductPrice>S/ {obtenerPrecioVenta(producto).toFixed(2)}</ProductPrice>
                      </PriceContainer>
 
                      <StockContainer>
                        <StockLabel>Stock</StockLabel>
                        <StockBadge $enStock={obtenerStockProducto(producto) > 0}>
                          {obtenerStockProducto(producto)} unid.
                        </StockBadge>
                      </StockContainer>
 
                      <SelectButton>Seleccionar</SelectButton>
                    </ProductCardInner>
                  </ProductCard>
                ))}
              </ProductGrid>
            </SelectorContent>
 
            <SelectorFooter>
              <FooterText>ESC para cerrar</FooterText>
            </SelectorFooter>
          </SelectorModal>
        </SelectorOverlay>
      )}
      {showChangesModal && (
        <ChangesReviewModal open={showChangesModal} onClose={() => setShowChangesModal(false)} />
      )}
    </Header>
  );
}
const Header = styled.div`
  grid-area: header;
  /* background-color: rgba(222, 18, 130, 0.5); */
  display: flex;
  height: 100%;

  flex-direction: column;
  gap: 20px;
  @media ${Device.desktop} {
    border-bottom: 1px solid ${({ theme }) => theme.color2};
  }

  .contentprincipal {
    width: 100%;
    display: grid;
    grid-template-areas:
      "area1 area2"
      "area3 area3";

    .area1 {
      grid-area: area1;
    }
    .area2 {
      grid-area: area2;
    }
    .area3 {
      grid-area: area3;
    }
    @media ${Device.desktop} {
      display: flex;
      justify-content: space-between;
    }
    .contentlogo {
      display: flex;
      align-items: center;
      font-weight: 700;
      gap: 8px;
      img {
        width: 30px;
        object-fit: contain;
      }
    }
  }
  .contentbuscador {
    display: grid;
    grid-template:
      "area2 area2"
      "area1 area1";
    gap: 10px;
    height: 100%;
    align-items: center;
    position: relative;

    .area1 {
      grid-area: area1;
      display: flex;
      gap: 30px;
      .contentCantidad {
        width: 150px;
      }
      /* background-color: #ff00ae; */
    }
    .area2 {
      grid-area: area2;
      display: flex;
      gap: 10px;
      /* background-color: #15ff00; */
    }
    @media ${Device.desktop} {
      display: flex;
      justify-content: flex-start;
      gap: 10px;
      .area1 {
        width: 40vw;
      }
    }
  }
`;
const ContentSucursal = styled.section`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  /* background-color: red; */
  align-items: center;
  height: 45px;
  border-bottom: 1px solid ${({ theme }) => theme.color2};
  gap:8px;
`;
const Contentuser = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  .contentimg {
    display: flex;
    align-items: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    img {
      width: 100%;
      object-fit: cover;
    }
  }
  .textos {
    display: none;

    .usuario {
      font-weight: 700;
    }
    @media ${Device.laptop} {
      display: flex;
      flex-direction: column;
    }
  }
`;

const Recomendacion = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 12px;
  background-color: ${props => props.$bg};
  border: 2px solid ${props => props.$color};
  color: ${props => props.$color};
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  animation: slideIn 0.4s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }

  .contenido {
    display: flex;
    flex-direction: column;
    gap: 2px;
    
    .mensaje {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.3px;
    }
    
    .detalle {
      font-size: 11px;
      font-weight: 500;
      opacity: 0.85;
    }
  }

  @media ${Device.tablet} {
    padding: 12px 18px;
    
    .contenido {
      .mensaje {
        font-size: 15px;
      }
      
      .detalle {
        font-size: 12px;
      }
    }
  }
`;

// 🎨 ESTILOS PARA EL MODAL DE SELECCIÓN DE PRODUCTOS DUPLICADOS
const SelectorOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease-out;
  padding: 16px;
  overflow: hidden;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const SelectorModal = styled.div`
  background: ${({ theme }) => theme.bg3};
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.color2};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 0;
  width: 100%;
  max-width: 720px;
  height: auto;
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
  overflow: hidden;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 640px) {
    max-width: 95vw;
    border-radius: 14px;
  }
`;

const SelectorHeader = styled.div`
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) => theme.color2};
  padding: 24px;
  gap: 16px;
  flex-shrink: 0;

  .headerContent {
    flex: 1;
    min-width: 0;
  }
`;

const SelectorTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0 0 4px 0;
  letter-spacing: -0.3px;
`;

const SelectorSubtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colorSubtitle};
  margin: 0;
  word-break: break-word;
  
  strong {
    color: ${({ theme }) => theme.color1};
    font-weight: 700;
  }
`;

const CloseButton = styled.button`
  flex-shrink: 0;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.color2};
  color: ${({ theme }) => theme.text};
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-weight: 700;
  padding: 0;

  &:hover {
    background: ${({ theme }) => theme.bg2};
    border-color: ${({ theme }) => theme.color1};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const SelectorContent = styled.div`
  overflow-y: auto;
  flex: 1;
  padding: 24px;
  min-height: 0;
  max-height: calc(100vh - 220px);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.bg2};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.color2};
    border-radius: 3px;

    &:hover {
      background: ${({ theme }) => theme.color1};
    }
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const ProductCard = styled.button`
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.color2};
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: inherit;
  font-family: inherit;
  color: inherit;
  text-align: left;
  width: 100%;
  box-sizing: border-box;

  &:hover {
    background: ${({ theme }) => theme.bg3};
    border-color: ${({ theme }) => theme.color1};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ProductCardInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
  width: 100%;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  display: block;
  background: ${({ theme }) => theme.bg3};
`;

const ProductName = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0;
  line-height: 1.3;
  word-break: break-word;
`;

const PriceContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
`;

const PriceLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: ${({ theme }) => theme.colorSubtitle};
`;

const ProductPrice = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.color1};
`;

const StockContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
`;

const StockLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: ${({ theme }) => theme.colorSubtitle};
`;

const StockBadge = styled.div`
  background: ${(props) => props.$enStock ? '#10b981' : '#ef4444'};
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  display: inline-block;
  max-width: fit-content;
`;

const SelectButton = styled.div`
  background: ${({ theme }) => theme.color1};
  color: white;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
  transition: all 0.2s ease;
`;

const SelectorFooter = styled.div`
  border-top: 1px solid ${({ theme }) => theme.color2};
  padding: 16px 24px;
  text-align: center;
  flex-shrink: 0;
`;

const FooterText = styled.small`
  font-size: 12px;
  color: ${({ theme }) => theme.colorSubtitle};
  font-weight: 500;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(9, 15, 25, 0.58);
  backdrop-filter: blur(10px);
  animation: fadeInOverlay 0.18s ease-out;

  @keyframes fadeInOverlay {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalCard = styled.div`
  width: min(680px, 100%);
  max-height: min(80vh, 760px);
  overflow: hidden;
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 247, 252, 0.98) 100%);
  border: 1px solid rgba(148, 163, 184, 0.32);
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.28);
  animation: popIn 0.2s ease-out;

  @keyframes popIn {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 22px 14px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.94));
  color: #fff;

  .eyebrow {
    display: inline-flex;
    margin-bottom: 8px;
    padding: 4px 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 700;
  }

  h3 {
    margin: 0;
    font-size: 22px;
    line-height: 1.15;
  }

  p {
    margin: 8px 0 0;
    color: rgba(226, 232, 240, 0.92);
    font-size: 14px;
    line-height: 1.45;
  }

  .closeButton {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border: 0;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
    cursor: pointer;
    transition: transform 0.15s ease, background 0.15s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.04);
    }
  }
`;

const ModalBody = styled.div`
  display: grid;
  gap: 12px;
  padding: 18px;
  overflow: auto;
  max-height: calc(80vh - 92px);
`;

const ProductoChoice = styled.button`
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) repeat(2, minmax(110px, 1fr));
  gap: 14px;
  align-items: center;
  padding: 16px 18px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  color: inherit;
  text-align: left;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.06);
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(59, 130, 246, 0.45);
    box-shadow: 0 16px 28px rgba(15, 23, 42, 0.12);
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 4px;

    strong {
      font-size: 15px;
      line-height: 1.2;
      color: #0f172a;
    }

    span {
      font-size: 12px;
      color: #64748b;
    }
  }

  .metrica {
    display: flex;
    flex-direction: column;
    gap: 4px;

    label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #64748b;
    }

    span {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }
  }

  @media ${Device.tablet} {
    grid-template-columns: 1fr;

    .metrica {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }
`;