import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useUsuariosStore } from "../store/UsuariosStore";
import { useEmpresaStore } from "../store/EmpresaStore";
// import { usePermisosStore } from "../store/PermisosStore"; 

const API_BASE = "http://localhost:8080/api";

const AuthContext = createContext();
export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for token in localStorage; if exists, try to retrieve user from backend
    const checkSession = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setUser(null);
        return;
      }
      try {
        const resp = await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // resp.data structure: { usuario, empresa, asignacion, permisos }
        const { usuario, empresa, asignacion, permisos } = resp?.data || {};
        
        setUser(usuario || null);

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
        useUsuariosStore.setState({ datausuarios: null });
        useEmpresaStore.setState({ dataempresa: null });
      }
    };
    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};
export const UserAuth = () => {
  return useContext(AuthContext);
};
