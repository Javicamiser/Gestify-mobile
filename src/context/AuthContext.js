import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../api/axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const userData = await AsyncStorage.getItem('user_data');
      
      if (token && userData) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

const login = async (email, password) => {
  try {
    const response = await axiosInstance.post('/users/login/', {
      email,
      password,
    });

    console.log('✅ Response login:', response.data);

    const { token, user_id, username, message } = response.data;

    await AsyncStorage.setItem('access_token', token);
    await AsyncStorage.setItem(
      'user_data',
      JSON.stringify({ user_id, username, email })
    );

    setUser({ user_id, username, email });
    setIsAuthenticated(true);

    return { success: true, message };
  } catch (error) {
    console.error('❌ Error login:', error.response?.data || error);

    let errorMessage =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.message ||
      'Error al iniciar sesión';

    return { success: false, message: errorMessage };
  }
};


  const register = async (userData) => {
    try {
      const response = await axiosInstance.post('/users/register/', {
        email: userData.email,
        username: userData.username,
        name: userData.name,
        password: userData.password,
      });
      
      console.log('✅ Response register:', response.data);
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error register:', error.response?.data);
      
      let errorMessage = 'Error al registrarse';
      
      if (error.response?.data) {
        if (error.response.data.email) {
          errorMessage = Array.isArray(error.response.data.email) 
            ? error.response.data.email[0] 
            : error.response.data.email;
        } else if (error.response.data.username) {
          errorMessage = Array.isArray(error.response.data.username)
            ? error.response.data.username[0]
            : error.response.data.username;
        } else if (error.response.data.password) {
          errorMessage = Array.isArray(error.response.data.password)
            ? error.response.data.password[0]
            : error.response.data.password;
        } else if (error.response.data.name) {
          errorMessage = Array.isArray(error.response.data.name)
            ? error.response.data.name[0]
            : error.response.data.name;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        }
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      await AsyncStorage.removeItem('user_data');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
