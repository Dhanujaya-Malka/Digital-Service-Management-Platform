'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, Sparkles, Mail, CheckCircle2, ArrowRight, ArrowLeft, RefreshCw, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/AppContext';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useApp();

  const [step, setStep] = useState<'form' | 'verify' | 'success'>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // OTP Verification States
  const [otpCode, setOtpCode] = useState('');
  const [resendCountdown, setResendCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTarget = searchParams.get('redirect');
  const isRedirectFromPlan = redirectTarget && (redirectTarget.includes('checkout') || redirectTarget.includes('network'));

  // Countdown timer for OTP Resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'verify' && resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    } else if (resendCountdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [step, resendCountdown]);

  // Step 1: Submit Form and Send OTP
  
const handleFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanName) {
    setError("Please enter your full name.");
    return;
  }

  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    setError("Please enter a valid email address.");
    return;
  }

  if (password.length < 6) {
    setError("Password must be at least 6 characters long.");
    return;
  }

  if (password !== confirmPassword) {
    setError("Passwords do not match. Please verify.");
    return;
  }

  setIsLoading(true);

  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: cleanName,
        email: cleanEmail,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Registration failed.");
      return;
    }

    setStep("verify");
    setOtpCode("");
    setResendCountdown(30);
    setCanResend(false);
  } catch {
    setError("Could not connect to the server. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

  // Step 2: Verify OTP
  
const handleVerifyOtp = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  const cleanOtp = otpCode.trim();

  if (!/^\d{6}$/.test(cleanOtp)) {
    setError("Please enter the 6-digit verification code.");
    return;
  }

  setIsLoading(true);

  try {
    const response = await fetch(`${API_URL}/api/auth/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        otp: cleanOtp,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Email verification failed.");
      return;
    }

    setStep("success");

    const newUser = {
      id: "user-" + Math.random().toString(36).slice(2, 11),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: "user" as const,
      isEmailVerified: true,
    };

    login(newUser);

    setTimeout(() => {
      router.push(redirectTarget || "/pricing");
    }, 1500);
  } catch {
    setError("Could not connect to the server. Please try again.");
  } finally {
    setIsLoading(false);
  }
};
  // Resend OTP
 
const handleResendOtp = async () => {
  if (!canResend || isLoading) return;

  setError(null);
  setIsLoading(true);

  try {
    const response = await fetch(
      `${API_URL}/api/auth/resend-verification`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Could not resend verification code.");
      return;
    }

    setOtpCode("");
    setResendCountdown(30);
    setCanResend(false);
    setError(null);
  } catch {
    setError("Could not connect to the server. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-card p-8 md:p-10 rounded-2xl border border-border shadow-xl relative overflow-hidden">
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary"></div>

        {isRedirectFromPlan && step === 'form' && (
          <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/25 text-xs text-primary flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
            <Sparkles className="h-4 w-4 shrink-0 animate-pulse" />
            <span>Create your account to complete your package subscription.</span>
          </div>
        )}

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <span>V2Nexus</span>
          </Link>

          {step === 'verify' && (
            <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mt-1 mb-2 shadow-inner">
              <Mail className="h-6 w-6" />
            </div>
          )}

          {step === 'success' && (
            <div className="h-12 w-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 mt-1 mb-2 shadow-inner">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          )}

          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {step === 'form' && 'Create an account'}
            {step === 'verify' && 'Verify Your Email'}
            {step === 'success' && 'Account Verified!'}
          </h2>

          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
            {step === 'form' && 'Already have an account? '}
            {step === 'form' && (
              <Link 
                href={redirectTarget ? `/login?redirect=${encodeURIComponent(redirectTarget)}` : '/login'} 
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            )}
            {step === 'verify' && `We sent a 6-digit verification code to ${email}`}
            {step === 'success' && 'Your email has been verified. Redirecting to your destination...'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-xs text-destructive font-medium animate-in fade-in">
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Registration Form */}
        {step === 'form' && (
          <div className="space-y-4">
            <GoogleSignInButton
              target="user"
              text="Sign up with Google"
              isSignUp={true}
              redirectTarget={redirectTarget || '/dashboard'}
              onError={(msg) => setError(msg)}
            />

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2.5 text-muted-foreground font-medium">Or register with email</span>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleFormSubmit}>
            <div>
              <label className="text-xs font-semibold text-foreground">Full Name</label>
              <div className="relative mt-1">
                <Input 
                  type="text" 
                  required 
                  className="h-12 pl-10 text-sm" 
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError(null);
                  }}
                />
                <UserIcon className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Email address</label>
              <div className="relative mt-1">
                <Input 
                  type="email" 
                  required 
                  className="h-12 pl-10 text-sm" 
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                />
                <Mail className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Password</label>
              <div className="relative mt-1">
                <Input 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  className="h-12 pl-10 pr-11 text-sm" 
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                />
                <Lock className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
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

            <div>
              <label className="text-xs font-semibold text-foreground">Confirm Password</label>
              <div className="relative mt-1">
                <Input 
                  type="password" 
                  required 
                  className="h-12 pl-10 text-sm" 
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError(null);
                  }}
                />
                <Lock className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-sm font-semibold shadow-md gap-2 mt-2"
              disabled={isLoading}
            >
              <span>{isLoading ? 'Sending Verification Code...' : 'Continue to Email Verification'}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            
            <p className="text-[11px] text-center text-muted-foreground mt-3">
              By registering, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </div>
      )}

        {/* STEP 2: Email OTP Verification */}
        {step === 'verify' && (
          <form className="space-y-4" onSubmit={handleVerifyOtp}>
            <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-foreground flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-primary shrink-0" />
              <span>
                We sent a 6-digit verification code to <strong className="text-primary">{email}</strong>. Please check your inbox and spam folder.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Enter 6-Digit Code</label>
              <Input 
                type="text" 
                maxLength={6}
                required 
                autoFocus
                className="mt-1 h-12 text-center text-xl font-mono tracking-widest" 
                placeholder="000000"
                value={otpCode}
                onChange={(e) => {
                  setOtpCode(e.target.value.replace(/[^0-9]/g, ''));
                  if (error) setError(null);
                }}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-sm font-semibold shadow-md gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Verifying Code...' : 'Verify Email & Create Account'}</span>
            </Button>

            {/* Resend and Change Email options */}
            <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground">
              <button
                type="button"
                className="hover:text-primary transition-colors flex items-center gap-1"
                onClick={() => {
                  setStep('form');
                  setOtpCode('');
                  setError(null);
                }}
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Change Email</span>
              </button>

              <button
                type="button"
                disabled={!canResend || isLoading}
                onClick={handleResendOtp}
                className={`transition-colors ${
                  canResend 
                    ? 'text-primary font-semibold hover:underline' 
                    : 'text-muted-foreground/60 cursor-not-allowed'
                }`}
              >
                {canResend ? 'Resend Code' : `Resend in ${resendCountdown}s`}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Success Screen */}
        {step === 'success' && (
          <div className="space-y-4 text-center py-4">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-600 dark:text-green-400">
              Welcome to V2Nexus, <strong>{name}</strong>! Your email has been verified and your account is now ready.
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
              <span>Redirecting to your dashboard...</span>
            </div>
          </div>
        )}
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
