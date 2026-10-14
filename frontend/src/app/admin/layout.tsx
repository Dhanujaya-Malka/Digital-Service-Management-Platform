'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { ShieldAlert, LayoutDashboard, Package, LogOut, ArrowLeft, Wifi, Gift, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isInitialized, logout, orders } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isLoginPage = pathname ? pathname.includes('/admin/login') : false;

  useEffect(() => {
    if (!isInitialized || isLoginPage) return;

    if (!user) {
      router.push('/admin/login');
    } else if (user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, isInitialized, isLoginPage, router]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Don't render layout if on login page
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state while verifying authentication
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-destructive" />
          <p className="text-xs text-muted-foreground">Verifying admin session...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const cleanCurrentPath = pathname ? pathname.replace(/\/$/, '') : '';
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending_approval').length;

  const sidebarLinks = [
    { name: 'Package Manager', path: '/admin/packages', icon: Package },
    { name: 'Network Packages', path: '/admin/networks', icon: Wifi },
    { name: 'Gift Cards & Promos', path: '/admin/promos', icon: Gift },
    { 
      name: 'Orders & Slips', 
      path: '/admin/orders', 
      icon: LayoutDashboard, 
      count: pendingOrdersCount 
    },
    { name: 'Dashboard Overview', path: '/admin', icon: ShieldAlert },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 border-r border-destructive/20 bg-card hidden md:flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-destructive"></div>
        <div className="h-16 flex items-center px-6 border-b border-border/40">
          <Link href="/admin/packages" className="flex items-center gap-2 font-bold text-xl tracking-tight text-destructive">
            <ShieldAlert className="h-6 w-6" />
            <span>Admin Portal</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {sidebarLinks.map((link) => {
            const isActive = cleanCurrentPath === link.path.replace(/\/$/, '');
            return (
              <Link key={link.path} href={link.path}>
                <div className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                  isActive ? 'bg-destructive text-destructive-foreground font-medium shadow-md' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}>
                  <div className="flex items-center gap-3">
                    <link.icon className="h-5 w-5" />
                    <span>{link.name}</span>
                  </div>
                  {link.count !== undefined && link.count > 0 && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-destructive-foreground text-destructive' : 'bg-destructive/20 text-destructive'
                    }`}>
                      {link.count}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-border/40 space-y-2">
          <Link href="/">
            <Button variant="outline" className="w-full justify-start gap-3 text-foreground text-xs">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Website</span>
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-xs text-muted-foreground hover:text-destructive" 
            onClick={() => { 
              logout(); 
              router.push('/admin/login'); 
            }}
          >
            <LogOut className="h-4 w-4" />
            <span>Admin Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-border/40 flex items-center justify-between px-4 bg-card border-t-2 border-t-destructive z-30 shrink-0">
          <Link href="/admin/packages" className="flex items-center gap-2 font-bold text-lg text-destructive">
            <ShieldAlert className="h-5 w-5" />
            <span>Admin Portal</span>
          </Link>
          
          <div className="flex items-center gap-2">
            {pendingOrdersCount > 0 && (
              <Link href="/admin/orders">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground animate-pulse">
                  {pendingOrdersCount} pending
                </span>
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-foreground"
              aria-label="Toggle Admin Menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
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
                    <div className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors ${
                      isActive ? 'bg-destructive text-destructive-foreground font-semibold shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <link.icon className="h-4 w-4" />
                        <span>{link.name}</span>
                      </div>
                      {link.count !== undefined && link.count > 0 && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                          isActive ? 'bg-destructive-foreground text-destructive' : 'bg-destructive/20 text-destructive'
                        }`}>
                          {link.count}
                        </span>
                      )}
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
                  router.push('/admin/login');
                }}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/20">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
