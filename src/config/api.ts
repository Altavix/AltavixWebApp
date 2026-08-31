import axios from 'axios';

export const API_BASE_URL = '/api';

export const API_ENDPOINTS = {
  AUTH: `/Auth`,
  PRODUCT: `/Product`,
  CATEGORY: `/Category`,
  BRANDS: `/Brands`,
  CHARACTERISTICS: `/Characteristics`
};

export const $api = axios.create({
  withCredentials: true,
  baseURL: API_BASE_URL
});

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

$api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._isRetry) {
      originalRequest._isRetry = true;
      
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = axios.post(`${API_BASE_URL}${API_ENDPOINTS.AUTH}/refresh`, {}, { withCredentials: true })
          .then(() => {
            isRefreshing = false;
            refreshPromise = null;
          })
          .catch((refreshError) => {
            isRefreshing = false;
            refreshPromise = null;
            console.error('Refresh token expired or invalid. Please login again.');
            localStorage.removeItem('user');
            window.location.href = '/login';
            throw refreshError;
          });
      }
      
      try {
        await refreshPromise;
        // If successful, backend sets new cookies. We can retry the request.
        return $api.request(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }
    
    return Promise.reject(error);
  }
);
