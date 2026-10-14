import { axiosInstance } from '../axiosCalls/axios';

export const authAPI = {
    login: (credentials) => axiosInstance.post('/customers/login', credentials),
    register: (data) => axiosInstance.post('/customers/register', data),
    getMe: () => axiosInstance.get('/customers/me'),
    logout: () => axiosInstance.post('/customers/logout'),
};

export const productAPI = {
    getProducts: (params = {}) => axiosInstance.get('/products', { params }),
    getProductById: (id) => axiosInstance.get(`/products/${id}`),
    getCategories: () => axiosInstance.get('/products/categories'),
    seed: (force = false) => axiosInstance.post(`/products/seed${force ? '?force=true' : ''}`)
};

export const cartAPI = {
    getCart: () => axiosInstance.get('/cart'),
    addToCart: (productId) => axiosInstance.post(`/cart/${productId}`),
    updateQuantity: (productId, quantity) => axiosInstance.patch(`/cart/${productId}`, { quantity }),
    removeFromCart: (productId) => axiosInstance.delete(`/cart/${productId}`),
};

export const wishlistAPI = {
    getWishlist: () => axiosInstance.get('/wishlist'),
    addToWishlist: (productId) => axiosInstance.post(`/wishlist/${productId}`),
    removeFromWishlist: (productId) => axiosInstance.delete(`/wishlist/${productId}`),
};

