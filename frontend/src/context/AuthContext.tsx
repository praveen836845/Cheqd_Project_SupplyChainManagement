import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  connectDID: (did: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  connectDID: async () => {},
  logout: () => {},
  isAuthenticated: false,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function ProvideAuth({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Role-based mock users for demonstration
  const mockUsers = {
    manufacturer: {
      id: '1',
      did: 'did:cheqd:testnet:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
      role: 'manufacturer' as UserRole,
      name: 'TechFabs Manufacturing',
      organization: 'TechFabs Inc.'
    },
    distributor: {
      id: '2',
      did: 'did:cheqd:testnet:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH',
      role: 'distributor' as UserRole,
      name: 'Global Distribution Network',
      organization: 'GDN LLC'
    },
    logistics: {
      id: '3',
      did: 'did:cheqd:testnet:z6MkwJSaEMnE4u7CtjPmTaRyxj2EwYNcBczt2xP8HPoCYZSx',
      role: 'logistics' as UserRole,
      name: 'FastTrack Logistics',
      organization: 'FastTrack Corp.'
    },
    retailer: {
      id: '4',
      did: 'did:cheqd:testnet:z6MknGc3ocHs3zdPiJbnaaqDi5r1W1wFxS9SJLJtVwbUhmGh',
      role: 'retailer' as UserRole,
      name: 'Consumer Goods Retail',
      organization: 'CGR Stores'
    },
    consumer: {
      id: '5',
      did: 'did:cheqd:testnet:z6MktcwkUDQGNJtjn9pxULxCNg6xRx1vKs7vEqehvMVzQUbm',
      role: 'consumer' as UserRole,
      name: 'John Smith',
    },
    auditor: {
      id: '6',
      did: 'did:cheqd:testnet:z6Mkw1Mpvbg3MgJgaiLbGsU7fd7JrMDHWm8pFAQqGNJKBYb8',
      role: 'auditor' as UserRole,
      name: 'Compliance Verification Authority',
      organization: 'Trust Registry'
    }
  };

  // Check if user is already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const connectDID = async (did: string, role: UserRole): Promise<void> => {
    setLoading(true);
    
    // Simulate DID verification process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo purposes, select a mock user based on role
    const user = mockUsers[role];
    
    // Save to localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    connectDID,
    logout,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}