'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { supportedNetworks, getNetworkConfig, getNetworkPackage } from '@/data/network-configs';
import { NetworkConfig, NetworkPackage, Package } from '@/types';
import { getIspLogo } from '@/components/marketing/IspLogos';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  HardDrive, 
  Smartphone, 
  Server, 
  Activity, 
  Wifi, 
  Check, 
  HelpCircle,
  Calendar,
  Lock,
  Zap,
  Sparkles
} from 'lucide-react';

function NetworkSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    packages, 
    selectedPlan, 
    selectPlan, 
    selectedNetwork, 
    selectNetwork,
    networkPackages,
    selectedNetworkPackage,
    selectNetworkPackage,
  } = useApp();

  const [activePlan, setActivePlan] = useState<Package | null>(selectedPlan);
  const [selectedIspTab, setSelectedIspTab] = useState<string>('all');
  const [chosenNetworkPkg, setChosenNetworkPkg] = useState<NetworkPackage | null>(selectedNetworkPackage);

  // Sync plan from query parameter or context or fallback
  useEffect(() => {
    const planParam = searchParams.get('plan');
    if (planParam) {
      const matched = packages.find((p) => p.id === planParam);
      if (matched) {
        setActivePlan(matched);
        selectPlan(matched);
        return;
      }
    }
    if (selectedPlan) {
      setActivePlan(selectedPlan);
    } else if (packages.length > 0) {
      const fallback = packages.find((p) => p.popular) || packages[0];
      setActivePlan(fallback);
      selectPlan(fallback);
    }
  }, [searchParams, packages, selectedPlan, selectPlan]);

  // Sync network package from query param or context
  useEffect(() => {
    const netPkgParam = searchParams.get('networkPackage') || searchParams.get('pkg');
    if (netPkgParam) {
      const matched = networkPackages.find((p) => p.id === netPkgParam);
      if (matched) {
        setChosenNetworkPkg(matched);
        selectNetworkPackage(matched);
        setSelectedIspTab(matched.isp);
        return;
      }
    }

    const netIspParam = searchParams.get('network');
    if (netIspParam) {
      const matchedNet = supportedNetworks.find((n) => n.id.toLowerCase() === netIspParam.toLowerCase());
      if (matchedNet) {
        selectNetwork(matchedNet);
        setSelectedIspTab(matchedNet.id);
      }
    }

    if (selectedNetworkPackage) {
      setChosenNetworkPkg(selectedNetworkPackage);
    }
  }, [searchParams, networkPackages, selectedNetworkPackage, selectNetworkPackage, selectNetwork]);

  const handleSelectPackage = (pkg: NetworkPackage) => {
    setChosenNetworkPkg(pkg);
    selectNetworkPackage(pkg);
    
    // Also associate the base ISP NetworkConfig
    const baseNet = supportedNetworks.find((n) => n.id.toLowerCase() === pkg.isp.toLowerCase());
    if (baseNet) {
      selectNetwork(baseNet);
    }
  };

  const handleContinue = () => {
    if (!chosenNetworkPkg || !activePlan) return;
    router.push(`/checkout?plan=${activePlan.id}&networkPackage=${chosenNetworkPkg.id}&network=${chosenNetworkPkg.isp}`);
  };

  const handleDirectContinue = (pkg: NetworkPackage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    handleSelectPackage(pkg);
    if (!activePlan) return;
    router.push(`/checkout?plan=${activePlan.id}&networkPackage=${pkg.id}&network=${pkg.isp}`);
  };

  // Filter packages based on active ISP tab
  const filteredPackages = useMemo(() => {
    if (selectedIspTab === 'all') {
      return networkPackages;
    }
    return networkPackages.filter((p) => p.isp.toLowerCase() === selectedIspTab.toLowerCase());
  }, [networkPackages, selectedIspTab]);

  // ISP Tabs configuration matching Screenshot 2
  const ispTabs = [
    { id: 'all', label: 'All Plans', count: networkPackages.length },
    { id: 'slt', label: 'SLT', count: networkPackages.filter((p) => p.isp === 'slt').length },
    { id: 'dialog', label: 'Dialog', count: networkPackages.filter((p) => p.isp === 'dialog').length },
    { id: 'hutch', label: 'Hutch', count: networkPackages.filter((p) => p.isp === 'hutch').length },
    { id: 'airtel', label: 'Airtel', count: networkPackages.filter((p) => p.isp === 'airtel').length },
    { id: 'mobitel', label: 'Mobitel', count: networkPackages.filter((p) => p.isp === 'mobitel').length },
  ];

  return (
    <div className="py-10 md:py-16 relative overflow-hidden min-h-[calc(100vh-4rem)]">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-3/4 h-[350px] bg-primary/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 max-w-6xl relative z-10">
        
        {/* Step Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between max-w-xl mx-auto relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border/60 -z-0" />
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-0 transition-all duration-300"
              style={{ width: '50%' }}
            />

            {/* Step 1: Package */}
            <Link href="/pricing" className="flex flex-col items-center gap-1.5 z-10 group">
              <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-md">
                <Check className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                1. Plan Selected
              </span>
            </Link>

            {/* Step 2: Network */}
            <div className="flex flex-col items-center gap-1.5 z-10">
              <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs ring-4 ring-primary/20 shadow-lg">
                2
              </div>
              <span className="text-xs font-bold text-primary">
                2. Choose Network
              </span>
            </div>

            {/* Step 3: Checkout */}
            <div className="flex flex-col items-center gap-1.5 z-10 opacity-60">
              <div className="h-9 w-9 rounded-full bg-card border-2 border-border text-muted-foreground flex items-center justify-center font-semibold text-xs">
                3
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                3. Checkout & Pay
              </span>
            </div>
          </div>
        </div>

        {/* Selected Plan Summary Banner */}
        {activePlan && (
          <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-card/90 backdrop-blur-md border border-border/70 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
                <Server className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/15 text-primary">
                    Selected Package
                  </span>
                  <span className="text-xs text-muted-foreground">• 30 Days Validity</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground mt-0.5">
                  {activePlan.name}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 font-medium text-foreground">
                    <HardDrive className="h-3.5 w-3.5 text-primary" />
                    {activePlan.trafficLimit > 0 ? `${activePlan.trafficLimit} GB Data` : 'Unlimited Data'}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 font-medium text-foreground">
                    <Smartphone className="h-3.5 w-3.5 text-primary" />
                    {activePlan.deviceLimit || '1 Device'}
                  </span>
                  <span>•</span>
                  <span className="font-semibold text-foreground">
                    Rs. {activePlan.price} / month
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <Link href="/pricing">
                <Button variant="outline" size="sm" className="text-xs h-9 gap-1.5 border-border/80 hover:bg-muted">
                  <span>Change Plan</span>
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mb-3">
            <Wifi className="h-3.5 w-3.5" />
            <span>Tailored Sri Lankan SNI Routes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            Select Your ISP Bypass Package
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Choose the exact Sri Lankan network bundle you use (Zoom, Netflix, Social Media, TikTok, etc.)
            so we can generate your optimized V2Ray connection link.
          </p>
        </div>

        {/* ISP Category Tabs (matching Screenshot 2) */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-muted/70 backdrop-blur-md rounded-2xl border border-border/70 max-w-full">
            {ispTabs.map((tab) => {
              const isActive = selectedIspTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedIspTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-card text-foreground shadow-sm border border-primary/40 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
                  }`}
                >
                  {tab.id === 'all' ? (
                    <Wifi className={`h-4 w-4 ${isActive ? 'text-primary' : 'opacity-60'}`} />
                  ) : (
                    <span className="shrink-0">{getIspLogo(tab.id, 18)}</span>
                  )}
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Network Packages Grid (Matching Screenshot 2 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {filteredPackages.map((pkg) => {
            const isSelected = chosenNetworkPkg?.id === pkg.id;

            return (
              <Card
                key={pkg.id}
                onClick={() => handleSelectPackage(pkg)}
                className={`group relative cursor-pointer transition-all duration-300 rounded-2xl p-5 border text-left flex flex-col justify-between overflow-hidden ${
                  isSelected
                    ? 'bg-card border-primary ring-2 ring-primary/40 shadow-xl shadow-primary/10 -translate-y-1'
                    : 'bg-card/75 backdrop-blur-sm border-border/70 hover:border-primary/50 hover:bg-card/90'
                }`}
              >
                {/* Top Subtle Border Highlight */}
                <div className={`absolute top-0 left-0 right-0 h-[2px] transition-all ${
                  isSelected ? 'bg-primary' : 'bg-transparent group-hover:bg-primary/40'
                }`} />

                <div>
                  {/* Card Header: ISP Logo + Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-xl bg-background/80 border border-border/60 shrink-0 shadow-sm">
                        {getIspLogo(pkg.isp, 28)}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {pkg.ispName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isSelected && (
                        <Badge className="text-[10px] bg-primary/20 hover:bg-primary/20 text-primary border-primary/40 font-bold px-2 py-0.5 gap-1 shadow-sm">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Selected</span>
                        </Badge>
                      )}

                      {pkg.popular && (
                        <Badge variant="secondary" className="text-[10px] bg-amber-500/15 text-amber-400 border-amber-500/30">
                          Popular
                        </Badge>
                      )}

                      {/* ACTIVE Status Indicator */}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        ACTIVE
                      </span>
                    </div>
                  </div>

                  {/* Package Name (e.g. SLT ZOOM (Fibre, 4G, ADSL)) */}
                  <h3 className="font-extrabold text-base text-foreground mb-3 leading-snug group-hover:text-primary transition-colors">
                    {pkg.name}
                  </h3>

                  {/* Specs List: Server, Validity, Torrent */}
                  <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Server className="h-3.5 w-3.5 text-primary/70" /> Server:
                      </span>
                      <span className="font-mono text-foreground font-medium">{pkg.serverLocation}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 text-primary/70" /> Validity:
                      </span>
                      <span className="font-medium text-foreground">{pkg.validity}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Lock className="h-3.5 w-3.5 text-primary/70" /> P2P / Torrent:
                      </span>
                      <span className="font-medium text-amber-400">{pkg.p2pTorrent}</span>
                    </div>
                  </div>

                  {/* Feature Tags (Matching Screenshot 2 Pills) */}
                  <div className="space-y-1.5 mb-2">
                    {pkg.features.map((feat, fIdx) => (
                      <div 
                        key={fIdx} 
                        className="flex items-center gap-2 bg-muted/40 p-2 rounded-xl border border-border/40 text-[11px]"
                      >
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span className="text-foreground/90 font-medium truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Selection Action Button */}
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Activity className="h-3 w-3 text-emerald-400" />
                    <span>Ping: {pkg.latency || '30ms - 40ms'}</span>
                  </div>

                  {isSelected ? (
                    <Button
                      size="sm"
                      onClick={(e) => handleDirectContinue(pkg, e)}
                      className="h-8 px-4 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/25 gap-1.5 cursor-pointer hover:scale-105 transition-all"
                    >
                      <span>Continue</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPackage(pkg);
                      }}
                      className="h-8 px-3 rounded-xl text-xs font-semibold text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 border-border/70 cursor-pointer"
                    >
                      <span>Select Route</span>
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Bottom Persistent Action Bar */}
        <div className="sticky bottom-4 z-30 p-4 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link href="/pricing" className="shrink-0">
              <Button variant="outline" size="sm" className="h-10 text-xs gap-1.5 rounded-xl border-border/80">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Plans</span>
              </Button>
            </Link>

            <div className="text-xs truncate">
              {chosenNetworkPkg ? (
                <div>
                  <span className="text-muted-foreground">Selected Bypass Route:</span>{' '}
                  <span className="font-bold text-foreground">
                    {chosenNetworkPkg.ispName} • {chosenNetworkPkg.name}
                  </span>
                </div>
              ) : (
                <div className="text-muted-foreground italic flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
                  <span>Please choose your network bypass package above to continue</span>
                </div>
              )}
            </div>
          </div>

          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!chosenNetworkPkg || !activePlan}
            className="w-full sm:w-auto h-11 px-8 rounded-xl font-bold text-sm bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Continue to Payment</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

      </div>
    </div>
  );
}

export default function NetworkSelectionPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      <NetworkSelectionContent />
    </Suspense>
  );
}
