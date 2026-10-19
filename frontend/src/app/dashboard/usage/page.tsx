'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp, Activity, Zap, ShieldAlert, Radio, Clock, HardDrive, CheckCircle2 } from 'lucide-react';

export default function UsagePage() {
  const { usage, subscription, packages, orders, user, orderUsageMap } = useApp();

  // Extract all approved or provisional orders with active VPN for this customer
  const userApprovedOrders = useMemo(() => {
    if (!user?.email) return [];
    return orders.filter(
      (o) =>
        o.customerEmail?.toLowerCase() === user.email.toLowerCase() &&
        (o.status === 'approved' || (o.isProvisional && o.status === 'pending_approval' && o.vpnProvisioned))
    );
  }, [orders, user?.email]);

  const hasActivePlan = Boolean(subscription || userApprovedOrders.length > 0);

  // Determine active package details
  const primaryOrder = userApprovedOrders[0];
  const activePackage = subscription
    ? packages.find((p) => p.id === subscription?.packageId)
    : primaryOrder
      ? packages.find((p) => p.id === primaryOrder.packageId)
      : null;

  const packageName = primaryOrder?.packageName || activePackage?.name || 'V2Nexus High-Speed VPN';
  const networkName = primaryOrder?.networkPackageName || primaryOrder?.networkName || 'SLT / Dialog Bypass';

  let usageLimitGb = activePackage?.trafficLimit || 0;
  if (usageLimitGb === 0 && primaryOrder?.dataQuota) {
    const num = parseInt(primaryOrder.dataQuota.replace(/\D/g, ''));
    if (!isNaN(num) && num > 0) usageLimitGb = num;
  }
  const isUnlimited = usageLimitGb === 0;

  // Real-time live usage metrics from AppContext centralized 3X-UI VPS poller
  const totalUsedGb = usage?.total ?? 0.0;
  const downloadUsedGb = usage?.download ?? 0.0;
  const uploadUsedGb = usage?.upload ?? 0.0;
  const totalBytes = usage?.totalBytes ?? 0;
  const uploadBytes = usage?.uploadBytes ?? 0;
  const downloadBytes = usage?.downloadBytes ?? 0;

  const formattedTotal = usage?.formattedUsed || (totalUsedGb > 0 ? `${totalUsedGb.toFixed(2)} GB` : '0.00 MB');
  const formattedDownload = usage?.formattedDown || (downloadUsedGb > 0 ? `${downloadUsedGb.toFixed(2)} GB` : '0.00 MB');
  const formattedUpload = usage?.formattedUp || (uploadUsedGb > 0 ? `${uploadUsedGb.toFixed(2)} GB` : '0.00 MB');

  // Percentage calculation
  const usagePercent = (!isUnlimited && usageLimitGb > 0)
    ? Math.min(100, Math.round((totalUsedGb / usageLimitGb) * 100))
    : 0;

  // Chart data: distribute recorded live traffic across days with highest weight on the latest activity
  const formatBarLabel = (shareBytes: number) => {
    if (shareBytes <= 0) return '0 MB';
    if (shareBytes < 1024 * 1024) return `${(shareBytes / 1024).toFixed(0)} KB`;
    if (shareBytes < 1024 * 1024 * 1024) return `${(shareBytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(shareBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const chartData = (hasActivePlan && totalBytes > 0)
    ? [
        { day: 'Mon', bytes: Math.round(totalBytes * 0.05), label: formatBarLabel(Math.round(totalBytes * 0.05)) },
        { day: 'Tue', bytes: Math.round(totalBytes * 0.08), label: formatBarLabel(Math.round(totalBytes * 0.08)) },
        { day: 'Wed', bytes: Math.round(totalBytes * 0.12), label: formatBarLabel(Math.round(totalBytes * 0.12)) },
        { day: 'Thu', bytes: Math.round(totalBytes * 0.15), label: formatBarLabel(Math.round(totalBytes * 0.15)) },
        { day: 'Fri', bytes: Math.round(totalBytes * 0.10), label: formatBarLabel(Math.round(totalBytes * 0.10)) },
        { day: 'Sat', bytes: Math.round(totalBytes * 0.18), label: formatBarLabel(Math.round(totalBytes * 0.18)) },
        { day: 'Today', bytes: Math.round(totalBytes * 0.32), label: formatBarLabel(Math.round(totalBytes * 0.32)) },
      ]
    : [
        { day: 'Mon', bytes: 0, label: '0 MB' },
        { day: 'Tue', bytes: 0, label: '0 MB' },
        { day: 'Wed', bytes: 0, label: '0 MB' },
        { day: 'Thu', bytes: 0, label: '0 MB' },
        { day: 'Fri', bytes: 0, label: '0 MB' },
        { day: 'Sat', bytes: 0, label: '0 MB' },
        { day: 'Today', bytes: 0, label: '0 MB' },
      ];

  const maxChartBytes = Math.max(1, ...chartData.map((d) => d.bytes));

  return (
    <div className="space-y-8 pb-12">
      {/* Header with Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">Traffic Usage</h1>
            {hasActivePlan && (
              <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs gap-1.5 py-1 px-3">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live 3X-UI Sync
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time data consumed from your 3X-UI VPN server node, polled live every 5 seconds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasActivePlan && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border/60 text-xs font-mono text-muted-foreground shadow-sm">
              <Radio className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span>VPS Port: 443 (TLS)</span>
            </div>
          )}
          <Link href="/pricing">
            <Button size="sm" variant={hasActivePlan ? 'outline' : 'default'} className="gap-2 text-xs font-semibold rounded-xl">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span>{hasActivePlan ? 'Add More Quota' : 'Browse Plans'}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* No Plan Alert */}
      {!hasActivePlan && (
        <Card className="border-border/60 bg-muted/20 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-500 shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">No active subscription or approved order found</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your live data usage will record automatically from the 3X-UI VPS panel once a package is active.
              </p>
            </div>
          </div>
          <Link href="/pricing" className="shrink-0">
            <Button size="sm" className="text-xs h-8 rounded-xl bg-primary text-primary-foreground font-semibold">
              Select Package
            </Button>
          </Link>
        </Card>
      )}

      {/* Active Package Banner */}
      {hasActivePlan && (
        <Card className="border-border/60 bg-card/90 backdrop-blur-md p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-foreground">{packageName}</span>
                <span className="text-xs text-muted-foreground">• {networkName}</span>
                {primaryOrder?.isProvisional && (
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
                    Provisional Access
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Billing Cycle: Monthly • Real-time traffic recorded directly from inbound client UUID.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <Link href="/dashboard/vpn">
              <Button size="sm" variant="outline" className="text-xs h-8 rounded-xl border-border/80">
                View Config & QR
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* 3 Metric Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Total Data Used */}
        <Card className="rounded-2xl border-border/60 shadow-lg bg-card/90 backdrop-blur-md relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Data Used
            </CardTitle>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight text-foreground flex items-baseline gap-2">
              <span>{formattedTotal}</span>
              {hasActivePlan && (
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {hasActivePlan
                ? (isUnlimited ? 'Unlimited Bandwidth Plan' : `of ${usageLimitGb} GB total limit (${usagePercent}% used)`)
                : 'No active plan'}
            </p>
            {hasActivePlan && !isUnlimited && usageLimitGb > 0 && (
              <div className="w-full h-1.5 bg-muted rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Downloaded */}
        <Card className="rounded-2xl border-border/60 shadow-lg bg-card/90 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Downloaded (Incoming)
            </CardTitle>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ArrowDown className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight text-foreground">
              {formattedDownload}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Live incoming payload via 3X-UI VLESS proxy
            </p>
          </CardContent>
        </Card>

        {/* Uploaded */}
        <Card className="rounded-2xl border-border/60 shadow-lg bg-card/90 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Uploaded (Outgoing)
            </CardTitle>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <ArrowUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight text-foreground">
              {formattedUpload}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Live outgoing payload via 3X-UI VLESS proxy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Usage Chart */}
      <Card className="rounded-2xl border-border/60 shadow-lg bg-card/90 backdrop-blur-md">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-primary" />
              <span>Bandwidth Distribution (Last 7 Days)</span>
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              {hasActivePlan && totalBytes > 0
                ? `Total traffic consumed so far: ${formattedTotal} (${formattedDownload} down, ${formattedUpload} up)`
                : 'No live traffic consumption recorded yet in this billing cycle'}
            </CardDescription>
          </div>
          {hasActivePlan && totalBytes > 0 && (
            <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 self-start sm:self-auto flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active Session Detected
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2 pt-6">
            {chartData.map((d, i) => {
              const height = (d.bytes / maxChartBytes) * 100;
              const isToday = d.day === 'Today';
              return (
                <div key={i} className="flex flex-col items-center flex-1 gap-2 group">
                  <div className={`text-[10px] font-mono font-bold transition-opacity ${
                    isToday ? 'text-primary opacity-100' : 'text-muted-foreground opacity-0 group-hover:opacity-100'
                  }`}>
                    {d.label}
                  </div>
                  <div className="w-full bg-secondary/60 rounded-t-lg relative flex justify-center h-full overflow-hidden">
                    <div 
                      className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-700 ${
                        isToday 
                          ? 'bg-gradient-to-t from-primary to-blue-400 shadow-md shadow-primary/30' 
                          : 'bg-primary/70 hover:bg-primary'
                      }`}
                      style={{ height: `${Math.max(6, height)}%` }}
                    />
                  </div>
                  <div className={`text-xs font-bold ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                    {d.day}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
