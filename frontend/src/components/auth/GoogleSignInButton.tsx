'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';

interface GoogleSignInButtonProps {
  target?: 'user' | 'admin';
  text?: string;
  isSignUp?: boolean;
  redirectTarget?: string;
  className?: string;
  onSuccess?: () => void;
  onError?: (msg: string) => void;
}

export function GoogleSignInButton({
  target = 'user',
  text,
  isSignUp = false,
  redirectTarget,
  className = '',
  onSuccess,
  onError,
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const { login } = useApp();

  const [isLoading, setIsLoading] = useState(false);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const isGoogleConfigured = !!googleClientId && googleClientId.trim() !== '' && !googleClientId.includes('placeholder');

  // Load Google Identity Services script if Client ID is configured
  useEffect(() => {
    if (isGoogleConfigured && typeof window !== 'undefined') {
      const scriptId = 'google-gsi-client';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }
    }
  }, [isGoogleConfigured]);

  const handleGoogleAuth = async (credential: string) => {
    setIsLoading(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    try {
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential,
          target,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data.message || 'Google authentication failed.';
        if (onError) onError(errMsg);
        setIsLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      if (data.user) {
        login({
          id: String(data.user.id),
          name: data.user.name,
          email: data.user.email,
          role: data.user.role === 'admin' ? 'admin' : 'user',
        });
      }

      if (onSuccess) onSuccess();

      if (target === 'admin') {
        router.push('/admin/packages');
      } else {
        router.push(redirectTarget || '/dashboard');
      }
      router.refresh();
    } catch (err: any) {
      console.error('Google auth error:', err);
      const errMsg = 'Could not connect to authentication server. Please check your network.';
      if (onError) onError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    if (!isGoogleConfigured) {
      const msg = 'Google Sign-In is not configured yet. Please continue with your email and password below.';
      if (onError) onError(msg);
      return;
    }

    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response: any) => {
          if (response.credential) {
            handleGoogleAuth(response.credential);
          }
        },
      });
      (window as any).google.accounts.id.prompt();
    } else {
      if (onError) {
        onError('Google Sign-In service is initializing. Please try again in a few seconds or use email.');
      }
    }
  };

  const defaultText = text || (target === 'admin'
    ? 'Sign in with Google as Admin'
    : isSignUp
    ? 'Sign up with Google'
    : 'Continue with Google');

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={isLoading}
      className={`w-full h-12 text-sm font-semibold border-border/80 bg-background hover:bg-muted/40 transition-all flex items-center justify-center gap-3 relative shadow-sm hover:shadow active:scale-[0.99] ${
        target === 'admin' ? 'border-destructive/30 hover:border-destructive/60' : ''
      } ${className}`}
    >
      {/* Google Multicolor SVG Icon */}
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>

      <span>{isLoading ? 'Connecting to Google...' : defaultText}</span>

      {target === 'admin' && (
        <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-destructive/15 text-destructive px-2 py-0.5 rounded-full border border-destructive/25">
          Admin
        </span>
      )}
    </Button>
  );
}
