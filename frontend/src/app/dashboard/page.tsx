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

  const activePackage = packages.find(p => p.id === subscription?.packageId) || packages[0];
  
  // Calculate remaining days
  const expiryDate = new Date(subscription?.expiryDate || Date.now() + 396 * 24 * 60 * 60 * 1000);
  const today = new Date();
  const diffTime = Math.max(0, expiryDate.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Usage numbers matching screenshot
  const totalLimit = activePackage?.trafficLimit && activePackage.trafficLimit > 0 ? activePackage.trafficLimit : 1000;
  const usedGB = usage?.total || 777.7;
  const uploadGB = usage?.upload || 101.0;
  const downloadGB = usage?.download || 676.7;
  const remainingGB = Math.max(0, totalLimit - usedGB);
  const usagePercent = Math.min(100, Math.round((usedGB / totalLimit) * 100));

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
  const strokeDashoffset = circumference - (usagePercent / 100) * circumference;

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
          <Link href="/dashboard/vpn">
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl">
              <QrCode className="h-4 w-4" />
              <span>Get V2Ray Config</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid: Left Column (Subscription + Data Usage) & Right Column (Metrics 01-04) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (2 Cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Top Card: Active Subscription matching Screenshot 1 */}
          <Card className="bg-card/90 border-border/60 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              {/* Left Details */}
              <div className="space-y-4 flex-1">
                {/* Status Pill */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ACTIVE</span>
                </div>

                {/* Service Name */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                    securevpn.lk / {activePackage?.name || 'SLT ZOOM Bypass'}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Your subscription is active and working normally.
                  </p>
                </div>

                {/* Key-Value Details */}
                <div className="space-y-2.5 pt-2 text-xs">
                  {/* Subscription ID */}
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="text-foreground/70 font-mono text-sm font-bold w-4 text-center">#</span>
                    <span className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground/80">SUBSCRIPTION ID</span>
                    <span className="font-mono text-foreground font-medium bg-muted/60 px-2 py-0.5 rounded border border-border/40 text-[11px] truncate max-w-[150px] sm:max-w-none">
                      {subscription?.id || 'asyfckrhgfxsy1oc50xt'}
                    </span>
                    <button 
                      onClick={copySubscriptionId}
                      className="p-1 hover:text-foreground transition-colors text-muted-foreground"
                      title="Copy Subscription ID"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {/* Expires On */}
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Calendar className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground/80">EXPIRES ON</span>
                    <span className="font-medium text-foreground">
                      {expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-[10px] font-semibold bg-primary/15 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                      {diffDays} days left
                    </span>
                  </div>

                  {/* Last Online */}
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Clock className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground/80">LAST ONLINE</span>
                    <span className="font-medium text-foreground">Connected Now</span>
                    <span className="text-[10px] text-emerald-400 font-medium">● Singapore SG-01</span>
                  </div>
                </div>
              </div>

              {/* Right: Circular Progress Meter matching Screenshot 1 */}
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
                    <span className="text-[10px] text-muted-foreground">of {totalLimit} GB</span>
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
