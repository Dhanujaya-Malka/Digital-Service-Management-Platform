import Link from 'next/link';
import { Shield, ArrowLeft, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Terms of Service | V2Nexus',
  description: 'Terms and conditions for using V2Nexus services.',
};

export default function TermsPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-2">
            <FileCheck className="h-4 w-4" />
            <span>Service Agreement</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mt-2">Last updated: October 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-sm leading-relaxed text-muted-foreground">
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By subscribing to or utilizing V2Nexus services, you agree to comply with and be bound by these terms. If you disagree with any portion of these terms, you must not access our network.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">2. Permissible Use</h2>
            <p>
              Our V2Ray bypass tunnels are engineered for personal privacy, low latency communication, and secure internet connectivity. You agree not to utilize our infrastructure for illegal operations, automated spam distribution, DDoS actions, or malicious intrusion attempts.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">3. Subscriptions & Trial Vouchers</h2>
            <p>
              Free trial gift cards and promo codes are strictly single-use and automatically expire upon checkout. Paid plans are provisioned upon bank transfer slip verification by our administrator team.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">4. Refund Policy</h2>
            <p>
              If our servers are incapable of connecting to your designated ISP carrier network within 48 hours of order verification, you may request a full refund by contacting our <Link href="/support" className="text-primary hover:underline">Support Helpdesk</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
