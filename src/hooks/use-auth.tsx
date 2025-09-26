
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
    onAuthStateChanged, 
    User, 
    signOut as firebaseSignOut, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signInAnonymously as firebaseSignInAnonymously,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    linkWithCredential,
    EmailAuthProvider,
    AuthError,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useToast } from './use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // For initial page load
  const [isLoading, setIsLoading] = useState(false); // For auth actions
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
    // Redirect after successful login to a permanent account
    if (!loading && user && !user.isAnonymous && pathname === '/login') {
      router.push('/');
    }
  }, [user, loading, pathname, router]);
  
  const handleError = (error: unknown, onEmailInUse?: () => void) => {
    const authError = error as AuthError;
    let errorMessage = 'An unexpected error occurred. Please try again.';
    switch (authError.code) {
        case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            errorMessage = 'Invalid email or password.';
            break;
        case 'auth/email-already-in-use':
        case 'auth/credential-already-in-use':
            errorMessage = 'This email is already in use. Please log in.';
            if (onEmailInUse) onEmailInUse();
            break;
        case 'auth/weak-password':
            errorMessage = 'Password should be at least 6 characters.';
            break;
        case 'auth/popup-closed-by-user':
            errorMessage = 'The sign-in popup was closed. Please try again.';
            break;
        default:
            console.error('Authentication Error:', authError.code, authError.message);
    }
    toast({
        title: `Authentication Failed`,
        description: errorMessage,
        variant: 'destructive',
    });
  };
  
  const signOut = async () => {
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const performAuthAction = async (action: () => Promise<any>) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (auth.currentUser) {
        await firebaseSignOut(auth);
      }
      await action();
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }

  const signInWithGoogle = async () => {
    await performAuthAction(() => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    });
  };
  
  const signInWithEmail = async (email: string, password: string) => {
    await performAuthAction(() => signInWithEmailAndPassword(auth, email, password));
  };
  
  const signUpWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.isAnonymous) {
            const credential = EmailAuthProvider.credential(email, password);
            await linkWithCredential(currentUser, credential);
            toast({ title: "Account created successfully!", description: "Your guest data has been saved." });
        } else {
            if (currentUser) {
                await firebaseSignOut(auth);
            }
            await createUserWithEmailAndPassword(auth, email, password);
            toast({ title: "Account created successfully!", description: "You've been logged in." });
        }
    } catch (error) {
        handleError(error, () => {
          // This callback is specific for the 'email-already-in-use' case
          // In a more complex scenario, you might want to pass a specific action here
          // For now, it just shows the toast.
        });
    } finally {
        setIsLoading(false);
    }
  };

  const signInAnonymously = async () => {
    await performAuthAction(async () => {
      await firebaseSignInAnonymously(auth);
      router.push('/');
    });
  };

  const authContextValue: AuthContextType = {
    user,
    loading,
    isLoading,
    signOut,
    signInWithGoogle,
    signInAnonymously,
    signInWithEmail,
    signUpWithEmail,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
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
