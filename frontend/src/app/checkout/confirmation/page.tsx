'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Order } from '@/types';
import { getIspLogo } from '@/components/marketing/IspLogos';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  HardDrive, 
  Smartphone, 
  Server, 
  Building2, 
  ArrowRight, 
  Home, 
  FileText, 
  QrCode, 
  ExternalLink,
  Gift
} from 'lucide-react';

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { orders, getOrderById } = useApp();
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId) {
      const found = getOrderById(orderId) || orders.find((o) => o.id === orderId);
      if (found) {
        setCurrentOrder(found);
        return;
      }
    }
    // Fallback to most recent order if not specified
    if (orders.length > 0) {
      setCurrentOrder(orders[0]);
    }
  }, [searchParams, orders, getOrderById]);

  const isFreeTrial = currentOrder?.finalAmount === 0;

  return (
    <div className="py-12 md:py-20 relative overflow-hidden min-h-[calc(100vh-4rem)]">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-3/4 h-[350px] bg-primary/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 max-w-3xl relative z-10">
        
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="h-16 w-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 text-emerald-400 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-emerald-500/10 animate-in zoom-in-75">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          {isFreeTrial ? (
            <Badge className="bg-emerald-500/15 hover:bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs font-semibold px-3 py-1 mb-3">
              <Gift className="h-3.5 w-3.5 mr-1.5" />
              <span>100% FREE TRIAL GIFT ACTIVATED</span>
            </Badge>
          ) : (
            <Badge className="bg-amber-500/15 hover:bg-amber-500/15 text-amber-400 border-amber-500/30 text-xs font-semibold px-3 py-1 mb-3">
              <Clock className="h-3.5 w-3.5 mr-1.5 animate-pulse" />
              <span>PAYMENT VERIFICATION PENDING</span>
            </Badge>
          )}

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {isFreeTrial ? 'Free Trial Gift Activated!' : 'Order Submitted Successfully!'}
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto leading-relaxed">
            {isFreeTrial
              ? 'Your 100% Free Trial Gift Voucher has been redeemed and queued for instant VPN provisioning.'
              : 'Thank you for your order. Your bank transfer slip has been uploaded and queued for verification.'}
          </p>
        </div>

        {/* Order Details Card */}
        {currentOrder ? (
          <Card className="rounded-2xl border-border/70 bg-card/85 backdrop-blur-md shadow-xl mb-8 overflow-hidden">
            <CardHeader className="bg-muted/40 border-b border-border/50 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Order Reference
                  </span>
                  <div className="text-lg font-mono font-black text-primary">
                    {currentOrder.id}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Submission Time
                  </span>
                  <div className="text-xs text-foreground font-medium">
                    {new Date(currentOrder.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Package and Network Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-background border border-border/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
                    <Server className="h-3.5 w-3.5" />
                    <span>Package Purchased</span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{currentOrder.packageName}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3" /> {currentOrder.dataQuota}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Smartphone className="h-3 w-3" /> {currentOrder.deviceLimit}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-background border border-border/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                    <span>ISP / Bypass Route</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-muted border border-border/60 shrink-0">
                      {getIspLogo(currentOrder.networkId, 22)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        {currentOrder.networkPackageName || currentOrder.networkName}
                      </h3>
                      <p className="text-[10px] text-emerald-400 font-medium">
                        {currentOrder.networkName} • Singapore Node
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Customer Details Table */}
              <div className="rounded-xl bg-muted/20 border border-border/50 p-4 space-y-2 text-xs">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Customer Name:</span>
                  <span className="font-semibold text-foreground">{currentOrder.customerName}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Delivery Email:</span>
                  <span className="font-semibold text-foreground">{currentOrder.customerEmail}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>WhatsApp / Phone:</span>
                  <span className="font-semibold text-foreground">{currentOrder.customerPhone}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Payment Method:</span>
                  <span className={`font-semibold flex items-center gap-1 ${isFreeTrial ? 'text-emerald-400' : 'text-foreground'}`}>
                    {isFreeTrial ? (
                      <>
                        <Gift className="h-3 w-3 text-emerald-400" /> 100% Free Gift Voucher
                      </>
                    ) : (
                      <>
                        <Building2 className="h-3 w-3 text-primary" /> Bank Transfer
                      </>
                    )}
                  </span>
                </div>
                {currentOrder.slipFileName && !isFreeTrial && (
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Uploaded Slip:</span>
                    <span className="font-semibold text-foreground flex items-center gap-1 truncate max-w-[200px]">
                      <FileText className="h-3 w-3 text-emerald-400 shrink-0" />
                      <span className="truncate">{currentOrder.slipFileName}</span>
                    </span>
                  </div>
                )}
                {currentOrder.promoCode && (
                  <div className="flex justify-between items-center text-emerald-400 font-semibold">
                    <span>Promo Applied:</span>
                    <span>{currentOrder.promoCode} (- Rs. {currentOrder.discountAmount})</span>
                  </div>
                )}
                <div className="pt-2 border-t border-border/40 flex justify-between items-center">
                  <span className="font-bold text-sm text-foreground">Total Amount Paid:</span>
                  <span className="font-mono font-bold text-base text-primary">
                    Rs. {currentOrder.finalAmount}
                  </span>
                </div>
              </div>

              {/* What Happens Next Timeline */}
              <div className="border-t border-border/40 pt-5 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">
                  What Happens Next?
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-xs">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {isFreeTrial ? '1. Gift Voucher Redeemed' : '1. Slip Uploaded'}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {isFreeTrial 
                          ? 'Your trial voucher has been authenticated and applied to this order.' 
                          : 'Your payment receipt is recorded in the admin verification queue.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs">
                    <div className="h-6 w-6 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5 animate-pulse">
                      2
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">2. Admin Verification (15 - 30 minutes)</p>
                      <p className="text-[11px] text-muted-foreground">
                        Our administrative team matches the bank transaction reference and approves the subscription.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs">
                    <div className="h-6 w-6 rounded-full bg-muted border border-border text-muted-foreground flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">3. VPN Account Activation & QR Code</p>
                      <p className="text-[11px] text-muted-foreground">
                        Upon verification, your V2Ray VLESS configuration and QR code will automatically generate in your Customer Dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>


            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border mb-8">
            <p className="text-xs text-muted-foreground">No recent order found.</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/dashboard/orders" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto gap-2 text-xs h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20">
              <FileText className="h-4 w-4" />
              <span>View My Orders</span>
            </Button>
          </Link>

          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto gap-2 text-xs h-11 px-6 rounded-xl border-border/80">
              <QrCode className="h-4 w-4" />
              <span>Go to Dashboard</span>
            </Button>
          </Link>

          <Link href="/" className="w-full sm:w-auto">
            <Button variant="ghost" className="w-full sm:w-auto gap-2 text-xs h-11 px-5 rounded-xl text-muted-foreground hover:text-foreground">
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
