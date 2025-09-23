
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup, signInAnonymously as firebaseSignInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => void;
  signInWithGoogle: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      // If user is logged in and on the login page, redirect them to home
      if (user && pathname === '/login') {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // Redirect to login page after sign out to clear state
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Redirection is handled by onAuthStateChanged
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error; // Re-throw to be caught in the component
    }
  };

  const signInAnonymously = async () => {
    try {
      await firebaseSignInAnonymously(auth);
      // Redirection is handled by onAuthStateChanged
    } catch (error) {
      console.error('Error signing in anonymously:', error);
      throw error; // Re-throw to be caught in the component
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, signInWithGoogle, signInAnonymously }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
