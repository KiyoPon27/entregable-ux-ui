import { create } from "zustand";
import api from "../api/api"; // Usa tu instancia configurada

export const useAuthStore = create((set) => ({
  loginGoogle: async () => {
    // Redirect to backend OAuth endpoint (backend must implement OAuth flow)
    try {
      window.location.href = `http://localhost:8081/api/auth/oauth/google`;
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
      // Ajuste para coincidir con el DTO LoginRequest del backend (correo, password)
      const resp = await api.post(`/auth/login`, {
        correo: p.email.trim(),
        password: p.password,
      });

      // El backend devuelve AuthResponse { accessToken, idUsuario, nombre, rol }
      const token = resp.data.accessToken; 
      
      if (!token) throw new Error("Respuesta inválida del servidor");
      
      localStorage.setItem("token", token);
      
      // Opcional: guardar datos del usuario
      localStorage.setItem("user_id", resp.data.idUsuario);
      localStorage.setItem("user_rol", resp.data.rol);

      // Redirect to home/dashboard
      window.location.href = "/";
      return resp.data;
    } catch (err) {
      // Reenviar el error HTTP real para que el formulario decida el mensaje a mostrar
      throw err;
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
