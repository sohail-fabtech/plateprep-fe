import axios, { AxiosError, AxiosRequestConfig } from 'axios';
// config
import { HOST_API_KEY } from '../config-global';
import { PATH_AUTH } from '../routes/paths';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ 
  baseURL: HOST_API_KEY,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const accessToken = localStorage.getItem('accessToken');
    
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized - Skip redirect for login endpoint
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      // Don't redirect on 401 for login endpoint - let the form handle the error
      if (!requestUrl.includes('/api/login/')) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = PATH_AUTH.login;
      }
    }
    
    // Return error response data or error message
    return Promise.reject(
      (error.response && error.response.data) || error.message || 'Something went wrong'
    );
  }
);

export default axiosInstance;
