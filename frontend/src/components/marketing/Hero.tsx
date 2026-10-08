import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Zap, Globe } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-32 lg:pt-36 lg:pb-40">
      {/* Abstract background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8">
            <ShieldCheck className="mr-2 h-4 w-4" />
            <span>Next-Generation Privacy is Here</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8">
            Private Internet. <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              Without Compromise.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
            Experience lightning-fast speeds, military-grade encryption, and absolute privacy on all your devices. Your digital life, secured.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/pricing" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 px-8 border-primary/20 hover:bg-primary/5">
                View Plans
              </Button>
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left w-full border-t border-border/40 pt-10">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Ultra-Fast</h3>
                <p className="text-sm text-muted-foreground mt-1">Optimized servers for seamless streaming.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Secure</h3>
                <p className="text-sm text-muted-foreground mt-1">AES-256 encryption protects your data.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Global</h3>
                <p className="text-sm text-muted-foreground mt-1">Connect to servers in 90+ countries.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
