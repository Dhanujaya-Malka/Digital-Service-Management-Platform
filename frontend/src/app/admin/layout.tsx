'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { ShieldAlert, LayoutDashboard, Package, LogOut, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isInitialized, logout } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname ? pathname.includes('/admin/login') : false;

  useEffect(() => {
    if (!isInitialized || isLoginPage) return;

    if (!user) {
      router.push('/admin/login');
    } else if (user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, isInitialized, isLoginPage, router]);

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

  const sidebarLinks = [
    { name: 'Package Manager', path: '/admin/packages', icon: Package },
    { name: 'Dashboard Overview', path: '/admin', icon: LayoutDashboard },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
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
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive ? 'bg-destructive text-destructive-foreground font-medium shadow-md' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}>
                  <link.icon className="h-5 w-5" />
                  <span>{link.name}</span>
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
        <header className="md:hidden h-16 border-b border-border/40 flex items-center justify-between px-4 bg-card border-t-2 border-t-destructive">
          <Link href="/admin/packages" className="flex items-center gap-2 font-bold text-lg text-destructive">
            <ShieldAlert className="h-5 w-5" />
            <span>Admin Portal</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/admin/packages">
              <Button size="sm" variant="ghost" className="text-xs">
                Packages
              </Button>
            </Link>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs" 
              onClick={() => { 
                logout(); 
                router.push('/admin/login'); 
              }}
            >
              Logout
            </Button>
          </div>
        </header>

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
