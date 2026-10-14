import React, { createContext, useContext, useState, useEffect } from 'react';
import { axiosInstance } from '../axiosCalls/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            // If neither token in localStorage nor cookie, we can still try /me
            const response = await axiosInstance.get('/customers/me');
            if (response.data?.customerData) {
                setUser(response.data.customerData);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.log("Auth check error:", error?.response?.data?.message || error.message);
            setUser(null);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (credentials) => {
        const response = await axiosInstance.post('/customers/login', credentials);
        if (response.data?.token) {
            localStorage.setItem('token', response.data.token);
        }
        if (response.data?.customer) {
            setUser(response.data.customer);
        } else {
            // refresh user data
            await checkAuth();
        }
        return response.data;
    };

    const register = async (userData) => {
        const response = await axiosInstance.post('/customers/register', userData);
        if (response.data?.token) {
            localStorage.setItem('token', response.data.token);
        }
        if (response.data?.customer) {
            setUser(response.data.customer);
        } else {
            await checkAuth();
        }
        return response.data;
    };

    const logout = async () => {
        try {
            await axiosInstance.post('/customers/logout');
        } catch (err) {
            console.error("Logout error", err);
        } finally {
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
