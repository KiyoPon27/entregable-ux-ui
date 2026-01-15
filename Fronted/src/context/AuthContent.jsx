import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
const API_BASE = "http://localhost:8080/api";
import { MostrarUsuarios, InsertarEmpresa } from "../index";

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
        const token = localStorage.getItem("token");
        const resp = await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        const userData = resp?.data?.user ?? resp?.data;
        setUser(userData || {});
        if (userData?.id_auth || userData?.id) {
          insertarDatos(userData?.id_auth || userData?.id, userData?.email);
        }
      } catch (e) {
        // If /auth/me doesn't exist (404) or token endpoint not implemented,
        // try to decode the JWT locally to obtain the subject (email).
        const token = localStorage.getItem("token");
        if (!token) {
          setUser(null);
          return;
        }
        try {
          // parse JWT payload
          const parseJwt = (t) => {
            try {
              const payload = t.split(".")[1];
              const json = JSON.parse(decodeURIComponent(
                atob(payload.replace(/-/g, "+").replace(/_/g, "/")).split("").map(function(c) {
                  return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
                }).join("")
              ));
              return json;
            } catch (err) {
              return null;
            }
          };
          const payload = parseJwt(token);
          if (payload) {
            const email = payload.sub || payload.email || payload.username;
            const userData = { email };
            setUser(userData);
            if (email) insertarDatos(null, email);
            return;
          }
        } catch (err) {
          // fallthrough
        }
        // If all fails, clear token and mark unauthenticated
        localStorage.removeItem("token");
        setUser(null);
      }
    };
    checkSession();
  }, []);
  const insertarDatos = async (id_auth, correo) => {
    const response = await MostrarUsuarios({ id_auth: id_auth });
    if (response) {
      return;
    } else {
      await InsertarEmpresa({ id_auth: id_auth, correo: correo });
    }
  };

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};
export const UserAuth = () => {
  return useContext(AuthContext);
};
