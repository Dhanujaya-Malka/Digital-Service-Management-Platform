'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Shield, LayoutDashboard, Server, Activity, CreditCard, User as UserIcon, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role === 'admin') {
      router.push('/admin');
    }
  }, [user, router]);

  if (!user || user.role === 'admin') return null;

  const sidebarLinks = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'VPN Config', path: '/dashboard/vpn', icon: Server },
    { name: 'Usage', path: '/dashboard/usage', icon: Activity },
    { name: 'Subscription', path: '/dashboard/subscription', icon: CreditCard },
    { name: 'Profile', path: '/dashboard/profile', icon: UserIcon },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/40 bg-card hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border/40">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Shield className="h-6 w-6 text-primary" />
            <span>SecureVPN</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link key={link.path} href={link.path}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive ? 'bg-primary text-primary-foreground font-medium shadow-md' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
              <Shield className="h-4 w-4" />
              Back to Website
            </Button>
          </Link>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground" onClick={() => { logout(); router.push('/'); }}>
            <LogOut className="h-5 w-5" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-border/40 flex items-center justify-between px-4 bg-card">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Shield className="h-5 w-5 text-primary" />
            <span>SecureVPN</span>
          </Link>
          {/* A proper mobile menu can be added here with Sheet from shadcn */}
        </header>

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
