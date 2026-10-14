'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/AppContext';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const redirectTarget = searchParams.get('redirect') || '/dashboard';
  const isRedirectFromPlan = redirectTarget.includes('checkout') || redirectTarget.includes('network');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock authentication
    setTimeout(() => {
      login({
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        name: email.split('@')[0] || 'User',
        email: email,
        role: 'user'
      });
      router.push(redirectTarget);
    }, 1000);
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
              <label className="text-sm font-medium">Email address</label>
              <Input 
                type="email" 
                required 
                className="mt-1 h-12" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Password</label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input 
                type="password" 
                required 
                className="mt-1 h-12" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
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
