'use client';

import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardOverview() {
  const { user, subscription, usage, vpnConfig, packages } = useApp();

  const activePackage = packages.find(p => p.id === subscription?.packageId);
  
  // Calculate remaining days
  const expiryDate = new Date(subscription?.expiryDate || Date.now());
  const today = new Date();
  const diffTime = Math.abs(expiryDate.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Calculate usage percentage
  const usageLimit = activePackage?.trafficLimit || 0;
  const usagePercentage = usageLimit > 0 && usage ? (usage.total / usageLimit) * 100 : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground mt-1">Here is what's happening with your account today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription Status</CardTitle>
            <ShieldCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{subscription?.status || 'Inactive'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Plan: {activePackage?.name || 'None'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Remaining</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{diffDays} Days</div>
            <p className="text-xs text-muted-foreground mt-1">
              Expires on {expiryDate.toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage?.total.toFixed(2) || 0} GB</div>
            <p className="text-xs text-muted-foreground mt-1">
              Of {usageLimit === 0 ? 'Unlimited' : `${usageLimit} GB limit`}
            </p>
            {usageLimit > 0 && (
              <div className="w-full bg-secondary h-1.5 rounded-full mt-3 overflow-hidden">
                <div 
                  className={`h-full ${usagePercentage > 90 ? 'bg-destructive' : 'bg-primary'}`} 
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={vpnConfig?.status === 'connected' ? 'border-primary shadow-sm shadow-primary/20' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection</CardTitle>
            <Zap className={`h-4 w-4 ${vpnConfig?.status === 'connected' ? 'text-primary' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={vpnConfig?.status === 'connected' ? 'default' : 'secondary'} className="capitalize">
                {vpnConfig?.status || 'Disconnected'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2 truncate">
              {vpnConfig?.server || 'No active server'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Quick Connect</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              Get your VPN configuration to connect your devices instantly. Use our app or scan the QR code for V2Ray/Xray clients.
            </p>
            <Link href="/dashboard/vpn">
              <Button className="w-full">Get VPN Config & QR Code</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-l-2 border-primary pl-4">
              <h4 className="text-sm font-semibold">New Servers Added in Japan</h4>
              <p className="text-xs text-muted-foreground mt-1">Experience even faster speeds in the Asia-Pacific region.</p>
            </div>
            <div className="border-l-2 border-muted pl-4 opacity-70">
              <h4 className="text-sm font-semibold">Scheduled Maintenance</h4>
              <p className="text-xs text-muted-foreground mt-1">US-East servers will undergo maintenance this Sunday.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
