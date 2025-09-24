
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
    fetchSignInMethodsForEmail,
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
      setUser(user);
      setLoading(false);
      // If a non-anonymous user is logged in and on the login page, redirect them to home
      if (user && !user.isAnonymous && pathname === '/login') {
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
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.isAnonymous) {
        // Handle linking for anonymous users
        const result = await linkWithPopup(currentUser, provider);
        setUser(result.user);
        toast({ title: "Account linked with Google!", description: "Your guest data has been saved." });
        return; // Exit after successful link
      }

      // Standard sign-in with Google
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      toast({ title: "Successfully signed in with Google!" });

    } catch (error) {
      const authError = error as AuthError;
      
      // This is the core logic for account linking
      if (authError.code === 'auth/account-exists-with-different-credential') {
        try {
          // 1. Extract the pending Google credential and email
          const pendingCred = GoogleAuthProvider.credentialFromError(authError);
          const email = authError.customData.email as string;

          // 2. Prompt user for their password to verify ownership
          const password = prompt("An account with this email already exists. Please enter your password to link your Google account.");
          if (!password) {
            toast({ title: "Link Canceled", description: "You canceled the account linking process.", variant: "destructive" });
            return; // Exit if user cancels prompt
          }

          // 3. Sign in the user with their existing email/password
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          
          // 4. Link the pending Google credential to the now signed-in user
          if (pendingCred) {
              await linkWithCredential(userCredential.user, pendingCred);
              toast({ title: "Accounts Linked!", description: "You can now sign in with either email/password or Google." });
              setUser(userCredential.user);
          }

        } catch (linkError) {
          const linkAuthError = linkError as AuthError;
          // Handle incorrect password or other linking errors
          let description = "Could not link accounts. Please try again.";
          if (linkAuthError.code === 'auth/wrong-password' || linkAuthError.code === 'auth/invalid-credential') {
              description = "The password you entered was incorrect. Please try again.";
          }
          console.error('Account linking error:', linkAuthError);
          toast({ title: "Linking Failed", description, variant: "destructive" });
        }
      } else {
        // Re-throw other errors to be caught by the calling component
        throw authError;
      }
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
