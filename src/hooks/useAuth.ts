import { useState, useEffect } from 'react';

// Mock User and Session types that were previously imported from '@supabase/supabase-js'
export interface User {
  id: string;
  email?: string;
  // Add any other user properties your application uses
}

export interface Session {
  user: User | null;
  // Add any other session properties your application uses
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  userRole: 'admin' | 'user' | null;
}

// A simple in-memory store for the user state
let memoryUser: User | null = null;
let memorySession: Session | null = null;
let memoryUserRole: 'admin' | 'user' | null = null;

export const useAuth = (): AuthState & {
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
} => {
  const [user, setUser] = useState<User | null>(memoryUser);
  const [session, setSession] = useState<Session | null>(memorySession);
  const [isLoading, setIsLoading] = useState(false); // Set to false as we are not doing async operations
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(memoryUserRole);

  useEffect(() => {
    // On initial load, we can check if we have a user in our "memory"
    setUser(memoryUser);
    setSession(memorySession);
    setUserRole(memoryUserRole);
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate a successful login
    const mockUser: User = { id: 'mock-user-id', email };
    const mockSession: Session = { user: mockUser };
    
    memoryUser = mockUser;
    memorySession = mockSession;
    // for testing purposes, let's say 'admin@example.com' is an admin
    memoryUserRole = email === 'admin@example.com' ? 'admin' : 'user';

    setUser(mockUser);
    setSession(mockSession);
    setUserRole(memoryUserRole);
    setIsLoading(false);
    
    return { error: null };
  };

  const signUp = async (email: string, password: string) => {
    // For simplicity, signUp will just sign in the user directly
    return signIn(email, password);
  };

  const signOut = async () => {
    setIsLoading(true);
    memoryUser = null;
    memorySession = null;
    memoryUserRole = null;

    setUser(null);
    setSession(null);
    setUserRole(null);
    setIsLoading(false);
  };

  return {
    user,
    session,
    isLoading,
    isAdmin: userRole === 'admin',
    userRole,
    signIn,
    signUp,
    signOut,
  };
};