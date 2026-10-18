'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Order, OrderStatus } from '@/types';
import { getIspLogo } from '@/components/marketing/IspLogos';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Search, 
  Eye, 
  Check, 
  X, 
  ExternalLink, 
  Server, 
  HardDrive, 
  Smartphone, 
  AlertTriangle,
  Receipt,
  Download,
  Gift
} from 'lucide-react';

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useApp();

  const [filterTab, setFilterTab] = useState<'all' | 'pending_approval' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected order for slip modal
  const [selectedOrderForSlip, setSelectedOrderForSlip] = useState<Order | null>(null);

  // Reject dialog state
  const [rejectOrderTarget, setRejectOrderTarget] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState('Payment reference could not be verified on the bank statement.');

  // Action feedback
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Calculate statistics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending_approval').length;
  const approvedOrders = orders.filter((o) => o.status === 'approved').length;
  const totalRevenue = orders
    .filter((o) => o.status === 'approved')
    .reduce((sum, o) => sum + o.finalAmount, 0);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    // Tab filter
    if (filterTab !== 'all' && order.status !== filterTab) return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchEmail = order.customerEmail.toLowerCase().includes(q);
      const matchPhone = order.customerPhone.toLowerCase().includes(q);
      const matchPkg = order.packageName.toLowerCase().includes(q);
      return matchId || matchName || matchEmail || matchPhone || matchPkg;
    }

    return true;
  });

  const handleApprove = (orderId: string) => {
    updateOrderStatus(orderId, 'approved', 'Payment verified and approved by Administrator.');
    setActionSuccess(`Order ${orderId} verified & permanently approved! Provisional status cleared.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleConfirmReject = () => {
    if (!rejectOrderTarget) return;
    updateOrderStatus(rejectOrderTarget.id, 'rejected', rejectReason);
    setActionSuccess(`Order ${rejectOrderTarget.id} was rejected. Customer's temporary VPN access permanently revoked.`);
    setRejectOrderTarget(null);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <Receipt className="h-6 w-6 text-destructive" />
            <span>Orders & Payment Slips</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Review incoming customer bank transfer receipts, verify transaction IDs, and approve VPN access.
          </p>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-medium text-emerald-400 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-xl border-border/60 bg-card/90">
          <CardContent className="p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Orders
            </span>
            <div className="text-2xl font-black text-foreground mt-1 font-mono">
              {totalOrders}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Pending Review
            </span>
            <div className="text-2xl font-black text-amber-400 mt-1 font-mono">
              {pendingOrders}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Approved
            </span>
            <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
              {approvedOrders}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/60 bg-card/90">
          <CardContent className="p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Revenue
            </span>
            <div className="text-2xl font-black text-primary mt-1 font-mono">
              Rs. {totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border/60">
        
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Orders', count: totalOrders },
            { id: 'pending_approval', label: 'Pending Review', count: pendingOrders },
            { id: 'approved', label: 'Approved', count: approvedOrders },
            { id: 'rejected', label: 'Rejected', count: orders.filter((o) => o.status === 'rejected').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 ${
                filterTab === tab.id
                  ? 'bg-destructive text-destructive-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                filterTab === tab.id ? 'bg-destructive-foreground/20 text-destructive-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search order ID, name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 text-xs rounded-xl"
          />
        </div>

      </div>

      {/* Orders Table */}
      <Card className="rounded-2xl border-border/70 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground">
                <th className="py-3.5 px-4 font-semibold">Order ID & Date</th>
                <th className="py-3.5 px-4 font-semibold">Customer Details</th>
                <th className="py-3.5 px-4 font-semibold">Package & Network</th>
                <th className="py-3.5 px-4 font-semibold">Amount</th>
                <th className="py-3.5 px-4 font-semibold">Payment Slip</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  return (
                    <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                      
                      {/* Order ID & Date */}
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-foreground block">{order.id}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground">{order.customerName}</div>
                        <div className="text-[11px] text-muted-foreground">{order.customerEmail}</div>
                        <div className="text-[10px] font-mono text-primary">{order.customerPhone}</div>
                      </td>

                      {/* Package & Network */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground">{order.packageName}</div>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                          <span className="shrink-0">{getIspLogo(order.networkId, 14)}</span>
                          <span className="font-medium text-foreground">{order.networkPackageName || order.networkName}</span>
                          <span>•</span>
                          <span>{order.dataQuota}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-foreground">
                          Rs. {order.finalAmount}
                        </span>
                        {order.discountAmount > 0 && (
                          <span className="block text-[10px] text-emerald-400">
                            Saved Rs. {order.discountAmount}
                          </span>
                        )}
                        {order.bankReference && (
                          <span className="block text-[10px] text-muted-foreground font-mono truncate max-w-[120px]" title={order.bankReference}>
                            Ref: {order.bankReference}
                          </span>
                        )}
                      </td>

                      {/* Payment Slip Preview Trigger */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {order.slipFileData || order.slipFileName ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrderForSlip(order)}
                              className="h-8 gap-1.5 text-[11px] rounded-lg border-border/80 hover:bg-muted"
                            >
                              <FileText className="h-3.5 w-3.5 text-primary" />
                              <span>View Slip</span>
                            </Button>
                          ) : (
                            <span className="text-[11px] text-muted-foreground italic">No Slip</span>
                          )}
                          {order.aiPreCheckPassed && (
                            <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-semibold block w-fit">
                              🤖 AI Pre-Checked
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {order.status === 'pending_approval' && (
                          order.isProvisional ? (
                            <div className="space-y-0.5">
                              <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px] font-bold">
                                <Clock className="h-3 w-3 mr-1 animate-pulse" />
                                Temporary Active
                              </Badge>
                              <span className="block text-[9px] text-amber-300/80 font-medium">Pending Review</span>
                            </div>
                          ) : (
                            <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px] font-bold">
                              <Clock className="h-3 w-3 mr-1 animate-pulse" />
                              Pending
                            </Badge>
                          )
                        )}
                        {order.status === 'approved' && (
                          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                            <Check className="h-3 w-3 mr-1" />
                            Approved
                          </Badge>
                        )}
                        {order.status === 'rejected' && (
                          <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-[10px] font-bold">
                            <X className="h-3 w-3 mr-1" />
                            Rejected
                          </Badge>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.status === 'pending_approval' ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(order.id)}
                                className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm gap-1"
                                title="Approve payment & activate VPN"
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span>Approve</span>
                              </Button>

                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setRejectOrderTarget(order);
                                  setRejectReason('Payment reference could not be verified on the bank statement.');
                                }}
                                className="h-8 px-2.5 text-xs rounded-lg"
                                title="Reject payment slip"
                              >
                                <X className="h-3.5 w-3.5" />
                                <span>Reject</span>
                              </Button>
                            </>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">
                              {order.status === 'approved' ? '✓ Provisioned' : 'Declined'}
                            </span>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <p className="text-xs">No orders found matching the filter criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payment Slip Viewer Dialog */}
      <Dialog 
        open={!!selectedOrderForSlip} 
        onOpenChange={(open) => {
          if (!open) setSelectedOrderForSlip(null);
        }}
      >
        <DialogContent className="max-w-lg bg-card border-border/80">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center justify-between">
              <span>Payment Slip Preview</span>
              <span className="font-mono text-xs text-primary">{selectedOrderForSlip?.id}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Submitted by {selectedOrderForSlip?.customerName} ({selectedOrderForSlip?.customerPhone})
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-4">
            {/* Slip Preview Box */}
            <div className="rounded-xl overflow-hidden border border-border/60 bg-muted/40 max-h-[360px] flex items-center justify-center p-2">
              {selectedOrderForSlip?.finalAmount === 0 ? (
                <div className="p-8 text-center text-muted-foreground space-y-2">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                    <Gift className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-bold text-foreground">100% Free Trial Gift Voucher</p>
                  <p className="text-xs text-emerald-400 font-mono font-semibold">
                    Code: {selectedOrderForSlip?.promoCode || 'GIFT-TRIAL'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    This order was redeemed with a single-use gift card. No bank transfer receipt is required.
                  </p>
                </div>
              ) : selectedOrderForSlip?.slipFileData ? (
                <img
                  src={selectedOrderForSlip.slipFileData}
                  alt="Customer Payment Receipt"
                  className="max-h-[340px] w-auto object-contain rounded-lg shadow-sm"
                />
              ) : (
                <div className="p-8 text-center text-muted-foreground space-y-2">
                  <FileText className="h-12 w-12 text-primary mx-auto opacity-70" />
                  <p className="text-xs font-semibold">{selectedOrderForSlip?.slipFileName || 'Payment Slip'}</p>
                  <p className="text-[11px]">Slip metadata uploaded without image preview.</p>
                </div>
              )}
            </div>

            {/* Slip & Order Details Recap */}
            <div className="p-3 rounded-xl bg-muted/20 border border-border/40 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Purchased Plan:</span>
                <span className="font-semibold text-foreground">
                  {selectedOrderForSlip?.packageName} ({selectedOrderForSlip?.dataQuota})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">ISP Bypass Package:</span>
                <span className="font-bold text-primary flex items-center gap-1.5">
                  {selectedOrderForSlip && getIspLogo(selectedOrderForSlip.networkId, 16)}
                  <span>{selectedOrderForSlip?.networkPackageName || selectedOrderForSlip?.networkName}</span>
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-border/30">
                <span className="text-muted-foreground">Payable Amount:</span>
                <span className="font-bold font-mono text-foreground">Rs. {selectedOrderForSlip?.finalAmount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Customer WhatsApp:</span>
                <span className="font-mono text-primary font-medium">{selectedOrderForSlip?.customerPhone}</span>
              </div>
              {selectedOrderForSlip?.bankReference && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Customer Transaction Ref:</span>
                  <span className="font-mono text-foreground font-bold">{selectedOrderForSlip.bankReference}</span>
                </div>
              )}
              {selectedOrderForSlip?.aiPreCheckPassed && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>
                    <strong>AI Pre-Check:</strong> {selectedOrderForSlip.aiVerificationDetails || 'Receipt structure & metadata validated.'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedOrderForSlip(null)}
              className="text-xs"
            >
              Close Preview
            </Button>

            {selectedOrderForSlip?.status === 'pending_approval' && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    if (selectedOrderForSlip) {
                      handleApprove(selectedOrderForSlip.id);
                      setSelectedOrderForSlip(null);
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Approve Payment</span>
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Order Dialog */}
      <Dialog 
        open={!!rejectOrderTarget} 
        onOpenChange={(open) => {
          if (!open) setRejectOrderTarget(null);
        }}
      >
        <DialogContent className="max-w-md bg-card border-border/80">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Reject Payment Slip</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              State the reason for rejecting Order {rejectOrderTarget?.id}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {(rejectOrderTarget?.isProvisional || rejectOrderTarget?.vpnProvisioned) && (
              <div className="p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-xs text-destructive flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Immediate Cut-Off:</strong> This user currently has active provisional VPN credentials. Confirming rejection will immediately revoke all VPN access and disconnect the client.
                </span>
              </div>
            )}
            <label className="text-xs font-semibold text-foreground">Reason for Rejection:</label>
            <Input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Reference not found or image unreadable."
              className="h-10 text-xs rounded-xl"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectOrderTarget(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmReject}
              className="text-xs"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
