import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const hasCalledRef = useRef(false);

  const API_BASE = import.meta.env.VITE_ENVIRONMENT === 'PRODUCTION'
  ? import.meta.env.VITE_API_BASE_URL
  : "http://localhost:3000";

  useEffect(() => {
    if (hasCalledRef.current) {
      console.log('⏭️ Session check already in progress/completed');
      return;
    }

    hasCalledRef.current = true;
    console.log('🔐 Checking session...');

    async function restoreSession() {
      try {
        const res = await fetch(`${API_BASE}/api/me`, {
          credentials: 'include'
        });

        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(data.ok === true);
          setUser(data.user);
          console.log('✅ Session restored');
        } else {
          setIsLoggedIn(false);
          setUser(null);
          console.log('❌ No active session');
        }
      } catch (err) {
        console.error('❌ Session restore failed', err);
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  const login = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    console.log('✅ User logged in');
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      console.log('✅ User logged out');
    } catch (err) {
      console.error('❌ Logout failed', err);
    } finally {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  const value = {
    isLoggedIn,
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};