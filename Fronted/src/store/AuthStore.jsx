import { create } from "zustand";
import axios from "axios";
const API_BASE = "http://localhost:8080/api";

export const useAuthStore = create((set) => ({
  loginGoogle: async () => {
    // Redirect to backend OAuth endpoint (backend must implement OAuth flow)
    try {
      window.location.href = `${API_BASE}/auth/oauth/google`;
    } catch (e) {
      throw new Error("No se pudo iniciar login con Google");
    }
  },
  cerrarSesion: async () => {
    // Remove token and reload/redirect to login
    try {
      localStorage.removeItem("token");
      // Force a full reload to ensure AuthContext picks up the missing token
      window.location.href = "/login";
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
 
  },
  loginEmail: async (p) => {
    try {
      const resp = await axios.post(`${API_BASE}/auth/login`, {
        email: p.email,
        password: p.password,
      });
      const token = resp?.data?.token;
      if (!token) throw new Error("Respuesta inválida del servidor");
      localStorage.setItem("token", token);
      // Redirect to home/dashboard
      window.location.href = "/";
      return resp.data;
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        throw new Error("Correo o contraseña incorrectos");
      }
      if (status === 500) {
        throw new Error("Error del servidor. Intente más tarde.");
      }
      throw new Error(err.message || "Error al iniciar sesión");
    }
  },
  crearUserYLogin:async(p)=>{
    // Optional: attempt to register user via backend. Backend must expose /auth/register
    try {
      const resp = await axios.post(`${API_BASE}/auth/register`, {
        email: p.email,
        password: p.password,
      });
      const token = resp?.data?.token;
      if (token) {
        localStorage.setItem("token", token);
        window.location.href = "/";
      }
      return resp.data;
    } catch (err) {
      const status = err?.response?.status;
      if (status === 400) throw new Error("Datos inválidos");
      throw new Error(err.message || "Error al crear usuario");
    }
  },
  
}));
