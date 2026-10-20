'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldAlert, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  UserCheck, 
  RefreshCw,
  Sparkles,
  Lock,
  ExternalLink
} from 'lucide-react';

interface AdminEmailResponse {
  configuredInEnv: string[];
  databaseAdmins: Array<{ id: string; name: string; email: string; role: string; created_at: string }>;
  allAuthorizedEmails: string[];
}

export default function AdminAuthorizedEmailsPage() {
  const [data, setData] = useState<AdminEmailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/authorized-emails`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Failed to load admin emails:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newEmail.includes('@')) {
      setMsg({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setIsSubmitting(true);
    setMsg(null);

    try {
      const res = await fetch(`${API_URL}/api/admin/authorized-emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail.trim(), name: newName.trim() }),
      });
      const resData = await res.json();

      if (!res.ok) {
        setMsg({ type: 'error', text: resData.message || 'Could not add admin email.' });
        return;
      }

      setMsg({ type: 'success', text: resData.message || 'Admin authorized successfully!' });
      setNewEmail('');
      setNewName('');
      await loadData();
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to connect to backend server.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (emailToRevoke: string) => {
    if (!confirm(`Are you sure you want to revoke admin access for ${emailToRevoke}?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/authorized-emails/${encodeURIComponent(emailToRevoke)}`, {
        method: 'DELETE',
      });
      const resData = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: resData.message });
        await loadData();
      } else {
        setMsg({ type: 'error', text: resData.message });
      }
    } catch (e) {
      setMsg({ type: 'error', text: 'Could not contact server.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <ShieldAlert className="h-7 w-7 text-destructive" />
            <span>Google Admin Access & Whitelist</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage who is allowed to sign in with Google into the V2Nexus Admin Portal.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={isLoading}
          className="gap-2 border-border/60 self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-xl text-sm flex items-start gap-3 border ${
            msg.type === 'success'
              ? 'bg-green-500/10 border-green-500/25 text-green-600 dark:text-green-400'
              : 'bg-destructive/15 border-destructive/30 text-destructive'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Add New Admin Card */}
      <Card className="border-destructive/30 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-foreground">
            <Plus className="h-5 w-5 text-destructive" />
            <span>Authorize New Admin Email</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Enter the Google account email of any administrator or support staff member to grant them immediate Admin Portal access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddAdmin} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-6 space-y-1">
              <label className="text-xs font-semibold text-foreground">Admin Email Address</label>
              <div className="relative">
                <Input
                  type="email"
                  required
                  placeholder="name@gmail.com or admin@domain.com"
                  className="pl-9 h-11 text-sm"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
                <Mail className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="sm:col-span-4 space-y-1">
              <label className="text-xs font-semibold text-foreground">Admin Full Name (Optional)</label>
              <Input
                type="text"
                placeholder="e.g. Dhanujaya Malka"
                className="h-11 text-sm"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <Button
                type="submit"
                variant="destructive"
                disabled={isSubmitting}
                className="w-full h-11 text-sm font-semibold gap-2 shadow"
              >
                <UserCheck className="h-4 w-4" />
                <span>{isSubmitting ? 'Authorizing...' : 'Authorize'}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Authorized Admins List */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              <span>Currently Authorized Admin Accounts</span>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              {data?.allAuthorizedEmails?.length || 0} Admins Active
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs">
            Only users with these verified Google emails can authenticate via "Sign in with Google as Admin".
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 flex justify-center items-center gap-2 text-xs text-muted-foreground">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
              <span>Loading authorized emails...</span>
            </div>
          ) : !data || data.allAuthorizedEmails.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No admin emails found.</p>
          ) : (
            <div className="divide-y divide-border/60">
              {data.allAuthorizedEmails.map((email) => {
                const isEnvConfigured = data.configuredInEnv.includes(email.toLowerCase());
                const dbUser = data.databaseAdmins.find((u) => u.email.toLowerCase() === email.toLowerCase());

                return (
                  <div key={email} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-destructive/15 text-destructive font-bold flex items-center justify-center text-sm">
                        {email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{dbUser?.name || email.split('@')[0]}</p>
                          {isEnvConfigured && (
                            <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                              .ENV Whitelist
                            </Badge>
                          )}
                          {dbUser && (
                            <Badge variant="outline" className="text-[10px] border-destructive/30 text-destructive">
                              Database Admin
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">{email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Do not allow deleting superadmin */}
                      {email !== 'dhanujayamalka@gmail.com' && email !== 'admin@v2nexus.lk' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevoke(email)}
                          className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Revoke</span>
                        </Button>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">
                          Primary SuperAdmin
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* How it works info card */}
      <Card className="border-border/60 bg-muted/20">
        <CardContent className="pt-6 text-xs text-muted-foreground space-y-2">
          <p className="font-semibold text-foreground flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>How Google Admin Authentication Works:</span>
          </p>
          <ul className="list-disc list-inside space-y-1 pl-1">
            <li>When an administrator visits <code>/admin/login</code> and clicks <strong>Sign in with Google as Admin</strong>, their Google email is verified against this authorized list.</li>
            <li>If the email is listed here, they are granted <code>role: &apos;admin&apos;</code> and redirected into the Admin Portal.</li>
            <li>If an unauthorized Google account tries to log in, access is denied with a <strong>403 Forbidden</strong> alert.</li>
            <li>You can also add admin emails directly to <code>backend/.env</code> under <code>ADMIN_EMAILS=email1@gmail.com,email2@gmail.com</code>.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
