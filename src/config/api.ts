import axios from 'axios';

export const API_BASE_URL = 'https://localhost:7248/api';

export const API_ENDPOINTS = {
  AUTH: `${API_BASE_URL}/Auth`,
  PRODUCT: `${API_BASE_URL}/Product`,
  CATEGORY: `${API_BASE_URL}/Category`,
};

export const $api = axios.create({
  withCredentials: true,
  baseURL: API_BASE_URL
});

$api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._isRetry) {
      originalRequest._isRetry = true;
      
      try {
        // Try to refresh token. Backend reads old refreshToken from Cookie
        await axios.post(`${API_ENDPOINTS.AUTH}/refresh`, {}, { withCredentials: true });
        
        // If successful, backend sets new cookies. We can retry the request.
        return $api.request(originalRequest);
      } catch (refreshError) {
        // If refresh fails, user must log in again.
        console.error('Refresh token expired or invalid. Please login again.');
        
        // Remove stale user data and redirect
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);
