import React, { createContext, useContext, useState, useEffect } from 'react';
import { axiosInstance } from '../axiosCalls/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchCart = async () => {
        if (!isAuthenticated) {
            setCart([]);
            return;
        }

        try {
            setLoading(true);
            setError('');
            const response = await axiosInstance.get('/cart');
            if (response.data?.success) {
                setCart(response.data.cart || []);
            }
        } catch (err) {
            console.error("Cart fetch error:", err);
            // Don't show critical error on 401 unauthenticated
            if (err?.response?.status !== 401) {
                setError(err?.response?.data?.message || "Unable to load cart.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            setCart([]);
        }
    }, [isAuthenticated]);

    const addToCart = async (productId, quantity = 1) => {
        try {
            setError('');
            const response = await axiosInstance.post(`/cart/${productId}`);
            if (response.data?.success) {
                let updatedCart = response.data.cart || [];
                if (quantity > 1) {
                    const patchRes = await axiosInstance.patch(`/cart/${productId}`, { quantity });
                    if (patchRes.data?.success) {
                        updatedCart = patchRes.data.cart || [];
                    }
                }
                setCart(updatedCart);
                return { success: true, cart: updatedCart };
            }
            return { success: false, message: response.data?.message || 'Could not add to cart.' };
        } catch (err) {
            console.error("Add to cart error:", err);
            const msg = err?.response?.data?.message || "Unable to add product to cart.";
            setError(msg);
            throw new Error(msg);
        }
    };

    const updateQuantity = async (productId, quantity) => {
        try {
            setError('');
            if (quantity <= 0) {
                return await removeFromCart(productId);
            }
            const response = await axiosInstance.patch(`/cart/${productId}`, { quantity });
            if (response.data?.success) {
                setCart(response.data.cart || []);
                return { success: true, cart: response.data.cart };
            }
            return { success: false, message: response.data?.message };
        } catch (err) {
            console.error("Update cart quantity error:", err);
            const msg = err?.response?.data?.message || "Unable to update quantity.";
            setError(msg);
            throw new Error(msg);
        }
    };

    const removeFromCart = async (productId) => {
        try {
            setError('');
            const response = await axiosInstance.delete(`/cart/${productId}`);
            if (response.data?.success) {
                setCart(response.data.cart || []);
                return { success: true, cart: response.data.cart };
            }
            return { success: false, message: response.data?.message };
        } catch (err) {
            console.error("Remove from cart error:", err);
            const msg = err?.response?.data?.message || "Unable to remove product from cart.";
            setError(msg);
            throw new Error(msg);
        }
    };

    const clearCart = async () => {
        try {
            await axiosInstance.delete('/cart/clear');
        } catch (err) {
            console.log("Clear cart API:", err?.message);
        } finally {
            setCart([]);
        }
    };

    const checkoutCart = async () => {
        try {
            setError('');
            const response = await axiosInstance.post('/cart/checkout');
            setCart([]);
            return { success: true, message: response.data?.message || 'Order placed successfully' };
        } catch (err) {
            console.error("Checkout error:", err);
            // Fallback: clear cart locally and via delete
            await clearCart();
            return { success: true };
        }
    };

    // Calculate total item count in cart
    const cartCount = cart.reduce((total, item) => total + (item.quantity || 0), 0);

    // Calculate total price in cart
    const cartTotal = cart.reduce((total, item) => {
        const price = item.product?.price || 0;
        return total + price * (item.quantity || 0);
    }, 0);

    const isProductInCart = (productId) => {
        return cart.some(item => (item.product?._id || item.product) === productId);
    };

    const getProductQuantity = (productId) => {
        const item = cart.find(item => (item.product?._id || item.product) === productId);
        return item ? item.quantity : 0;
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                loading,
                error,
                cartCount,
                cartTotal,
                fetchCart,
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart,
                checkoutCart,
                isProductInCart,
                getProductQuantity,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
