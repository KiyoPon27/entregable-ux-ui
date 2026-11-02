/**
 * MÓDULO DE VALIDACIONES POS
 * ===========================
 * Funciones críticas de validación para el sistema POS
 * Todas las validaciones son independientes para fácil testing
 */

/**
 * Valida que un RUC tenga exactamente 11 dígitos
 * @param {string} ruc - El RUC a validar
 * @returns {object} { isValid: boolean, error: string|null }
 */
export const validarRUC = (ruc) => {
  if (!ruc) {
    return { isValid: false, error: "RUC es requerido" };
  }

  const rucLimpio = ruc.trim();
  
  if (!rucLimpio) {
    return { isValid: false, error: "RUC no puede estar vacío" };
  }

  if (!/^\d+$/.test(rucLimpio)) {
    return { isValid: false, error: "RUC debe contener solo números" };
  }

  if (rucLimpio.length !== 11) {
    return { isValid: false, error: `RUC debe tener 11 dígitos (tiene ${rucLimpio.length})` };
  }

  return { isValid: true, error: null };
};

/**
 * Valida que un DNI tenga exactamente 8 dígitos
 * @param {string} dni - El DNI a validar
 * @returns {object} { isValid: boolean, error: string|null }
 */
export const validarDNI = (dni) => {
  if (!dni) {
    return { isValid: false, error: "DNI es requerido" };
  }

  const dniLimpio = dni.trim();
  
  if (!dniLimpio) {
    return { isValid: false, error: "DNI no puede estar vacío" };
  }

  if (!/^\d+$/.test(dniLimpio)) {
    return { isValid: false, error: "DNI debe contener solo números" };
  }

  if (dniLimpio.length !== 8) {
    return { isValid: false, error: `DNI debe tener 8 dígitos (tiene ${dniLimpio.length})` };
  }

  return { isValid: true, error: null };
};

/**
 * Valida el RUC/DNI según el tipo de comprobante
 * @param {string} tipoComprobante - "FACTURA" o "BOLETA"
 * @param {string} rucDni - Valor del RUC/DNI
 * @returns {object} { isValid: boolean, error: string|null }
 */
export const validarRucDniPorTipo = (tipoComprobante, rucDni) => {
  if (!tipoComprobante) {
    return { isValid: false, error: "Tipo de comprobante no especificado" };
  }

  const tipo = tipoComprobante.toUpperCase();

  if (tipo === "FACTURA") {
    return validarRUC(rucDni);
  } else if (tipo === "BOLETA") {
    return validarDNI(rucDni);
  } else if (tipo === "TICKET") {
    // Los tickets no requieren RUC/DNI
    return { isValid: true, error: null };
  }

  return { isValid: false, error: "Tipo de comprobante inválido" };
};

/**
 * Valida que el pago sea válido (restante debe ser 0)
 * @param {number} restante - Monto restante a pagar
 * @returns {object} { isValid: boolean, error: string|null }
 */
export const validarPago = (restante) => {
  if (restante === null || restante === undefined) {
    return { isValid: false, error: "Restante no disponible" };
  }

  if (typeof restante !== 'number') {
    return { isValid: false, error: "Restante debe ser un número" };
  }

  if (restante !== 0) {
    return { 
      isValid: false, 
      error: "Falta completar el pago. Restante no es 0" 
    };
  }

  return { isValid: true, error: null };
};

/**
 * Valida que el monto total sea válido
 * @param {number} monto - Monto a validar
 * @returns {object} { isValid: boolean, error: string|null }
 */
export const validarMonto = (monto) => {
  if (monto === null || monto === undefined) {
    return { isValid: false, error: "Monto no especificado" };
  }

  if (typeof monto !== 'number') {
    return { isValid: false, error: "Monto debe ser un número" };
  }

  if (monto < 0) {
    return { isValid: false, error: "Monto no puede ser negativo" };
  }

  if (monto === 0) {
    return { isValid: false, error: "Monto debe ser mayor a 0" };
  }

  return { isValid: true, error: null };
};

/**
 * Calcula el vuelto correctamente
 * @param {number} pagado - Monto pagado
 * @param {number} total - Monto total a pagar
 * @returns {number} - Vuelto (monto pagado - total)
 */
export const calcularVuelto = (pagado, total) => {
  if (!Number.isFinite(pagado) || !Number.isFinite(total)) {
    return 0;
  }
  
  const vuelto = pagado - total;
  return vuelto > 0 ? vuelto : 0;
};

/**
 * Calcula el restante a pagar
 * @param {number} pagado - Monto pagado hasta el momento
 * @param {number} total - Monto total a pagar
 * @returns {number} - Restante (total - pagado)
 */
export const calcularRestante = (pagado, total) => {
  if (!Number.isFinite(pagado) || !Number.isFinite(total)) {
    return total || 0;
  }
  
  const restante = total - pagado;
  return restante > 0 ? restante : 0;
};

/**
 * Valida un objeto de venta antes de enviar al backend
 * @param {object} venta - Objeto de venta a validar
 * @returns {object} { isValid: boolean, errors: string[] }
 */
export const validarObjetoVenta = (venta) => {
  const errors = [];

  if (!venta) {
    return { isValid: false, errors: ["Objeto venta no válido"] };
  }

  // Validar montos
  if (venta._monto_total === null || venta._monto_total === undefined) {
    errors.push("Monto total no especificado");
  } else if (venta._monto_total <= 0) {
    errors.push("Monto total debe ser mayor a 0");
  }

  // Validar usuario
  if (!venta.idUsuario) {
    errors.push("Usuario no especificado");
  }

  // Validar tipo de comprobante
  if (!venta._id_tipo_comprobante) {
    errors.push("Tipo de comprobante no especificado");
  }

  // Validar serie
  if (!venta._serie) {
    errors.push("Serie de comprobante no especificada");
  }

  // Validar fecha
  if (!venta._fecha) {
    errors.push("Fecha de venta no especificada");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
