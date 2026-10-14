import { useRouter } from 'next/navigation';
import { Server, Calendar, AlertTriangle, ShieldCheck, Zap, Info, ArrowRight, Smartphone, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Package } from '@/types';
import { useApp } from '@/context/AppContext';
import { getIspLogo, SriLankanIspStrip } from './IspLogos';

interface PricingCardProps {
  pkg: Package;
}

export default function PricingCard({ pkg }: PricingCardProps) {
  const router = useRouter();
  const { user, selectPlan } = useApp();

  const handleChoosePlan = () => {
    selectPlan(pkg);
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/checkout/network?plan=${pkg.id}`)}`);
      return;
    }
    router.push(`/checkout/network?plan=${pkg.id}`);
  };

  // Provider badge styling based on category
  const getProviderMeta = (cat?: string) => {
    switch (cat?.toLowerCase()) {
      case 'basic':
        return { label: 'Basic Package', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'standard':
        return { label: 'Standard Package', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'premium':
        return { label: 'Premium Package', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      case 'ultimate':
        return { label: 'Ultimate Package', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'slt':
        return { label: 'SLT Fibre / 4G', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'dialog':
        return { label: 'Dialog Home & SIM', bg: 'bg-red-500/10 text-red-400 border-red-500/20' };
      case 'mobitel':
        return { label: 'Mobitel OneShot', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'airtel':
        return { label: 'Airtel Freedom', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
      case 'hutch':
        return { label: 'Hutch Cliq', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      default:
        return { label: 'V2Ray Network', bg: 'bg-primary/10 text-primary border-primary/20' };
    }
  };

  const provider = getProviderMeta(pkg.category);

  return (
    <Card className={`group relative flex flex-col h-full bg-card/85 backdrop-blur-xl rounded-2xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/15 ${
      pkg.popular 
        ? 'border-primary/60 shadow-xl shadow-primary/10 ring-1 ring-primary/30' 
        : 'border-border/60 hover:border-primary/40'
    }`}>
      {/* Subtle AI-styled glowing gradient border top */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl bg-gradient-to-r ${
        pkg.popular 
          ? 'from-primary via-purple-500 to-blue-500 opacity-100' 
          : 'from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100'
      } transition-opacity duration-300`} />

      {/* Top Header Row */}
      <CardHeader className="pb-3 pt-6 px-6">
        <div className="flex items-center justify-between mb-4">
          
          {/* Brand Logo & Pill */}
          <div className="flex items-center gap-2.5">
            <div className="shadow-md rounded-lg overflow-hidden shrink-0 border border-border/40 group-hover:scale-105 transition-transform">
              {getIspLogo(pkg.category, 26)}
            </div>
            <div>
              <span className={`text-[11px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md border ${provider.bg}`}>
                {provider.label}
              </span>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-1.5">
            {pkg.popular && (
              <Badge className="bg-primary/20 hover:bg-primary/20 text-primary border-primary/40 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                Popular
              </Badge>
            )}
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Plan Title */}
        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {pkg.name}
        </h3>

        {/* Device & Data Strip */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {pkg.trafficLimit > 0 ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-md border border-primary/20">
              <HardDrive className="h-3 w-3" />
              <span>{pkg.trafficLimit} GB</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
              <HardDrive className="h-3 w-3" />
              <span>Unlimited</span>
            </span>
          )}

          {pkg.deviceLimit && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-muted px-2.5 py-0.5 rounded-md border border-border/50 text-foreground">
              <Smartphone className="h-3 w-3 text-primary" />
              <span>{pkg.deviceLimit}</span>
            </span>
          )}
        </div>

        {/* Pricing */}
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-xs font-semibold text-muted-foreground">Rs.</span>
          <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">{pkg.price}</span>
          <span className="text-xs text-muted-foreground ml-1">/ month</span>
          {pkg.availableSlots > 0 && (
            <span className="ml-auto text-[10px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/40">
              {pkg.availableSlots} slots left
            </span>
          )}
        </div>
      </CardHeader>

      {/* Meta Specifications Table */}
      <CardContent className="flex-1 px-6 py-2 space-y-3.5">
        <div className="rounded-xl bg-muted/30 p-3 border border-border/40 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
              <HardDrive className="h-3.5 w-3.5 text-primary" /> Data Quota
            </span>
            <span className="font-semibold text-foreground text-[11px]">
              {pkg.trafficLimit > 0 ? `${pkg.trafficLimit} GB` : 'Unlimited Data'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
              <Smartphone className="h-3.5 w-3.5 text-primary" /> Devices
            </span>
            <span className="font-semibold text-foreground text-[11px]">
              {pkg.deviceLimit || '1 Device'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
              <Server className="h-3.5 w-3.5 text-primary" /> Server Route
            </span>
            <span className="font-semibold text-foreground bg-background/80 px-2 py-0.5 rounded border border-border/40 text-[11px]">
              {pkg.serverLocation || 'SG SERVER'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
              <Calendar className="h-3.5 w-3.5 text-primary" /> Validity
            </span>
            <span className="font-semibold text-foreground text-[11px]">
              {pkg.validity || `${pkg.duration} Days`}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> P2P / Torrent
            </span>
            <span className={`font-semibold px-2 py-0.5 rounded text-[10px] uppercase tracking-wide ${
              pkg.p2pTorrent === 'Allowed'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {pkg.p2pTorrent || 'Restricted'}
            </span>
          </div>
        </div>

        {/* Supported Networks Strip */}
        <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-muted/20 border border-border/40 text-[11px]">
          <span className="text-muted-foreground font-medium">Supported Networks:</span>
          <SriLankanIspStrip size={15} />
        </div>

        {/* Feature Badges & Specs */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-2 text-xs text-foreground font-medium">
            <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{pkg.speedLimit || 'No Speed Limit'}</span>
          </div>
          {pkg.features.slice(0, 3).map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span className="line-clamp-1">{feat}</span>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Action Footer */}
      <CardFooter className="pt-3 pb-6 px-6 flex items-center gap-2">
        <Button 
          className="flex-1 h-11 text-xs sm:text-sm font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 group/btn transition-all flex items-center justify-center gap-1.5"
          onClick={handleChoosePlan}
        >
          <span>Choose Plan</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </Button>

        {/* Info Dialog */}
        <Dialog>
          <DialogTrigger
            className="h-11 w-11 inline-flex items-center justify-center rounded-xl border border-border/60 hover:bg-muted/80 text-muted-foreground hover:text-foreground shrink-0 transition-colors cursor-pointer"
            title="Plan Details & Instructions"
          >
            <Info className="h-4 w-4" />
          </DialogTrigger>
          <DialogContent className="sm:max-w-[460px] bg-card border-border/80">
            <DialogHeader>
              <div className="flex items-center gap-2.5 mb-2">
                {getIspLogo(pkg.category, 22)}
                <span className={`px-2 py-0.5 rounded text-xs font-bold border ${provider.bg}`}>
                  {provider.label}
                </span>
                <span className="text-xs text-emerald-400 font-medium ml-auto">● Operational</span>
              </div>
              <DialogTitle className="text-xl font-bold">{pkg.name}</DialogTitle>
              <DialogDescription>
                Full specifications, quota and connection setup for this plan.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="bg-muted/40 p-4 rounded-xl border border-border/50 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data Quota:</span>
                  <span className="font-semibold text-primary">{pkg.trafficLimit > 0 ? `${pkg.trafficLimit} GB` : 'Unlimited Data'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Devices Allowed:</span>
                  <span className="font-semibold">{pkg.deviceLimit || '1 Device'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Server Route:</span>
                  <span className="font-semibold">{pkg.serverLocation || 'SG SERVER (Singapore Peering)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Ping:</span>
                  <span className="font-semibold text-emerald-400">30ms - 45ms to Sri Lanka</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Protocol:</span>
                  <span className="font-semibold">VLESS + Reality / WebSocket TLS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recommended Client:</span>
                  <span className="font-semibold">NetMod (Win/Android) • v2box (iOS/Mac)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border border-border/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">Network Compatibility:</span>
                  <SriLankanIspStrip size={16} />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Works seamlessly on SLT (Fibre/4G), Dialog (Home WiFi/Mobile), Mobitel, Airtel, and Hutch.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">How to use this package:</h4>
                <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4 leading-relaxed">
                  <li>Choose and subscribe to this package.</li>
                  <li>Scan the instant QR code or copy the V2Ray config link.</li>
                  <li>Import into NetMod or v2box app and click connect.</li>
                  <li>Enjoy private high-speed internet without speed drops!</li>
                </ul>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-xs text-emerald-300">
                🔒 <strong>Zero Logs Guarantee:</strong> Your connection is protected with end-to-end military encryption.
              </div>

              <div className="pt-2">
                <Button 
                  className="w-full h-11 text-xs sm:text-sm font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  onClick={handleChoosePlan}
                >
                  <span>Choose This Plan</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
