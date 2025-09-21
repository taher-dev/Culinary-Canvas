
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, AuthError } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ChefHat } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSigningUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: "Account created successfully!", description: "You've been logged in." });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Login successful!", description: "Welcome back." });
      }
      router.push('/');
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = 'An unexpected error occurred. Please try again.';
      switch (authError.code) {
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Invalid email or password.';
          break;
        case 'auth/email-already-in-use':
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

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
                <ChefHat className="h-10 w-10 text-primary" />
            </div>
          <CardTitle className="text-2xl font-bold font-headline">
            {isSigningUp ? 'Create an Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription>
            {isSigningUp ? 'Enter your details to get started.' : 'Log in to access your culinary canvas.'}
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Processing...' : (isSigningUp ? 'Sign Up' : 'Log In')}
            </Button>
          </form>
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
        </CardContent>
      </Card>
    </div>
  );
}
