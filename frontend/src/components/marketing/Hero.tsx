import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Zap, Globe, Star, ArrowRight, Lock, Server } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-background pt-20 pb-28 lg:pt-28 lg:pb-36">
      {/* Background radial gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-purple-500/10 to-transparent blur-[140px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          
          {/* Top Pill matching Screenshot 3 */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-8 backdrop-blur-md shadow-sm">
            <span className="text-base">🇱🇰</span>
            <span>Sri Lanka's #1 High-Speed V2Ray Network</span>
          </div>
          
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            Everything Digital. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-blue-400">
              One Trusted Network.
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
            High-speed V2Ray VPN with ultra-low ping Singapore routes. Bypass Zoom, Netflix & Work packages on <strong>SLT, Dialog, Mobitel, Airtel & Hutch</strong> with zero speed throttling and complete privacy.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-10">
            <Link href="/pricing" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-sm sm:text-base h-12 px-8 rounded-xl font-semibold shadow-lg shadow-primary/20 gap-2 bg-primary hover:bg-primary/90">
                <span>Explore V2Ray Plans</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/how-it-works" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm sm:text-base h-12 px-8 rounded-xl font-medium border-border/80 hover:bg-card/80">
                Learn How It Works
              </Button>
            </Link>
          </div>

          {/* Trust Badges matching Screenshot 3 */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Zero Logs Guaranteed</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <span>Military-Grade TLS Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-blue-400" />
              <span>Singapore 35ms Peering</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>24/7 Dedicated Support</span>
            </div>
          </div>

          {/* Rating Pill matching Screenshot 3 */}
          <div className="inline-flex items-center gap-2 bg-card/80 border border-border/60 px-4 py-2 rounded-full text-xs shadow-sm">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="font-semibold text-foreground">4.9 / 5</span>
            <span className="text-muted-foreground">• Trusted by 1,000+ Sri Lankan power users</span>
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-5 text-left w-full border-t border-border/50 pt-10">
            <div className="bg-card/40 backdrop-blur-sm p-4 rounded-xl border border-border/40 flex items-start gap-3.5">
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">Ultra-Low Latency</h3>
                <p className="text-xs text-muted-foreground mt-0.5">35ms Singapore route tuned for gaming & streaming.</p>
              </div>
            </div>
            <div className="bg-card/40 backdrop-blur-sm p-4 rounded-xl border border-border/40 flex items-start gap-3.5">
              <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">Smart ISP Bypass</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Disguises all internet traffic as Zoom or Netflix packets.</p>
              </div>
            </div>
            <div className="bg-card/40 backdrop-blur-sm p-4 rounded-xl border border-border/40 flex items-start gap-3.5">
              <div className="rounded-lg bg-blue-500/10 p-2.5 text-blue-400">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">Multi-Device Config</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Instant 1-tap QR codes for NetMod & v2box clients.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
