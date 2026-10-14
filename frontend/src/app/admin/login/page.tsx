'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, ArrowRight, Zap, ArrowLeft, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/AppContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, login } = useApp();
  const [email, setEmail] = useState('admin@v2nexus.com');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);

  const performLogin = (targetEmail: string) => {
    setIsLoading(true);
    login({
      id: 'admin-1',
      name: 'System Admin',
      email: targetEmail || 'admin@v2nexus.com',
      role: 'admin',
    });
    // Navigate immediately to package manager
    router.push('/admin/packages');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-card p-8 md:p-10 rounded-2xl border border-destructive/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-destructive"></div>
        
        <div className="flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mb-3 shadow-inner">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Admin Portal
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
            Administrative management access for V2Nexus.
          </p>
        </div>

        {/* 1-Click Fast Access Button */}
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-destructive">
            <Zap className="h-3.5 w-3.5" />
            <span>One-Click Instant Access</span>
          </div>
          <Button 
            type="button"
            variant="destructive"
            className="w-full h-11 font-bold text-sm shadow-md gap-2"
            onClick={() => performLogin('admin@v2nexus.com')}
            disabled={isLoading}
          >
            <span>{isLoading ? 'Accessing...' : 'Enter Admin Panel Now'}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-2 text-muted-foreground uppercase font-medium">Or log in with credentials</span>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleFormSubmit}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-foreground">Admin Email</label>
              <Input 
                type="email" 
                required 
                className="mt-1 h-11 text-sm bg-muted/30" 
                placeholder="admin@v2nexus.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground">Password</label>
              <Input 
                type="password" 
                required 
                className="mt-1 h-11 text-sm bg-muted/30" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            variant="outline"
            className="w-full h-11 text-sm font-semibold border-border/80 hover:bg-muted gap-2"
            disabled={isLoading}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>{isLoading ? 'Authenticating...' : 'Sign In With Credentials'}</span>
          </Button>
        </form>

        <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
          <Link href="/login" className="hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" />
            <span>User Login</span>
          </Link>
          <Link href="/" className="hover:text-primary transition-colors">
            Back to Website
          </Link>
        </div>
      </div>
    </div>
  );
}
