
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
    onAuthStateChanged, 
    User, 
    signOut as firebaseSignOut, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signInAnonymously as firebaseSignInAnonymously,
    linkWithPopup,
    AuthError,
    signInWithEmailAndPassword,
    linkWithCredential
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useToast } from './use-toast';

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
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setLoading(false);
        // If a non-anonymous user is logged in and on the login page, redirect them to home
        if (!user.isAnonymous && pathname === '/login') {
          router.push('/');
        }
      } else {
        // If there's no user and we are not on the login page, sign in as guest
        if (pathname !== '/login') {
            firebaseSignInAnonymously(auth).catch((error) => {
                console.error("Anonymous sign-in failed", error);
                setLoading(false);
            });
        } else {
            // If on login page, just update loading state
            setUser(null);
            setLoading(false);
        }
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
      // Standard sign-in with Google
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      // Re-throw the error to be handled by the calling component (LoginPage)
      // This allows the UI to handle specific flows like account linking.
      throw error;
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
