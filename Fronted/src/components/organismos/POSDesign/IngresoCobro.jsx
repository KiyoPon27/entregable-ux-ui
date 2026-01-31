import styled, { createGlobalStyle } from "styled-components";

import { Icon } from "@iconify/react/dist/iconify.js";
import { InputText } from "../formularios/InputText";
import { FormatearNumeroDinero } from "../../../utils/Conversiones";
import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Btn1 } from "../../moleculas/Btn1";
import { useUsuariosStore } from "../../../store/UsuariosStore";
import { useSucursalesStore } from "../../../store/SucursalesStore";
import { useEmpresaStore } from "../../../store/EmpresaStore";
import { useVentasStore } from "../../../store/VentasStore";
import { useDetalleVentasStore } from "../../../store/DetalleVentasStore";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PanelBuscador } from "./PanelBuscador";
import { useClientesProveedoresStore } from "../../../store/ClientesProveedoresStore";
import { useMetodosPagoStore } from "../../../store/MetodosPagoStore";
import { useCierreCajaStore } from "../../../store/CierreCajaStore";
import { useMovCajaStore } from "../../../store/MovCajaStore";
import { useFormattedDate } from "../../../hooks/useFormattedDate";
import { useAsignacionCajaSucursalStore } from "../../../store/AsignacionCajaSucursalStore";
import { useSerializacionStore } from "../../../store/SerializacionStore";
import { useImpresorasStore } from "../../../store/ImpresorasStore";
import ticket from "../../../reports/TicketVenta";
import { RegistrarClientesProveedores } from "../formularios/RegistrarClientesProveedores";
import { useGlobalStore } from "../../../store/GlobalStore";
const GlobalErrorInputStyle = createGlobalStyle`
  .error-input {
      border: 2px solid #e57373 !important;
      background: #fff6f6 !important;
      box-shadow: 0 0 0 2px #ffcdd2, 0 2px 8px rgba(229, 115, 115, 0.08);
      transition: border 0.2s, box-shadow 0.2s;
      animation: shakeError 0.18s 1;
  }
    @keyframes shakeError {
      0% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      50% { transform: translateX(4px); }
      75% { transform: translateX(-2px); }
      100% { transform: translateX(0); }
    }
`;

