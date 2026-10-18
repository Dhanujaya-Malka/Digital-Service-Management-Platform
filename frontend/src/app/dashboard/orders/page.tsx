'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { getIspLogo } from '@/components/marketing/IspLogos';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  ArrowRight, 
  QrCode, 
  Server, 
  HardDrive, 
  Smartphone, 
  Building2, 
  ExternalLink 
} from 'lucide-react';

export default function CustomerOrdersPage() {
  const { user, orders } = useApp();

  // Filter orders strictly for current user if logged in
  const customerOrders = user 
    ? orders.filter((o) => o.customerEmail?.toLowerCase() === user.email?.toLowerCase())
    : [];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <FileText className="h-6 w-6 text-primary" />
            <span>My Orders & Transactions</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track bank slip verification progress and access your provisioned V2Ray configs.
          </p>
        </div>

        <Link href="/pricing">
          <Button size="sm" className="text-xs h-9 gap-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
            <span>Order New Package</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* Orders List */}
      {customerOrders.length > 0 ? (
        <div className="space-y-4">
          {customerOrders.map((order) => {
            return (
              <Card 
                key={order.id} 
                className="rounded-2xl border-border/70 bg-card/85 backdrop-blur-md shadow-md overflow-hidden transition-all hover:border-primary/40"
              >
                <CardHeader className="bg-muted/30 border-b border-border/40 py-3.5 px-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-xs text-primary">
                        {order.id}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div>
                      {order.status === 'pending_approval' && (
                        order.isProvisional ? (
                          <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-xs font-semibold px-2.5 py-0.5">
                            <Clock className="h-3 w-3 mr-1 animate-pulse" />
                            AI Pre-Approved (Temporary Access)
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-xs font-semibold px-2.5 py-0.5">
                            <Clock className="h-3 w-3 mr-1 animate-pulse" />
                            Verification In Progress
                          </Badge>
                        )
                      )}
                      {order.status === 'approved' && (
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs font-semibold px-2.5 py-0.5">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Approved & Active
                        </Badge>
                      )}
                      {order.status === 'rejected' && (
                        <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-xs font-semibold px-2.5 py-0.5">
                          <XCircle className="h-3 w-3 mr-1" />
                          Payment Rejected
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    
                    {/* Left Details: Package & Network (7 cols) */}
                    <div className="md:col-span-7 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
                          <Server className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-foreground">
                            {order.packageName}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                              <span className="shrink-0">{getIspLogo(order.networkId, 16)}</span>
                              <span>{order.networkName}</span>
                            </span>
                            <span className="text-muted-foreground text-xs">•</span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                              <HardDrive className="h-3 w-3 text-primary" />
                              <span>{order.dataQuota}</span>
                            </span>
                            <span className="text-muted-foreground text-xs">•</span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Smartphone className="h-3 w-3 text-primary" />
                              <span>{order.deviceLimit}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Explanatory Note */}
                      {order.status === 'pending_approval' && (
                        order.isProvisional ? (
                          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 leading-relaxed">
                            ⚡ <strong>Temporary VPN Access Active:</strong> Your bank slip was pre-approved by our automated AI check. Your V2Ray connection is active right now while our administrator verifies the bank deposit.
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 leading-relaxed">
                            ⏱️ <strong>Awaiting Slip Review:</strong> Your bank receipt is in the admin verification queue. Once verified (usually 15-30 minutes), your V2Ray config will be unlocked.
                          </div>
                        )
                      )}

                      {order.status === 'approved' && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 leading-relaxed">
                          ✅ <strong>V2Ray Account Activated:</strong> Your Singapore bypass route is online. Import into NetMod or v2box.
                        </div>
                      )}

                      {order.status === 'rejected' && (
                        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive leading-relaxed">
                          ❌ <strong>Reason for Rejection:</strong> {order.adminNotes || 'Payment slip could not be confirmed on bank statement. Please contact support.'}
                        </div>
                      )}
                    </div>

                    {/* Right Details: Pricing & Actions (5 cols) */}
                    <div className="md:col-span-5 flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-border/40">
                      <div>
                        <div className="text-[11px] text-muted-foreground md:text-right">Amount Paid:</div>
                        <div className="text-xl font-black font-mono text-foreground md:text-right">
                          Rs. {order.finalAmount}
                        </div>
                        {order.promoCode && (
                          <div className="text-[10px] text-emerald-400 font-mono md:text-right">
                            {order.promoCode} (- Rs. {order.discountAmount})
                          </div>
                        )}
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5 md:justify-end">
                          <Building2 className="h-3 w-3" />
                          <span>Bank Transfer</span>
                        </div>
                      </div>

                      <div className="w-full sm:w-auto md:w-full flex justify-end gap-2 pt-2">
                        {order.status === 'approved' || (order.isProvisional && order.status === 'pending_approval' && order.vpnProvisioned) ? (
                          <Link href="/dashboard/vpn" className="w-full sm:w-auto">
                            <Button size="sm" className="w-full sm:w-auto gap-1.5 text-xs rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                              <QrCode className="h-3.5 w-3.5" />
                              <span>View VPN QR & Config</span>
                            </Button>
                          </Link>
                        ) : (
                          <Link href="/support" className="w-full sm:w-auto">
                            <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs rounded-xl border-border/70">
                              <span>Contact Support</span>
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>

                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="rounded-2xl border-dashed border-border/70 p-12 text-center bg-card/40">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-bold text-foreground mb-1">No Orders Yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6">
            You haven't placed any VPN package orders yet. Choose your preferred package and network to get started.
          </p>
          <Link href="/pricing">
            <Button className="text-xs gap-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
              <span>Browse Packages</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </Card>
      )}

    </div>
  );
}
