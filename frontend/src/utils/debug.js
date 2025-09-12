// Utilidad para debuggear el estado de autenticación
export const debugAuth = () => {
  console.log('=== DEBUG AUTH ===');
  console.log('localStorage token:', localStorage.getItem('token'));
  console.log('localStorage user:', localStorage.getItem('user'));
  console.log('localStorage authState:', localStorage.getItem('authState'));
  
  // Limpiar localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('authState');
  
  console.log('localStorage limpiado');
  console.log('Recarga la página para ver el login');
};

// Función para verificar si hay un usuario logueado
export const checkAuthState = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token && user) {
    console.log('Usuario logueado:', JSON.parse(user));
    return true;
  }
  
  console.log('No hay usuario logueado');
  return false;
};

// Función para forzar logout
export const forceLogout = () => {
  localStorage.clear();
  window.location.reload();
};
