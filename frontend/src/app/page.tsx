'use client';

import { useApp } from '@/context/AppContext';
import Hero from '@/components/marketing/Hero';
import StickyPackageCarousel from '@/components/marketing/StickyPackageCarousel';
import Testimonials from '@/components/marketing/Testimonials';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Zap, Smartphone, CheckCircle2, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { packages } = useApp();

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Pinned Horizontal Package Carousel (Right after Hero) */}
      <StickyPackageCarousel packages={packages} />

      {/* 3. Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need in a VPN</h2>
            <p className="text-lg text-muted-foreground">
              We built V2Nexus from the ground up to be fast, secure, and incredibly easy to use.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: 'Lightning Fast', desc: 'Next-generation protocols ensure minimal speed loss.' },
              { icon: Lock, title: 'No-Logs Policy', desc: 'We never track, store, or share your private data.' },
              { icon: Shield, title: 'Military Encryption', desc: 'AES-256 bit encryption keeps your connection secure.' },
              { icon: Smartphone, title: 'All Devices', desc: 'Apps for Windows, Mac, iOS, Android, and Linux.' },
              { icon: MapPin, title: 'Global Network', desc: 'Thousands of servers across 90+ countries.' },
              { icon: CheckCircle2, title: 'Next-Gen Protocols', desc: 'Powered by advanced VLESS and Trojan protocols for maximum security' },
            ].map((feature, i) => (
              <div key={i} className="bg-background rounded-2xl p-8 border border-border/50 hover:border-primary/30 transition-colors shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How it Works Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get started in minutes</h2>
            <p className="text-lg opacity-80">
              No technical knowledge required. We made it as simple as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-background/20 flex items-center justify-center text-2xl font-bold mb-6">1</div>
              <h3 className="text-xl font-semibold mb-3">Choose a Plan</h3>
              <p className="opacity-80">Select the package that fits your needs and create an account.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-background/20 flex items-center justify-center text-2xl font-bold mb-6">2</div>
              <h3 className="text-xl font-semibold mb-3">Get Configuration</h3>
              <p className="opacity-80">Download the VPN app or scan the QR code to set up your device.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-background/20 flex items-center justify-center text-2xl font-bold mb-6">3</div>
              <h3 className="text-xl font-semibold mb-3">Connect</h3>
              <p className="opacity-80">Tap connect and enjoy a secure, private internet experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Testimonials */}
      <Testimonials />

      {/* 6. Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to take back your privacy?</h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join thousands of users who trust V2Nexus to protect their digital lives.
          </p>
          <Link href="/register">
            <Button size="lg" className="h-14 px-10 text-lg rounded-full">
              Get Started Now
            </Button>
          </Link>
          <p className="mt-6 text-sm text-muted-foreground">30-day money-back guarantee. No questions asked.</p>
        </div>
      </section>
    </div>
  );
}
