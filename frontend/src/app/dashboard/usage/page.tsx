'use client';

import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp, Activity, Zap, ShieldAlert } from 'lucide-react';

export default function UsagePage() {
  const { usage, subscription, packages } = useApp();
  
  const hasSubscription = !!subscription;
  const activePackage = hasSubscription 
    ? packages.find(p => p.id === subscription?.packageId) 
    : null;
    
  const usageLimit = activePackage?.trafficLimit || 0;
  const totalUsed = usage?.total ?? 0.0;
  const downloadUsed = usage?.download ?? 0.0;
  const uploadUsed = usage?.upload ?? 0.0;

  // Real or inactive chart data
  const chartData = (hasSubscription && totalUsed > 0)
    ? [
        { day: 'Mon', val: Number((totalUsed * 0.12).toFixed(1)) },
        { day: 'Tue', val: Number((totalUsed * 0.08).toFixed(1)) },
        { day: 'Wed', val: Number((totalUsed * 0.22).toFixed(1)) },
        { day: 'Thu', val: Number((totalUsed * 0.18).toFixed(1)) },
        { day: 'Fri', val: Number((totalUsed * 0.14).toFixed(1)) },
        { day: 'Sat', val: Number((totalUsed * 0.16).toFixed(1)) },
        { day: 'Sun', val: Number((totalUsed * 0.10).toFixed(1)) },
      ]
    : [
        { day: 'Mon', val: 0.0 },
        { day: 'Tue', val: 0.0 },
        { day: 'Wed', val: 0.0 },
        { day: 'Thu', val: 0.0 },
        { day: 'Fri', val: 0.0 },
        { day: 'Sat', val: 0.0 },
        { day: 'Sun', val: 0.0 },
      ];

  const maxChartVal = Math.max(1, ...chartData.map(d => d.val));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Traffic Usage</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Monitor your bandwidth consumption for the current billing cycle.
          </p>
        </div>

        {!hasSubscription && (
          <Link href="/pricing">
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-sm">
              <Zap className="h-3.5 w-3.5" />
              <span>Browse Plans</span>
            </Button>
          </Link>
        )}
      </div>

      {!hasSubscription && (
        <Card className="border-border/60 bg-muted/20 p-4 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">No active subscription found</p>
              <p className="text-[11px] text-muted-foreground">
                Your data usage will start recording automatically once a VPN package is approved and active.
              </p>
            </div>
          </div>
          <Link href="/pricing">
            <Button size="sm" variant="outline" className="text-xs h-8 shrink-0">
              Select Package
            </Button>
          </Link>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Total Data */}
        <Card className="rounded-2xl border-border/60 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Data Used
            </CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{totalUsed.toFixed(2)} GB</div>
            <p className="text-xs text-muted-foreground mt-1">
              {hasSubscription
                ? (usageLimit === 0 ? 'Unlimited Plan' : `of ${usageLimit} GB total limit`)
                : 'No active plan'}
            </p>
          </CardContent>
        </Card>
        
        {/* Downloaded */}
        <Card className="rounded-2xl border-border/60 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Downloaded
            </CardTitle>
            <ArrowDown className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{downloadUsed.toFixed(2)} GB</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total incoming traffic
            </p>
          </CardContent>
        </Card>

        {/* Uploaded */}
        <Card className="rounded-2xl border-border/60 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Uploaded
            </CardTitle>
            <ArrowUp className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{uploadUsed.toFixed(2)} GB</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total outgoing traffic
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Usage Chart */}
      <Card className="rounded-2xl border-border/60 shadow-md">
        <CardHeader>
          <CardTitle className="text-base font-bold">Daily Usage (Last 7 Days)</CardTitle>
          <CardDescription className="text-xs">
            {hasSubscription && totalUsed > 0
              ? 'Estimated bandwidth usage per day'
              : 'No traffic consumption recorded in this cycle'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2 pt-6">
            {chartData.map((d, i) => {
              const height = (d.val / maxChartVal) * 100;
              return (
                <div key={i} className="flex flex-col items-center flex-1 gap-2 group">
                  <div className="text-[11px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.val.toFixed(1)} GB
                  </div>
                  <div className="w-full bg-secondary/60 rounded-t-sm relative flex justify-center h-full">
                    <div 
                      className="absolute bottom-0 w-full bg-primary rounded-t-sm transition-all duration-500 hover:bg-primary/80" 
                      style={{ height: `${Math.max(4, height)}%` }}
                    />
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">{d.day}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
