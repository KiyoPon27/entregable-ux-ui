import axios from 'axios';

// 1. Crear la instancia de Axios con la URL base de tu Backend Java
const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Tu backend Java
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

export default api;