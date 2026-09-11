import React from "react";
import api from '../utils/axios';

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("token", data.token);
      return data;
    } catch (err) {
      // Build a plain Error carrying the backend's real message and the
      // needsVerification flag, since Login.jsx reads err.message and
      // err.needsVerification directly (not err.response.data).
      const backendData = err.response?.data;
      const normalizedError = new Error(backendData?.error || err.message || 'Login failed');
      normalizedError.needsVerification = backendData?.needsVerification || false;
      console.error("login failed :", err);
      throw normalizedError;
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      return data;
    } catch (err) {
      console.error("Registration failed :", err);
      throw err;
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("token", data.token);
      return data;
    } catch (err) {
      console.error("OTP verification failed :", err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, verifyOTP, register }}>
      {children}
    </AuthContext.Provider>
  );
};