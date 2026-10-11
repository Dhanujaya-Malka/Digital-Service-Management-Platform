'use client';

import { useApp } from '@/context/AppContext';
import Hero from '@/components/marketing/Hero';
import PricingCard from '@/components/marketing/PricingCard';
import Testimonials from '@/components/marketing/Testimonials';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Zap, Smartphone, CheckCircle2, MapPin } from 'lucide-react';
import Link from 'next/link';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getIspLogo } from '@/components/marketing/IspLogos';

export default function Home() {
  const { packages } = useApp();
  
  const dialogPackages = packages.filter(p => p.category === 'dialog');
  const sltPackages = packages.filter(p => p.category === 'slt');

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need in a VPN</h2>
            <p className="text-lg text-muted-foreground">
              We built SecureVPN from the ground up to be fast, secure, and incredibly easy to use.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: 'Lightning Fast', desc: 'Next-generation protocols ensure minimal speed loss.' },
              { icon: Lock, title: 'No-Logs Policy', desc: 'We never track, store, or share your private data.' },
              { icon: Shield, title: 'Military Encryption', desc: 'AES-256 bit encryption keeps your connection secure.' },
              { icon: Smartphone, title: 'All Devices', desc: 'Apps for Windows, Mac, iOS, Android, and Linux.' },
              { icon: MapPin, title: 'Global Network', desc: 'Thousands of servers across 90+ countries.' },
              { icon: CheckCircle2, title: 'Kill Switch', desc: 'Automatic protection if your connection drops.' },
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

      {/* V2Ray Services Section matching Screenshot 2 */}
      <section className="py-24 relative" id="pricing">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-xs font-semibold text-emerald-400 mb-5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ALL SERVERS OPERATIONAL</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
              V2Ray <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-blue-400">Services</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
              Fast, secure and reliable V2Ray VPN services in Sri Lanka.
            </p>
          </div>

          <div className="max-w-6xl mx-auto mt-8 px-4">
            <Tabs defaultValue="slt" className="w-full">
              <div className="flex justify-center mb-10 overflow-x-auto pb-2">
                <TabsList className="flex flex-wrap h-auto gap-2 p-1.5 bg-muted/60 backdrop-blur-md rounded-2xl border border-border/60">
                  <TabsTrigger value="slt" className="rounded-xl px-5 py-2.5 font-bold text-xs flex items-center gap-2">
                    {getIspLogo('slt', 18)}
                    <span>SLT</span>
                  </TabsTrigger>
                  <TabsTrigger value="dialog" className="rounded-xl px-5 py-2.5 font-bold text-xs flex items-center gap-2">
                    {getIspLogo('dialog', 18)}
                    <span>Dialog</span>
                  </TabsTrigger>
                  <TabsTrigger value="mobitel" className="rounded-xl px-5 py-2.5 font-bold text-xs flex items-center gap-2">
                    {getIspLogo('mobitel', 18)}
                    <span>Mobitel</span>
                  </TabsTrigger>
                  <TabsTrigger value="airtel" className="rounded-xl px-5 py-2.5 font-bold text-xs flex items-center gap-2">
                    {getIspLogo('airtel', 18)}
                    <span>Airtel</span>
                  </TabsTrigger>
                  <TabsTrigger value="hutch" className="rounded-xl px-5 py-2.5 font-bold text-xs flex items-center gap-2">
                    {getIspLogo('hutch', 18)}
                    <span>Hutch</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {['slt', 'dialog', 'mobitel', 'airtel', 'hutch'].map((cat) => {
                const catPackages = packages.filter(p => p.category === cat);
                return (
                  <TabsContent key={cat} value={cat} className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
                      {catPackages.map((pkg) => (
                        <PricingCard key={pkg.id} pkg={pkg} />
                      ))}
                      {catPackages.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border">
                          No packages currently available for this network.
                        </div>
                      )}
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
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

      <Testimonials />

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to take back your privacy?</h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join thousands of users who trust SecureVPN to protect their digital lives.
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
