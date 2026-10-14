'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  ShieldCheck, 
  Copy, 
  Check, 
  Calendar, 
  Clock, 
  ArrowUp, 
  ArrowDown, 
  Activity, 
  HardDrive, 
  Zap, 
  QrCode,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DashboardOverview() {
  const { user, subscription, usage, vpnConfig, packages } = useApp();
  const [copied, setCopied] = useState(false);

  const hasSubscription = !!subscription;
  const activePackage = hasSubscription 
    ? packages.find((p) => p.id === subscription?.packageId) || packages[0] 
    : null;
  
  // Calculate remaining days
  const expiryDate = subscription?.expiryDate ? new Date(subscription.expiryDate) : null;
  const today = new Date();
  const diffTime = expiryDate ? Math.max(0, expiryDate.getTime() - today.getTime()) : 0;
  const diffDays = expiryDate ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;

  // Real usage numbers
  const totalLimit = activePackage?.trafficLimit && activePackage.trafficLimit > 0 ? activePackage.trafficLimit : 0;
  const usedGB = usage?.total ?? 0.0;
  const uploadGB = usage?.upload ?? 0.0;
  const downloadGB = usage?.download ?? 0.0;
  const remainingGB = totalLimit > 0 ? Math.max(0, totalLimit - usedGB) : 0.0;
  const usagePercent = totalLimit > 0 ? Math.min(100, Math.round((usedGB / totalLimit) * 100)) : 0;

  const copySubscriptionId = () => {
    if (subscription?.id) {
      navigator.clipboard.writeText(subscription.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Circular gauge calculations (SVG)
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = totalLimit > 0 ? circumference - (usagePercent / 100) * circumference : circumference;

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Account Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Logged in as <span className="text-foreground font-medium">{user?.email}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasSubscription ? (
            <Link href="/dashboard/vpn">
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-xs">
                <QrCode className="h-4 w-4" />
                <span>Get V2Ray Config</span>
              </Button>
            </Link>
          ) : (
            <Link href="/pricing">
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-xs">
                <Zap className="h-4 w-4" />
                <span>Browse Plans</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Grid: Left Column (Subscription + Data Usage) & Right Column (Metrics 01-04) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (2 Cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Top Card: Active Subscription / Clean New User State */}
          <Card className="bg-card/90 border-border/60 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              {/* Left Details */}
              <div className="space-y-4 flex-1">
                {/* Status Pill */}
                {hasSubscription ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>ACTIVE</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                    <span>NO ACTIVE PLAN</span>
                  </div>
                )}

                {/* Service Name */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                    {hasSubscription ? `v2nexus.lk / ${activePackage?.name || 'V2Ray Service'}` : 'V2Nexus High-Speed VPN'}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    {hasSubscription 
                      ? 'Your subscription is active and working normally.' 
                      : 'You do not have an active package. Choose a plan or redeem a gift trial to get connected.'}
                  </p>
                </div>

                {/* Key-Value Details */}
                <div className="space-y-2.5 pt-2 text-xs">
                  {/* Subscription ID */}
                  {hasSubscription && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span className="text-foreground/70 font-mono text-sm font-bold w-4 text-center">#</span>
                      <span className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground/80">SUBSCRIPTION ID</span>
                      <span className="font-mono text-foreground font-medium bg-muted/60 px-2 py-0.5 rounded border border-border/40 text-[11px] truncate max-w-[150px] sm:max-w-none">
                        {subscription.id}
                      </span>
                      <button 
                        onClick={copySubscriptionId}
                        className="p-1 hover:text-foreground transition-colors text-muted-foreground"
                        title="Copy Subscription ID"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  )}

                  {/* Expires On */}
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Calendar className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground/80">EXPIRES ON</span>
                    <span className="font-medium text-foreground">
                      {expiryDate ? expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Active Plan'}
                    </span>
                    {hasSubscription && (
                      <span className="text-[10px] font-semibold bg-primary/15 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                        {diffDays} days left
                      </span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Clock className={`h-4 w-4 shrink-0 ${hasSubscription ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                    <span className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground/80">STATUS</span>
                    <span className="font-medium text-foreground">
                      {hasSubscription ? 'Ready to Connect' : 'Inactive (Get Plan)'}
                    </span>
                    {hasSubscription && (
                      <span className="text-[10px] text-emerald-400 font-medium">● Singapore SG-01</span>
                    )}
                  </div>
                </div>

                {!hasSubscription && (
                  <div className="pt-2">
                    <Link href="/pricing">
                      <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs">
                        <span>Browse V2Ray Plans</span>
                        <Zap className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Right: Circular Progress Meter */}
              <div className="flex flex-col items-center justify-center shrink-0 p-3 bg-muted/20 rounded-2xl border border-border/40">
                <div className="relative flex items-center justify-center">
                  <svg className="w-36 h-36 transform -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="72"
                      cy="72"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="10"
                      className="text-muted/60"
                      fill="transparent"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="72"
                      cy="72"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="10"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="text-primary transition-all duration-1000 ease-out"
                      fill="transparent"
                    />
                  </svg>
                  {/* Inner text */}
                  <div className="absolute flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">USED</span>
                    <span className="text-xl font-black text-foreground">{usedGB.toFixed(1)} GB</span>
                    <span className="text-[10px] text-muted-foreground">of {totalLimit > 0 ? `${totalLimit} GB` : '0 GB'}</span>
                  </div>
                </div>
                <div className="mt-2 text-xs font-bold text-primary">
                  {usagePercent}% used
                </div>
              </div>

            </div>
          </Card>

          {/* Bottom Card: DATA USAGE OVERVIEW matching Screenshot 1 */}
          <Card className="bg-card/90 border-border/60 rounded-2xl p-6 backdrop-blur-md shadow-lg space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90 flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span>DATA USAGE OVERVIEW</span>
              </h3>
              <span className="text-xs text-muted-foreground">Reset cycle: Monthly</span>
            </div>

            {/* 4 Stat Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Upload */}
              <div className="bg-muted/30 border border-border/40 rounded-xl p-3.5 flex flex-col items-center text-center space-y-1">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 mb-1">
                  <ArrowUp className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">UPLOAD</span>
                <span className="text-base font-extrabold text-foreground">{uploadGB.toFixed(1)} GB</span>
              </div>

              {/* Download */}
              <div className="bg-muted/30 border border-border/40 rounded-xl p-3.5 flex flex-col items-center text-center space-y-1">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mb-1">
                  <ArrowDown className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">DOWNLOAD</span>
                <span className="text-base font-extrabold text-foreground">{downloadGB.toFixed(1)} GB</span>
              </div>

              {/* Used */}
              <div className="bg-muted/30 border border-border/40 rounded-xl p-3.5 flex flex-col items-center text-center space-y-1">
                <div className="p-2 rounded-lg bg-primary/10 text-primary mb-1">
                  <Activity className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">USED</span>
                <span className="text-base font-extrabold text-foreground">{usedGB.toFixed(1)} GB</span>
              </div>

              {/* Remaining */}
              <div className="bg-muted/30 border border-border/40 rounded-xl p-3.5 flex flex-col items-center text-center space-y-1">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 mb-1">
                  <HardDrive className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">REMAINING</span>
                <span className="text-base font-extrabold text-foreground">{remainingGB.toFixed(1)} GB</span>
              </div>
            </div>

            {/* Horizontal Progress Bar */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span className="text-foreground font-semibold">{usagePercent}% Used</span>
                <span>{totalLimit.toFixed(1)} GB Total Limit</span>
              </div>
              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all duration-1000"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>
          </Card>

        </div>

        {/* RIGHT COLUMN (Accordion / Metric Cards 01-04 matching Screenshot 1) */}
        <div className="space-y-4">
          
          {/* 01: USAGE METRICS */}
          <div className="bg-card/90 border border-border/60 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group hover:border-primary/40 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">USAGE METRICS</span>
              <span className="text-xs font-mono text-muted-foreground font-bold opacity-60">01</span>
            </div>
            <h4 className="text-sm font-bold text-foreground mb-1">
              Live dashboards in your account.
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Per-day usage, quota and speeds in real time with automated failover tracking.
            </p>
            {/* Glowing underline accent */}
            <div className="w-full h-0.5 bg-gradient-to-r from-primary/60 to-transparent mt-3.5 rounded-full" />
          </div>

          {/* 02: SMART ROUTING */}
          <div className="bg-card/90 border border-border/60 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group hover:border-primary/40 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">SMART ROUTING</span>
              <span className="text-xs font-mono text-muted-foreground font-bold opacity-60">02</span>
            </div>
            <h4 className="text-sm font-bold text-foreground mb-1">
              Warp+ & Low-Ping LK Peering.
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              One-tap Singapore VLESS tunnel optimized for gaming, Discord & streaming without ISP packet drops.
            </p>
          </div>

          {/* 03: UPTIME SLA */}
          <div className="bg-card/90 border border-border/60 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group hover:border-primary/40 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">UPTIME SLA</span>
              <span className="text-xs font-mono text-muted-foreground font-bold opacity-60">03</span>
            </div>
            <h4 className="text-sm font-bold text-foreground mb-1">
              99.99% uptime, monitored live.
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Automated health-checks running every 10 seconds across our Singapore & India node clusters.
            </p>
          </div>

          {/* 04: NETWORK CAPACITY */}
          <div className="bg-card/90 border border-border/60 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group hover:border-primary/40 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">NETWORK CAPACITY</span>
              <span className="text-xs font-mono text-muted-foreground font-bold opacity-60">04</span>
            </div>
            <h4 className="text-sm font-bold text-foreground mb-1">
              10 Gbps headroom per route.
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              High-bandwidth multi-gigabit uplinks ensuring zero slowdowns even during peak Sri Lankan hours.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
