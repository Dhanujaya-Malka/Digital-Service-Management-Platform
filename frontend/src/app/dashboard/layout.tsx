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
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isInitialized, logout } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      router.push('/login');
    }
  }, [user, isInitialized, router]);

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

  if (!user) return null;

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

        <div className="p-4 border-t border-border/40 space-y-2">
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
