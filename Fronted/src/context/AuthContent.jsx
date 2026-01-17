import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
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
        const userData = resp?.data;
        setUser(userData || null);
      } catch (e) {
        console.error("Error al obtener usuario:", e);
        // Si falla, limpiar token
        localStorage.removeItem("token");
        setUser(null);
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
