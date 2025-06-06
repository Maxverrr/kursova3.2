import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

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
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:3001/api/login', {
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
            const response = await axios.post('http://localhost:3001/api/signup', userData);
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
        loading
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