import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Interceptor ขาออก: แนบ Header Authorization: Bearer <token>
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor ขาเข้า: จัดการ Error และดักจับ 401
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // ถ้าเป็น 401 (Unauthorized) ให้เคลียร์ Token และเด้งไปหน้า Login
      if (error.response.status === 401) {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
      
      const detail = error.response.data?.detail || 'เกิดข้อผิดพลาดจาก API';
      return Promise.reject(new Error(detail));
    }
    return Promise.reject(new Error('ไม่สามารถเชื่อมต่อกับ Backend ได้: ' + error.message));
  }
);

export default api;
