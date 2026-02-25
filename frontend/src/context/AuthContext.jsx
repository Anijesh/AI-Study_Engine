import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            
            const response = await api.post('http://localhost:5001/auth/login', { email, password });
            const { access_token } = response.data;
            localStorage.setItem('token', access_token);
            setIsAuthenticated(true);
            return true;
        } catch (error) {
            throw error;
        }
    };

    const register = async (email, password) => {
        try {
            await api.post('http://localhost:5001/auth/register', { email, password });
            return true;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
