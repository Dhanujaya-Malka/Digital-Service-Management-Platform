'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { PromoCode } from '@/types';
import { defaultPromoCodes } from '@/data/promo-codes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Gift, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Share2, 
  RotateCcw,
  Search,
  Filter,
  UserCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function AdminPromoCodesPage() {
  const { promoCodes, addPromoCode, updatePromoCode, deletePromoCode } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'redeemed' | 'expired'>('all');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<PromoCode | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'gift_100' | 'percentage' | 'fixed'>('gift_100');
  const [value, setValue] = useState<number>(100);
  const [durationDays, setDurationDays] = useState<number>(7);
  const [validityDays, setValidityDays] = useState<number>(7);
  const [maxUses, setMaxUses] = useState<number>(1);
  const [description, setDescription] = useState('');
  const [minSpend, setMinSpend] = useState<number | undefined>(undefined);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleCopy = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(codeText);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const generateRandomCode = (prefix: string = 'GIFT') => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = '';
    for (let i = 0; i < 5; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}-${rand}`;
  };

  // Preset Handlers
  const applyPreset = (type: '7d' | '14d' | '30d' | 'discount50') => {
    if (type === '7d') {
      setCode(generateRandomCode('GIFT-7D'));
      setDiscountType('gift_100');
      setValue(100);
      setDurationDays(7);
      setValidityDays(7);
      setMaxUses(1);
      setDescription('100% Free 7-Day Trial Gift Card for Friend');
    } else if (type === '14d') {
      setCode(generateRandomCode('GIFT-14D'));
      setDiscountType('gift_100');
      setValue(100);
      setDurationDays(14);
      setValidityDays(14);
      setMaxUses(1);
      setDescription('100% Free 14-Day Trial Gift Card for Testing');
    } else if (type === '30d') {
      setCode(generateRandomCode('GIFT-30D'));
      setDiscountType('gift_100');
      setValue(100);
      setDurationDays(30);
      setValidityDays(30);
      setMaxUses(1);
      setDescription('100% Free 1-Month Trial Gift Card for Special User');
    } else if (type === 'discount50') {
      setCode(generateRandomCode('NEXUS-50'));
      setDiscountType('percentage');
      setValue(50);
      setDurationDays(30);
      setValidityDays(14);
      setMaxUses(1);
      setDescription('50% Off Special Voucher Code');
    }
  };

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanCode = (code.trim() || generateRandomCode('GIFT')).toUpperCase();
    
    // Check for existing duplicate code
    const existing = promoCodes.find((p) => p.code.toUpperCase() === cleanCode);
    if (existing) {
      alert(`A promo code "${cleanCode}" already exists. Please choose or generate another code.`);
      return;
    }

    const expiryDate = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString();

    const newPromo: PromoCode = {
      id: `promo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      code: cleanCode,
      discountType,
      value: discountType === 'gift_100' ? 100 : Number(value) || 0,
      durationDays: Number(durationDays) || 7,
      description: description.trim() || `${discountType === 'gift_100' ? '100% Free Trial' : 'Discount'} Gift Voucher`,
      createdAt: new Date().toISOString(),
      expiryDate,
      maxUses: Number(maxUses) || 1,
      usedCount: 0,
      isUsed: false,
      usedBy: [],
      minSpend: minSpend ? Number(minSpend) : undefined,
      isActive: true,
    };

    addPromoCode(newPromo);
    setLastGenerated(newPromo);
    showNotification(`Gift Card "${cleanCode}" generated successfully!`);

    // Reset form with a fresh random code
    setCode('');
    setDescription('');
  };

  const handleToggleActive = (promo: PromoCode) => {
    const updated = { ...promo, isActive: !promo.isActive };
    updatePromoCode(updated);
    showNotification(`Code ${promo.code} marked as ${updated.isActive ? 'Active' : 'Inactive'}.`);
  };

  const handleDelete = (id: string, codeName: string) => {
    if (confirm(`Are you sure you want to delete promo code "${codeName}"?`)) {
      deletePromoCode(id);
      showNotification(`Promo code "${codeName}" deleted.`);
      if (lastGenerated?.id === id) {
        setLastGenerated(null);
      }
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Reset promo codes to default demo gift vouchers? Custom generated codes will be reset.')) {
      localStorage.setItem('vpn_promos', JSON.stringify(defaultPromoCodes));
      localStorage.setItem('vpn_promos_ver', 'v2');
      window.location.reload();
    }
  };

  const getStatusBadge = (promo: PromoCode) => {
    const isExpiredDate = promo.expiryDate && Date.now() > new Date(promo.expiryDate).getTime();
    const isRedeemed = promo.isUsed || (promo.usedCount >= promo.maxUses);

    if (isRedeemed) {
      return (
        <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20 gap-1">
          <XCircle className="h-3 w-3" />
          Redeemed / Used
        </Badge>
      );
    }
    if (isExpiredDate) {
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1">
          <Clock className="h-3 w-3" />
          Expired Date
        </Badge>
      );
    }
    if (!promo.isActive) {
      return (
        <Badge variant="outline" className="text-muted-foreground gap-1">
          <XCircle className="h-3 w-3" />
          Disabled
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Active (Ready)
      </Badge>
    );
  };

  // Filtered List
  const filteredPromos = promoCodes.filter((promo) => {
    const matchesSearch = 
      promo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (promo.usedBy && promo.usedBy.some((u) => u.toLowerCase().includes(searchQuery.toLowerCase())));

    if (!matchesSearch) return false;

    const isExpiredDate = promo.expiryDate && Date.now() > new Date(promo.expiryDate).getTime();
    const isRedeemed = promo.isUsed || (promo.usedCount >= promo.maxUses);

    if (filterTab === 'active') return promo.isActive && !isRedeemed && !isExpiredDate;
    if (filterTab === 'redeemed') return isRedeemed;
    if (filterTab === 'expired') return isExpiredDate || !promo.isActive;
    return true;
  });

  const totalCount = promoCodes.length;
  const activeCount = promoCodes.filter((p) => p.isActive && !p.isUsed && (!p.expiryDate || Date.now() <= new Date(p.expiryDate).getTime())).length;
  const redeemedCount = promoCodes.filter((p) => p.isUsed || (p.usedCount >= p.maxUses)).length;
  const expiredCount = promoCodes.filter((p) => (!p.isActive || (p.expiryDate && Date.now() > new Date(p.expiryDate).getTime())) && !p.isUsed).length;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center font-bold">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Gift Cards & Promo Vouchers</h1>
              <p className="text-sm text-muted-foreground">
                Generate single-use trial gift cards for friends and users. Once redeemed at checkout, codes automatically expire.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleResetDefaults}
            className="text-xs text-muted-foreground hover:text-foreground gap-2"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Defaults
          </Button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="flex items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/60">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Total Vouchers</p>
            <p className="text-2xl font-bold mt-1">{totalCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-emerald-600">Active & Ready</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/5 border-red-500/20">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-red-500">Redeemed by Users</p>
            <p className="text-2xl font-bold text-red-500 mt-1">{redeemedCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-amber-600">Time-Expired / Off</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{expiredCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Last Generated Quick Share Banner */}
      {lastGenerated && (
        <Card className="bg-gradient-to-r from-destructive/10 via-destructive/5 to-transparent border-destructive/30 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-destructive animate-pulse" />
                  <span className="text-xs uppercase font-bold tracking-wider text-destructive">Ready to Share with Friend</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl md:text-3xl font-mono font-black tracking-wider text-foreground">
                    {lastGenerated.code}
                  </span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleCopy(lastGenerated.code)}
                    className="gap-1.5 h-8 text-xs font-semibold"
                  >
                    {copiedCode === lastGenerated.code ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Benefit: <span className="font-semibold text-foreground">{lastGenerated.discountType === 'gift_100' ? `100% Free ${lastGenerated.durationDays}-Day Trial` : `${lastGenerated.value}% OFF`}</span> • Single-Use: Automatically expires as soon as redeemed.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `🎁 Hey! Here is your 100% Free ${lastGenerated.durationDays || 7}-Day V2Nexus VPN Trial Gift Card:\n\n*${lastGenerated.code}*\n\nRedeem it at https://v2nexus.lk/checkout before it expires! (Single-use only)`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full md:w-auto"
                >
                  <Button className="w-full md:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs">
                    <Share2 className="h-3.5 w-3.5" />
                    Share on WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generator Section */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Gift className="h-5 w-5 text-destructive" />
                Generate New Gift Card / Voucher
              </CardTitle>
              <CardDescription>
                Choose a 1-click preset or customize validity, duration, and discount amount.
              </CardDescription>
            </div>

            {/* Quick 1-Click Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 md:pt-0">
              <span className="text-xs font-medium text-muted-foreground mr-1">Presets:</span>
              <Button 
                type="button" 
                size="sm" 
                variant="outline" 
                onClick={() => applyPreset('7d')}
                className="text-xs h-7 gap-1"
              >
                ⚡ 7-Day Trial
              </Button>
              <Button 
                type="button" 
                size="sm" 
                variant="outline" 
                onClick={() => applyPreset('14d')}
                className="text-xs h-7 gap-1"
              >
                ⚡ 14-Day Trial
              </Button>
              <Button 
                type="button" 
                size="sm" 
                variant="outline" 
                onClick={() => applyPreset('30d')}
                className="text-xs h-7 gap-1"
              >
                ⚡ 30-Day Trial
              </Button>
              <Button 
                type="button" 
                size="sm" 
                variant="outline" 
                onClick={() => applyPreset('discount50')}
                className="text-xs h-7 gap-1"
              >
                ⚡ 50% Off
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateVoucher} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Voucher Code */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="voucherCode" className="text-xs font-semibold">Voucher Code</Label>
                  <button
                    type="button"
                    onClick={() => setCode(generateRandomCode('GIFT'))}
                    className="text-[11px] text-destructive hover:underline font-medium"
                  >
                    🎲 Generate Random
                  </button>
                </div>
                <Input
                  id="voucherCode"
                  placeholder="e.g. GIFT-7D-8B4X"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="font-mono uppercase font-bold tracking-wider"
                  required
                />
                <p className="text-[11px] text-muted-foreground">The code the user will enter during checkout.</p>
              </div>

              {/* Discount / Voucher Type */}
              <div className="space-y-2">
                <Label htmlFor="discountType" className="text-xs font-semibold">Voucher Type</Label>
                <select
                  id="discountType"
                  value={discountType}
                  onChange={(e) => {
                    const newType = e.target.value as any;
                    setDiscountType(newType);
                    if (newType === 'gift_100') setValue(100);
                  }}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="gift_100">🎁 100% Free Trial Gift Voucher (Rs. 0 Total)</option>
                  <option value="percentage">🏷️ Percentage Discount (%)</option>
                  <option value="fixed">💵 Fixed Cash Discount (Rs.)</option>
                </select>
                <p className="text-[11px] text-muted-foreground">
                  {discountType === 'gift_100' ? 'Free trial gift: user pays Rs. 0 & no bank slip needed.' : 'Reduces package price.'}
                </p>
              </div>

              {/* Discount Value */}
              <div className="space-y-2">
                <Label htmlFor="voucherValue" className="text-xs font-semibold">
                  {discountType === 'gift_100' ? 'Discount Amount' : discountType === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount (Rs.)'}
                </Label>
                <Input
                  id="voucherValue"
                  type="number"
                  min={1}
                  max={discountType === 'percentage' ? 100 : undefined}
                  value={value}
                  disabled={discountType === 'gift_100'}
                  onChange={(e) => setValue(Number(e.target.value))}
                  className={discountType === 'gift_100' ? 'bg-muted cursor-not-allowed font-semibold' : ''}
                />
                <p className="text-[11px] text-muted-foreground">
                  {discountType === 'gift_100' ? 'Fixed at 100% Free' : 'Amount discounted from package price'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Trial Duration */}
              <div className="space-y-2">
                <Label htmlFor="durationDays" className="text-xs font-semibold">Trial Duration (Days)</Label>
                <select
                  id="durationDays"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value={3}>3 Days Trial</option>
                  <option value={7}>7 Days (1 Week) Trial</option>
                  <option value={14}>14 Days (2 Weeks) Trial</option>
                  <option value={30}>30 Days (1 Month) Trial</option>
                  <option value={60}>60 Days Trial</option>
                </select>
                <p className="text-[11px] text-muted-foreground">VPN service access period.</p>
              </div>

              {/* Code Redemption Expiry Window */}
              <div className="space-y-2">
                <Label htmlFor="validityDays" className="text-xs font-semibold">Redemption Expiry Window</Label>
                <select
                  id="validityDays"
                  value={validityDays}
                  onChange={(e) => setValidityDays(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value={3}>Expires in 3 Days</option>
                  <option value={7}>Expires in 7 Days</option>
                  <option value={14}>Expires in 14 Days</option>
                  <option value={30}>Expires in 30 Days</option>
                  <option value={90}>Expires in 90 Days</option>
                </select>
                <p className="text-[11px] text-muted-foreground">Deadline for friend to enter code.</p>
              </div>

              {/* Single Use (Max Uses) */}
              <div className="space-y-2">
                <Label htmlFor="maxUses" className="text-xs font-semibold">Max Uses (Strict Expiry)</Label>
                <select
                  id="maxUses"
                  value={maxUses}
                  onChange={(e) => setMaxUses(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value={1}>1 Use Only (Expires immediately after checkout)</option>
                  <option value={2}>2 Uses</option>
                  <option value={5}>5 Uses</option>
                  <option value={10}>10 Uses</option>
                  <option value={100}>100 Uses</option>
                </select>
                <p className="text-[11px] text-muted-foreground">Set to 1 for single-use gift cards.</p>
              </div>

              {/* Note / Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-semibold">Gift For / Note</Label>
                <Input
                  id="description"
                  placeholder="e.g. Gift for Kasun / Testing"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground">Internal note or label for tracking.</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" className="gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground px-6">
                <Plus className="h-4 w-4" />
                Generate & Save Voucher
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Vouchers List & Management */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Generated Vouchers & Tracking</h2>
            <p className="text-xs text-muted-foreground">
              Monitor active codes, expiration dates, and which user/order redeemed them.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search code, note, user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full sm:w-64 h-9 text-xs"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                  filterTab === 'all' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('active')}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                  filterTab === 'active' ? 'bg-background text-emerald-600 shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('redeemed')}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                  filterTab === 'redeemed' ? 'bg-background text-red-500 shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Redeemed ({redeemedCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('expired')}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                  filterTab === 'expired' ? 'bg-background text-amber-600 shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Expired ({expiredCount})
              </button>
            </div>
          </div>
        </div>

        {/* Voucher Cards / Table */}
        {filteredPromos.length === 0 ? (
          <Card className="border-dashed p-12 text-center">
            <Gift className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <h3 className="text-base font-semibold">No promo codes found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {searchQuery ? 'Try adjusting your search criteria.' : 'Generate your first single-use gift card voucher above.'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPromos.map((promo) => {
              const isExpiredDate = promo.expiryDate && Date.now() > new Date(promo.expiryDate).getTime();
              const isRedeemed = promo.isUsed || (promo.usedCount >= promo.maxUses);

              return (
                <Card 
                  key={promo.id} 
                  className={`border transition-all ${
                    isRedeemed 
                      ? 'border-red-500/20 bg-card/40 opacity-75' 
                      : isExpiredDate 
                      ? 'border-amber-500/20 bg-card/40' 
                      : 'border-border/80 hover:border-destructive/40 shadow-sm'
                  }`}
                >
                  <CardContent className="p-5 space-y-4">
                    {/* Header: Code & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-lg tracking-wider text-foreground">
                            {promo.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(promo.code)}
                            title="Copy code"
                            className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted"
                          >
                            {copiedCode === promo.code ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {promo.description || 'Gift voucher'}
                        </p>
                      </div>

                      {getStatusBadge(promo)}
                    </div>

                    {/* Voucher Details Badge Grid */}
                    <div className="p-3 bg-muted/40 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Benefit:</span>
                        <span className="font-semibold text-foreground">
                          {promo.discountType === 'gift_100' ? (
                            <span className="text-emerald-600 font-bold">100% Free Trial ({promo.durationDays || 7} Days)</span>
                          ) : promo.discountType === 'percentage' ? (
                            `${promo.value}% OFF`
                          ) : (
                            `Rs. ${promo.value} OFF`
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Usage Limit:</span>
                        <span className="font-medium">
                          {promo.usedCount} / {promo.maxUses} {isRedeemed ? '(Fully Redeemed)' : '(Available)'}
                        </span>
                      </div>

                      {promo.expiryDate && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Expires:</span>
                          <span className={`font-medium ${isExpiredDate ? 'text-amber-500' : 'text-foreground'}`}>
                            {new Date(promo.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {/* Redeemed By Info */}
                      {promo.usedBy && promo.usedBy.length > 0 && (
                        <div className="pt-2 border-t border-border/40 mt-1">
                          <span className="text-muted-foreground block text-[11px]">Redeemed By:</span>
                          <div className="space-y-0.5 mt-1">
                            {promo.usedBy.map((userText, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-[11px] font-mono text-destructive">
                                <UserCheck className="h-3 w-3 shrink-0" />
                                <span className="truncate">{userText}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/30 text-xs">
                      <div className="flex items-center gap-2">
                        {/* WhatsApp Share */}
                        {!isRedeemed && !isExpiredDate && promo.isActive && (
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(
                              `🎁 Here is your ${promo.durationDays || 7}-Day V2Nexus VPN Trial Gift Card:\n\n*${promo.code}*\n\nRedeem it at https://v2nexus.lk/checkout before it expires!`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 font-medium"
                          >
                            <Share2 className="h-3 w-3" />
                            Share
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleToggleActive(promo)}
                          className={`text-xs hover:underline font-medium ${
                            promo.isActive ? 'text-muted-foreground hover:text-foreground' : 'text-emerald-600'
                          }`}
                        >
                          {promo.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(promo.id, promo.code)}
                        className="h-7 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
