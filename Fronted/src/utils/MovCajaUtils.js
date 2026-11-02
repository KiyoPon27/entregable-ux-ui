/**
 * Extrae la descripción limpia de un movimiento de caja
 * Elimina el prefijo "Ingreso de dinero con Efectivo - detalle:" o similar
 * @param {string} descripcionCompleta - La descripción completa del movimiento
 * @returns {string} - La descripción limpia
 */
export const extraerDescripcionLimpia = (descripcionCompleta) => {
  if (!descripcionCompleta) return "";
  
  // Buscar "detalle:" en la descripción (case insensitive)
  const indexDetalle = descripcionCompleta.toLowerCase().indexOf("detalle:");
  
  if (indexDetalle !== -1) {
    // Extraer todo lo que viene después de "detalle:"
    return descripcionCompleta
      .substring(indexDetalle + 8) // 8 = longitud de "detalle:"
      .trim();
  }
  
  // Si no encuentra "detalle:", devolver la descripción completa
  return descripcionCompleta.trim();
};