export const IngresoCobro = forwardRef((props, ref) => {
  // Estado para saber si se visitó SUNAT (ya no se usará para bloquear el botón de cobrar)
  // Inyectar estilos globales para error-input
  // styled-components se encarga de no duplicar
  // eslint-disable-next-line react/jsx-no-undef
  // eslint-disable-next-line react/jsx-pascal-case
  // eslint-disable-next-line no-unused-expressions

  const [sunatVisitado, setSunatVisitado] = useState(false);
  // Estado para advertencia de confirmación
  // Eliminado showConfirm, no se requiere confirmación extra
  const fechaActual = useFormattedDate();
  const {
    tipocobro,
    items,
    setStatePantallaCobro,
    resetState,
    confirmarVenta,
    dataventaconfirmada,
  } = useVentasStore();
  const { total } = useDetalleVentasStore();
  //Valores a calcular
  const [stateBuscadorClientes, setStateBuscadorClientes] = useState(false);
  const [precioVenta, setPrecioVenta] = useState(total);
  const [valoresPago, setValoresPago] = useState({});
  const [valorTarjeta, setValorTarjeta] = useState(
    tipocobro === "tarjeta" ? total : 0
  );
  const [valorEfectivo, setValorEfectivo] = useState(
    tipocobro === "efectivo" ? total : 0
  );
  const [valorCredito, setValorCredito] = useState(
    tipocobro === "credito" ? total : 0
  );
  //Valores a mostrar
  const [vuelto, setVuelto] = useState(0);
  const [restante, setRestante] = useState(0);
  //datos de tipos de pago
  const { dataMetodosPago } = useMetodosPagoStore();
  //datos de la store
  const { datausuarios } = useUsuariosStore();
  const { sucursalesItemSelectAsignadas } = useAsignacionCajaSucursalStore();
  const { dataempresa } = useEmpresaStore();
  const { idventa, insertarVentas } = useVentasStore();
  const { datadetalleventa } = useDetalleVentasStore();
  const { dataComprobantes, itemComprobanteSelect, setItemComprobanteSelect } =
    useSerializacionStore();
  //mostrar data de impresoras por usuario y estado local de imprimir directo
  const { dataImpresorasPorUsuario, statePrintDirecto } = useImpresorasStore();
  // Estados para RUC/DNI y Número de Comprobante
  const [rucDni, setRucDni] = useState("");
  const [nroComprobante, setNroComprobante] = useState("");
  // Estados para errores de validación
  const [errorRucDni, setErrorRucDni] = useState("");
  //#region Clientes
  const {
    buscarCliPro,
    setBuscador,
    buscador,
    selectCliPro,
    cliproItemSelect,
  } = useClientesProveedoresStore();
  const queryClient = useQueryClient();
  const { data: dataBuscadorcliente, isLoading: isloadingBuscadorCliente } =
    useQuery({
      queryKey: ["buscar cliente", [dataempresa?.id, "cliente", buscador]],
      queryFn: () =>
        buscarCliPro({
          id_empresa: dataempresa?.id,
          tipo: "cliente",
          buscador: buscador,
        }),
      enabled: !!dataempresa,
      refetchOnWindowFocus: false,
    });
  //#endregion
  //Mostrar cierres de caja
  const { dataCierreCaja } = useCierreCajaStore();
  // Función para calcular vuelto y restante
  //Movientos de caja
  const { insertarMovCaja } = useMovCajaStore();
  const calcularVueltoYRestante = () => {
    const totalPagado = Object.values(valoresPago).reduce(
      (acc, curr) => acc + curr,
      0
    );
    const totalSinEfectivo = totalPagado - (valoresPago["Efectivo"] || 0);
    // Si el total sin efectivo excede el precio de venta, no permitir el exceso
    if (totalSinEfectivo > precioVenta) {
      setVuelto(0);
      setRestante(precioVenta - totalSinEfectivo); //Restante negativo para indicar que se excede sin efectivo
    } else {
      // Permitir el exceso solo si es en efectivo
      if (totalPagado >= precioVenta) {
        const exceso = totalPagado - precioVenta;
        setVuelto(valoresPago["Efectivo"] ? exceso : 0);
        setRestante(0);
      } else {
        // Si el total pagado no cubre el precio de venta, calcular el restante
        setVuelto(0);
        setRestante(precioVenta - totalPagado);
      }
    }
  };
  //Manejadores de cambio
  const handleChangePago = (tipo, valor) => {
    setValoresPago((prev) => ({
      ...prev,
      [tipo]: parseFloat(valor) || 0,
    }));
    console.log(valoresPago);
    //{100,50,10}
  };
  // Exponiendo la función mutation a través de ref
  useImperativeHandle(ref, () => ({
    mutateAsync: mutation.mutateAsync,
  }));
  //Funcion para realizar la venta
  const mutation = useMutation({
    mutationKey: "insertar ventas",
    mutationFn: ConfirmarVenta,
    onSuccess: () => {
      if (restante != 0) {
        return;
      }
      resetState();
      queryClient.invalidateQueries(["mostrar detalle venta"]);
      toast.success("🎉 venta generada correctamente!!!");
    },
  });
  async function ConfirmarVenta() {
    // Validar campos requeridos solo para Factura y Boleta, no para Ticket
    const tipoComprobanteNombre = itemComprobanteSelect?.tipoComprobante?.nombre;
    
    // Solo validar RUC/DNI para Factura y Boleta (no obligatorio el nro de comprobante)
    if (tipoComprobanteNombre !== "Ticket") {
      if (!rucDni || rucDni.trim() === "") {
        toast.error(`El campo ${tipoComprobanteNombre === "Factura" ? "RUC" : "DNI"} es obligatorio`);
        return;
      }
      // Validar formato de RUC/DNI
      if (tipoComprobanteNombre === "Factura" && rucDni.length !== 11) {
        toast.error("El RUC debe tener 11 dígitos");
        return;
      }
      if (tipoComprobanteNombre === "Boleta" && rucDni.length !== 8) {
        toast.error("El DNI debe tener 8 dígitos");
        return;
      }
    }
    
    if (restante === 0) {
      // Obtener el monto pagado en efectivo
      const montoEfectivo = valoresPago["Efectivo"] || 0;
      const pventas = {
        _id_venta: idventa,
        idUsuario: datausuarios?.id,
        _vuelto: vuelto,
        _id_tipo_comprobante: itemComprobanteSelect?.tipoComprobante?.id,
        _serie: itemComprobanteSelect?.serie,
        idSucursal: dataCierreCaja?.caja?.id_sucursal,
        _id_cliente: cliproItemSelect?.id || null,
        _fecha: fechaActual,
        _monto_total: total,
        pagoCon: montoEfectivo,
      };
      
      // Agregar ruc/dni si NO es Ticket. No enviar nro de comprobante (se genera en backend)
      if (tipoComprobanteNombre !== "Ticket") {
        pventas._ruc_dni = rucDni;
      }

      // Eliminada confirmación para Factura/Boleta, el flujo es igual para todos
      console.log("confirmarVenta", pventas);
      const dataVentaConfirmada = await confirmarVenta(pventas);
      const nuevosMetodosPago = [];
      // Insertar en MovCaja solo los métodos de pago con monto mayor a 0
      for (const [tipo, monto] of Object.entries(valoresPago)) {
        if (monto > 0) {
          const metodoPago = dataMetodosPago.find(
            (item) => item.nombre === tipo
          );
          // Si es efectivo, solo ingresar en caja el monto neto (pago - vuelto)
          if (tipo === "Efectivo") {
            const montoNeto = Number(monto) - Number(vuelto || 0);
            const pmovcajaVenta = {
              tipo_movimiento: "VENTA",
              monto: montoNeto > 0 ? montoNeto : 0,
              id_metodo_pago: metodoPago?.id,
              descripcion: `Pago de venta con ${tipo}`,
              id_usuario: datausuarios?.id,
              id_cierre_caja: dataCierreCaja?.id,
              id_ventas: idventa,
              vuelto: 0,
            };
            await insertarMovCaja(pmovcajaVenta);

            // Registrar el vuelto como salida si aplica
            if (Number(vuelto) > 0) {
              const pmovcajaVuelto = {
                tipo_movimiento: "salida",
                monto: Number(vuelto),
                id_metodo_pago: metodoPago?.id,
                descripcion: `Vuelto por venta`,
                id_usuario: datausuarios?.id,
                id_cierre_caja: dataCierreCaja?.id,
                id_ventas: idventa,
              };
              await insertarMovCaja(pmovcajaVuelto);
            }

            nuevosMetodosPago.push({ tipo, monto, vuelto });
          } else {
            const pmovcaja = {
              tipo_movimiento: "VENTA",
              monto: monto,
              id_metodo_pago: metodoPago?.id,
              descripcion: `Pago de venta con ${tipo}`,
              id_usuario: datausuarios?.id,
              id_cierre_caja: dataCierreCaja?.id,
              id_ventas: idventa,
              vuelto: 0,
            };
            await insertarMovCaja(pmovcaja);
            nuevosMetodosPago.push({ tipo, monto, vuelto: 0 });
          }
        }
      }
      const pPrint = {
        dataempresa: dataempresa,
        productos: datadetalleventa,
        dataventas: {
          ...dataVentaConfirmada,
          _ruc_dni: rucDni || dataVentaConfirmada?._ruc_dni || dataVentaConfirmada?.ruc_dni,
        },
        nombreComprobante: itemComprobanteSelect?.tipoComprobante?.nombre,
        nombrecajero: datausuarios?.nombres,
        dataCliente: cliproItemSelect,
        metodosPago: nuevosMetodosPago,
      };
      // Usar el estado local `statePrintDirecto` para decidir el comportamiento
      // Esto permite que desde la pantalla de cobro se desactive temporalmente
      // la impresión directa sin sobrescribir la configuración guardada en DB.
      (typeof statePrintDirecto === "boolean" ? statePrintDirecto : dataImpresorasPorUsuario?.estado)
        ? imprimirDirectoTicket(pPrint)
        : imprimirConVentanaEmergente(pPrint);
    } else {
      toast.warning("Falta completar el pago, el restante tiene que ser 0");
    }
  }
  const imprimirConVentanaEmergente = async (p) => {
    console.log("pprint", p);
    await ticket("print", p);
  };
  const imprimirDirectoTicket = async (p) => {
    if (!dataImpresorasPorUsuario?.nombre || dataImpresorasPorUsuario?.nombre === "-") {
      return toast.error(
        "Impresora no configurada. Ve a Configuración → Impresoras para seleccionar tu impresora"
      );
    }
    const response = await ticket("b64", p);
    // Convertir el contenido base64 en un archivo Blob
    const binaryString = atob(response.content);
    const binaryLen = binaryString.length;
    const bytes = new Uint8Array(binaryLen);
    for (let i = 0; i < binaryLen; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: "application/pdf" });
    // Crear un archivo simulando un archivo subido
    const file = new File([blob], "GeneratedTicket.pdf", {
      type: "application/pdf",
    });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("printerName", dataImpresorasPorUsuario?.nombre);
    const responseApi = await fetch("http://localhost:5075/api/print-ticket", {
      method: "POST",
      body: formData,
    });
    if (responseApi.ok) {
      toast.success("El PDF se envió a imprimir correctamente.");

    }else{
      const error = await responseApi.text();
      toast.error("Error al imprimir" + error);
    }

  };
  const { setTipo: setTipocliente } = useClientesProveedoresStore();
  const { setStateClose, setAccion, stateClose, accion, setIsExploding } =
    useGlobalStore();
  function registrarNuevoCliente() {
    const tipo = "cliente";
    setTipocliente(tipo);
    setAccion("Nuevo");
    setStateClose(true);
  }
  //useEffect para recalcular cuando los valores cambian
  useEffect(() => {
    if (tipocobro !== "Mixto" && valoresPago[tipocobro] != total) {
      setValoresPago((prev) => ({
        ...prev,
        [tipocobro]: total,
      }));
    }
  }, [tipocobro, total]);
  useEffect(() => {
    calcularVueltoYRestante();
  }, [precioVenta, tipocobro, valoresPago]);
  
  // Limpiar campos y advertencias de error cuando cambia el tipo de comprobante
  useEffect(() => {
    setRucDni("");
    setNroComprobante("");
    setErrorRucDni("");
  }, [itemComprobanteSelect]);
  
  // Lógica para mostrar/ocultar botón SUNAT y texto dinámico
  const tipoComprobante = itemComprobanteSelect?.tipoComprobante?.nombre;
  const mostrarBotonSunat = tipoComprobante === "Factura" || tipoComprobante === "Boleta";
  const textoBotonSunat = tipoComprobante === "Factura" ? "Factura SUNAT" : tipoComprobante === "Boleta" ? "Boleta SUNAT" : "";
  // El botón de cobrar siempre está habilitado
  const cobrarHabilitado = true;

  return (
    <>
      <GlobalErrorInputStyle />
      <Container className={tipocobro === "Mixto" ? "mixto" : ""}>
      {mutation.isPending ? (
        <span>guardando...🐖</span>
      ) : (
        <>
          {mutation.isError && <span>error: {mutation.error.message}</span>}
          <section className="area1">
            <span className="tipocobro">{tipocobro}</span>
            <section>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {itemComprobanteSelect?.tipoComprobante?.nombre || 'COMPROBANTE'}:{" "}
                <strong>
                  {itemComprobanteSelect?.serie}-
                  {itemComprobanteSelect?.correlativo}{" "}
                </strong>{" "}
              </span>
            </section>

            <section className="areacomprobantes">
              {dataComprobantes?.map((item, index) => {
                const isSelected = itemComprobanteSelect?.id === item?.id;
                const nombre = item?.tipoComprobante?.nombre;
                // Definir orden: Factura=1, Boleta=2, Ticket=3
                const orderValue = nombre === "Factura" ? 1 : nombre === "Boleta" ? 2 : 3;
                return (
                  <ComprobanteBox 
                    key={index}
                    $isSelected={isSelected}
                    $order={orderValue}
                    onClick={() => setItemComprobanteSelect(item)}
                  >
                    <div className="comprobante-icon">
                      <Icon 
                        icon={
                          nombre === "Factura" 
                            ? "mdi:invoice-text-outline" 
                            : nombre === "Boleta"
                            ? "mdi:receipt-text-outline" 
                            : "mdi:ticket-percent-outline"
                        } 
                      />
                    </div>
                    <div className="comprobante-info">
                      <span className="comprobante-nombre">
                        {nombre}
                      </span>
                    </div>
                  </ComprobanteBox>
                );
              })}
            </section>
            
            {/* Inputs para RUC/DNI y Número de Comprobante - Solo visible para Factura y Boleta */}
            {itemComprobanteSelect?.tipoComprobante?.nombre !== "Ticket" && (
              <section className="area-datos-comprobante">
                <InputText textalign="left">
                  <input
                    onChange={(e) => {
                      // Solo permitir números
                      const soloNumeros = e.target.value.replace(/[^0-9]/g, "");
                      setRucDni(soloNumeros);
                      setErrorRucDni("");
                    }}
                    value={rucDni}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className={`form__field${errorRucDni ? ' error-input' : ''}`}
                    type="text"
                    placeholder=" "
                    maxLength={itemComprobanteSelect?.tipoComprobante?.nombre === "Factura" ? 11 : 8}
                  />
                  <label className="form__label">
                    {itemComprobanteSelect?.tipoComprobante?.nombre === "Factura" ? "RUC" : "DNI"}
                  </label>
                  {errorRucDni && <span style={{ color: '#d32f2f', fontSize: '13px' }}>{errorRucDni}</span>}
                </InputText>
              </section>
            )}
            
            <span>cliente</span>
            <EditButton
              onClick={() => setStateBuscadorClientes(!stateBuscadorClientes)}
            >
              <Icon className=" icono" icon="lets-icons:edit-fill" />
            </EditButton>
            <span className="cliente">{cliproItemSelect?.nombres}</span>
          </section>
          <Linea />
          <section className="area2">
            {dataMetodosPago?.map((item, index) => {
              return (tipocobro === "Mixto" && item.nombre !== "Mixto") ||
                (tipocobro === item.nombre && item.nombre !== "Mixto") ? (
                <InputText textalign="center" key={index}>
                  <input
                    onChange={(e) =>
                      handleChangePago(item.nombre, e.target.value)
                    }
                    defaultValue={tipocobro === item.nombre ? total : ""}
                    className="form__field"
                    type="number"
                    disabled={
                      tipocobro === "Mixto" || tipocobro === "Efectivo"
                        ? false
                        : true
                    }
                  />
                  <label className="form__label">{item.nombre} </label>
                </InputText>
              ) : null;
            })}
          </section>
          <Linea />
          <section className="area3">
            <article className="etiquetas">
              <span className="total">Total: </span>
              <span>Vuelto: </span>
              <span>Restante: </span>
            </article>
            <article>
              <span className="total">
                {FormatearNumeroDinero(
                  total,
                  dataempresa?.currency,
                  dataempresa?.iso
                )}
              </span>
              <span>
                {FormatearNumeroDinero(
                  vuelto,
                  dataempresa?.currency,
                  dataempresa?.iso
                )}
              </span>
              <span>
                {FormatearNumeroDinero(
                  restante,
                  dataempresa?.currency,
                  dataempresa?.iso
                )}
              </span>
            </article>
          </section>
          <Linea />
          <section className="area4">
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              {/* Botón SUNAT interno eliminado, solo queda COBRAR */}
              <Btn1
                funcion={() => {
                  // Validación previa: solo validar RUC/DNI para Factura/Boleta
                    setErrorRucDni("");
                    if (tipoComprobante === "Factura" || tipoComprobante === "Boleta") {
                      if (!rucDni.trim()) {
                        setErrorRucDni(`El campo ${tipoComprobante === "Factura" ? "RUC" : "DNI"} es obligatorio`);
                        return;
                      }
                      if (tipoComprobante === "Factura" && rucDni.length !== 11) {
                        setErrorRucDni("El RUC debe tener 11 dígitos");
                        return;
                      }
                      if (tipoComprobante === "Boleta" && rucDni.length !== 8) {
                        setErrorRucDni("El DNI debe tener 8 dígitos");
                        return;
                      }
                    }
                  // El flujo de cobro es directo para todos los comprobantes
                  mutation.mutateAsync();
                }}
                border="2px"
                titulo="COBRAR (enter)"
                bgcolor="#0aca21"
                color="#ffffff"
                width={"100%"}
                disabled={false}
              />
            </div>

            {/* Modal de confirmación eliminado, el flujo de cobro es directo para todos los comprobantes */}
          </section>
          {stateBuscadorClientes && (
            <PanelBuscador
              funcion={registrarNuevoCliente}
              selector={selectCliPro}
              setBuscador={setBuscador}
              displayField="nombres"
              data={dataBuscadorcliente}
              setStateBuscador={() =>
                setStateBuscadorClientes(!stateBuscadorClientes)
              }
            />
          )}
          {stateClose && (
            <RegistrarClientesProveedores
              setIsExploding={setIsExploding}
              accion={accion}
              onClose={() => setStateClose(false)}
            />
          )}
        </>
      )}
      </Container>
    </>
  );
});
const Container = styled.div`
  position: relative;
  box-sizing: border-box;
  width: 100%;
  max-width: 420px;
  margin-top: 1.5rem;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 2px 2px 15px 0px #e2e2e2;
  gap: 12px;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  color: #000;
  min-height: auto;
  align-items: center;
  justify-content: center;
  font-size: 20px;

  input {
    color: #000 !important;
    font-weight: 700;
  }
  &:before,
  &:after {
    content: "";
    position: absolute;
    left: 10px;
    right: 10px;
    height: 6px;
    width: calc(100% - 20px);
    max-width: calc(100% - 20px);
  }
  &:before {
    top: -5px;
    background: radial-gradient(
        circle,
        transparent,
        transparent 50%,
        #fbfbfb 50%,
        #fbfbfb 100%
      ) -7px -8px / 16px 16px repeat-x;
  }
  &:after {
    bottom: -5px;
    background: radial-gradient(
        circle,
        transparent,
        transparent 50%,
        #fbfbfb 50%,
        #fbfbfb 100%
      ) -7px -2px / 16px 16px repeat-x;
  }
  .area1 {
    display: flex;
    flex-direction: column;
    align-items: center;
    .areacomprobantes {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      padding: 10px 0;
      width: 100%;
      justify-content: center;
    }
    .area-datos-comprobante {
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 100%;
      padding: 10px 0;
      
      input {
        font-size: 18px;
      }
    }
    .tipocobro {
      position: absolute;
      right: 6px;
      top: 6px;
      background-color: rgba(233, 6, 184, 0.2);
      padding: 5px;
      color: #e61eb1;
      border-radius: 5px;
      font-size: 15px;
      font-weight: 650;
    }
    .cliente {
      font-weight: 700;
    }
  }
  .area2 {
    input {
      font-size: 40px;
    }
  }

  /* Styles applied only when payment type is Mixto */
  &.mixto {
    .area2 {
      max-height: 260px;
      overflow-y: auto;
      width: 100%;
      padding-right: 12px;
    }
    .area2 input {
      font-size: 30px;
    }
    /* thinner scrollbar for mixto list */
    .area2::-webkit-scrollbar {
      width: 8px;
    }
    .area2::-webkit-scrollbar-thumb {
      background: rgba(0,0,0,0.2);
      border-radius: 8px;
    }
  }

  /* smaller screens: reduce font sizes and spacing to fit more content */
  @media (max-width: 420px) {
    font-size: 16px;
    padding: 14px;
    .area2 input {
      font-size: 32px;
    }
  }
  @media (max-height: 700px) {
    max-height: calc(100vh - 5rem);
    padding: 12px;
    font-size: 18px;
  }
  .area3 {
    display: flex;
    justify-content: space-between;
    width: 100%;

    article {
      display: flex;
      flex-direction: column;
    }
    .total {
      font-weight: 700;
    }
    .etiquetas {
      text-align: end;
    }
  }
`;

const Linea = styled.span`
  width: 100%;
  border-bottom: dashed 1px #d4d4d4;
`;
const EditButton = styled.button`
  background-color: #62c6f7;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
  .icono {
    font-size: 20px;
  }
`;

const ComprobanteBox = styled.div`
  flex: 1 1 calc(33.33% - 10px);
  min-width: 110px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 18px 12px;
  border-radius: 12px;
  background: ${props => props.$isSelected 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : '#f8f9fa'};
  border: 2px solid ${props => props.$isSelected ? '#5a67d8' : '#dee2e6'};
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.$isSelected 
    ? '0 4px 15px rgba(102, 126, 234, 0.4)' 
    : '0 2px 8px rgba(0, 0, 0, 0.08)'};
  order: ${props => props.$order || 0};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    background: ${props => props.$isSelected 
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
      : '#e9ecef'};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  .comprobante-icon {
    font-size: 40px;
    color: ${props => props.$isSelected ? '#ffffff' : '#495057'};
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .comprobante-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    width: 100%;
  }
  
  .comprobante-nombre {
    font-size: 17px;
    font-weight: 800;
    color: ${props => props.$isSelected ? '#ffffff' : '#212529'};
    text-align: center;
    letter-spacing: 0.3px;
  }
`;
