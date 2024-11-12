// AuthContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import { Route, Navigate } from "react-router-dom";
import { BASE_URL } from "../config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // Fetch user data on page load (if token is stored)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (loginData) => {
    const response = await fetch(`${BASE_URL}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginData),
    });

    const data = await response.json();
    if (response.ok) {
      setToken(data.access);
      localStorage.setItem("token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("user_id", data.user_id);
      setUser(data.user_id);
    } else {
      throw new Error(data.detail);
    }
  };

  const register = async (registerData) => {
    const response = await fetch(`${BASE_URL}/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registerData),
    });

    const data = await response.json();
    if (response.ok) {
      login(registerData);
    } else {
      throw new Error(data.detail);
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
    setUser(null);
  };

  const refreshAuthToken = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    const response = await fetch(`${BASE_URL}/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    const data = await response.json();
    if (response.ok) {
      setToken(data.access);
      localStorage.setItem("token", data.access);
    } else {
      logout()
      throw new Error(data.detail);
    }
  };

  useEffect(() => {
      const interval = setInterval(() => {
          // Get the expiration time of the access token
          const token = localStorage.getItem("token");
          if (token) {
              const payload = JSON.parse(atob(token.split('.')[1])); // Decode the token
              const exp = payload.exp * 1000; // Convert to milliseconds
              const now = Date.now();

              // If the token is about to expire in 1 minute, refresh it
              if (exp - now < 60 * 1000) {
                  refreshAuthToken();
              }
          }
      }, 60000); // Check every minute

      return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, register, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

export const PrivateRoute = ({ component: Component, ...rest }) => {
    const { user } = useContext(AuthContext);
  
    return (
      <Route
        {...rest}
        render={(props) =>
          user ? <Component {...props} /> : <Navigate to="/login" />
        }
      />
    );
};
