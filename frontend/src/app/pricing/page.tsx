'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import PricingCard from '@/components/marketing/PricingCard';
import { HelpCircle, Check, ArrowRight, Activity, Wifi } from 'lucide-react';
import { getIspLogo } from '@/components/marketing/IspLogos';

export default function PricingPage() {
  const { packages } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const baseCategories = [
    { id: 'all', label: 'All Plans', count: packages.length },
    { id: 'basic', label: 'Basic', count: packages.filter(p => p.category === 'basic').length },
    { id: 'standard', label: 'Standard', count: packages.filter(p => p.category === 'standard').length },
    { id: 'premium', label: 'Premium', count: packages.filter(p => p.category === 'premium').length },
    { id: 'ultimate', label: 'Ultimate', count: packages.filter(p => p.category === 'ultimate').length },
  ];

  // Dynamic support for any custom/legacy categories
  const standardIds = ['all', 'basic', 'standard', 'premium', 'ultimate'];
  const extraCategories = Array.from(new Set(
    packages
      .map(p => p.category?.toLowerCase())
      .filter((c): c is string => typeof c === 'string' && !standardIds.includes(c))
  )).map(cat => ({
    id: cat,
    label: cat.toUpperCase(),
    count: packages.filter(p => p.category?.toLowerCase() === cat).length
  }));

  const categories = [...baseCategories, ...extraCategories];

  const filteredPackages = selectedCategory === 'all'
    ? packages
    : packages.filter(p => p.category === selectedCategory);

  return (
    <div className="py-16 md:py-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-3/4 h-[350px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* Header matching Screenshot 2 */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          {/* Operational Status Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 mb-6 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ALL SERVERS OPERATIONAL</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            V2Ray <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-blue-400">Services</span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground mb-6 max-w-xl mx-auto leading-relaxed">
            Fast, secure and reliable V2Ray VPN services in Sri Lanka with dedicated low-ping Singapore routes.
          </p>

          <Link 
            href="/how-it-works"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors bg-primary/10 hover:bg-primary/15 px-3 py-1.5 rounded-full border border-primary/20"
          >
            <span>New to V2Ray? Learn how it works</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* ISP Filter Tabs Bar matching Screenshot 2 */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 p-1.5 bg-muted/60 backdrop-blur-md rounded-2xl border border-border/60 max-w-full">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive 
                      ? 'bg-card text-foreground shadow-md border border-primary/40 text-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                  }`}
                >
                  {cat.id === 'all' ? (
                    <Wifi className={`h-4 w-4 ${isActive ? 'text-primary' : 'opacity-60'}`} />
                  ) : (
                    <span className="shrink-0">{getIspLogo(cat.id, 18)}</span>
                  )}
                  <span>{cat.label}</span>
                  {cat.count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {cat.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Package Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-24">
          {filteredPackages.map((pkg) => (
            <PricingCard key={pkg.id} pkg={pkg} />
          ))}
          {filteredPackages.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border">
              <p>No packages found in this category yet. Check back soon!</p>
            </div>
          )}
        </div>

        {/* Trust & Spec Features List */}
        <div className="max-w-4xl mx-auto border-t border-border/40 pt-16">
          <h2 className="text-2xl font-bold text-center mb-10">All V2Ray configurations include:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              'Direct Singapore Peering (Average 35ms latency)',
              'Zero-Logging Architecture (No browsing history stored)',
              'VLESS + Reality & WebSocket TLS protocols',
              'Unlimited Data Throughput on bypass routes',
              'Direct NetMod & v2box QR Code integration',
              'Automated Failover between multiple SG nodes',
              'Full 1080p & 4K streaming optimization',
              '24/7 Telegram & WhatsApp support team',
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-muted/20 p-3.5 rounded-xl border border-border/40">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-xs sm:text-sm text-foreground/90 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-28">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "How does the Zoom/Netflix bypass work?",
                a: "Our V2Ray servers disguise all of your web traffic as Zoom or Netflix traffic using SNI spoofing and WebSocket protocols. Your ISP's system counts this traffic under your unlimited Zoom or Netflix package instead of your normal data."
              },
              {
                q: "Is using this VPN safe and legal?",
                a: "Yes. Using a VPN is completely legal in Sri Lanka. All communication is protected with military-grade encryption, so your ISP or third parties cannot inspect what websites or services you use."
              },
              {
                q: "Which apps should I install?",
                a: "For Windows and Android, we recommend NetMod. For Apple iPhones (iOS) and macOS, we recommend v2box. Both are free to download and support our QR codes."
              },
              {
                q: "What ping will I get in games?",
                a: "Our Singapore nodes provide between 30ms and 45ms ping to popular Southeast Asian game servers (Valorant, CS2, PUBG, Dota 2)."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-card/70 backdrop-blur-sm rounded-xl p-5 border border-border/60">
                <div className="flex gap-3.5 items-start">
                  <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm mb-1.5 text-foreground">{faq.q}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
