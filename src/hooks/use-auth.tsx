
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
    // This effect runs after the initial user state has been determined.
    if (!loading) {
      if (user && !user.isAnonymous && pathname === '/login') {
        router.push('/');
      } else if (!user && pathname !== '/login') {
        // Only sign in as guest if there's no user and not on the login page
        firebaseSignInAnonymously(auth).catch((error) => {
          console.error("Anonymous sign-in failed", error);
        });
      }
    }
  }, [user, loading, pathname, router]);

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
        if (user?.isAnonymous) {
            // If the user is a guest, link the Google account to the guest account.
            // This preserves their data.
            await linkWithPopup(user, provider);
        } else {
            // If there's no user or a regular user, perform a standard sign-in.
            await signInWithPopup(auth, provider);
        }
    } catch (error) {
        // Re-throw the error to be handled by the calling component (LoginPage)
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
