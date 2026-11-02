import styled, { ThemeProvider } from "styled-components";
import {
  AuthContextProvider,
  Dark,
  GlobalStyles,
  Light,
  MyRoutes,
  useThemeStore,
  useUsuariosStore,
} from "./index";
import { Device } from "./styles/breakpoints";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const { setTheme, themeStyle } = useThemeStore();
  const { datausuarios } = useUsuariosStore();
  const location = useLocation();
  useEffect(() => {
    if (location.pathname === "/login") {
      setTheme({
        tema: "light",
        style: Light,
      });
    } else {
      if (datausuarios) {
        const style = datausuarios?.tema === "light" ? Light : Dark;
        setTheme({
          tema: datausuarios?.tema,
          style: style,
        });
      }
    }
    // Solo sincroniza con usuario al cargar, no al cambiar tema
    // El toggle ahora sí funciona porque ThemeProvider depende de themeStyle
    // eslint-disable-next-line
  }, [datausuarios]);
  return (
    <ErrorBoundary>
      <ThemeProvider theme={themeStyle}>
        <AuthContextProvider>
          <GlobalStyles />
          <MyRoutes />
          <ReactQueryDevtools initialIsOpen={true} />
        </AuthContextProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
