import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing
const demoUsers: Record<UserRole, User> = {
  admin: { id: '1', email: 'admin@sentosa.id', role: 'admin', nama: 'Administrator' },
  dokter: { id: '2', email: 'dokter@sentosa.id', role: 'dokter', nama: 'Dr. Budi Santoso' },
  kasir: { id: '3', email: 'kasir@sentosa.id', role: 'kasir', nama: 'Siti Rahayu' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // Demo login - in production this would call Supabase
    if (password === 'demo123') {
      setUser(demoUsers[role]);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
