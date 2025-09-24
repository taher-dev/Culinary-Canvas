
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
    type AuthError,
    signInWithEmailAndPassword,
    linkWithCredential,
    EmailAuthProvider,
    getRedirectResult,
    signInWithRedirect
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
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user && pathname === '/login') {
        router.push('/');
      } else if (!user && pathname !== '/login') {
        firebaseSignInAnonymously(auth).catch((error) => {
          console.error("Anonymous sign-in failed", error);
        });
      }
    }
  }, [user, loading, pathname, router]);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        if (user?.isAnonymous) {
            await linkWithPopup(user, provider);
        } else {
            await signInWithPopup(auth, provider);
        }
    } catch (error) {
        const authError = error as AuthError;
        if (authError.code === 'auth/account-exists-with-different-credential') {
             toast({
                title: "Account exists",
                description: "An account with this email already exists. Please sign in with your original method to link your Google account.",
                variant: "destructive",
            });
        }
        throw error;
    }
  };

  const signInAnonymously = async () => {
    try {
      await firebaseSignInAnonymously(auth);
    } catch (error) {
      console.error('Error signing in anonymously:', error);
      throw error;
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
