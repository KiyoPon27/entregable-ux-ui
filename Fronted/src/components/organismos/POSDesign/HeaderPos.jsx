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

import { useFormattedDate } from "../../../hooks/useFormattedDate";
import { useCierreCajaStore } from "../../../store/CierreCajaStore";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { SelectList } from "../../ui/lists/SelectList";
import { useStockStore } from "../../../store/StockStore";
import { useEliminarVentasIncompletasMutate } from "../../../tanstack/VentasStack";


export function HeaderPos() {
  const [stateLectora, setStateLectora] = useState(true);
  const [cantidadInput, setCantidadInput] = useState(1);
  const [stateTeclado, setStateTeclado] = useState(false);
  const [stateListaproductos, setStateListaproductos] = useState(false);
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
  const { mutate } = useEliminarVentasIncompletasMutate();
  useEffect(() => {
    buscadorRef.current.focus();
    mutate()
  }, []);

  // global barcode scanner: when a code is read, try to find the product and add it
  useBarcodeScanner((code) => {
    console.log("📷 Barcode escaneado:", code);
    try {
      const productoEncontrado = dataProductos?.find(
        (p) => String(p.codigoBarras) === String(code)
      );
      console.log("📷 Producto encontrado por barcode:", productoEncontrado);
      if (productoEncontrado) {
        selectProductos(productoEncontrado);
        console.log("📷 Llamando mutationInsertarVentas desde barcode scanner");
        // add product without forcing focus back to buscador
        mutationInsertarVentas({ noFocus: true });
        setBuscador("");
      } else {
        toast.error("Producto no encontrado");
      }
    } catch (err) {
      console.error("❌ barcode handler error", err);
    }
  });
  useEffect(() => {
    let timeout;
    const texto = buscador.trim();
    const isCodigoDeBarras = /^[0-9]{3,}$/.test(texto);
    
    console.log("🔍 useEffect buscador - texto:", texto, "isCodigoDeBarras:", isCodigoDeBarras);
    
    if (isCodigoDeBarras) {
      setStateListaproductos(false);
      timeout = setTimeout(() => {
        console.log("🔍 Buscando producto con código:", texto);
        const productoEncontrado = dataProductos?.find(
          (p) => p.codigoBarras === texto
        );
        console.log("🔍 Producto encontrado:", productoEncontrado);
        if (productoEncontrado) {
          selectProductos(productoEncontrado);
          console.log("🔍 Llamando mutationInsertarVentas desde buscador");
          mutationInsertarVentas();
          setBuscador("");
        } else {
          toast.error("Producto no encontrado");
          setBuscador("");
        }
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
  return (
    <Header>
      <ContentSucursal>
        <div>
          <strong>SUCURSAL:&nbsp; </strong>{" "}
          {dataCierreCaja.caja?.sucursales?.nombre}
        </div>
        |
        <div>
          <strong>CAJA:&nbsp; </strong>{" "}
          {dataCierreCaja.caja?.descripcion}
        </div>

      </ContentSucursal>
      <section className="contentprincipal">
        <Contentuser className="area1">
          <div className="textos">
            <span className="usuario">{datausuarios?.nombres} </span>
            <span>🧊{datausuarios?.roles?.nombre} </span>
          </div>
        </Contentuser>

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
              data={dataProductos}
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
