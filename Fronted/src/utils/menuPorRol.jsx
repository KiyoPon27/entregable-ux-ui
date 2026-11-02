/**
 * MENÚ DINÁMICO POR ROL
 * Controla qué opciones de menú ve cada rol
 */

// Definir todos los links disponibles con su rol requerido mínimo
const ALL_LINKS = {
  HOME: { label: "Home", icon: "noto-v1:house", to: "/", roles: ["superadmin", "cajero", "admin", "almacenero", "OG"] },
  DASHBOARD: { label: "Dashboard", icon: "fluent-emoji-flat:antenna-bars", to: "/dashboard", roles: ["superadmin", "cajero", "admin", "almacenero", "OG"] },
  VENDER: { label: "VENDER", icon: "flat-color-icons:shop", to: "/pos", roles: ["superadmin", "admin", "cajero", "OG"] },
  INVENTARIO: { label: "Inventario", icon: "flat-ui:box", to: "/inventario", roles: ["superadmin", "admin", "almacenero", "OG"] },
  REPORTES: { label: "Reportes", icon: "flat-ui:graph", to: "/reportes", roles: ["superadmin", "admin", "OG"] },
  COMPRAS: { label: "Compras", icon: "noto:shopping-bags", to: "/compras", roles: ["superadmin", "admin", "OG"] },
  FACTURAS: { label: "Facturas", icon: "noto:receipt", to: "/facturas", roles: ["superadmin", "admin", "OG"] },
};

const ALL_SECONDARY_LINKS = {
  CONFIGURACION: { label: "Configuración", icon: "icon-park:setting-two", to: "/configuracion", color: "#CE82FF", roles: ["superadmin", "admin", "OG"] },
  MI_PERFIL: { label: "Mi perfil", icon: "icon-park:avatar", to: "/miperfil", color: "#CE82FF", roles: ["superadmin", "cajero", "admin", "almacenero", "OG"] },
};

/**
 * Extrae el nombre del rol desde diferentes formatos posibles
 * @param {*} rolData - Puede ser string, objeto con nombre, objeto con id, etc.
 * @returns {string} Nombre del rol normalizado (minúsculas para comparación)
 */
const getRolName = (rolData) => {
  if (!rolData) return "cajero"; // Default

  // Si es string, retornar en minúsculas
  if (typeof rolData === "string") {
    return rolData.toLowerCase().trim();
  }

  // Si es objeto, intentar obtener el nombre de varias formas
  if (typeof rolData === "object") {
    const nombre = rolData?.nombre || rolData?.name || rolData?.rol;
    if (nombre) {
      return nombre.toLowerCase().trim();
    }
  }

  return "cajero"; // Default si no puede extraer
};

/**
 * Retorna los links del menú principal según el rol del usuario
 * @param {*} rolData - Nombre del rol o objeto rol del usuario
 * @returns {Array} Array de links visibles para este rol
 */
export const getLinksArrayPorRol = (rolData) => {
  const rol = getRolName(rolData);

  if (!rol) {
    console.warn("⚠️ No se pudo determinar el rol del usuario");
    return [];
  }

  const linksVisibles = Object.values(ALL_LINKS).filter(link =>
    link.roles.some(r => r.toLowerCase() === rol)
  );

  console.log(`📋 Rol detectado: "${rol}" - Menú con ${linksVisibles.length} links:`, linksVisibles.map(l => l.label));

  return linksVisibles;
};

/**
 * Retorna los links secundarios según el rol del usuario
 * @param {*} rolData - Nombre del rol o objeto rol del usuario
 * @returns {Array} Array de links secundarios visibles para este rol
 */
export const getSecondaryLinksArrayPorRol = (rolData) => {
  const rol = getRolName(rolData);

  if (!rol) {
    console.warn("⚠️ No se pudo determinar el rol para links secundarios");
    return [];
  }

  const linksVisibles = Object.values(ALL_SECONDARY_LINKS).filter(link =>
    link.roles.some(r => r.toLowerCase() === rol)
  );

  console.log(`⚙️ Rol "${rol}" - Menú secundario con ${linksVisibles.length} links:`, linksVisibles.map(l => l.label));

  return linksVisibles;
};

/**
 * Hook personalizado para obtener los menús dinámicos
 * @param {*} userRole - Rol del usuario (string o objeto)
 * @returns {Object} { primaryLinks, secondaryLinks }
 */
export const useMenuDinamico = (userRole) => {
  // Debug: mostrar qué se recibe
  console.log("🔍 useMenuDinamico recibe:", userRole);

  const primaryLinks = getLinksArrayPorRol(userRole);
  const secondaryLinks = getSecondaryLinksArrayPorRol(userRole);

  return {
    primaryLinks,
    secondaryLinks,
  };
};

// Exportar también los arrays estáticos para referencia
export const MENU_ROLES = {
  OG: "OG",
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  ALMACENERO: "almacenero",
  CAJERO: "cajero",
};
