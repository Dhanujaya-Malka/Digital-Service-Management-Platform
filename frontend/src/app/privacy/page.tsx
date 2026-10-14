import Link from 'next/link';
import { Shield, ArrowLeft, Lock, EyeOff, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Privacy Policy | V2Nexus',
  description: 'Learn how V2Nexus protects your data and enforces strict zero-logging privacy.',
};

export default function PrivacyPolicyPage() {
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
            <Lock className="h-4 w-4" />
            <span>Strict Zero-Logs Guarantee</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mt-2">Last updated: October 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-sm leading-relaxed text-muted-foreground">
          <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <EyeOff className="h-5 w-5" />
              </div>
              <h2 className="text-base font-bold text-foreground">1. No-Logs Commitment</h2>
            </div>
            <p>
              V2Nexus does not monitor, record, log, or store your browsing history, traffic destinations, DNS queries, or downloaded content. Our V2Ray nodes run in RAM-only environments where session metadata is instantly discarded upon disconnection.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">2. Information We Collect</h2>
            <p>
              We collect minimal information necessary to deliver and maintain your service:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account Credentials:</strong> Email address and encrypted password for portal login.</li>
              <li><strong>Billing & Verification Data:</strong> Bank transfer reference or voucher code for order verification.</li>
              <li><strong>Aggregated Usage Stats:</strong> Monthly bandwidth consumption (GB) to enforce plan quotas.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">3. How Your Data Is Protected</h2>
            <p>
              All customer transmissions to V2Nexus servers utilize advanced VLESS + Reality and gRPC/WebSocket encryption protocols, rendering your payload indistinguishable from standard HTTPS traffic.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">4. Contact Our Privacy Team</h2>
            <p>
              If you have any questions or concerns regarding our privacy practices, please contact our support desk through our <Link href="/support" className="text-primary hover:underline">Support Center</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
