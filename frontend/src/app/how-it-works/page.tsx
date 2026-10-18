import { CheckCircle2, Download, ShieldCheck, Zap } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            How it works
          </h1>
          <p className="text-xl text-muted-foreground">
            Getting started with V2Nexus is incredibly simple. In just a few minutes, you can protect all your devices.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-16">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2 flex justify-center">
              <div className="w-48 h-48 rounded-full bg-primary/10 flex items-center justify-center border-8 border-background shadow-xl">
                <CheckCircle2 className="h-20 w-20 text-primary" />
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="inline-block px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-semibold mb-4">Step 1</div>
              <h2 className="text-2xl font-bold mb-4">Choose your plan</h2>
              <p className="text-muted-foreground leading-relaxed">
                Select the subscription plan that best fits your needs. All our plans come with a 30-day money-back guarantee, so you can try our service completely risk-free.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
            <div className="md:w-1/2 flex justify-center">
              <div className="w-48 h-48 rounded-full bg-primary/10 flex items-center justify-center border-8 border-background shadow-xl">
                <Download className="h-20 w-20 text-primary" />
              </div>
            </div>
            <div className="md:w-1/2 text-left md:text-right">
              <div className="inline-block px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-semibold mb-4">Step 2</div>
              <h2 className="text-2xl font-bold mb-4">Get your configuration</h2>
              <p className="text-muted-foreground leading-relaxed">
                Once registered, access your dashboard to download our app for your device, or scan the QR code to instantly import your VPN profile to third-party clients like v2ray or Xray.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2 flex justify-center">
              <div className="w-48 h-48 rounded-full bg-primary/10 flex items-center justify-center border-8 border-background shadow-xl">
                <Zap className="h-20 w-20 text-primary" />
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="inline-block px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-semibold mb-4">Step 3</div>
              <h2 className="text-2xl font-bold mb-4">Connect and Browse Freely</h2>
              <p className="text-muted-foreground leading-relaxed">
                Once connected, our app creates an encrypted tunnel that routes your entire internet traffic through your selected Zoom or social media package. Your Internet Service Provider (ISP) will only see it as Zoom data, meaning your normal data quota remains completely untouched!
              </p>
            </div>
          </div>
        </div>

        {/* Clean Looping Showcase Video (Below Steps) */}
        <div className="max-w-5xl mx-auto my-20">
          <div className="rounded-2xl md:rounded-3xl overflow-hidden border border-border/80 bg-black shadow-2xl">
            <video
              src="/videos/loop.mp4"
              autoPlay
              loop
              muted
              playsInline
              controls
              className="w-full h-auto max-h-[650px] object-contain mx-auto"
            />
          </div>
        </div>

        <div className="mt-32 max-w-4xl mx-auto bg-muted rounded-2xl p-8 md:p-12 text-center">
          <ShieldCheck className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">How does the Bypass actually work?</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            When you activate a specific data package (like a Dialog/SLT Zoom plan), your ISP allows unlimited or extended access to those specific servers. 
            V2Nexus uses advanced SNI (Server Name Indication) spoofing and WebSocket tunnels to disguise your normal internet traffic (like YouTube, TikTok, or downloads) to look exactly like Zoom traffic.
          </p>
          <div className="bg-background p-6 rounded-xl border border-border text-left">
            <h3 className="font-semibold text-lg mb-2 text-foreground">Legal & Safety Guarantee</h3>
            <p className="text-sm text-muted-foreground">
              Using an encrypted VPN tunnel is 100% legal. The ISP (Internet Service Provider) cannot see what websites you are visiting or what files you are downloading. Because your traffic is fully encrypted with military-grade AES-256 protocols, **no ISP or third-party company can monitor your activities, block your connection, or take any legal action against you.** Your privacy and identity remain completely anonymous and protected at all times.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
