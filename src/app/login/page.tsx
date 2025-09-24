
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    AuthError,
    EmailAuthProvider,
    linkWithCredential,
    getAdditionalUserInfo,
    GoogleAuthProvider,
    reauthenticateWithCredential,
    UserCredential
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ChefHat, Loader2, User } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Separator } from '@/components/ui/separator';
import { PasswordConfirmationDialog } from '@/components/PasswordConfirmationDialog';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.657-3.356-11.303-7.962l-6.571,4.819C9.656,39.663,16.318,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.904,36.368,44,30.638,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, signInWithGoogle, signInAnonymously } = useAuth();
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [pendingGoogleCredential, setPendingGoogleCredential] = useState<any>(null);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (user?.isAnonymous) {
        // Guest users can only link to a new account (sign up)
        const credential = EmailAuthProvider.credential(email, password);
        await linkWithCredential(user, credential);
        toast({ title: "Account linked successfully!", description: "Your guest data has been saved." });
        router.push('/');
      } else {
        // Standard user (not a guest)
        if (isSigningUp) {
          await createUserWithEmailAndPassword(auth, email, password);
          toast({ title: "Account created successfully!", description: "You've been logged in." });
        } else {
          await signInWithEmailAndPassword(auth, email, password);
          toast({ title: "Login successful!", description: "Welcome back." });
        }
        // Redirection for new signup/login is handled by the useAuth hook
      }
    } catch (error) {
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
          errorMessage = 'This email is already in use. Please log in or use a different email.';
          break;
        case 'auth/weak-password':
            errorMessage = 'Password should be at least 6 characters.';
            break;
        default:
            console.error(authError.code, authError.message);
      }
      toast({
        title: `Authentication Failed`,
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordConfirm = async (password: string) => {
    setIsLoading(true);
    setIsLinkDialogOpen(false);
    try {
        if (!auth.currentUser) {
            throw new Error("No user is currently signed in to link the account.");
        }
        
        // Create a credential for the user's existing email/password
        const credential = EmailAuthProvider.credential(auth.currentUser.email!, password);
        
        // Re-authenticate the current user with their original credential
        await reauthenticateWithCredential(auth.currentUser, credential);
        
        // Link the pending Google credential to the now re-authenticated user
        await linkWithCredential(auth.currentUser, pendingGoogleCredential);

        toast({
            title: "Account Linked",
            description: "You can now sign in with Google or your password.",
        });
        // Redirection is handled by the useAuth hook
    } catch (error) {
        let description = "The password you entered was incorrect. Please try again.";
        const authError = error as AuthError;
        if (authError.code !== 'auth/wrong-password' && authError.code !== 'auth/invalid-credential') {
            description = "An unexpected error occurred during linking. Please try again.";
            console.error("Linking error:", authError);
        }
        toast({
            title: "Linking Failed",
            description: description,
            variant: "destructive",
        });
    } finally {
        setPendingGoogleCredential(null);
        setIsLoading(false);
    }
  };


  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
        await signInWithGoogle();
        // After linking, the user object updates. If they were anonymous, we redirect.
        if (user?.isAnonymous) {
            router.push('/');
        }
        // Otherwise redirection is handled by useAuth hook
    } catch (error) {
        const authError = error as AuthError;
        let description = "Could not sign in with Google. Please try again.";
        
        if (authError.code === 'auth/account-exists-with-different-credential') {
            const pendingCred = GoogleAuthProvider.credentialFromError(authError);
            if (pendingCred) {
                const userEmail = authError.customData?.email as string;
                if (!userEmail) {
                  toast({ title: "Linking Error", description: "Could not retrieve email from Google. Please try again.", variant: "destructive"});
                  setIsLoading(false);
                  return;
                }
                
                // Temporarily sign in with the email to get the user object for re-authentication
                try {
                  await signInWithEmailAndPassword(auth, userEmail, 'invalid-password-to-force-user-object');
                } catch (signInError) {
                    const signInAuthError = signInError as AuthError;
                    // We expect this to fail, but it gives us the user context if the email exists.
                    if (signInAuthError.code === 'auth/invalid-credential' && auth.currentUser) {
                       setEmail(userEmail); // Pre-fill email for password prompt
                       setPendingGoogleCredential(pendingCred);
                       setIsLinkDialogOpen(true);
                    } else {
                       toast({ title: "Account Error", description: "Could not prepare account for linking. Please try signing in with your password first.", variant: "destructive"});
                    }
                }
            }
            setIsLoading(false);
            return; // Stop further execution here, wait for dialog
        }
        
        if (authError.code === 'auth/popup-closed-by-user') {
            description = "The sign-in popup was closed before completing. Please try again.";
        } else if (authError.code === 'auth/credential-already-in-use') {
            description = "This Google account is already linked to another user. Please sign in with your original method.";
        }
        toast({
            title: "Google Sign-In Failed",
            description,
            variant: "destructive",
        });
    } finally {
        if (isLinkDialogOpen === false) { // Don't turn off loading if dialog is opening
            setIsLoading(false);
        }
    }
  };

  const handleAnonymousSignIn = async () => {
    setIsLoading(true);
    try {
        await signInAnonymously();
        router.push('/');
    } catch (error) {
        toast({
            title: "Anonymous Sign-In Failed",
            description: "Could not sign in as a guest. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  const isGuestMode = !!user?.isAnonymous;

  return (
    <>
        <PasswordConfirmationDialog
            isOpen={isLinkDialogOpen}
            onClose={() => setIsLinkDialogOpen(false)}
            onConfirm={handlePasswordConfirm}
            email={email}
        />
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                    <ChefHat className="h-10 w-10 text-primary" />
                </div>
            <CardTitle className="text-2xl font-bold font-headline">
                {isGuestMode ? 'Save Your Progress' : (isSigningUp ? 'Create an Account' : 'Welcome Back')}
            </CardTitle>
            <CardDescription>
                {isGuestMode ? 'Create an account to save your recipes permanently.' : (isSigningUp ? 'Enter your details to get started.' : 'Log in to access your culinary canvas.')}
            </CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleAuthAction} className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    placeholder="Enter your password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={isSigningUp ? 'new-password' : 'current-password'}
                />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : (isGuestMode ? 'Save & Create Account' : (isSigningUp ? 'Sign Up' : 'Log In'))}
                </Button>
            </form>

            <div className="my-4 flex items-center">
                <Separator className="flex-1" />
                <span className="mx-4 text-xs text-muted-foreground">OR</span>
                <Separator className="flex-1" />
            </div>

            <div className="space-y-2">
                <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : <><GoogleIcon className="mr-2 h-5 w-5" />
                {isGuestMode ? 'Link with Google' : 'Sign in with Google'}</>}
                </Button>
                {!isGuestMode && (
                <Button variant="outline" className="w-full" onClick={handleAnonymousSignIn} disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : <><User className="mr-2 h-5 w-5" />
                    Continue as Guest</>}
                </Button>
                )}
            </div>
            
            {!isGuestMode && (
                <div className="mt-4 text-center text-sm">
                    {isSigningUp ? 'Already have an account?' : "Don't have an account?"}
                    <Button
                    variant="link"
                    className="pl-1"
                    onClick={() => setIsSigningUp(!isSigningUp)}
                    >
                    {isSigningUp ? 'Log In' : 'Sign Up'}
                    </Button>
                </div>
            )}
            </CardContent>
        </Card>
        </div>
    </>
  );
}

    