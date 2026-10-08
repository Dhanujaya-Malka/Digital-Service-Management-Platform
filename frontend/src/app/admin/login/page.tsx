'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/AppContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock admin authentication
    setTimeout(() => {
      login({
        id: 'admin-1',
        name: 'System Admin',
        email: email,
        role: 'admin'
      });
      router.push('/admin');
    }, 1000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-card p-8 md:p-10 rounded-2xl border border-destructive/20 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-destructive"></div>
        
        <div className="flex flex-col items-center">
          <ShieldAlert className="h-10 w-10 text-destructive mb-2" />
          <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-foreground">
            Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Restricted access. Authorized personnel only.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Admin Email</label>
              <Input 
                type="email" 
                required 
                className="mt-1 h-12" 
                placeholder="admin@securevpn.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Master Password</label>
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
            variant="destructive"
            className="w-full h-12 text-base font-semibold"
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Secure Login'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Return to User Login
          </Link>
        </div>
      </div>
    </div>
  );
}
