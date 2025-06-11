import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to check if token is expired
    const isTokenExpired = (token) => {
        try {
            const decoded = jwtDecode(token);
            return decoded.exp * 1000 < Date.now();
        } catch (error) {
            return true;
        }
    };

    // Initialize auth state
    useEffect(() => {
        const initializeAuth = () => {
            try {
                const token = localStorage.getItem('token');
                if (token && !isTokenExpired(token)) {
                    const decoded = jwtDecode(token);
                    // Restore user state from token
                    setUser({
                        id: decoded.id,
                        email: decoded.email,
                        role: decoded.role
                    });
                } else if (token) {
                    // Token exists but is expired
                    localStorage.removeItem('token');
                    setUser(null);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                localStorage.removeItem('token');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/login`, {
                email,
                password,
            });
            localStorage.setItem('token', response.data.token);
            setUser({
                id: response.data.user.id,
                email: response.data.user.email,
                first_name: response.data.user.first_name,
                last_name: response.data.user.last_name,
                middle_name: response.data.user.middle_name,
                role: response.data.user.role
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to login');
        }
    };

    const signup = async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/signup`, userData);
            localStorage.setItem('token', response.data.token);
            setUser({
                id: response.data.user.id,
                email: response.data.user.email,
                first_name: response.data.user.first_name,
                last_name: response.data.user.last_name,
                middle_name: response.data.user.middle_name,
                role: response.data.user.role
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to signup');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const value = {
        user,
        login,
        signup,
        logout,
        loading,
        isAuthenticated: !!user
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext; 