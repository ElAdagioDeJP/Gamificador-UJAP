import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Error en response interceptor:', error);
    
    // Manejo de errores de red
    if (!error.response) {
      console.error('Error de red:', error.message);
      return Promise.reject({
        message: 'Error de conexión. Verifique su conexión a internet.',
        type: 'NETWORK_ERROR'
      });
    }

    const { status, data } = error.response;
    
    // Token expirado o inválido
    if (status === 401) {
      console.warn('Token expirado o inválido, redirigiendo al login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Solo redirigir si no estamos ya en login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Error del servidor
    if (status >= 500) {
      console.error('Error del servidor:', data);
      return Promise.reject({
        message: 'Error interno del servidor. Intente nuevamente más tarde.',
        type: 'SERVER_ERROR',
        status
      });
    }
    
    // Error de validación
    if (status === 400) {
      return Promise.reject({
        message: data.message || 'Datos inválidos',
        type: 'VALIDATION_ERROR',
        errors: data.errors || [],
        status
      });
    }
    
    // Otros errores
    return Promise.reject({
      message: data.message || 'Error desconocido',
      type: 'UNKNOWN_ERROR',
      status
    });
  }
);

export default api;
