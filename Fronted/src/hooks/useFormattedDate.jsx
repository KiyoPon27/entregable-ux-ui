import { useState, useEffect } from "react";

export function useFormattedDate() {
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    const fechaActual = new Date();
    //2024-19-09T45:45:00 (formato ISO-8601 para el backend)
    const offset = fechaActual.getTimezoneOffset() * 60000; 
    const fechaLocal = new Date(fechaActual - offset)
      .toISOString()
      .slice(0, 19); // Mantiene la 'T' para formato ISO-8601
    setFormattedDate(fechaLocal);
  }, []); 

  return formattedDate;
}
