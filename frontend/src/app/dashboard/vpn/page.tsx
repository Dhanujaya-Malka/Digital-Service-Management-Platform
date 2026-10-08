'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QrCode, Copy, CheckCircle2, Download, Smartphone } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function VPNConfigPage() {
  const { vpnConfig } = useApp();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (vpnConfig?.configuration) {
      navigator.clipboard.writeText(vpnConfig.configuration);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">VPN Configuration</h1>
        <p className="text-muted-foreground mt-1">Setup your devices to connect to the secure network.</p>
      </div>

      <Tabs defaultValue="qrcode" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="qrcode">Scan QR Code</TabsTrigger>
          <TabsTrigger value="manual">Manual Setup</TabsTrigger>
        </TabsList>
        
        <TabsContent value="qrcode" className="mt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>V2Ray / Xray QR Code</CardTitle>
                <CardDescription>Scan this with your mobile app (v2rayNG, Shadowrocket, etc.)</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
                  {/* Mock QR Code Visual */}
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
                <p className="text-sm text-center text-muted-foreground max-w-xs">
                  This QR code contains your private connection details. Do not share it with anyone.
                </p>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Supported Apps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 border-b border-border pb-4">
                    <div className="bg-primary/10 p-2 rounded-lg"><Smartphone className="h-5 w-5 text-primary" /></div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">NetMod (Android & Windows)</h4>
                      <p className="text-xs text-muted-foreground">Download from Google Play / Website</p>
                    </div>
                    <Button variant="outline" size="sm">Get</Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg"><Smartphone className="h-5 w-5 text-primary" /></div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">v2box (iOS & macOS)</h4>
                      <p className="text-xs text-muted-foreground">Download from App Store</p>
                    </div>
                    <Button variant="outline" size="sm">Get</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="manual" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Link</CardTitle>
              <CardDescription>Copy this link and paste it into your VPN client</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2 mt-4">
                <Input 
                  readOnly 
                  value={vpnConfig?.configuration || 'vless://mock-token@server.vpn.com:443?security=tls#SecureVPN'} 
                  className="font-mono text-xs bg-muted"
                />
                <Button variant="secondary" onClick={copyToClipboard} className="w-24">
                  {copied ? <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              
              <div className="mt-8 border-t border-border pt-6">
                <h3 className="font-medium mb-4">Download Config File</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Alternatively, you can download the .json configuration file to import it manually.
                </p>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download config.json
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
