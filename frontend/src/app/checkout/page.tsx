'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Package, NetworkConfig, NetworkPackage, Order, PromoCode, OrderStatus } from '@/types';
import { getNetworkConfig, getNetworkPackage, buildVlessUrl, ensureStandardVlessUrl } from '@/data/network-configs';
import { validatePromoCode } from '@/data/promo-codes';
import { adminBankDetails } from '@/data/bank-config';
import { getIspLogo } from '@/components/marketing/IspLogos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  HardDrive, 
  Smartphone, 
  Server, 
  Check, 
  AlertCircle, 
  UploadCloud, 
  FileText, 
  X, 
  Building2, 
  CreditCard, 
  Tag, 
  CheckCircle2, 
  Copy, 
  Lock, 
  AlertTriangle,
  Gift,
  Zap
} from 'lucide-react';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    packages, 
    user, 
    selectedPlan, 
    selectPlan, 
    selectedNetwork, 
    selectNetwork,
    selectedNetworkPackage,
    selectNetworkPackage,
    networkPackages,
    promoCodes,
    markPromoCodeUsed,
    createOrder,
    login 
  } = useApp();

  const [activePlan, setActivePlan] = useState<Package | null>(selectedPlan);
  const [activeNetwork, setActiveNetwork] = useState<NetworkConfig | null>(selectedNetwork);
  const [activeNetworkPkg, setActiveNetworkPkg] = useState<NetworkPackage | null>(selectedNetworkPackage);

  // Customer Form State
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'online_gateway'>('bank_transfer');
  const [bankReference, setBankReference] = useState('');

  // File Upload State
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreviewUrl, setSlipPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Promo Code State
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiScanStatus, setAiScanStatus] = useState<'idle' | 'scanning' | 'passed' | 'failed'>('idle');
  const [formError, setFormError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Ensure user is authenticated to access checkout
  useEffect(() => {
    if (!user) {
      const currentQuery = searchParams.toString();
      const redirectPath = currentQuery ? `/checkout?${currentQuery}` : '/checkout';
      router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
    } else {
      if (user.name && !customerName) setCustomerName(user.name);
      if (user.email && !customerEmail) setCustomerEmail(user.email);
    }
  }, [user, searchParams, router]);

  // Sync plan & network & network package from URL query params or AppContext
  useEffect(() => {
    const planParam = searchParams.get('plan');
    if (planParam) {
      const matched = packages.find((p) => p.id === planParam);
      if (matched) {
        setActivePlan(matched);
        selectPlan(matched);
      }
    } else if (selectedPlan) {
      setActivePlan(selectedPlan);
    }

    const netPkgParam = searchParams.get('networkPackage') || searchParams.get('pkg');
    if (netPkgParam) {
      const matchedNetPkg = networkPackages.find((p) => p.id === netPkgParam) || getNetworkPackage(netPkgParam);
      if (matchedNetPkg) {
        setActiveNetworkPkg(matchedNetPkg);
        selectNetworkPackage(matchedNetPkg);
      }
    } else if (selectedNetworkPackage) {
      setActiveNetworkPkg(selectedNetworkPackage);
    }

    const netParam = searchParams.get('network');
    if (netParam) {
      const matchedNet = getNetworkConfig(netParam);
      if (matchedNet) {
        setActiveNetwork(matchedNet);
        selectNetwork(matchedNet);
      }
    } else if (selectedNetwork) {
      setActiveNetwork(selectedNetwork);
    }
  }, [searchParams, packages, selectedPlan, selectedNetwork, selectedNetworkPackage, networkPackages, selectPlan, selectNetwork, selectNetworkPackage]);

  // If user state loads, prefill name and email
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!customerEmail) setCustomerEmail(user.email);
    }
  }, [user]);

  // Recalculate promo discount when plan changes or subtotal changes
  const originalPrice = activePlan?.price || 0;
  const finalPrice = Math.max(0, originalPrice - discountAmount);

  // Handle Promo Code Apply (Real-Time Cloud Validation from PostgreSQL)
  const handleApplyPromo = async () => {
    setPromoMessage(null);
    const cleanInput = promoInput.trim().toUpperCase();
    if (!cleanInput) {
      setPromoMessage({ type: 'error', text: 'Please enter a promo code or gift card.' });
      return;
    }

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://virtual-internet-access.duckdns.org:3001';
    let currentList = promoCodes;

    // Fetch the freshest promo codes directly from AWS RDS PostgreSQL database
    try {
      const res = await fetch(`${API_BASE}/api/promos`);
      if (res.ok) {
        const cloudPromos = await res.json();
        if (Array.isArray(cloudPromos) && cloudPromos.length > 0) {
          currentList = cloudPromos;
          localStorage.setItem('vpn_promos', JSON.stringify(cloudPromos));
        }
      }
    } catch (e) {
      console.warn('Real-time promo check network fallback:', e);
    }

    const result = validatePromoCode(cleanInput, originalPrice, currentList);
    if (result.valid && result.promo) {
      setAppliedPromo(result.promo);
      setDiscountAmount(result.discountAmount);
      setPromoMessage({
        type: 'success',
        text: result.promo.discountType === 'gift_100'
          ? `🎁 Gift Voucher "${result.promo.code}" applied! 100% Free (${result.promo.durationDays || 7}-Day Trial). Total: Rs. 0!`
          : `Promo "${result.promo.code}" applied! You saved Rs. ${result.discountAmount}.`,
      });
    } else {
      setAppliedPromo(null);
      setDiscountAmount(0);
      setPromoMessage({
        type: 'error',
        text: result.errorMessage || 'Invalid promo code.',
      });
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setDiscountAmount(0);
    setPromoInput('');
    setPromoMessage(null);
  };

  // Handle Slip File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate File Type (JPG, PNG, PDF)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setFileError('Invalid file type. Please upload a JPG, PNG or PDF document.');
      return;
    }

    // Validate File Size (Max 5MB)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setFileError('File size exceeds 5 MB. Please upload a compressed slip image.');
      return;
    }

    setSlipFile(file);

    // Read file as Data URL (Supports both image and PDF)
    const reader = new FileReader();
    reader.onload = () => {
      setSlipPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSlipFile(null);
    setSlipPreviewUrl(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Handle Order Submission
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!activePlan) {
      setFormError('No package selected. Please select a package to proceed.');
      return;
    }

    if (activePlan.availableSlots !== undefined && activePlan.availableSlots <= 0) {
      setFormError('This package is currently out of stock (0 slots remaining). Please return to Pricing to choose an available plan.');
      return;
    }

    if (!activeNetwork) {
      setFormError('No network configuration selected. Please choose a supported network.');
      return;
    }

    if (activeNetworkPkg && activeNetworkPkg.status !== 'active') {
      setFormError(`The selected bypass route "${activeNetworkPkg.name}" is currently not available / offline. Please go back to network selection and choose an active route.`);
      return;
    }

    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setFormError('Please enter a valid email address for receiving your VPN credentials.');
      return;
    }

    if (!customerPhone.trim() || customerPhone.length < 9) {
      setFormError('Please enter a valid Sri Lankan phone or WhatsApp number (e.g. 0771234567).');
      return;
    }

    if (finalPrice > 0 && paymentMethod === 'online_gateway') {
      setFormError('Online Payment Gateway is currently awaiting admin API configuration. Please select Bank Transfer to complete your order.');
      return;
    }

    if (finalPrice > 0 && paymentMethod === 'bank_transfer' && !slipFile) {
      setFormError('Please upload your bank transfer slip or transaction screenshot.');
      return;
    }

    setIsSubmitting(true);
    setAiScanStatus('scanning');

    // Simulate smart AI receipt inspection and auto-provision real 3X-UI VPS client
    setTimeout(async () => {
      setAiScanStatus('passed');

      // Generate unique order ID
      const randomDigits = Math.floor(10000 + Math.random() * 90000);
      const orderId = `ORD-2026-${randomDigits}`;

      const isFreeGift = finalPrice === 0 && appliedPromo?.discountType === 'gift_100';

      const targetSni = (activeNetworkPkg?.sni || activePlan?.sni || 'aka.ms').trim();
      const cleanNet = (activeNetwork?.name || activeNetworkPkg?.ispName || 'SLT').replace(/[^a-zA-Z0-9]/g, '');
      const cleanPkg = (activePlan.name || 'Pro').replace(/[^a-zA-Z0-9]/g, '-');
      const clientUuid = `${randomDigits}e7a-3f4b-48c2-a912-${Date.now().toString(16).padStart(12, '0')}`;

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://virtual-internet-access.duckdns.org:3001';

      let orderStatus: OrderStatus = 'pending_approval';
      let vpnProvisioned = false; // Strictly FALSE by default! No temporary links given without approval!
      let isProvisional = false;
      let vpnDetails: any = undefined;
      let aiVerificationDetails = isFreeGift 
        ? 'Free trial voucher verified. Instant trial access active.'
        : 'Bank transfer slip uploaded. Awaiting administrator verification.';
      let adminNotes = isFreeGift 
        ? `100% Free Gift Trial (${appliedPromo.durationDays || 7} Days) redeemed via voucher "${appliedPromo.code}". Approved.`
        : 'Awaiting administrator verification of bank transfer slip.';

      // Helper to provision VPN client on 3X-UI VPS
      const provisionVpnAccess = async () => {
        let vlessUrl = buildVlessUrl(clientUuid, targetSni, `Cyberx-${cleanNet}-${cleanPkg}`);
        let serverLocation = `virtual-internet-access.duckdns.org:443 (Cyberx - VLESS gRPC TLS | SNI: ${targetSni})`;
        try {
          const provRes = await fetch(`${API_BASE}/api/vpn/provision`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              email: customerEmail.trim(),
              customerName: customerName || 'Customer',
              packageName: activePlan.name,
              networkName: cleanNet,
              sni: targetSni,
              totalGB: activePlan.trafficLimit || 0,
              expiryDays: 30,
              uuid: clientUuid,
              deviceLimit: activePlan.deviceLimit || '1 Device',
            }),
          });
          if (provRes.ok) {
            const data = await provRes.json();
            if (data.vlessUrl) vlessUrl = ensureStandardVlessUrl(data.vlessUrl, targetSni, `Cyberx-${cleanNet}-${cleanPkg}`);
            if (data.serverLocation) serverLocation = data.serverLocation;
          }
        } catch (e) {
          console.warn('Backend 3X-UI provision fallback:', e);
        }
        return {
          server: serverLocation,
          status: 'connected',
          configuration: vlessUrl,
          qrCode: 'active-v2ray-qr',
        };
      };

      // Case 1: 100% Free Gift Voucher Trial
      if (isFreeGift) {
        orderStatus = 'approved';
        vpnProvisioned = true;
        vpnDetails = await provisionVpnAccess();
      }
      // Case 2: Bank Transfer with uploaded slip
      else if (slipPreviewUrl && finalPrice > 0) {
        setAiScanStatus('scanning');
        try {
          const aiRes = await fetch(`${API_BASE}/api/payments/verify-slip`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              slipBase64: slipPreviewUrl,
              expectedAmount: finalPrice,
              expectedAccount: '0094574296',
              expectedBank: 'Bank of Ceylon',
              expectedAccountName: 'MR A D D M U NANAYAKKARA',
            }),
          });

          if (aiRes.ok) {
            const aiData = await aiRes.json();

            // Check if blank, fake, or non-bank-slip -> Automatic Decline!
            if (aiData.details?.isFakeOrBlank || aiData.details?.isBankSlip === false) {
              setAiScanStatus('failed');
              orderStatus = 'rejected';
              vpnProvisioned = false;
              vpnDetails = undefined; // NO VPN LINK GIVEN!
              aiVerificationDetails = `❌ AI Audit Declined: ${aiData.details?.reason || 'Uploaded file is not a valid bank payment receipt.'}`;
              adminNotes = `Order automatically declined by AI Slip Verification: Fake, blank, or invalid image detected (${aiData.details?.reason || 'Invalid slip'}).`;
            }
            // Check if AI strictly Approved (Matched account 0094574296 AND Amount)
            else if (aiData.approved) {
              setAiScanStatus('passed');
              orderStatus = 'approved';
              vpnProvisioned = true;
              vpnDetails = await provisionVpnAccess(); // Provision ONLY when verified!
              aiVerificationDetails = `✨ AI Instant Approval: Destination account 0094574296 & Rs. ${finalPrice} payment verified (${aiData.details?.detectedReference || 'BOC Verified'}).`;
              adminNotes = `Order automatically approved by AI Slip Verification: Matched account 0094574296, Rs. ${finalPrice} (${aiData.details?.reason || 'Verified'}).`;
            }
            // Real slip but amount/account mismatch or AI key pending -> Strict manual review (NO VPN link yet!)
            else {
              setAiScanStatus('passed');
              orderStatus = 'pending_approval';
              vpnProvisioned = false; // Strictly NO VPN link until Admin approves!
              vpnDetails = undefined;
              aiVerificationDetails = aiData.details?.reason || 'Slip uploaded. Awaiting administrator review of bank deposit.';
              adminNotes = `Awaiting admin review: ${aiData.details?.reason || 'Pending verification'}`;
            }
          } else {
            // Server error / network fallback -> Pending manual review, NO VPN link
            orderStatus = 'pending_approval';
            vpnProvisioned = false;
            vpnDetails = undefined;
          }
        } catch (aiErr) {
          console.warn('AI slip verify network notice:', aiErr);
          orderStatus = 'pending_approval';
          vpnProvisioned = false;
          vpnDetails = undefined;
        }
      }

      const newOrder: Order = {
        id: orderId,
        createdAt: new Date().toISOString(),
        customerName: customerName || 'Customer',
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        telegramUsername: telegramUsername.trim() || undefined,
        packageId: activePlan.id,
        packageName: activePlan.name,
        packagePrice: originalPrice,
        dataQuota: activePlan.trafficLimit > 0 ? `${activePlan.trafficLimit} GB` : 'Unlimited Data',
        deviceLimit: activePlan.deviceLimit || '1 Device',
        networkId: activeNetwork?.id || activeNetworkPkg?.isp || 'slt',
        networkName: activeNetwork?.name || activeNetworkPkg?.ispName || 'SLT',
        networkPackageId: activeNetworkPkg?.id,
        networkPackageName: activeNetworkPkg?.name,
        sni: targetSni,
        promoCode: appliedPromo?.code,
        discountAmount,
        finalAmount: finalPrice,
        paymentMethod: isFreeGift ? 'bank_transfer' : paymentMethod,
        slipFileName: isFreeGift ? 'Gift_Voucher_Trial.pdf' : slipFile?.name,
        slipFileSize: isFreeGift ? 1024 : slipFile?.size,
        slipFileData: slipPreviewUrl || undefined,
        bankReference: isFreeGift ? `GIFT-CARD-${appliedPromo.code}` : (bankReference.trim() || undefined),
        status: orderStatus,
        adminNotes,
        vpnProvisioned, // Only true if approved! False if pending or rejected!
        isProvisional: false, // Never provisional!
        aiPreCheckPassed: orderStatus === 'approved',
        aiVerificationDetails,
        vpnDetails, // undefined if pending or rejected!
      };

      // Save order in context and localStorage
      createOrder(newOrder);

      // Automatically sign in customer so dashboard is immediately accessible without login block
      if (!user) {
        login({
          id: `cust-${orderId.toLowerCase()}`,
          name: customerName || 'Customer',
          email: customerEmail.trim(),
          role: 'user',
        });
      }

      // Expire the promo code immediately upon redemption
      if (appliedPromo) {
        markPromoCodeUsed(appliedPromo.code, newOrder.id, customerEmail.trim());
      }

      // Navigate to confirmation page
      setTimeout(() => {
        setIsSubmitting(false);
        router.push(`/checkout/confirmation?orderId=${newOrder.id}`);
      }, 500);
    }, 900);
  };

  return (
    <div className="py-10 md:py-16 relative overflow-hidden min-h-[calc(100vh-4rem)]">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-3/4 h-[350px] bg-primary/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 max-w-6xl relative z-10">
        
        {/* Step Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between max-w-xl mx-auto relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border/60 -z-0" />
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-0 transition-all duration-300"
              style={{ width: '100%' }}
            />

            {/* Step 1: Package */}
            <Link href="/pricing" className="flex flex-col items-center gap-1.5 z-10 group">
              <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-md">
                <Check className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                1. Plan
              </span>
            </Link>

            {/* Step 2: Network */}
            <Link 
              href={activePlan ? `/checkout/network?plan=${activePlan.id}` : '/checkout/network'} 
              className="flex flex-col items-center gap-1.5 z-10 group"
            >
              <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-md">
                <Check className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                2. Network
              </span>
            </Link>

            {/* Step 3: Checkout */}
            <div className="flex flex-col items-center gap-1.5 z-10">
              <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs ring-4 ring-primary/20 shadow-lg">
                3
              </div>
              <span className="text-xs font-bold text-primary">
                3. Checkout & Pay
              </span>
            </div>
          </div>
        </div>

        {/* Warning if no plan or network selected */}
        {(!activePlan || !activeNetwork) && (
          <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Please select a plan and network before completing checkout.</span>
            </div>
            <Link href="/pricing">
              <Button size="sm" variant="outline" className="text-xs h-8">
                Browse Plans
              </Button>
            </Link>
          </div>
        )}

        {/* Form Error Banner */}
        {formError && (
          <div className="mb-8 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-xs text-destructive flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Customer Info & Payment Method (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Card 1: Customer Contact Info */}
              <Card className="rounded-2xl border-border/70 bg-card/85 backdrop-blur-md shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black">
                      1
                    </span>
                    <span>Customer Contact Information</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your VPN credentials and setup guide will be dispatched to these contacts.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="customerName" className="text-xs">Full Name</Label>
                      <Input
                        id="customerName"
                        placeholder="e.g. Kasun Perera"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="h-10 text-xs rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="customerPhone" className="text-xs">
                        WhatsApp / Mobile No <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="customerPhone"
                        placeholder="077 123 4567"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        required
                        className="h-10 text-xs rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="customerEmail" className="text-xs">
                        Email Address <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        placeholder="kasun@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        required
                        className="h-10 text-xs rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="telegramUsername" className="text-xs">
                        Telegram Username (Optional)
                      </Label>
                      <Input
                        id="telegramUsername"
                        placeholder="@username"
                        value={telegramUsername}
                        onChange={(e) => setTelegramUsername(e.target.value)}
                        className="h-10 text-xs rounded-xl"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Payment Method Selection */}
              <Card className="rounded-2xl border-border/70 bg-card/85 backdrop-blur-md shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black">
                      2
                    </span>
                    <span>Select Payment Method</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {finalPrice === 0 ? (
                    <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                          <Gift className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">
                              100% Free Trial Gift Voucher Active
                            </span>
                            <Badge className="bg-emerald-500 text-white text-[10px]">
                              Rs. 0 Payable
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {appliedPromo?.description || 'Free trial voucher'} ({appliedPromo?.durationDays || 7} Days Access)
                          </p>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-background/60 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
                        <p className="font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          <span>No bank deposit or slip upload required!</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Your promo code covers 100% of the package cost. Simply verify your details and click below to submit your trial order.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Option 1: Bank Transfer */}
                      <div
                        onClick={() => setPaymentMethod('bank_transfer')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                        : 'border-border/60 hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-foreground">
                              Bank Transfer / CDM Deposit
                            </span>
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                              Recommended
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Transfer via Online Banking or CDM, and upload your payment receipt.
                          </p>
                        </div>
                      </div>
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'bank_transfer' ? 'border-primary bg-primary' : 'border-muted-foreground'
                      }`}>
                        {paymentMethod === 'bank_transfer' && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                      </div>
                    </div>

                    {/* Bank Details Dropdown Content */}
                    {paymentMethod === 'bank_transfer' && (
                      <div className="mt-4 pt-4 border-t border-border/40 space-y-4 text-xs animate-in fade-in duration-200">
                        {/* Bank Box */}
                        <div className="p-3.5 rounded-xl bg-background/80 border border-border/60 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Bank Name:</span>
                            <span className="font-semibold text-foreground">{adminBankDetails.bankName}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Account Name:</span>
                            <span className="font-semibold text-foreground">{adminBankDetails.accountName}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Account Number:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-primary tracking-wider">
                                {adminBankDetails.accountNumber}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyText(adminBankDetails.accountNumber, 'account');
                                }}
                                className="p-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                                title="Copy Account Number"
                              >
                                {copiedField === 'account' ? (
                                  <Check className="h-3 w-3 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Branch:</span>
                            <span className="font-semibold text-foreground">{adminBankDetails.branch}</span>
                          </div>
                        </div>

                        {/* Instructions */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-semibold text-foreground">Transfer Instructions:</span>
                          <ul className="space-y-1 text-[11px] text-muted-foreground list-disc pl-4 leading-relaxed">
                            {adminBankDetails.instructions.map((inst, idx) => (
                              <li key={idx}>{inst}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Slip Upload Area */}
                        <div className="space-y-2 pt-2">
                          <Label className="text-xs font-semibold">
                            Upload Payment Slip / Receipt <span className="text-destructive">*</span>
                          </Label>

                          {!slipFile ? (
                            <div
                              onClick={() => fileInputRef.current?.click()}
                              className="border-2 border-dashed border-border/70 hover:border-primary/60 rounded-xl p-6 text-center cursor-pointer transition-colors bg-muted/20 hover:bg-muted/30"
                            >
                              <UploadCloud className="h-8 w-8 text-primary mx-auto mb-2 opacity-80" />
                              <p className="text-xs font-medium text-foreground">
                                Click or drag receipt image / PDF here
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-1">
                                Supported formats: JPG, PNG, PDF (Max 5 MB)
                              </p>
                            </div>
                          ) : (
                            <div className="p-3 rounded-xl bg-background border border-border/60 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 overflow-hidden">
                                {slipPreviewUrl && !slipFile?.type?.includes('pdf') && !slipFile?.name?.toLowerCase().endsWith('.pdf') ? (
                                  <img 
                                    src={slipPreviewUrl} 
                                    alt="Slip Preview" 
                                    className="h-12 w-12 rounded-lg object-cover border border-border/60 shrink-0" 
                                  />
                                ) : (
                                  <div className="h-12 w-12 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 flex flex-col items-center justify-center shrink-0">
                                    <FileText className="h-5 w-5" />
                                    <span className="text-[8px] font-extrabold uppercase tracking-wider">PDF</span>
                                  </div>
                                )}
                                <div className="overflow-hidden">
                                  <p className="text-xs font-medium text-foreground truncate">
                                    {slipFile.name}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                    <span>{(slipFile.size / 1024).toFixed(1)} KB</span>
                                    <span>•</span>
                                    <span className="text-emerald-500 font-medium">Ready for AI review</span>
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleRemoveFile}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}

                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,application/pdf"
                            onChange={handleFileChange}
                            className="hidden"
                          />

                          {fileError && (
                            <p className="text-[11px] text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              <span>{fileError}</span>
                            </p>
                          )}
                        </div>

                        {/* Optional Reference */}
                        <div className="space-y-1.5 pt-1">
                          <Label htmlFor="bankRef" className="text-xs">
                            Bank Reference / Transaction ID (Optional)
                          </Label>
                          <Input
                            id="bankRef"
                            placeholder="e.g. 984029482 or CDM Slip No."
                            value={bankReference}
                            onChange={(e) => setBankReference(e.target.value)}
                            className="h-9 text-xs rounded-xl"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Option 2: Online Payment Gateway (Disabled / Modular Placeholder) */}
                  <div
                    onClick={() => setPaymentMethod('online_gateway')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'online_gateway'
                        ? 'border-border/80 bg-muted/30'
                        : 'border-border/60 hover:border-border/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted text-muted-foreground shrink-0">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-foreground">
                              Online Payment Gateway (Visa / Mastercard)
                            </span>
                            <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">
                              Setup Pending
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Direct card checkout with PayHere / Stripe gateway integration.
                          </p>
                        </div>
                      </div>
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'online_gateway' ? 'border-primary bg-primary' : 'border-muted-foreground'
                      }`}>
                        {paymentMethod === 'online_gateway' && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                      </div>
                    </div>

                    {paymentMethod === 'online_gateway' && (
                      <div className="mt-4 pt-4 border-t border-border/40 text-xs space-y-2 animate-in fade-in duration-200">
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                            <Lock className="h-3.5 w-3.5" />
                            <span>Payment Gateway Configuration Required</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-amber-300/90">
                            The online payment gateway requires administrator merchant credentials (API keys) to process credit/debit cards. To ensure transaction security and prevent unverified orders, card payments are temporarily offline.
                          </p>
                          <p className="text-[11px] font-bold text-foreground pt-1">
                            👉 Please switch to the Bank Transfer option above to complete your order.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  </>
                  )}
                </CardContent>
              </Card>

            </div>

            {/* Right Column: Order Summary & Promo Code (5 cols) */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
              
              <Card className="rounded-2xl border-border/70 bg-card/90 backdrop-blur-md shadow-xl">
                <CardHeader className="pb-3 border-b border-border/40">
                  <CardTitle className="text-base font-bold text-foreground">
                    Order Summary
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  {/* Selected Plan Details */}
                  {activePlan ? (
                    <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                          Package
                        </span>
                        <Link 
                          href="/pricing"
                          className="text-[11px] text-muted-foreground hover:text-primary transition-colors underline"
                        >
                          Change
                        </Link>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-bold text-sm text-foreground">{activePlan.name}</h4>
                        <span className="font-mono font-bold text-xs text-foreground">
                          Rs. {activePlan.price}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1 border-t border-border/30">
                        <span className="flex items-center gap-1">
                          <HardDrive className="h-3 w-3 text-primary" />
                          {activePlan.trafficLimit > 0 ? `${activePlan.trafficLimit} GB` : 'Unlimited'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Smartphone className="h-3 w-3 text-primary" />
                          {activePlan.deviceLimit || '1 Device'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-xs">
                      No plan selected.
                    </div>
                  )}

                  {/* Selected Network & Bypass Package Details */}
                  {activeNetworkPkg ? (
                    <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                          ISP Bypass Route
                        </span>
                        <Link 
                          href={activePlan ? `/checkout/network?plan=${activePlan.id}&networkPackage=${activeNetworkPkg.id}` : '/checkout/network'}
                          className="text-[11px] text-muted-foreground hover:text-primary transition-colors underline"
                        >
                          Change
                        </Link>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg bg-background border border-border/60 shrink-0 mt-0.5">
                          {getIspLogo(activeNetworkPkg.isp, 24)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-foreground truncate">
                            {activeNetworkPkg.name}
                          </div>
                          <div className="text-[10px] text-emerald-400 font-medium mt-0.5">
                            {activeNetworkPkg.ispName} • {activeNetworkPkg.serverLocation} • {activeNetworkPkg.speedLimit}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : activeNetwork ? (
                    <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Network Carrier
                        </span>
                        <Link 
                          href={activePlan ? `/checkout/network?plan=${activePlan.id}` : '/checkout/network'}
                          className="text-[11px] text-muted-foreground hover:text-primary transition-colors underline"
                        >
                          Change
                        </Link>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="p-1 rounded-lg bg-background border border-border/60 shrink-0">
                          {getIspLogo(activeNetwork.category, 22)}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-foreground">{activeNetwork.name}</div>
                          <div className="text-[10px] text-muted-foreground">{activeNetwork.carrierBadge}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-xs">
                      No network selected.
                    </div>
                  )}

                  {/* Promo Code Input Section */}
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-primary" />
                      <span>Have a Promo Code?</span>
                    </Label>

                    {!appliedPromo ? (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter Gift Card / Promo Code"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                          className="h-9 text-xs rounded-xl font-mono uppercase"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleApplyPromo}
                          className="h-9 text-xs px-4 rounded-xl border-border/80 hover:bg-primary hover:text-primary-foreground hover:border-primary shrink-0"
                        >
                          Apply
                        </Button>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          <div>
                            <span className="font-mono font-bold text-emerald-400">{appliedPromo.code}</span>
                            <p className="text-[10px] text-emerald-300/80">{appliedPromo.description}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemovePromo}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}

                    {promoMessage && !appliedPromo && (
                      <p className={`text-[11px] flex items-center gap-1 ${
                        promoMessage.type === 'success' ? 'text-emerald-400' : 'text-destructive'
                      }`}>
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{promoMessage.text}</span>
                      </p>
                    )}

                    <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-0.5">
                      <span>Have a gift card or trial voucher? Enter it above to apply.</span>
                    </div>
                  </div>

                  {/* Price Calculation Table */}
                  <div className="pt-3 border-t border-border/40 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Package Price:</span>
                      <span className="font-mono">Rs. {originalPrice}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between items-center text-emerald-400 font-semibold">
                        <span>Promo Discount:</span>
                        <span className="font-mono">- Rs. {discountAmount}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Setup & Server Provisioning:</span>
                      <span className="text-emerald-400 font-semibold">FREE</span>
                    </div>

                    <div className="pt-2 border-t border-border/60 flex justify-between items-baseline">
                      <span className="font-bold text-sm text-foreground">Total Payable:</span>
                      <div className="text-right">
                        <span className="text-2xl font-black text-primary font-mono tracking-tight">
                          Rs. {finalPrice}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          One-time / 30 Days
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Instant Access Pre-Check Banner */}
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-[11px] text-muted-foreground flex items-center gap-2.5">
                    <Zap className="h-4 w-4 text-primary shrink-0" />
                    <span>
                      <strong>Instant Access Enabled:</strong> Upload your slip to receive immediate VLESS credentials via automated AI pre-check while admin reviews the deposit.
                    </span>
                  </div>

                  {/* Submit Order Button */}
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting || 
                      !activePlan || 
                      !activeNetwork || 
                      (activePlan.availableSlots !== undefined && activePlan.availableSlots <= 0) ||
                      Boolean(activeNetworkPkg && activeNetworkPkg.status !== 'active')
                    }
                    className={`w-full h-11 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 mt-2 ${
                      (activePlan?.availableSlots !== undefined && activePlan.availableSlots <= 0) ||
                      (activeNetworkPkg && activeNetworkPkg.status !== 'active')
                        ? 'bg-muted text-muted-foreground border border-border/70 cursor-not-allowed hover:bg-muted'
                        : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                        <span>🤖 AI Pre-Checking Payment Slip...</span>
                      </>
                    ) : aiScanStatus === 'passed' ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span>✓ AI Pre-Approved! Activating VPN...</span>
                      </>
                    ) : activePlan?.availableSlots !== undefined && activePlan.availableSlots <= 0 ? (
                      <>
                        <AlertCircle className="h-4 w-4 text-rose-400" />
                        <span>Selected Package is Out of Stock</span>
                      </>
                    ) : activeNetworkPkg && activeNetworkPkg.status !== 'active' ? (
                      <>
                        <AlertCircle className="h-4 w-4 text-rose-400" />
                        <span>Selected Route is Not Available</span>
                      </>
                    ) : (
                      <>
                        <span>{finalPrice === 0 ? 'Activate Free Trial Account' : 'Submit Order & Get Instant Access'}</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>

                  {/* Security Note */}
                  <p className="text-[10px] text-center text-muted-foreground leading-relaxed flex items-center justify-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>256-bit Encrypted Checkout • Verified Admin Verification</span>
                  </p>

                </CardContent>
              </Card>

            </div>

          </div>
        </form>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
