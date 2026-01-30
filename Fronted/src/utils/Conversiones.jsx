
export function ConvertirCapitalize(input) {
    return (input.charAt(0).toUpperCase()+input.slice(1).toLowerCase());
  }
  export function ConvertirMinusculas(input){
    return input.toLowerCase()
  }
  export function FormatearNumeroDinero(numero, currency, iso) {
    if (currency === undefined) {
      return "";
    }
    // Si el número es null o undefined, usar 0
    const safeNumber = (typeof numero === "number" && !isNaN(numero)) ? numero : 0;
    const esiso = "es-" + iso;
    try {
      return safeNumber.toLocaleString(esiso, { style: "currency", currency: `${currency}` });
    } catch (e) {
      return safeNumber.toLocaleString("es-PE", { style: "currency", currency: "PEN" });
    }
  }
  export  const urlToBase64 = async(imageUrl)=>{
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const reader = new FileReader()
    return new Promise ((resolve,reject)=>{
      reader.onloadend=()=>{
        resolve(reader.result)
      }
      reader.onerror = reject;
      reader.readAsDataURL(blob)
    })
  }
  export function numeroALetras(num, nombreMoneda = "SOLES") {
    // Validar entrada
    if (num === undefined || num === null || isNaN(num)) {
      console.error("❌ numeroALetras recibió un valor inválido:", num);
      return `SON: CERO CON 00/100 ${nombreMoneda.toUpperCase()}`;
    }

    const unidades = ["", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
    const decenas = ["", "", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
    const centenas = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];
    const especiales = {
      10: "DIEZ", 11: "ONCE", 12: "DOCE", 13: "TRECE", 14: "CATORCE", 15: "QUINCE",
      16: "DIECISÉIS", 17: "DIECISIETE", 18: "DIECIOCHO", 19: "DIECINUEVE",
      21: "VEINTIUNO", 22: "VEINTIDÓS", 23: "VEINTITRÉS", 24: "VEINTICUATRO", 25: "VEINTICINCO",
      26: "VEINTISÉIS", 27: "VEINTISIETE", 28: "VEINTIOCHO", 29: "VEINTINUEVE"
    };
  
    const [entero, decimal] = Number(num).toFixed(2).split(".");
    const n = parseInt(entero, 10);
  
    let texto = "";
  
    if (n === 0) {
      texto = "CERO";
    } else if (n < 10) {
      texto = unidades[n];
    } else if (n < 30) {
      texto = especiales[n] || decenas[2];
    } else if (n < 100) {
      const dec = Math.floor(n / 10);
      const uni = n % 10;
      texto = decenas[dec];
      if (uni > 0) texto += " Y " + unidades[uni];
    } else if (n < 1000) {
      const cen = Math.floor(n / 100);
      const resto = n % 100;
      texto = (n === 100) ? "CIEN" : centenas[cen];
      if (resto > 0) {
        if (resto < 10) texto += " " + unidades[resto];
        else if (resto < 30) texto += " " + (especiales[resto] || decenas[2]);
        else {
          const dec = Math.floor(resto / 10);
          const uni = resto % 10;
          texto += " " + decenas[dec];
          if (uni > 0) texto += " Y " + unidades[uni];
        }
      }
    } else if (n < 1000000) {
      const miles = Math.floor(n / 1000);
      const resto = n % 1000;
      if (miles === 1) {
        texto = "MIL";
      } else {
        texto = numeroALetras(miles, "").replace(/^SON: |CON .*$/g, "").trim() + " MIL";
      }
      if (resto > 0) {
        texto += " " + numeroALetras(resto, "").replace(/^SON: |CON .*$/g, "").trim();
      }
    } else {
      // Para números muy grandes, usar formato simplificado
      texto = n.toLocaleString("es-PE");
    }
  
    return `SON: ${texto} CON ${decimal}/100 ${nombreMoneda.toUpperCase()}`;
  }
  