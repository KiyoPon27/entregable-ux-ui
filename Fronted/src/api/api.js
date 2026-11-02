import axios from 'axios';

// 1. Crear la instancia de Axios con la URL base de tu Backend Java
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api', // Tu backend Java
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor (La Magia): Antes de cada petición, inyecta el Token
api.interceptors.request.use(
  (config) => {
    // Buscamos el token guardado en el navegador
    const token = localStorage.getItem('token'); 
    
    if (token) {
      // Si existe, lo agregamos al encabezado como 'Bearer ...'
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta: si recibimos 401/403 limpiamos sesión y redirigimos a login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || '';
    const isAuthFlowRequest =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/forgot-password') ||
      requestUrl.includes('/auth/verify-reset-code') ||
      requestUrl.includes('/auth/reset-password');

    if ((status === 401 || status === 403) && !isAuthFlowRequest) {
      try {
        localStorage.removeItem('token');
        // opcional: limpiar otros datos relacionados
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_rol');
      } catch (e) {}
      // redirigir al login (evitar bucles en dev y asegurar que la app monte de nuevo)
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;