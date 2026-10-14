'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/AppContext';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const redirectTarget = searchParams.get('redirect');
  const isRedirectFromPlan = redirectTarget && (redirectTarget.includes('checkout') || redirectTarget.includes('network'));

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock registration and automatic login
    setTimeout(() => {
      login({
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        name: name,
        email: email,
        role: 'user'
      });
      router.push(redirectTarget || '/pricing');
    }, 1000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-card p-8 md:p-10 rounded-2xl border border-border shadow-lg">
        
        {isRedirectFromPlan && (
          <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/25 text-xs text-primary flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
            <Sparkles className="h-4 w-4 shrink-0 animate-pulse" />
            <span>Create your account to complete your package subscription.</span>
          </div>
        )}

        <div className="flex flex-col items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <span>V2Nexus</span>
          </Link>
          <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-foreground">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link 
              href={redirectTarget ? `/login?redirect=${encodeURIComponent(redirectTarget)}` : '/login'} 
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <Input 
                type="text" 
                required 
                className="mt-1 h-12" 
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
              <label className="text-sm font-medium">Password</label>
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
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground mt-4">
            By clicking "Create account", you agree to our Terms of Service and Privacy Policy.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
