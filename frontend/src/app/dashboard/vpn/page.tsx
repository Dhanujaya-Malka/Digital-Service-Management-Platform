'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { QrCode, Copy, CheckCircle2, Download, Smartphone, ArrowRight, Zap, Shield, Layers, Radio, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ActiveVPNItem {
  id: string;
  name: string;
  networkName: string;
  server: string;
  configuration: string;
  subscriptionId: string;
  isProvisional?: boolean;
}

export default function VPNConfigPage() {
  const { vpnConfig, subscription, user, orders, packages } = useApp();
  const [copied, setCopied] = useState(false);
  const [selectedPkgIndex, setSelectedPkgIndex] = useState(0);

  // Derive all active packages (approved or provisional) for the user
  const userApprovedOrders = useMemo(() => {
    if (!user?.email) return [];
    return orders.filter(
      (o) =>
        o.customerEmail?.toLowerCase() === user.email.toLowerCase() &&
        (o.status === 'approved' || (o.isProvisional && o.status === 'pending_approval' && o.vpnProvisioned))
    );
  }, [orders, user?.email]);

  const latestRejectedOrder = useMemo(() => {
    if (!user?.email) return null;
    return orders.find(
      (o) => o.customerEmail?.toLowerCase() === user.email.toLowerCase() && o.status === 'rejected'
    );
  }, [orders, user?.email]);

  const activeConfigs = useMemo<ActiveVPNItem[]>(() => {
    const list: ActiveVPNItem[] = [];

    if (userApprovedOrders.length > 0) {
      userApprovedOrders.forEach((order) => {
        const matchedPkg = packages.find((p) => p.id === order.packageId);
        const pkgName = order.packageName || matchedPkg?.name || 'V2Ray Service';
        const netName = order.networkPackageName || order.networkName || 'Sri Lanka Bypass';

        const subId = order.vpnDetails?.configuration?.split('@')?.[0]?.replace('vless://', '') ||
          `vpn-${order.id.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        const cleanNet = netName.replace(/[^a-zA-Z0-9]/g, '');
        const cleanPkg = pkgName.replace(/[^a-zA-Z0-9]/g, '-');
        const targetSni = (order.sni || 'aka.ms').trim();
        let configuration = order.vpnDetails?.configuration ||
          `vless://${subId}@virtual-internet-access.duckdns.org:443?security=tls&encryption=none&type=grpc&serviceName=grpc-service&sni=${targetSni}&alpn=h2,http/1.1#Cyberx-${cleanNet}-${cleanPkg}`;
        if (configuration && !configuration.includes('alpn=')) {
          configuration = configuration.replace('#', '&alpn=h2,http/1.1#');
        }
        const server = order.vpnDetails?.server || `virtual-internet-access.duckdns.org:443 (Cyberx - VLESS gRPC TLS | SNI: ${targetSni} | ALPN: h2,http/1.1)`;

        list.push({
          id: order.id,
          name: pkgName,
          networkName: netName,
          server,
          configuration,
          subscriptionId: subId,
          isProvisional: Boolean(order.isProvisional && order.status === 'pending_approval'),
        });
      });
    } else if (vpnConfig && vpnConfig.configuration) {
      let configuration = vpnConfig.configuration;
      if (configuration && !configuration.includes('alpn=')) {
        configuration = configuration.replace('#', '&alpn=h2,http/1.1#');
      }
      list.push({
        id: subscription?.id || 'default-vpn',
        name: 'V2Ray High-Speed VPN',
        networkName: 'SLT & Dialog Bypass',
        server: vpnConfig.server || 'virtual-internet-access.duckdns.org:443 (Cyberx - VLESS gRPC TLS | ALPN: h2,http/1.1)',
        configuration,
        subscriptionId: subscription?.id || 'vpn-default-sub',
      });
    }

    return list;
  }, [userApprovedOrders, vpnConfig, subscription, packages]);

  const hasActiveConfig = activeConfigs.length > 0;
  const currentConfig = hasActiveConfig
    ? activeConfigs[Math.min(selectedPkgIndex, activeConfigs.length - 1)]
    : null;

  const copyToClipboard = () => {
    if (currentConfig?.configuration) {
      navigator.clipboard.writeText(currentConfig.configuration);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
          <span>VPN Configuration</span>
          {hasActiveConfig && activeConfigs.length > 1 && (
            <Badge variant="secondary" className="text-xs bg-primary/15 text-primary border-primary/30">
              {activeConfigs.length} Active Configurations
            </Badge>
          )}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Setup your Android, iOS, Windows, or macOS devices using private VLESS Reality configs and QR codes.
        </p>
      </div>

      {/* Package Selector Switcher when user has 2 or more active packages */}
      {hasActiveConfig && activeConfigs.length > 1 && (
        <div className="p-4 rounded-2xl bg-card/90 border border-border/70 backdrop-blur-md shadow-md space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <span>Select Package Configuration ({activeConfigs.length} Purchased)</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeConfigs.map((cfg, idx) => {
              const isSelected = idx === selectedPkgIndex;
              return (
                <button
                  key={cfg.id}
                  onClick={() => {
                    setSelectedPkgIndex(idx);
                    setCopied(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25 scale-[1.02]'
                      : 'bg-muted/50 text-muted-foreground border-border/60 hover:bg-card hover:text-foreground'
                  }`}
                >
                  <span className={`flex h-2 w-2 rounded-full ${cfg.isProvisional ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
                  <span>{cfg.name}</span>
                  {cfg.isProvisional && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold">
                      TEMPORARY
                    </span>
                  )}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {cfg.networkName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!hasActiveConfig || !currentConfig ? (
        <div className="space-y-6">
          {latestRejectedOrder && (
            <Card className="border-2 border-destructive/30 bg-destructive/5 p-6 rounded-2xl text-left shadow-lg shadow-destructive/5">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-destructive/15 text-destructive shrink-0">
                  <XCircle className="h-6 w-6" />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-extrabold text-destructive">
                      VPN Connection Cut Off — Payment Verification Declined
                    </h3>
                    <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-[10px]">
                      Order: {latestRejectedOrder.id}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    The payment slip for package <strong>{latestRejectedOrder.packageName}</strong> was reviewed and declined by administrator.
                    <br />
                    Reason: <em>"{latestRejectedOrder.adminNotes || 'Payment could not be verified on the bank statement.'}"</em>. 
                    Any provisional VPN credentials for this order have been permanently cut off.
                  </p>
                  <div className="pt-2 flex items-center gap-2">
                    <Link href="/pricing">
                      <Button size="sm" variant="destructive" className="h-8 text-xs rounded-xl">
                        Order Again
                      </Button>
                    </Link>
                    <Link href="/support">
                      <Button size="sm" variant="outline" className="h-8 text-xs rounded-xl border-border/80">
                        Contact Support
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <Card className="border-dashed p-8 md:p-12 text-center bg-card/60">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <QrCode className="h-8 w-8 opacity-70" />
            </div>
            <h2 className="text-lg font-bold text-foreground">No Active VPN Credentials Found</h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 leading-relaxed">
              You do not have an active VPN subscription yet. Select a package or redeem a trial gift voucher to generate your private VLESS configuration and QR code.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/pricing">
                <Button className="gap-2 text-xs h-10 px-5 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Zap className="h-4 w-4" />
                  <span>Browse V2Ray Packages</span>
                </Button>
              </Link>
            </div>
          </Card>

          {/* Supported Apps Guide */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Recommended V2Ray Client Apps</CardTitle>
              <CardDescription className="text-xs">
                You can download these free apps in advance to connect once your subscription is activated.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="flex items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2.5 rounded-xl text-primary"><Smartphone className="h-5 w-5" /></div>
                  <div>
                    <h4 className="font-semibold text-sm">NetMod Syna (Android & Windows)</h4>
                    <p className="text-xs text-muted-foreground">High-performance client with direct VLESS & gRPC reality support.</p>
                  </div>
                </div>
                <a href="https://play.google.com/store/apps/details?id=com.netmod.syna" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="text-xs h-8">Get</Button>
                </a>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2.5 rounded-xl text-primary"><Smartphone className="h-5 w-5" /></div>
                  <div>
                    <h4 className="font-semibold text-sm">v2rayNG (Android)</h4>
                    <p className="text-xs text-muted-foreground">Most popular open-source V2Ray Android client.</p>
                  </div>
                </div>
                <a href="https://play.google.com/store/apps/details?id=com.v2ray.ang" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="text-xs h-8">Get</Button>
                </a>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2.5 rounded-xl text-primary"><Smartphone className="h-5 w-5" /></div>
                  <div>
                    <h4 className="font-semibold text-sm">v2box (iOS & macOS)</h4>
                    <p className="text-xs text-muted-foreground">Available on Apple App Store for iPhones, iPads, and Macs.</p>
                  </div>
                </div>
                <a href="https://apps.apple.com/app/v2box-v2ray-client/id6446814690" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="text-xs h-8">Get</Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          {currentConfig.isProvisional && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-300 text-xs flex items-center gap-3 shadow-md animate-in fade-in">
              <Clock className="h-5 w-5 text-amber-400 shrink-0 animate-pulse" />
              <div>
                <strong className="text-sm block text-foreground">Temporary VPN Access Active (AI Pre-Approved)</strong>
                <span>
                  You have full instant access to this VLESS configuration and QR code. Administrator verification of your bank transfer slip is in progress. Once confirmed, this warning clears and your subscription becomes permanent.
                </span>
              </div>
            </div>
          )}

          <Tabs defaultValue="qrcode" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
              <TabsTrigger value="qrcode">Scan QR Code</TabsTrigger>
              <TabsTrigger value="manual">Manual Setup</TabsTrigger>
            </TabsList>
          
          <TabsContent value="qrcode" className="mt-6">
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold">{currentConfig.name} QR Code</CardTitle>
                    <Badge variant="secondary" className="text-[10px] bg-primary/15 text-primary border-primary/20">
                      {currentConfig.networkName}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">Scan this with your mobile app (NetMod, v2rayNG, v2box, etc.)</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
                    {/* Live Scannable QR Code */}
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(currentConfig.configuration)}`} 
                      alt="V2Ray QR Code" 
                      className="w-52 h-52 sm:w-64 sm:h-64 object-contain"
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground max-w-xs leading-relaxed">
                    This QR code contains your private connection details for <strong>{currentConfig.name}</strong>. Do not share it with anyone.
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Supported Apps</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 border-b border-border pb-4">
                      <div className="bg-primary/10 p-2 rounded-lg"><Smartphone className="h-5 w-5 text-primary" /></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">NetMod (Android & Windows)</h4>
                        <p className="text-xs text-muted-foreground">Download from Google Play / Website</p>
                      </div>
                      <a href="https://play.google.com/store/apps/details?id=com.netmod.syna" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="text-xs">Get</Button>
                      </a>
                    </div>
                    <div className="flex items-center gap-4 border-b border-border pb-4">
                      <div className="bg-primary/10 p-2 rounded-lg"><Smartphone className="h-5 w-5 text-primary" /></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">v2rayNG (Android)</h4>
                        <p className="text-xs text-muted-foreground">Download from Google Play Store</p>
                      </div>
                      <a href="https://play.google.com/store/apps/details?id=com.v2ray.ang" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="text-xs">Get</Button>
                      </a>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-2 rounded-lg"><Smartphone className="h-5 w-5 text-primary" /></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">v2box (iOS & macOS)</h4>
                        <p className="text-xs text-muted-foreground">Download from App Store</p>
                      </div>
                      <a href="https://apps.apple.com/app/v2box-v2ray-client/id6446814690" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="text-xs">Get</Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="manual" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold">VLESS Configuration Link ({currentConfig.name})</CardTitle>
                  <Badge variant="secondary" className="text-[10px] bg-primary/15 text-primary">
                    {currentConfig.networkName}
                  </Badge>
                </div>
                <CardDescription className="text-xs">Copy this link and import from clipboard into your VPN client</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    readOnly 
                    value={currentConfig.configuration} 
                    className="font-mono text-xs bg-muted"
                  />
                  <Button variant="secondary" onClick={copyToClipboard} className="w-24 shrink-0 text-xs">
                    {copied ? <CheckCircle2 className="h-4 w-4 mr-1 text-emerald-500" /> : <Copy className="h-4 w-4 mr-1" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                
                <div className="mt-6 border-t border-border pt-4 space-y-3">
                  <h3 className="font-semibold text-xs mb-1">Server Hostname & Node Details</h3>
                  <p className="text-xs font-mono text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/50">
                    {currentConfig.server}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                    <div className="p-2.5 rounded-xl bg-card border border-border/60">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Protocol</span>
                      <span className="text-xs font-mono font-bold text-foreground">VLESS</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-card border border-border/60">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Transport / Network</span>
                      <span className="text-xs font-mono font-bold text-foreground">gRPC (grpc-service)</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-card border border-border/60">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Security / Port</span>
                      <span className="text-xs font-mono font-bold text-foreground">TLS / Port 443</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-card border border-emerald-500/30 bg-emerald-500/5">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 block flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        ALPN Setting
                      </span>
                      <span className="text-xs font-mono font-black text-emerald-400">h2,http/1.1</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      )}
    </div>
  );
}
