import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useUsuariosStore } from "../store/UsuariosStore";
import { useEmpresaStore } from "../store/EmpresaStore";
// import { usePermisosStore } from "../store/PermisosStore"; 

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api";

const AuthContext = createContext();
export const AuthContextProvider = ({ children }) => {
  // `user` is `undefined` while we check session, `null` means no session, object means authenticated
  const [user, setUser] = useState(undefined);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check for token in localStorage; if exists, try to retrieve user from backend
    const checkSession = async () => {
      setChecking(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setChecking(false);
        return;
      }
      try {
        const resp = await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // resp.data structure: { usuario, empresa, asignacion, permisos }
        const { usuario, empresa, asignacion, permisos } = resp?.data || {};
        
        setUser(usuario || null);
        setChecking(false);

        // Sync with Zustand stores
        if (usuario) {
          useUsuariosStore.setState({ datausuarios: usuario });
        }
        if (empresa) {
          useEmpresaStore.setState({ dataempresa: empresa });
        }
        // if (permisos) {
        //   usePermisosStore.setState({ permisos: permisos }); 
        // }

      } catch (e) {
        console.error("Error al obtener usuario:", e);
        // Si falla, limpiar token (expired or invalid)
        localStorage.removeItem("token");
        setUser(null);
        setChecking(false);
        useUsuariosStore.setState({ datausuarios: null });
        useEmpresaStore.setState({ dataempresa: null });
      }
    };
    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, checking }}>{children}</AuthContext.Provider>
  );
};
export const UserAuth = () => {
  return useContext(AuthContext);
};
