'use client';

import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Server, 
  DollarSign, 
  Activity, 
  Clock, 
  CheckCircle2, 
  Wifi, 
  Gift, 
  ArrowRight,
  ShieldAlert,
  FileText,
  HardDrive
} from 'lucide-react';
import { getIspLogo } from '@/components/marketing/IspLogos';

export default function AdminDashboard() {
  const { orders, packages, networkPackages, promoCodes, getServerBandwidthStats } = useApp();
  const bandwidthStats = getServerBandwidthStats ? getServerBandwidthStats() : null;

  const pendingOrders = orders.filter((o) => o.status === 'pending_approval');
  const approvedOrders = orders.filter((o) => o.status === 'approved');
  const totalRevenue = approvedOrders.reduce((sum, o) => sum + (o.finalAmount || 0), 0);
  const activeVouchers = promoCodes.filter((p) => p.isActive && !p.isUsed && (!p.expiryDate || Date.now() <= new Date(p.expiryDate).getTime()));

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-2 text-destructive font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldAlert className="h-4 w-4" />
            <span>Master Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Admin Overview</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            System status, live orders, active network bypasses, and gift cards at a glance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {pendingOrders.length > 0 && (
            <Link href="/admin/orders">
              <Button size="sm" className="gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs shadow-md">
                <Clock className="h-3.5 w-3.5 animate-pulse" />
                <span>Review {pendingOrders.length} Pending Order{pendingOrders.length > 1 ? 's' : ''}</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Top Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Pending Orders */}
        <Link href="/admin/orders">
          <Card className="hover:border-destructive/60 transition-colors cursor-pointer bg-card/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pending Slips & Orders
              </CardTitle>
              <Clock className={`h-4 w-4 ${pendingOrders.length > 0 ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold font-mono">
                {pendingOrders.length}
              </div>
              <p className={`text-xs mt-1 font-medium ${pendingOrders.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {pendingOrders.length > 0 ? 'Requires your approval' : 'All orders processed'}
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Approved Revenue */}
        <Card className="bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Approved Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-500">
              Rs. {totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {approvedOrders.length} verified order{approvedOrders.length === 1 ? '' : 's'}
            </p>
          </CardContent>
        </Card>

        {/* Network Packages */}
        <Link href="/admin/networks">
          <Card className="hover:border-primary/60 transition-colors cursor-pointer bg-card/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Network Packages
              </CardTitle>
              <Wifi className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold font-mono">
                {networkPackages.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                SLT, Dialog, Hutch, Airtel bypass routes
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Gift Cards & Promos */}
        <Link href="/admin/promos">
          <Card className="hover:border-emerald-500/60 transition-colors cursor-pointer bg-card/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Active Gift Cards
              </CardTitle>
              <Gift className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
                {activeVouchers.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Single-use trial vouchers ready
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Server Bandwidth Pool */}
        <Link href="/admin/packages">
          <Card className="hover:border-primary/60 transition-colors cursor-pointer bg-card/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Bandwidth Pool
              </CardTitle>
              <HardDrive className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
                {bandwidthStats?.remainingBandwidthTb || 20} TB
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Free of {bandwidthStats?.totalCapacityTb || 20} TB quota
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Live Recent Orders & Quick Shortcuts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders (2 cols) */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold">Recent Customer Orders</CardTitle>
              <CardDescription className="text-xs">
                Real-time checkout orders submitted by users.
              </CardDescription>
            </div>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-primary">
                <span>View All ({orders.length})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-xs">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>No customer orders yet. They will appear here when placed via checkout.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div 
                    key={order.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50 gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-foreground">{order.id}</span>
                        {order.status === 'pending_approval' ? (
                          <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px] font-bold">
                            <Clock className="h-3 w-3 mr-1 animate-pulse" />
                            Pending
                          </Badge>
                        ) : order.status === 'approved' ? (
                          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Approved
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            Rejected
                          </Badge>
                        )}
                      </div>
                      <div className="text-muted-foreground">
                        <span className="font-medium text-foreground">{order.customerName}</span> ({order.customerEmail})
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <span className="font-mono font-bold text-foreground block">
                          Rs. {order.finalAmount}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {order.packageName}
                        </span>
                      </div>
                      <Link href="/admin/orders">
                        <Button size="sm" variant="outline" className="h-7 text-xs px-2.5">
                          Review
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Management Shortcuts (1 col) */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Quick Shortcuts</CardTitle>
              <CardDescription className="text-xs">
                Jump directly to admin management tasks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <Link href="/admin/promos" className="block">
                <div className="p-3 rounded-xl border border-border/60 hover:border-destructive/40 hover:bg-muted/30 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Gift className="h-4 w-4 text-destructive" />
                    <div>
                      <p className="font-semibold text-foreground">Generate Trial Gift Card</p>
                      <p className="text-[11px] text-muted-foreground">7-Day, 14-Day free vouchers</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>

              <Link href="/admin/networks" className="block">
                <div className="p-3 rounded-xl border border-border/60 hover:border-destructive/40 hover:bg-muted/30 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Wifi className="h-4 w-4 text-destructive" />
                    <div>
                      <p className="font-semibold text-foreground">Network Packages</p>
                      <p className="text-[11px] text-muted-foreground">Add SLT, Dialog, Hutch bypass</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>

              <Link href="/admin/packages" className="block">
                <div className="p-3 rounded-xl border border-border/60 hover:border-destructive/40 hover:bg-muted/30 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Server className="h-4 w-4 text-destructive" />
                    <div>
                      <p className="font-semibold text-foreground">Main Package Manager</p>
                      <p className="text-[11px] text-muted-foreground">Prices, quotas, features</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-destructive">
                <Activity className="h-4 w-4" />
                <span>Node Health</span>
              </div>
              <p className="text-muted-foreground text-[11px]">
                Singapore Node 01 (`sg-node-01.v2ray.network`) is operating normally with 35ms latency.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
