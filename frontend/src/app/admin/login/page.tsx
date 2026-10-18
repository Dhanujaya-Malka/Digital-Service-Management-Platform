'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, ArrowRight, Zap, ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/AppContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useApp();
  const [username, setUsername] = useState('superadmin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const trimmedUser = username.trim().toLowerCase();
    const validUsernames = ['superadmin', 'admin', 'admin@v2nexus.lk', 'admin@v2nexus.com'];
    const validPasswords = ['admin123', 'superadmin', 'superadmin123', 'admin'];

    if (!validUsernames.includes(trimmedUser)) {
      setIsLoading(false);
      setError('Invalid Super Admin username or email.');
      return;
    }

    if (!validPasswords.includes(password.trim())) {
      setIsLoading(false);
      setError('Invalid password. (Default: admin123 or superadmin)');
      return;
    }

    setTimeout(() => {
      login({
        id: 'admin-super',
        name: 'Super Admin',
        email: trimmedUser.includes('@') ? trimmedUser : 'admin@v2nexus.lk',
        role: 'admin',
      });
      router.push('/admin/packages');
    }, 500);
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

        {error && (
          <div className="p-3.5 rounded-xl bg-destructive/15 border border-destructive/30 text-xs text-destructive font-medium animate-in fade-in">
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleFormSubmit}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-foreground">Admin Username or Email</label>
              <Input 
                type="text" 
                required 
                className="mt-1 h-11 text-sm bg-muted/30" 
                placeholder="superadmin or admin@v2nexus.lk"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError(null);
                }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground">Password</label>
              <div className="relative mt-1">
                <Input 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  className="h-11 pr-10 text-sm bg-muted/30" 
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            variant="destructive"
            className="w-full h-11 text-sm font-semibold shadow-md gap-2"
            disabled={isLoading}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>{isLoading ? 'Authenticating...' : 'Sign In as Super Admin'}</span>
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
