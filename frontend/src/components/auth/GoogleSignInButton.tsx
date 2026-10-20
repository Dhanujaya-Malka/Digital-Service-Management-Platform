'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/AppContext';
import { Shield, Sparkles, X, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

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
  const [showDevModal, setShowDevModal] = useState(false);
  const [customEmail, setCustomEmail] = useState(target === 'admin' ? 'dhanujayamalka@gmail.com' : 'dhanujayamalka@gmail.com');
  const [customName, setCustomName] = useState('Dhanujaya Malka');
  const [modalError, setModalError] = useState<string | null>(null);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const isDevMode = !googleClientId || googleClientId.trim() === '' || googleClientId.includes('placeholder');

  // Load Google Identity Services script if Client ID is configured
  useEffect(() => {
    if (!isDevMode && typeof window !== 'undefined') {
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
  }, [isDevMode]);

  const handleGoogleAuth = async (credential?: string, simulatedUser?: { email: string; name: string }) => {
    setIsLoading(true);
    setModalError(null);

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
          simulatedUser,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data.message || 'Google authentication failed.';
        setModalError(errMsg);
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

      setShowDevModal(false);
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
      setModalError(errMsg);
      if (onError) onError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    if (isDevMode) {
      // Open direct Google account selector modal for seamless local/custom testing
      setShowDevModal(true);
      return;
    }

    // Real Google Identity Services prompt
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
      setShowDevModal(true);
    }
  };

  const defaultText = text || (target === 'admin'
    ? 'Sign in with Google as Admin'
    : isSignUp
    ? 'Sign up with Google'
    : 'Continue with Google');

  return (
    <>
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

      {/* Google Sign In Dialog Modal (For Dev & Instant Local Testing) */}
      {showDevModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md p-6 sm:p-7 rounded-2xl border border-border shadow-2xl relative overflow-hidden space-y-5">
            {/* Top Accent bar */}
            <div className={`absolute top-0 left-0 w-full h-1.5 ${target === 'admin' ? 'bg-destructive' : 'bg-primary'}`}></div>

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-muted/60 border border-border">
                  <svg className="h-6 w-6" viewBox="0 0 24 24">
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
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">Sign in with Google</h3>
                  <p className="text-xs text-muted-foreground">
                    {target === 'admin' ? 'Administrative Google Authorization' : 'Choose an account to continue to V2Nexus'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDevModal(false);
                  setModalError(null);
                }}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-xs text-destructive flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Quick Select Preset Accounts */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Select Google Account:
              </label>

              {/* Dhanujaya Malka Option */}
              <div
                onClick={() => {
                  setCustomEmail('dhanujayamalka@gmail.com');
                  setCustomName('Dhanujaya Malka');
                  handleGoogleAuth(undefined, { email: 'dhanujayamalka@gmail.com', name: 'Dhanujaya Malka' });
                }}
                className="p-3 rounded-xl border border-border/80 hover:border-primary/50 bg-muted/20 hover:bg-muted/40 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-sm">
                    D
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      Dhanujaya Malka
                    </p>
                    <p className="text-xs text-muted-foreground">dhanujayamalka@gmail.com</p>
                  </div>
                </div>
                {target === 'admin' && (
                  <span className="text-[10px] font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">
                    Authorized Admin
                  </span>
                )}
              </div>

              {/* Admin @ V2Nexus Option (for admin testing) */}
              {target === 'admin' && (
                <div
                  onClick={() => {
                    setCustomEmail('admin@v2nexus.lk');
                    setCustomName('V2Nexus SuperAdmin');
                    handleGoogleAuth(undefined, { email: 'admin@v2nexus.lk', name: 'V2Nexus SuperAdmin' });
                  }}
                  className="p-3 rounded-xl border border-border/80 hover:border-primary/50 bg-muted/20 hover:bg-muted/40 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-destructive/20 text-destructive font-bold flex items-center justify-center text-sm">
                      A
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground group-hover:text-destructive transition-colors">
                        V2Nexus SuperAdmin
                      </p>
                      <p className="text-xs text-muted-foreground">admin@v2nexus.lk</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-destructive/15 text-destructive border border-destructive/25 px-2 py-0.5 rounded-full">
                    Super Admin
                  </span>
                </div>
              )}
            </div>

            {/* Custom Google Email Input */}
            <div className="pt-2 border-t border-border/60 space-y-3">
              <label className="text-xs font-semibold text-foreground">
                Or enter any custom Google account:
              </label>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="your.email@gmail.com"
                  className="h-10 text-sm"
                  value={customEmail}
                  onChange={(e) => {
                    setCustomEmail(e.target.value);
                    if (modalError) setModalError(null);
                  }}
                />
                <Input
                  type="text"
                  placeholder="Your Name (Optional)"
                  className="h-10 text-sm"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
              </div>

              <Button
                type="button"
                className="w-full h-11 text-sm font-semibold shadow-md gap-2"
                disabled={isLoading || !customEmail.trim()}
                onClick={() => handleGoogleAuth(undefined, { email: customEmail.trim(), name: customName.trim() })}
              >
                <span>{isLoading ? 'Signing In...' : `Continue as ${customEmail || 'User'}`}</span>
              </Button>
            </div>

            {/* Note on Real Client ID */}
            <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40 text-[11px] text-muted-foreground text-center">
              💡 For production, provide <code className="text-primary font-mono text-[10px]">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> in <code className="text-primary font-mono text-[10px]">.env</code> to trigger real Google popup.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
