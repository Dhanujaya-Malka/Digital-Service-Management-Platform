
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield, KeyRound, Mail, CheckCircle2, ArrowLeft,
  ArrowRight, Lock, RefreshCw, MessageSquare, Eye, EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Step = 'request' | 'verify' | 'success';

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '');

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (step !== 'verify' || resendCountdown <= 0) {
      if (resendCountdown <= 0) setCanResend(true);
      return;
    }

    const timer = setTimeout(() => {
      setResendCountdown((previous) => previous - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [step, resendCountdown]);

  async function requestOtp(resend = false) {
    setError(null);
    setNotice(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Could not send the reset code.');
      }

      setEmail(cleanEmail);
      setOtpCode('');
      setResendCountdown(30);
      setCanResend(false);
      setStep('verify');

      setNotice(
        data.message || 'If the account is eligible, a reset code has been sent. Check your inbox and spam folder.'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not connect to the server. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRequestSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    await requestOtp();
  }

  async function handleResendOtp() {
    if (!canResend || isLoading) return;
    await requestOtp(true);
  }

  async function handleVerifySubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    const cleanOtp = otpCode.trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: cleanOtp,
          password: newPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Could not reset your password.');
      }

      setStep('success');
      setNotice(data.message || 'Password reset successful.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not connect to the server. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-card p-8 md:p-10 rounded-2xl border border-border shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />

        <div className="flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <span>V2Nexus</span>
          </Link>

          <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mt-2 mb-2 shadow-inner">
            {step === 'success' ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : (
              <KeyRound className="h-6 w-6" />
            )}
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {step === 'request' && 'Forgot Password?'}
            {step === 'verify' && 'Reset Your Password'}
            {step === 'success' && 'Password Reset Complete'}
          </h2>

          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
            {step === 'request' && 'Enter your account email to request a password reset code.'}
            {step === 'verify' && `Enter the code sent to ${email} and choose a new password.`}
            {step === 'success' && 'Your password has been updated. You can now sign in.'}
          </p>
        </div>

        {error && (
          <div role="alert" className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-xs text-destructive font-medium">
            {error}
          </div>
        )}

        {notice && (
          <div role="status" className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-foreground">
            {notice}
          </div>
        )}

        {step === 'request' && (
          <form className="space-y-4" onSubmit={handleRequestSubmit}>
            <div>
              <label className="text-xs font-semibold text-foreground">Email Address</label>
              <div className="relative mt-1">
                <Input
                  type="email"
                  required
                  className="h-12 pl-10 text-sm"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError(null);
                  }}
                />
                <Mail className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-sm font-semibold shadow-md gap-2" disabled={isLoading}>
              <span>{isLoading ? 'Sending Code...' : 'Send Reset Instructions'}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}

        {step === 'verify' && (
          <form className="space-y-4" onSubmit={handleVerifySubmit}>
            <div>
              <label className="text-xs font-semibold text-foreground">6-Digit Code</label>
              <Input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                className="mt-1 h-12 text-center text-lg font-mono tracking-widest"
                placeholder="000000"
                value={otpCode}
                onChange={(event) => {
                  setOtpCode(event.target.value.replace(/\D/g, '').slice(0, 6));
                  setError(null);
                }}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">New Password</label>
              <div className="relative mt-1">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="h-12 pl-10 pr-11 text-sm"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value);
                    setError(null);
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
              <label className="text-xs font-semibold text-foreground">Confirm New Password</label>
              <div className="relative mt-1">
                <Input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="h-12 pl-10 text-sm"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setError(null);
                  }}
                />
                <Lock className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-sm font-semibold shadow-md gap-2" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Updating Password...' : 'Save New Password'}</span>
            </Button>

            <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground">
              <button
                type="button"
                className="hover:text-primary transition-colors flex items-center gap-1"
                disabled={isLoading}
                onClick={() => {
                  setStep('request');
                  setOtpCode('');
                  setError(null);
                  setNotice(null);
                }}
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Change Email</span>
              </button>

              <button
                type="button"
                disabled={!canResend || isLoading}
                onClick={handleResendOtp}
                className={canResend ? 'text-primary font-semibold hover:underline' : 'text-muted-foreground/60 cursor-not-allowed'}
              >
                {canResend ? 'Resend Code' : `Resend in ${resendCountdown}s`}
              </button>
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-600 dark:text-green-400">
              Your password has been reset successfully. You can now use your new password to access your account.
            </div>

            <Button type="button" className="w-full h-12 text-sm font-semibold shadow-md gap-2" onClick={() => router.push('/login')}>
              <span>Go to Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="pt-2 border-t border-border/40">
          <div className="p-3 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageSquare className="h-4 w-4 text-primary shrink-0" />
              <span>Need help? Contact Admin on Telegram:</span>
            </div>
            <a href="https://t.me/v2nexus_support" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline shrink-0">
              @v2nexus
            </a>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}