'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'farmaceutico' | 'admin' | 'gerente' | 'funcionario';
}

// Mock users storage with localStorage persistence
const MOCK_USERS_KEY = 'farmacia_mock_users';
const MOCK_SESSION_KEY = 'farmacia_mock_session';

function getMockUsers(): Map<string, { password: string; user: User }> {
  if (typeof window === 'undefined') return new Map();
  
  try {
    const stored = localStorage.getItem(MOCK_USERS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return new Map(Object.entries(parsed));
    }
  } catch (e) {
    console.error('Error loading mock users:', e);
  }
  
  // Create default admin user
  const defaultUsers = new Map<string, { password: string; user: User }>();
  defaultUsers.set('admin@farmacia.com', {
    password: 'admin123',
    user: {
      id: 'admin-1',
      email: 'admin@farmacia.com',
      name: 'Administrador',
      userType: 'admin'
    }
  });
  
  return defaultUsers;
}

function saveMockUsers(users: Map<string, { password: string; user: User }>) {
  if (typeof window === 'undefined') return;
  
  try {
    const obj = Object.fromEntries(users.entries());
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(obj));
  } catch (e) {
    console.error('Error saving mock users:', e);
  }
}

function getMockSession(): User | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(MOCK_SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
}

function saveMockSession(user: User | null) {
  if (typeof window === 'undefined') return;
  
  try {
    if (user) {
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(MOCK_SESSION_KEY);
    }
  } catch (e) {
    console.error('Error saving mock session:', e);
  }
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mockUsers, setMockUsers] = useState<Map<string, { password: string; user: User }>>(new Map());

  useEffect(() => {
    setMockUsers(getMockUsers());
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // Check mock session
      const mockSession = getMockSession();
      if (mockSession) {
        setUser(mockSession);
        toast.success('Sessão restaurada!');
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const stored = mockUsers.get(email);
      if (stored && stored.password === password) {
        setUser(stored.user);
        saveMockSession(stored.user);
        toast.success('Login realizado com sucesso!');
        return;
      }
      throw new Error('Email ou senha incorretos');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Erro ao fazer login');
      throw error;
    }
  };

  const handleSignup = async (email: string, password: string, name: string, userType: string) => {
    try {
      // Check if user already exists
      if (mockUsers.has(email)) {
        throw new Error('Email já cadastrado');
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        email,
        name,
        userType: userType as User['userType'],
      };
      
      const updatedUsers = new Map(mockUsers);
      updatedUsers.set(email, { password, user: newUser });
      setMockUsers(updatedUsers);
      saveMockUsers(updatedUsers);
      
      toast.success('Cadastro realizado! Faça login para continuar.');
      return true;
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Erro ao fazer cadastro');
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      saveMockSession(null);
      setUser(null);
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} onSignup={handleSignup} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}
