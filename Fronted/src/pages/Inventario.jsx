import { useState, useRef, useCallback, useEffect, useDeferredValue } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMovStockStore } from "../store/MovStockStore";
import { useEmpresaStore } from "../store/EmpresaStore";
import { useProductosStore } from "../store/ProductosStore";
import { useGlobalStore } from "../store/GlobalStore";
import { useBarcodeScanner } from "../hooks/useBarcodeScanner";
import { BuscadorList } from "../components/ui/lists/BuscadorList";
import { RegistrarInventario } from "../components/organismos/formularios/RegistrarInventario";
import { TablaInventarios } from "../components/organismos/tablas/TablaInventarios";
import api from "../api/api";
import "../styles/inventario.css";

// Iconos SVG
const SearchIcon = () => (
  <svg width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const PackageIcon = () => (
  <svg width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" viewBox="0 0 24 24">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const BoxIcon = () => (
  <svg width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" viewBox="0 0 24 24">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const TrendingDownIcon = () => (
  <svg width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" viewBox="0 0 24 24">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" viewBox="0 0 24 24">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 17" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" viewBox="0 0 24 24">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const SunIcon = () => (
  <svg width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

export const Inventario = () => {
  const { mostrarMovStock } = useMovStockStore();
  const { dataempresa } = useEmpresaStore();
  const { productosItemSelect, selectProductos } = useProductosStore();
  const { setStateClose, setAccion, stateClose } = useGlobalStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [inputBusqueda, setInputBusqueda] = useState("");
  const deferredInputBusqueda = useDeferredValue(inputBusqueda);
  const [debouncedBusqueda, setDebouncedBusqueda] = useState("");
  const buscadorRef = useRef(null);

  const handleBarcode = useCallback((code) => {
    setInputBusqueda(code);
    setTimeout(() => buscadorRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBusqueda(deferredInputBusqueda.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [deferredInputBusqueda]);

  useBarcodeScanner(handleBarcode);

  const { data: dataproductos } = useQuery({
    queryKey: ["buscar productos inventario", dataempresa?.id, debouncedBusqueda],
    queryFn: () =>
      debouncedBusqueda.length > 0
        ? api
            .get(`/productos/buscar/${dataempresa?.id}?q=${encodeURIComponent(debouncedBusqueda)}`)
            .then((r) => r.data || [])
        : Promise.resolve([]),
    enabled: !!dataempresa,
    refetchOnWindowFocus: false,
    retry: false,
  });

  // Query para obtener todos los productos
  const { data: todosProductos = [] } = useQuery({
    queryKey: ["todos productos", dataempresa?.id],
    queryFn: () =>
      api
        .get(`/productos/empresa/${dataempresa?.id}`)
        .then((r) => r.data || [])
        .catch(() => []),
    enabled: !!dataempresa,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const hasValidProductSelection =
    !!productosItemSelect?.id && !!productosItemSelect?.nombre;

  const { data } = useQuery({
    queryKey: [
      "mostrar movimientos de stock",
      {
        id_empresa: dataempresa?.id,
        id_producto: productosItemSelect?.id,
      },
    ],
    queryFn: () =>
      mostrarMovStock({
        id_empresa: dataempresa?.id,
        id_producto: productosItemSelect?.id,
      }),
    enabled: !!dataempresa && hasValidProductSelection,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleSetBuscador = (value) => {
    setInputBusqueda(value);
  };

  const nuevoRegistro = () => {
    setStateClose(true);
    setAccion("Nuevo");
    selectProductos(null);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Funciones para calcular datos de las tarjetas - LÓGICA PROFESIONAL
  
  // 1. STOCK INICIAL = Primer movimiento (el más antiguo)
  const calcularStockInicial = () => {
    if (!data || !Array.isArray(data) || data.length === 0) return 0;
    // El stock inicial es el ÚLTIMO elemento del array (el más antiguo)
    const ultimoMovimiento = data[data.length - 1];
    return ultimoMovimiento?.tipoMovimiento === "AJUSTE_ENTRADA" 
      ? ultimoMovimiento.cantidad || 0 
      : 0;
  };

  // 2. ENTRADAS = Suma de AJUSTE_ENTRADA SIN el stock inicial
  const calcularEntradas = () => {
    if (!data || !Array.isArray(data)) return 0;
    const entradasAjuste = data.filter(mov => mov.tipoMovimiento === "AJUSTE_ENTRADA");
    
    // Excluir el stock inicial (el último/más antiguo)
    if (entradasAjuste.length > 1) {
      return entradasAjuste
        .slice(0, -1)  // Excluye el último
        .reduce((total, mov) => total + (mov.cantidad || 0), 0);
    }
    return 0;
  };

  // 3. SALIDAS = Solo AJUSTE_SALIDA (no contar ventas)
  const calcularSalidas = () => {
    if (!data || !Array.isArray(data)) return 0;
    return data
      .filter(mov => mov.tipoMovimiento === "AJUSTE_SALIDA")
      .reduce((total, mov) => total + (mov.cantidad || 0), 0);
  };

  // 4. STOCK ACTUAL = Stock Inicial + Entradas - Salidas (FÓRMULA PROFESIONAL)
  const calcularStockActual = () => {
    const stockInicial = calcularStockInicial();
    const entradas = calcularEntradas();
    const salidas = calcularSalidas();
    return (stockInicial + entradas - salidas).toFixed(2);
  };

  const totalProductos = calcularStockInicial();
  const totalEntradas = calcularEntradas();
  const totalSalidas = calcularSalidas();
  const stockActual = calcularStockActual();
  const valorInventario = (stockActual * (productosItemSelect?.precioVenta || productosItemSelect?.precio || 0)).toFixed(2);

  return (
    <div className="inventario-container">
      {stateClose && <RegistrarInventario />}

      <header className="inventario-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon"><BoxIcon /></div>
            <div className="header-title">
              <h1>Inventario</h1>
              <p>Sistema de Almacén POS</p>
            </div>
          </div>

          <div className="header-right">
            <div className="search-container">
              <span className="search-icon"><SearchIcon /></span>
              <BuscadorList
                setBuscador={handleSetBuscador}
                data={dataproductos || []}
                onSelect={selectProductos}
                externalValue={inputBusqueda}
                inputRef={buscadorRef}
                customClassName="search-input"
              />
            </div>
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Cambiar tema">
              {theme === "light" ? <MoonIcon /> : <SunIcon />}
            </button>
            <button className="btn-registrar" onClick={nuevoRegistro}>
              <PackageIcon />
              REGISTRAR
            </button>
          </div>
        </div>
      </header>

      <div className="inventario-content">
        {/* STATS CARDS */}
        {productosItemSelect?.nombre && (
          <div className="stats-grid">
            <div className="stat-card stat-card-blue">
              <div className="stat-header">
                <PackageIcon />
                <span className="stat-label">PRODUCTO</span>
              </div>
              <p className="stat-value">{productosItemSelect?.nombre}</p>
            </div>

            <div className="stat-card stat-card-green">
              <div className="stat-header">
                <BoxIcon />
                <span className="stat-label">STOCK ACTUAL</span>
              </div>
              <div className="stat-value-row">
                <p className="stat-value-large">{productosItemSelect?.stockTotal || 0}</p>
              </div>
            </div>

            <div className="stat-card stat-card-orange">
              <div className="stat-header">
                <TrendingUpIcon />
                <span className="stat-label">TOTAL VENDIDOS</span>
              </div>
              <div className="stat-value-row">
                <p className="stat-value-large">{productosItemSelect?.totalVendido || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* TABLA DE MOVIMIENTOS */}
        <div className="table-container">
          <div className="table-header">
            <h2>Movimientos de Inventario</h2>
          </div>

          <div className="table-wrapper">
            <TablaInventarios data={data} />
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon summary-icon-blue">
              <PackageIcon />
            </div>
            <p className="summary-label">Producto Inicial</p>
            <p className="summary-value">{totalProductos}</p>
          </div>

          <div className="summary-card">
            <div className="summary-icon summary-icon-green">
              <TrendingUpIcon />
            </div>
            <p className="summary-label">Entradas</p>
            <p className="summary-value">{totalEntradas}</p>
          </div>

          <div className="summary-card">
            <div className="summary-icon summary-icon-red">
              <TrendingDownIcon />
            </div>
            <p className="summary-label">Salidas</p>
            <p className="summary-value">{totalSalidas}</p>
          </div>

          <div className="summary-card">
            <div className="summary-icon summary-icon-orange">
              <BoxIcon />
            </div>
            <p className="summary-label">Valor Inventario</p>
            <p className="summary-value">S/. {valorInventario}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
