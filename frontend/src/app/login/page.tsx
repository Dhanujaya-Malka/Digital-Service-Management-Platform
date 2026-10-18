'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, Sparkles, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/AppContext';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTarget = searchParams.get('redirect') || '/dashboard';
  const isRedirectFromPlan = redirectTarget.includes('checkout') || redirectTarget.includes('network');

 

const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);

  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Login failed. Please try again.");
      return;
    }

    if (!data.user) {
      setError("Login response did not include user details.");
      return;
    }

    const user = data.user;

    login({
      id: String(user.id),
      name: user.name,
      email: user.email,
      role: user.role === "admin" ? "admin" : "user",
    });

    // Store a token only if the backend actually returns one.
    if (data.token) {
      localStorage.setItem("authToken", data.token);
    }

    router.push(redirectTarget);
    router.refresh();
  } catch (err) {
    console.error("Login request failed:", err);
    setError("Could not connect to the server. Please try again.");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-card p-8 md:p-10 rounded-2xl border border-border shadow-lg">
        
        {isRedirectFromPlan && (
          <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/25 text-xs text-primary flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
            <Sparkles className="h-4 w-4 shrink-0 animate-pulse" />
            <span>Please sign in or register to complete your package subscription.</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-xs text-destructive font-medium animate-in fade-in">
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <span>V2Nexus</span>
          </Link>
          <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-foreground">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link 
              href={redirectTarget !== '/dashboard' ? `/register?redirect=${encodeURIComponent(redirectTarget)}` : '/register'} 
              className="font-medium text-primary hover:underline"
            >
              Register now
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email or Username</label>
              <Input 
                type="text" 
                required 
                className="mt-1 h-12" 
                placeholder="you@example.com or superadmin"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <div className="relative mt-1">
                <Input 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  className="h-12 pr-11" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-base font-semibold"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
