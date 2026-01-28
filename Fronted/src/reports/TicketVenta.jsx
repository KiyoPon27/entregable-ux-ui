import { numeroALetras, urlToBase64 } from "../utils/Conversiones";
import createPdf from "../utils/CreatePdf";

const TicketVenta = async (output, data) => {
  console.log("🎫 Generando ticket con datos:", {
    empresa: data.dataempresa?.nombre,
    venta: data.dataventas,
    productos: data.productos?.length,
    montoTotal: data.dataventas?.montoTotal
  });

  // Validar datos críticos
  if (!data.dataventas?.montoTotal) {
    console.error("❌ Error: No hay montoTotal en dataventas", data.dataventas);
    throw new Error("No se puede generar el ticket sin monto total");
  }

  const fechaCompleta = data.dataventas?.fecha;
  const fechaObj = new Date(fechaCompleta);
  const simboloMoneda = data.dataempresa?.simbolo_moneda || "S/";
  
  // Usar nombre_moneda de la configuración
  const nombreMoneda = data.dataempresa?.nombre_moneda || "Soles";
  const textoTotal = numeroALetras(data.dataventas?.montoTotal, nombreMoneda);
  
  const fecha = fechaObj.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const hora = fechaObj.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  
  // Procesar logo: si es base64, usarlo directamente; si es URL, convertirlo
  let logoempresa;
  try {
    if (data.dataempresa?.logo && data.dataempresa.logo !== "-") {
      if (data.dataempresa.logo.startsWith("data:image")) {
        // Ya es base64
        console.log("✅ Usando logo base64 de la configuración");
        logoempresa = data.dataempresa.logo;
      } else {
        // Es una URL, convertir a base64
        console.log("🔄 Convirtiendo logo desde URL");
        logoempresa = await urlToBase64(data.dataempresa.logo);
      }
    } else {
      // Logo por defecto si no hay
      console.log("⚠️ No hay logo configurado, usando placeholder");
      logoempresa = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="; // Pixel transparente
    }
  } catch (error) {
    console.error("❌ Error al procesar logo:", error);
    logoempresa = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  }
  const productTableBody = [
    [
      { text: "CANT.", style: "tProductsHeader", alignment: "center" },
      { text: "DESCRIPCIÓN", style: "tProductsHeader", alignment: "left" },
      { text: "PRECIO", style: "tProductsHeader", alignment: "right" },
      { text: "TOTAL", style: "tProductsHeader", alignment: "right" },
    ],
    ...data.productos.map((item) => [
      { text: item.cantidad || 1, style: "tProductsBody", alignment: "center" },
      { 
        text: item.productos?.nombre || "Producto", 
        style: "tProductsBody", 
        alignment: "left" 
      },
      {
        text: `${simboloMoneda} ${Number(item.precio_venta || 0).toFixed(2)}`,
        style: "tProductsBody",
        alignment: "right",
      },
      { 
        text: `${simboloMoneda} ${Number(item.total || 0).toFixed(2)}`, 
        style: "tProductsBody", 
        alignment: "right" 
      },
    ]),
  ];

  const content = [
    //DATA EMPRESA - LOGO Y DATOS FISCALES
    ...(data.dataempresa?.logo && data.dataempresa.logo !== "-" 
      ? [{
          image: logoempresa,
          width: 120,
          alignment: "center",
          margin: [0, 0, 0, 5],
        }]
      : [{
          text: data.dataempresa?.nombre || "EMPRESA",
          style: "logoPlaceholder",
          margin: [0, 0, 0, 5],
        }]
    ),
    {
      text: data.dataempresa?.nombre || "Empresa",
      style: "header",
      margin: [0, 5, 0, 2],
    },
    {
      text: `RUC: ${data.dataempresa?.id_fiscal || data.dataempresa?.idFiscal || "Sin RUC"}`,
      style: "subheader",
      margin: [0, 2, 0, 2],
    },
    {
      text: data.dataempresa?.direccionFiscal || data.dataempresa?.direccion_fiscal || "Sin dirección",
      style: "subheader",
      margin: [0, 2, 0, 5],
    },

    //TIPO Y NUMERO DOCUMENTO
    { 
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, dash: { length: 3 } }],
      margin: [0, 5, 0, 5]
    },
    { text: data.nombreComprobante, style: "comprobante", margin: [0, 5, 0, 2] },
    {
      text: data.dataventas?.nroComprobante,
      style: "numeroComprobante",
      margin: [0, 2, 0, 5],
    },
    { 
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, dash: { length: 3 } }],
      margin: [0, 5, 0, 10]
    },

    //DATOS CEBECERA FACTURAR

    {
      margin: [0, 10, 0, 0],
      table: {
        widths: ["25%", "35%", "15%", "25%"],
        body: [
          [
            { text: "FECHA:", style: "tHeaderLabel" },
            { text: fecha, style: "tHeaderValue" },
            { text: "HORA:", style: "tHeaderLabel" },
            { text: hora, style: "tHeaderValue" },
          ],
          [
            { text: "CAJERO:", style: "tHeaderLabel" },
            { text: data.nombrecajero, style: "tHeaderValue", colSpan: 3 },
            {},
            {},
          ],

          //DATOS CLIENTE
          [
            {
              text: "CLIENTE: ",
              style: "tTotals",
              alignment: "left",
              colSpan: 4,
              margin: [0, 6, 0, 0],
            },
            {},
            {},
            {},
          ],
          [
            { text: "NOMBRES: ", style: "tClientLabel" },
            {
              text: data.dataCliente?.nombres || "Publico General",
              style: "tClientValue",
              colSpan: 3,
            },
            {},
            {},
          ],
          [
            { text: "DOC.ID: ", style: "tClientLabel" },
            {
              text: data.dataCliente?.identificador_fiscal || "-",
              style: "tClientValue",
              colSpan: 3,
            },
            {},
            {},
          ],
        ],
      },
      layout: "noBorders",
    },
    //TABLA PRODUCTOS
    {
      margin: [0, 10, 0, 0],
      table: {
        widths: ["15%", "40%", "22.5%", "22.5%"],
        headerRows: 1,
        body: productTableBody,
      },
      layout: {
        hLineWidth: function (i, node) {
          return i === 0 || i === 1 ? 0.5 : 0;
        },
        vLineWidth: function (i, node) {
          return 0;
        },
        hLineColor: function () {
          return "#a9a9a9";
        },
      },
    },
    //TOTALES
    {
      margin: [0, 10, 0, 0],
      table: {
        widths: ["50%", "50%"],
        body: [
          [
            { text: "SUBTOTAL:", style: "tTotals", alignment: "right" },
            { 
              text: `${simboloMoneda} ${Number(data.dataventas?.subTotal || 0).toFixed(2)}`, 
              style: "tTotals", 
              alignment: "right" 
            },
          ],
          [
            { 
              text: `${data.dataempresa?.impuesto || "IGV"} (${data.dataempresa?.valor_impuesto || 0}%):`, 
              style: "tTotals", 
              alignment: "right" 
            },
            {
              text: `${simboloMoneda} ${Number(data.dataventas?.totalImpuestos || 0).toFixed(2)}`,
              style: "tTotals",
              alignment: "right"
            },
          ],
          [
            { text: "TOTAL:", style: "tTotalFinal", alignment: "right" },
            { 
              text: `${simboloMoneda} ${Number(data.dataventas?.montoTotal || 0).toFixed(2)}`, 
              style: "tTotalFinal", 
              alignment: "right" 
            },
          ],
        ],
      },
      layout: "noBorders",
    },
    
    //IMPORTE EN LETRAS
    {
      margin: [0, 10, 0, 0],
      table: {
        widths: ["100%"],
        body: [
          [
            {
              text: "IMPORTE EN LETRAS:",
              style: "tTotals",
              alignment: "left",
            },
          ],
          [
            {
              text: textoTotal,
              style: "tProductsBody",
            },
          ],
        ],
      },
      layout: "noBorders",
    },
    
    //FORMA DE PAGO
    {
      margin: [0, 10, 0, 0],
      table: {
        widths: ["50%", "50%"],
        body: [
          [
            {
              text: "FORMA DE PAGO:",
              style: "tTotals",
              alignment: "left",
              colSpan: 2,
            },
            {},
          ],
          ...data.metodosPago?.map((item) => [
            { 
              text: `${item.tipo}:`, 
              style: "tProductsBody", 
              alignment: "right" 
            },
            { 
              text: `${simboloMoneda} ${Number(item.monto || 0).toFixed(2)}`, 
              style: "tProductsBody", 
              alignment: "right" 
            },
          ]) || [],
          ...(data.metodosPago?.find(m => m.tipo === "Efectivo" && m.vuelto > 0)
            ? [[
                { text: "Vuelto:", style: "tProductsBody", alignment: "right" },
                { 
                  text: `${simboloMoneda} ${Number(data.metodosPago.find(m => m.tipo === "Efectivo").vuelto || 0).toFixed(2)}`, 
                  style: "tProductsBody", 
                  alignment: "right" 
                },
              ]]
            : []
          ),
        ],
      },
      layout: "noBorders",
    },
    //NOTA DE PIE - Usar configuración de pie_pagina_ticket
    {
      text: data.dataempresa?.pie_pagina_ticket || data.dataempresa?.piePaginaTicket || "¡Gracias por su compra!",
      style: "header",
      alignment: "center",
      margin: [0, 10, 0, 5],
    },
    //QR FACTURA - Generar con datos de la venta
    {
      stack: [
        {
          qr: `${data.dataempresa?.id_fiscal || data.dataempresa?.idFiscal || ""}|${data.nombreComprobante}|${data.dataventas?.nroComprobante}|${fecha}|${data.dataventas.montoTotal}|${data.dataventas?.subTotal}|${data.dataventas?.totalImpuestos}`,
          fit: 115,
          alignment: "center",
          eccLevel: "Q",
          margin: [0, 5, 0, 3],
        },
        {
          text: "Representación impresa del comprobante original.",
          style: "text",
        },
        {
          text: "Escanea el QR para verificar el comprobante",
          style: "text",
          margin: [0, 0, 0, 4],
        },
      ],
    },
  ];

  //estilos
  const styles = {
    header: {
      fontSize: 10,
      bold: true,
      alignment: "center",
    },
    subheader: {
      fontSize: 8,
      alignment: "center",
    },
    logoPlaceholder: {
      fontSize: 16,
      bold: true,
      alignment: "center",
      color: "#666666",
    },
    comprobante: {
      fontSize: 11,
      bold: true,
      alignment: "center",
    },
    numeroComprobante: {
      fontSize: 10,
      bold: true,
      alignment: "center",
    },
    tHeaderLabel: {
      fontSize: 8,
      alignment: "right",
    },
    tHeaderValue: {
      fontSize: 8,
      bold: true,
    },
    tProductsHeader: {
      fontSize: 8.5,
      bold: true,
    },
    tProductsBody: {
      fontSize: 9,
    },
    tTotals: {
      fontSize: 9,
      bold: true,
      alignment: "right",
    },
    tTotalFinal: {
      fontSize: 10,
      bold: true,
      alignment: "right",
    },
    tClientLabel: {
      fontSize: 8,
      alignment: "right",
    },
    tClientValue: {
      fontSize: 8,
      bold: true,
    },
    text: {
      fontSize: 8,
      alignment: "center",
    },
    link: {
      fontSize: 8,
      bold: true,
      margin: [0, 0, 0, 4],
      alignment: "center",
    },
  };
  
  console.log("✅ Ticket generado exitosamente");
  const response = await createPdf({ content, styles }, output);
  return response;
};
export default TicketVenta;
