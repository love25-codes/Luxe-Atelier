import axios from 'axios'

// Determine the backend API baseURL dynamically:
// 1. If VITE_API_BASE_URL is set in environment (e.g. deployed backend URL), use it.
// 2. If in production and not provided, default to '' (empty string for relative URL in unified fullstack setups).
// 3. In development, fallback to 'http://localhost:8000'.
const getBaseURL = () => {
    if (import.meta.env.VITE_API_BASE_URL !== undefined && import.meta.env.VITE_API_BASE_URL !== '') {
        return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
    }
    return import.meta.env.PROD ? '' : 'http://localhost:8000';
};

export const axiosInstance = axios.create({
    baseURL: getBaseURL(),
    headers: {
        "Content-Type": "application/json"
    },
    withCredentials: true
});

// Attach token if stored in localStorage
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);