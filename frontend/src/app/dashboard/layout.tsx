'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  Shield, 
  ShieldAlert, 
  LayoutDashboard, 
  Server, 
  Activity, 
  CreditCard, 
  User as UserIcon, 
  LogOut, 
  FileText,
  Menu,
  X,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isInitialized, orders, login, logout } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      // 1. If an order exists, automatically restore that customer session
      if (orders && orders.length > 0) {
        const primaryOrder = orders[0];
        login({
          id: `cust-${primaryOrder.id.toLowerCase()}`,
          name: primaryOrder.customerName || 'Customer',
          email: primaryOrder.customerEmail,
          role: 'user',
        });
        return;
      }
      // 2. Otherwise initialize default customer session so dashboard is immediately visible and testable
      login({
        id: 'cust-demo',
        name: 'Dhanujaya Malka',
        email: 'dhanujayamalka@gmail.com',
        role: 'user',
      });
    }
  }, [user, isInitialized, orders, login]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="text-xs text-muted-foreground">Connecting to dashboard...</p>
      </div>
    );
  }

  const cleanCurrentPath = pathname ? pathname.replace(/\/$/, '') : '';

  const sidebarLinks = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'VPN Config', path: '/dashboard/vpn', icon: Server },
    { name: 'Usage', path: '/dashboard/usage', icon: Activity },
    { name: 'Subscription', path: '/dashboard/subscription', icon: CreditCard },
    { name: 'My Orders', path: '/dashboard/orders', icon: FileText },
    { name: 'Profile', path: '/dashboard/profile', icon: UserIcon },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-border/40 bg-card hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border/40">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Shield className="h-6 w-6 text-primary" />
            <span>V2Nexus</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {sidebarLinks.map((link) => {
            const isActive = cleanCurrentPath === link.path.replace(/\/$/, '');
            return (
              <Link key={link.path} href={link.path}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive ? 'bg-primary text-primary-foreground font-medium shadow-md' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}>
                  <link.icon className="h-5 w-5" />
                  {link.name}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-border/40 space-y-3">
          <div className="flex items-center gap-2.5 px-1 py-1">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
                {user.isEmailVerified && (
                  <span title="Verified Email" className="inline-flex items-center">
                    <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>

          <Link href="/">
            <Button variant="outline" className="w-full justify-start gap-3 text-foreground text-xs">
              <ArrowLeft className="h-4 w-4" />
              Back to Website
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-xs text-muted-foreground hover:text-foreground" 
            onClick={() => { 
              logout(); 
              router.push('/'); 
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-border/40 flex items-center justify-between px-4 bg-card z-30 shrink-0">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Shield className="h-5 w-5 text-primary" />
            <span>V2Nexus</span>
          </Link>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-foreground"
            aria-label="Toggle Dashboard Menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </header>

        {/* Mobile Menu Dropdown Sheet */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-card/95 backdrop-blur-md border-b border-border/50 px-4 py-4 space-y-2 z-20 animate-in slide-in-from-top-2 shadow-xl">
            <div className="space-y-1">
              {sidebarLinks.map((link) => {
                const isActive = cleanCurrentPath === link.path.replace(/\/$/, '');
                return (
                  <Link 
                    key={link.path} 
                    href={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-colors ${
                      isActive ? 'bg-primary text-primary-foreground font-semibold shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}>
                      <link.icon className="h-4 w-4" />
                      <span>{link.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-border/40 flex items-center justify-between gap-2">
              <Link href="/" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-8">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Website</span>
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-1 text-xs text-muted-foreground hover:text-destructive gap-1.5 h-8"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                  router.push('/');
                }}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
