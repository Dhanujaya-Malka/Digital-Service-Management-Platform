'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QrCode, Copy, CheckCircle2, Download, Smartphone, ArrowRight, Zap, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function VPNConfigPage() {
  const { vpnConfig, subscription } = useApp();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (vpnConfig?.configuration) {
      navigator.clipboard.writeText(vpnConfig.configuration);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasActiveConfig = !!vpnConfig && !!vpnConfig.configuration;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">VPN Configuration</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Setup your devices to connect to the secure network.</p>
      </div>

      {!hasActiveConfig ? (
        <div className="space-y-6">
          <Card className="border-dashed p-8 md:p-12 text-center bg-card/60">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <QrCode className="h-8 w-8 opacity-70" />
            </div>
            <h2 className="text-lg font-bold text-foreground">No Active VPN Credentials Found</h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 leading-relaxed">
              You do not have an active VPN subscription yet. Select a package or redeem a trial gift voucher to generate your private VLESS configuration and QR code.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/pricing">
                <Button className="gap-2 text-xs h-10 px-5 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Zap className="h-4 w-4" />
                  <span>Browse V2Ray Packages</span>
                </Button>
              </Link>
            </div>
          </Card>

          {/* Supported Apps Guide */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Recommended V2Ray Client Apps</CardTitle>
              <CardDescription className="text-xs">
                You can download these free apps in advance to connect once your subscription is activated.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="flex items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2.5 rounded-xl text-primary"><Smartphone className="h-5 w-5" /></div>
                  <div>
                    <h4 className="font-semibold text-sm">NetMod Syna (Android & Windows)</h4>
                    <p className="text-xs text-muted-foreground">High-performance client with direct VLESS & gRPC reality support.</p>
                  </div>
                </div>
                <a href="https://play.google.com/store/apps/details?id=com.netmod.syna" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="text-xs h-8">Get</Button>
                </a>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2.5 rounded-xl text-primary"><Smartphone className="h-5 w-5" /></div>
                  <div>
                    <h4 className="font-semibold text-sm">v2rayNG (Android)</h4>
                    <p className="text-xs text-muted-foreground">Most popular open-source V2Ray Android client.</p>
                  </div>
                </div>
                <a href="https://play.google.com/store/apps/details?id=com.v2ray.ang" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="text-xs h-8">Get</Button>
                </a>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2.5 rounded-xl text-primary"><Smartphone className="h-5 w-5" /></div>
                  <div>
                    <h4 className="font-semibold text-sm">v2box (iOS & macOS)</h4>
                    <p className="text-xs text-muted-foreground">Available on Apple App Store for iPhones, iPads, and Macs.</p>
                  </div>
                </div>
                <a href="https://apps.apple.com/app/v2box-v2ray-client/id6446814690" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="text-xs h-8">Get</Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Tabs defaultValue="qrcode" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="qrcode">Scan QR Code</TabsTrigger>
            <TabsTrigger value="manual">Manual Setup</TabsTrigger>
          </TabsList>
          
          <TabsContent value="qrcode" className="mt-6">
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-bold">V2Ray / Xray QR Code</CardTitle>
                  <CardDescription className="text-xs">Scan this with your mobile app (NetMod, v2rayNG, v2box, etc.)</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
                    {/* QR Code Visual */}
                    <div className="w-48 h-48 sm:w-64 sm:h-64 border-4 border-black grid grid-cols-4 grid-rows-4 gap-1 p-2 relative">
                      <div className="w-full h-full bg-black col-span-1 row-span-1 rounded-sm"></div>
                      <div className="w-full h-full bg-black col-start-4 row-start-1 rounded-sm"></div>
                      <div className="w-full h-full bg-black col-start-1 row-start-4 rounded-sm"></div>
                      <div className="w-full h-full bg-black col-start-3 row-start-3 rounded-sm"></div>
                      <div className="w-full h-full bg-black col-start-2 row-start-1 rounded-sm"></div>
                      <div className="w-full h-full bg-black col-start-4 row-start-2 rounded-sm"></div>
                      <div className="w-full h-full bg-black col-start-2 row-start-4 rounded-sm"></div>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <QrCode className="h-16 w-16 text-black/50" />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground max-w-xs leading-relaxed">
                    This QR code contains your private connection details. Do not share it with anyone.
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Supported Apps</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 border-b border-border pb-4">
                      <div className="bg-primary/10 p-2 rounded-lg"><Smartphone className="h-5 w-5 text-primary" /></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">NetMod (Android & Windows)</h4>
                        <p className="text-xs text-muted-foreground">Download from Google Play / Website</p>
                      </div>
                      <a href="https://play.google.com/store/apps/details?id=com.netmod.syna" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="text-xs">Get</Button>
                      </a>
                    </div>
                    <div className="flex items-center gap-4 border-b border-border pb-4">
                      <div className="bg-primary/10 p-2 rounded-lg"><Smartphone className="h-5 w-5 text-primary" /></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">v2rayNG (Android)</h4>
                        <p className="text-xs text-muted-foreground">Download from Google Play Store</p>
                      </div>
                      <a href="https://play.google.com/store/apps/details?id=com.v2ray.ang" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="text-xs">Get</Button>
                      </a>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-2 rounded-lg"><Smartphone className="h-5 w-5 text-primary" /></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">v2box (iOS & macOS)</h4>
                        <p className="text-xs text-muted-foreground">Download from App Store</p>
                      </div>
                      <a href="https://apps.apple.com/app/v2box-v2ray-client/id6446814690" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="text-xs">Get</Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="manual" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold">VLESS Configuration Link</CardTitle>
                <CardDescription className="text-xs">Copy this link and import from clipboard into your VPN client</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    readOnly 
                    value={vpnConfig.configuration} 
                    className="font-mono text-xs bg-muted"
                  />
                  <Button variant="secondary" onClick={copyToClipboard} className="w-24 shrink-0 text-xs">
                    {copied ? <CheckCircle2 className="h-4 w-4 mr-1 text-emerald-500" /> : <Copy className="h-4 w-4 mr-1" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                
                <div className="mt-6 border-t border-border pt-4">
                  <h3 className="font-semibold text-xs mb-1">Server Hostname</h3>
                  <p className="text-xs font-mono text-muted-foreground">
                    {vpnConfig.server || 'sg-node-01.v2ray.network:443 (Singapore Reality)'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
