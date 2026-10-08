'use client';

import { useApp } from '@/context/AppContext';
import PricingCard from '@/components/marketing/PricingCard';
import { Shield, HelpCircle, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PricingPage() {
  const { packages } = useApp();

  const dialogPackages = packages.filter(p => p.category === 'dialog');
  const sltPackages = packages.filter(p => p.category === 'slt');
  const otherPackages = packages.filter(p => p.category !== 'dialog' && p.category !== 'slt');

  return (
    <div className="py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
            <Shield className="mr-2 h-4 w-4" />
            <span>30-Day Money-Back Guarantee</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Simple pricing, absolute privacy
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Get unrestricted access to the internet with our secure VPN plans. Choose the one that fits you best.
          </p>
        </div>

        <div className="max-w-6xl mx-auto mt-8 mb-24">
          <Tabs defaultValue="dialog" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="dialog">Dialog Packages</TabsTrigger>
                <TabsTrigger value="slt">SLT Packages</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="dialog" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 justify-center">
                {dialogPackages.map((pkg) => (
                  <PricingCard key={pkg.id} pkg={pkg} />
                ))}
                {dialogPackages.length === 0 && <p className="text-center col-span-full text-muted-foreground">No packages available.</p>}
              </div>
            </TabsContent>
            <TabsContent value="slt" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 justify-center">
                {sltPackages.map((pkg) => (
                  <PricingCard key={pkg.id} pkg={pkg} />
                ))}
                {sltPackages.length === 0 && <p className="text-center col-span-full text-muted-foreground">No packages available.</p>}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Comparison or features detailed */}
        <div className="max-w-4xl mx-auto border-t border-border/40 pt-16">
          <h2 className="text-2xl font-bold text-center mb-10">All plans include:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              'AES-256 military-grade encryption',
              'Strict no-logs policy',
              'DNS leak protection',
              'Unlimited bandwidth',
              'Access to servers in 90+ countries',
              '24/7 customer support',
              'High-speed streaming support',
              'Automatic Kill Switch',
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Preview */}
        <div className="max-w-3xl mx-auto mt-32">
          <h2 className="text-2xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "Can I cancel my subscription anytime?",
                a: "Yes, you can easily cancel your subscription from your dashboard at any time. There are no hidden fees or cancellation charges."
              },
              {
                q: "Do you keep logs of my browsing activity?",
                a: "Absolutely not. We have a strict no-logs policy, meaning we don't track, collect, or share your private data with anyone."
              },
              {
                q: "How many devices can I connect at once?",
                a: "Depending on your plan, you can connect up to 5 devices simultaneously on a single account."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-card rounded-xl p-6 border border-border">
                <div className="flex gap-4">
                  <HelpCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                    <p className="text-muted-foreground">{faq.a}</p>
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
