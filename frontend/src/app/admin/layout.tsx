'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { ShieldAlert, LayoutDashboard, Package, Users, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If not logged in or not admin, redirect
    if (!user) {
      router.push('/admin/login');
    } else if (user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Don't render layout if on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!user || user.role !== 'admin') return null;

  const sidebarLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Packages', path: '/admin/packages', icon: Package },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-destructive/20 bg-card hidden md:flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-destructive"></div>
        <div className="h-16 flex items-center px-6 border-b border-border/40">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-xl tracking-tight text-destructive">
            <ShieldAlert className="h-6 w-6" />
            <span>Admin Portal</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link key={link.path} href={link.path}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive ? 'bg-destructive text-destructive-foreground font-medium shadow-md' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}>
                  <link.icon className="h-5 w-5" />
                  {link.name}
                </div>
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-border/40 space-y-2">
          <Link href="/">
            <Button variant="outline" className="w-full justify-start gap-3 text-foreground">
              <ShieldAlert className="h-4 w-4" />
              Back to Website
            </Button>
          </Link>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground" onClick={() => { logout(); router.push('/admin/login'); }}>
            <LogOut className="h-5 w-5" />
            Admin Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-border/40 flex items-center justify-between px-4 bg-card border-t-2 border-t-destructive">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-lg text-destructive">
            <ShieldAlert className="h-5 w-5" />
            <span>Admin Portal</span>
          </Link>
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
