// AuthContext.js
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { BASE_URL } from "../config";

type LoginData = {
  username: string,
  password: string
};

type ID = string | number;

type User = {
  id: ID,
  username: string,
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  register: (data: LoginData) => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user_id");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem("token") || null);

  const setUserData = async (id: ID) => {
    const response = await fetch(`${BASE_URL}/users/${id}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data: User = await response.json();
    setUser(data);
  }

  // Fetch user data on page load (if token is stored)
  useEffect(() => {
    const storedUser = localStorage.getItem("user_id");
    if (storedUser) {;
      setUserData(storedUser);
    }
  }, []);

  const login = async (loginData: LoginData) => {
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

  const register = async (registerData: LoginData) => {
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
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("refresh_token");
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
    <AuthContext.Provider value = {{ user, login, logout, register, token, setUser, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

