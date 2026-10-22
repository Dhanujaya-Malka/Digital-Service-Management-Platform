'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Package } from '@/types';
import { defaultPackages } from '@/data/mock-packages';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Edit, Plus, Trash2, Save, X, RotateCcw, Server, ShieldCheck, Zap, AlertTriangle, Wifi, HardDrive, CheckCircle2, Calendar } from 'lucide-react';
import { getIspLogo } from '@/components/marketing/IspLogos';

export default function AdminPackagesPage() {
  const { 
    packages, 
    addPackage, 
    updatePackage, 
    deletePackage, 
    refreshPackages,
    serverCapacityTb,
    setServerCapacityTb,
    getServerBandwidthStats,
    getEffectiveSlots,
    lastQuotaResetDate,
    resetMonthlyQuota,
  } = useApp();
  
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [capacityInput, setCapacityInput] = useState<string>(String(serverCapacityTb || 20));
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isResettingQuota, setIsResettingQuota] = useState(false);

  const bandwidthStats = getServerBandwidthStats
    ? getServerBandwidthStats()
    : {
        totalCapacityGb: 20480,
        totalCapacityTb: 20,
        usedBandwidthGb: 0,
        usedBandwidthTb: 0,
        remainingBandwidthGb: 20480,
        remainingBandwidthTb: 20,
        usagePercent: 0,
      };

  const handleSaveCapacity = () => {
    const val = parseFloat(capacityInput);
    if (!isNaN(val) && val > 0) {
      setServerCapacityTb(val);
      setSaveSuccessMsg(`Server quota updated to ${val} TB! Live package slot pool recalculated.`);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    }
  };

  const handleAutoSyncSlotsToDb = async () => {
    if (confirm(`Do you want to recalculate and persist dynamic slot limits for all active packages to the PostgreSQL database based on current ${bandwidthStats.remainingBandwidthTb} TB remaining server capacity?`)) {
      for (const pkg of packages) {
        const liveSlots = getEffectiveSlots ? getEffectiveSlots(pkg) : (pkg.availableSlots || 0);
        await updatePackage({ ...pkg, availableSlots: liveSlots });
      }
      setSaveSuccessMsg('All package slot quotas successfully updated in PostgreSQL database!');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    }
  };

  const handleManualMonthlyReset = async () => {
    if (confirm('Are you sure you want to trigger a Monthly Quota Reset? This will reset the monthly bandwidth pool to 0 utilized and restore all package available slots back to full stock in the PostgreSQL database.')) {
      try {
        setIsResettingQuota(true);
        if (resetMonthlyQuota) {
          await resetMonthlyQuota();
          setSaveSuccessMsg('Monthly quota and package slots successfully reset in PostgreSQL database!');
          setTimeout(() => setSaveSuccessMsg(null), 5000);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsResettingQuota(false);
      }
    }
  };

  // Edit State
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Package>>({});
  
  // Add State
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<Partial<Package>>({
    name: '',
    price: 300,
    duration: 30,
    validity: '1 Month',
    trafficLimit: 100,
    deviceLimit: '1 Device',
    category: 'basic',
    serverLocation: 'SG SERVER',
    p2pTorrent: 'Restricted',
    speedLimit: 'No Speed Limit',
    features: ['High-Speed V2Ray', 'SLT, Dialog, Mobitel, Airtel & Hutch', 'Zero Speed Throttling'],
    popular: false,
    availableSlots: 100,
  });

  const handleEditClick = (pkg: Package) => {
    setIsEditing(pkg.id);
    setEditForm({ 
      ...pkg, 
      features: [...pkg.features] // clone features array
    });
  };

  const handleSaveEdit = () => {
    if (isEditing && editForm.id) {
      const isOutOfStock = editForm.badge === 'OUT OF STOCK' || Number(editForm.availableSlots) <= 0;
      const finalSlots = isOutOfStock ? 0 : Math.max(1, Number(editForm.availableSlots) || 50);
      const finalBadge = isOutOfStock
        ? 'OUT OF STOCK'
        : editForm.popular
        ? 'POPULAR'
        : 'ACTIVE';

      const updated: Package = {
        id: editForm.id,
        name: editForm.name || 'Custom Package',
        price: Number(editForm.price) || 0,
        duration: Number(editForm.duration) || 30,
        validity: editForm.validity || `${editForm.duration || 30} Days`,
        trafficLimit: Number(editForm.trafficLimit) || 0,
        deviceLimit: editForm.deviceLimit || '1 Device',
        features: editForm.features?.filter(f => f.trim() !== '') || [],
        popular: Boolean(editForm.popular),
        availableSlots: finalSlots,
        category: editForm.category || 'basic',
        serverLocation: editForm.serverLocation || 'SG SERVER',
        p2pTorrent: (editForm.p2pTorrent as 'Allowed' | 'Restricted') || 'Restricted',
        speedLimit: editForm.speedLimit || 'No Speed Limit',
        badge: finalBadge,
      };
      updatePackage(updated);
      setIsEditing(null);
      setSaveSuccessMsg(
        isOutOfStock
          ? `"${updated.name}" updated and marked as OUT OF STOCK (Checkout blocked).`
          : `"${updated.name}" updated successfully (Stock: ${finalSlots} slots).`
      );
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    }
  };

  const handleTogglePackageStock = async (pkg: Package) => {
    const isCurrentlyInStock = (pkg.availableSlots ?? 0) > 0 && pkg.badge !== 'OUT OF STOCK';
    const newSlots = isCurrentlyInStock ? 0 : 50;
    const newBadge = isCurrentlyInStock ? 'OUT OF STOCK' : (pkg.popular ? 'POPULAR' : 'ACTIVE');
    const updated: Package = {
      ...pkg,
      availableSlots: newSlots,
      badge: newBadge,
    };
    await updatePackage(updated);
    setSaveSuccessMsg(
      isCurrentlyInStock
        ? `"${pkg.name}" marked as OUT OF STOCK (Stock set to 0. Checkout blocked).`
        : `"${pkg.name}" marked as IN STOCK (Stock set to 50 slots).`
    );
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleSaveAdd = () => {
    if (addForm.name && addForm.price !== undefined) {
      const isOutOfStock = addForm.badge === 'OUT OF STOCK' || Number(addForm.availableSlots) <= 0;
      const finalSlots = isOutOfStock ? 0 : (Number(addForm.availableSlots) || 100);
      const finalBadge = isOutOfStock
        ? 'OUT OF STOCK'
        : addForm.popular
        ? 'POPULAR'
        : 'ACTIVE';

      const newPkg: Package = {
        id: `pkg-${Date.now()}`,
        name: addForm.name,
        price: Number(addForm.price) || 0,
        duration: Number(addForm.duration) || 30,
        validity: addForm.validity || `${addForm.duration || 30} Days`,
        trafficLimit: Number(addForm.trafficLimit) || 0,
        deviceLimit: addForm.deviceLimit || '1 Device',
        features: addForm.features?.filter(f => f.trim() !== '') || [],
        popular: Boolean(addForm.popular),
        availableSlots: finalSlots,
        category: addForm.category || 'basic',
        serverLocation: addForm.serverLocation || 'SG SERVER',
        p2pTorrent: (addForm.p2pTorrent as 'Allowed' | 'Restricted') || 'Restricted',
        speedLimit: addForm.speedLimit || 'No Speed Limit',
        badge: finalBadge,
      };
      addPackage(newPkg);
      setIsAdding(false);
      setAddForm({
        name: '',
        price: 300,
        duration: 30,
        validity: '1 Month',
        trafficLimit: 100,
        deviceLimit: '1 Device',
        category: 'basic',
        serverLocation: 'SG SERVER',
        p2pTorrent: 'Restricted',
        speedLimit: 'No Speed Limit',
        features: ['High-Speed V2Ray', 'SLT, Dialog, Mobitel, Airtel & Hutch', 'Zero Speed Throttling'],
        popular: false,
        availableSlots: 100,
        badge: 'ACTIVE',
      });
      setSaveSuccessMsg(`New plan "${newPkg.name}" created successfully!`);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    }
  };

  // Refresh / Reload packages from Database
  const handleResetDefaults = async () => {
    if (confirm('Are you sure you want to refresh packages from the database?')) {
      if (refreshPackages) {
        await refreshPackages();
      } else {
        localStorage.removeItem('vpn_packages');
        window.location.reload();
      }
    }
  };

  // Dynamic Features Manager
  const handleFeatureChange = (index: number, value: string, isAdd: boolean) => {
    if (isAdd) {
      const updated = [...(addForm.features || [])];
      updated[index] = value;
      setAddForm({ ...addForm, features: updated });
    } else {
      const updated = [...(editForm.features || [])];
      updated[index] = value;
      setEditForm({ ...editForm, features: updated });
    }
  };

  const addFeatureRow = (isAdd: boolean) => {
    if (isAdd) {
      setAddForm({ ...addForm, features: [...(addForm.features || []), ''] });
    } else {
      setEditForm({ ...editForm, features: [...(editForm.features || []), ''] });
    }
  };

  const removeFeatureRow = (index: number, isAdd: boolean) => {
    if (isAdd) {
      const updated = [...(addForm.features || [])];
      updated.splice(index, 1);
      setAddForm({ ...addForm, features: updated });
    } else {
      const updated = [...(editForm.features || [])];
      updated.splice(index, 1);
      setEditForm({ ...editForm, features: updated });
    }
  };

  const filteredPackages = filterCategory === 'all'
    ? packages
    : packages.filter(p => p.category === filterCategory);

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Package & Plan Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete administrative control to create, modify, or delete Sri Lankan ISP V2Ray packages.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 text-xs" 
            onClick={handleResetDefaults}
            title="Restore original ISP presets"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to Presets</span>
          </Button>
          {!isAdding && (
            <Button size="sm" className="gap-2 bg-primary font-semibold" onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4" />
              <span>Add New Plan</span>
            </Button>
          )}
        </div>
      </div>

      {/* Server Bandwidth Quota & Dynamic Slot Pool Card */}
      <Card className="border border-border/80 bg-card/90 shadow-md rounded-2xl overflow-hidden">
        <div className="p-5 sm:p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <HardDrive className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-foreground">
                    Upstream Server Bandwidth Capacity
                  </h3>
                  <Badge variant="outline" className="border-primary/40 text-primary text-[10px] uppercase font-bold">
                    Auto-Slot Pool
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Set the maximum bandwidth quota (X TB) of your VPN node. Package slots dynamically adjust as users subscribe.
                </p>
              </div>
            </div>

            {/* Input & Save Form */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={capacityInput}
                  onChange={(e) => setCapacityInput(e.target.value)}
                  className="w-28 h-9 text-xs font-bold pl-3 pr-8 rounded-xl"
                  placeholder="e.g. 20"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none">
                  TB
                </span>
              </div>
              <Button size="sm" onClick={handleSaveCapacity} className="h-9 px-4 text-xs font-semibold rounded-xl bg-primary hover:bg-primary/90">
                <Save className="h-3.5 w-3.5 mr-1.5" />
                <span>Save Quota</span>
              </Button>
            </div>
          </div>

          {/* Feedback banner */}
          {saveSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Bandwidth Usage Progress & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-muted/40 border border-border/50 space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Total Pool Quota
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono text-foreground">
                {bandwidthStats.totalCapacityTb} TB <span className="text-xs font-normal text-muted-foreground">({bandwidthStats.totalCapacityGb.toLocaleString()} GB)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border/50 space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Allocated To Active Users
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono text-primary">
                {bandwidthStats.usedBandwidthTb} TB <span className="text-xs font-normal text-muted-foreground">({bandwidthStats.usedBandwidthGb.toLocaleString()} GB)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border/50 space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Remaining Bandwidth
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                {bandwidthStats.remainingBandwidthTb} TB <span className="text-xs font-normal text-muted-foreground">({bandwidthStats.remainingBandwidthGb.toLocaleString()} GB)</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-medium">Bandwidth Utilization</span>
              <span className="font-bold text-foreground">{bandwidthStats.usagePercent}% utilized</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden border border-border/40">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  bandwidthStats.usagePercent > 90
                    ? 'bg-rose-500'
                    : bandwidthStats.usagePercent > 70
                    ? 'bg-amber-500'
                    : 'bg-primary'
                }`}
                style={{ width: `${Math.min(100, bandwidthStats.usagePercent)}%` }}
              />
            </div>
          </div>

          {/* Policy Banner & Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 text-xs text-foreground/90 bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/20">
              <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>
                <strong>Unlimited Package Rule:</strong> Default <strong>500 GB</strong> quota deducted per user.
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoSyncSlotsToDb}
              className="text-xs font-semibold rounded-xl border-border/70 hover:bg-primary/10 gap-1.5 shrink-0"
              title="Push live capacity limits into PostgreSQL packages database"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Sync All Package Slots to Database</span>
            </Button>
          </div>

          {/* Monthly Billing Cycle & Reset Controls */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  Monthly Quota Reset & Billing Cycle
                </span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-bold">
                  Auto-Reset: 1st of Every Month
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Bandwidth consumption resets every month automatically. As an Admin, you can also trigger a manual reset at any time to clear utilized bandwidth and restore package stock in the database.
              </p>
              {lastQuotaResetDate && (
                <p className="text-[10px] text-muted-foreground font-mono pt-0.5">
                  Last Reset: {new Date(lastQuotaResetDate).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={handleManualMonthlyReset}
              disabled={isResettingQuota}
              className="text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md gap-1.5 shrink-0 h-10 px-4"
              title="Reset monthly utilized bandwidth to 0 and restore all package available slots"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${isResettingQuota ? 'animate-spin' : ''}`} />
              <span>{isResettingQuota ? 'Resetting Quotas...' : 'Reset Monthly Quota & Slots Now'}</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Network / Tier Category Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase mr-2">Filter:</span>
        {[
          { id: 'all', label: 'All Plans' },
          { id: 'basic', label: 'Basic' },
          { id: 'standard', label: 'Standard' },
          { id: 'premium', label: 'Premium' },
          { id: 'ultimate', label: 'Ultimate' },
          { id: 'slt', label: 'SLT' },
          { id: 'dialog', label: 'Dialog' },
          { id: 'mobitel', label: 'Mobitel' },
          { id: 'airtel', label: 'Airtel' },
          { id: 'hutch', label: 'Hutch' },
        ].map((cat) => {
          const isActive = filterCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.id !== 'all' && getIspLogo(cat.id, 14)}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* ADD PACKAGE FORM (Comprehensive) */}
      {isAdding && (
        <Card className="border-primary/60 shadow-xl bg-card/95 backdrop-blur-md">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  <span>Create New V2Ray Plan</span>
                </CardTitle>
                <CardDescription className="mt-1">
                  Configure full pricing, routing, ISP bypass, and specifications. It will go live immediately.
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            
            {/* Primary Details Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Package Name</Label>
                <Input 
                  value={addForm.name} 
                  onChange={(e) => setAddForm({...addForm, name: e.target.value})} 
                  placeholder="e.g. Basic 50 GB or Standard 300 GB" 
                />
              </div>

              <div className="space-y-2">
                <Label>Package Tier / Category</Label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                  value={addForm.category || 'basic'}
                  onChange={(e) => setAddForm({...addForm, category: e.target.value})}
                >
                  <option value="basic">Basic Packages</option>
                  <option value="standard">Standard Packages</option>
                  <option value="premium">Premium Packages</option>
                  <option value="ultimate">Ultimate Packages</option>
                  <option value="slt">SLT (Fibre / 4G / ADSL)</option>
                  <option value="dialog">Dialog (Home WiFi & Mobile)</option>
                  <option value="mobitel">Mobitel (Work & Learn / OneShot)</option>
                  <option value="airtel">Airtel (Freedom)</option>
                  <option value="hutch">Hutch (Cliq & Social)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Price (LKR)</Label>
                <Input 
                  type="number" 
                  step="10" 
                  value={addForm.price} 
                  onChange={(e) => setAddForm({...addForm, price: parseFloat(e.target.value)})} 
                />
              </div>

              <div className="space-y-2">
                <Label>Device Limit</Label>
                <Input 
                  value={addForm.deviceLimit} 
                  onChange={(e) => setAddForm({...addForm, deviceLimit: e.target.value})} 
                  placeholder="e.g. 1 Device, 2 Devices, Unlimited Devices" 
                />
              </div>

              <div className="space-y-2">
                <Label>Duration (Days)</Label>
                <Input 
                  type="number" 
                  value={addForm.duration} 
                  onChange={(e) => setAddForm({...addForm, duration: parseInt(e.target.value), validity: `${e.target.value} Days`})} 
                />
              </div>

              <div className="space-y-2">
                <Label>Validity Label</Label>
                <Input 
                  value={addForm.validity} 
                  onChange={(e) => setAddForm({...addForm, validity: e.target.value})} 
                  placeholder="e.g. 1 Month or 30 Days" 
                />
              </div>

              <div className="space-y-2">
                <Label>Data Limit (GB, 0 = Unlimited)</Label>
                <Input 
                  type="number" 
                  value={addForm.trafficLimit} 
                  onChange={(e) => setAddForm({...addForm, trafficLimit: parseInt(e.target.value)})} 
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Available Slots (Stock)</Label>
                  <span className="text-[10px] text-muted-foreground font-medium">0 = Out of Stock</span>
                </div>
                <Input 
                  type="number" 
                  min="0"
                  value={addForm.availableSlots} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setAddForm({
                      ...addForm, 
                      availableSlots: val,
                      badge: val <= 0 ? 'OUT OF STOCK' : (addForm.badge === 'OUT OF STOCK' ? (addForm.popular ? 'POPULAR' : 'ACTIVE') : addForm.badge),
                    });
                  }} 
                />
              </div>

              {/* Add Stock Availability Selector */}
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 p-4 rounded-xl border border-border/70 bg-muted/20 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <Label className="text-xs font-bold text-foreground">Initial Stock & Availability Status</Label>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Choose whether this plan launches in stock or out of stock.
                    </p>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border self-start sm:self-auto ${
                    addForm.badge === 'OUT OF STOCK' || (addForm.availableSlots !== undefined && Number(addForm.availableSlots) <= 0)
                      ? 'bg-destructive/15 text-destructive border-destructive/30'
                      : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {addForm.badge === 'OUT OF STOCK' || (addForm.availableSlots !== undefined && Number(addForm.availableSlots) <= 0)
                      ? '● OUT OF STOCK'
                      : '● IN STOCK'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const prevSlots = addForm.availableSlots && Number(addForm.availableSlots) > 0 ? Number(addForm.availableSlots) : 100;
                      setAddForm({
                        ...addForm,
                        badge: addForm.popular ? 'POPULAR' : 'ACTIVE',
                        availableSlots: prevSlots,
                      });
                    }}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      addForm.badge !== 'OUT OF STOCK' && (addForm.availableSlots === undefined || Number(addForm.availableSlots) > 0)
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-sm ring-1 ring-emerald-500/30'
                        : 'bg-card border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>In Stock (Available for Purchase)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddForm({
                        ...addForm,
                        badge: 'OUT OF STOCK',
                        availableSlots: 0,
                      });
                    }}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      addForm.badge === 'OUT OF STOCK' || (addForm.availableSlots !== undefined && Number(addForm.availableSlots) <= 0)
                        ? 'bg-destructive/15 border-destructive text-destructive shadow-sm ring-1 ring-destructive/30'
                        : 'bg-card border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span>Out of Stock (Sold Out / Block Checkout)</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Server Location</Label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                  value={addForm.serverLocation || 'SG SERVER'}
                  onChange={(e) => setAddForm({...addForm, serverLocation: e.target.value})}
                >
                  <option value="SG SERVER">SG SERVER (Singapore 35ms)</option>
                  <option value="IN SERVER">IN SERVER (India 45ms)</option>
                  <option value="DE SERVER">DE SERVER (Germany 140ms)</option>
                  <option value="US SERVER">US SERVER (United States 220ms)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>P2P / Torrent Status</Label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                  value={addForm.p2pTorrent || 'Restricted'}
                  onChange={(e) => setAddForm({...addForm, p2pTorrent: e.target.value as 'Allowed' | 'Restricted'})}
                >
                  <option value="Restricted">Restricted (Safe)</option>
                  <option value="Allowed">Allowed</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Speed Limit</Label>
                <Input 
                  value={addForm.speedLimit} 
                  onChange={(e) => setAddForm({...addForm, speedLimit: e.target.value})} 
                  placeholder="e.g. No Speed Limit" 
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input 
                  type="checkbox" 
                  id="add-popular" 
                  checked={addForm.popular} 
                  onChange={(e) => setAddForm({...addForm, popular: e.target.checked})} 
                  className="rounded border-gray-300 h-4 w-4 text-primary focus:ring-primary" 
                />
                <Label htmlFor="add-popular" className="font-semibold cursor-pointer">
                  Mark as "Most Popular"
                </Label>
              </div>
            </div>

            {/* Dynamic Features Manager */}
            <div className="space-y-3 pt-2 border-t border-border/40">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold">Package Feature Bullets</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => addFeatureRow(true)} className="gap-1.5 h-8 text-xs">
                  <Plus className="h-3.5 w-3.5" /> Add Feature Bullet
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {addForm.features?.map((feat, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input 
                      value={feat} 
                      onChange={(e) => handleFeatureChange(idx, e.target.value, true)} 
                      placeholder="e.g. Works with Zoom & Teams" 
                      className="text-xs"
                    />
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon" 
                      className="shrink-0 h-9 w-9" 
                      onClick={() => removeFeatureRow(idx, true)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border/40">
              <Button onClick={handleSaveAdd} className="gap-2 bg-primary font-semibold">
                <Save className="h-4 w-4" /> Save & Publish Plan
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* EDIT MODAL / FULL EDIT CARD */}
      {isEditing && (
        <Card className="border-primary shadow-2xl bg-card ring-2 ring-primary/40">
          <CardHeader className="border-b border-border/40 pb-4 bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2 text-primary">
                  <Edit className="h-5 w-5" />
                  <span>Edit Plan: {editForm.name}</span>
                </CardTitle>
                <CardDescription className="mt-1">
                  Modify all live parameters, pricing, server routing, and features.
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            
            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Package Name</Label>
                <Input 
                  value={editForm.name} 
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <Label>Package Tier / Category</Label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                  value={editForm.category || 'basic'}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                >
                  <option value="basic">Basic Packages</option>
                  <option value="standard">Standard Packages</option>
                  <option value="premium">Premium Packages</option>
                  <option value="ultimate">Ultimate Packages</option>
                  <option value="slt">SLT (Fibre / 4G / ADSL)</option>
                  <option value="dialog">Dialog (Home WiFi & Mobile)</option>
                  <option value="mobitel">Mobitel (Work & Learn / OneShot)</option>
                  <option value="airtel">Airtel (Freedom)</option>
                  <option value="hutch">Hutch (Cliq & Social)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Price (LKR)</Label>
                <Input 
                  type="number" 
                  step="10" 
                  value={editForm.price} 
                  onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value)})} 
                />
              </div>

              <div className="space-y-2">
                <Label>Device Limit</Label>
                <Input 
                  value={editForm.deviceLimit} 
                  onChange={(e) => setEditForm({...editForm, deviceLimit: e.target.value})} 
                  placeholder="e.g. 1 Device, 2 Devices, Unlimited Devices" 
                />
              </div>

              <div className="space-y-2">
                <Label>Duration (Days)</Label>
                <Input 
                  type="number" 
                  value={editForm.duration} 
                  onChange={(e) => setEditForm({...editForm, duration: parseInt(e.target.value), validity: `${e.target.value} Days`})} 
                />
              </div>

              <div className="space-y-2">
                <Label>Validity Label</Label>
                <Input 
                  value={editForm.validity} 
                  onChange={(e) => setEditForm({...editForm, validity: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <Label>Data Limit (GB, 0 = Unlimited)</Label>
                <Input 
                  type="number" 
                  value={editForm.trafficLimit} 
                  onChange={(e) => setEditForm({...editForm, trafficLimit: parseInt(e.target.value)})} 
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Available Slots (Stock)</Label>
                  <span className="text-[10px] text-muted-foreground font-medium">0 = Out of Stock</span>
                </div>
                <Input 
                  type="number" 
                  min="0"
                  value={editForm.availableSlots} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setEditForm({
                      ...editForm, 
                      availableSlots: val,
                      badge: val <= 0 ? 'OUT OF STOCK' : (editForm.badge === 'OUT OF STOCK' ? (editForm.popular ? 'POPULAR' : 'ACTIVE') : editForm.badge),
                    });
                  }} 
                />
              </div>

              {/* Stock Availability Selector */}
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 p-4 rounded-xl border border-border/70 bg-muted/20 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <Label className="text-xs font-bold text-foreground">Stock & Availability Status</Label>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Choose whether this plan is live for purchase or flagged as Out of Stock (blocks checkout).
                    </p>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border self-start sm:self-auto ${
                    editForm.badge === 'OUT OF STOCK' || (editForm.availableSlots !== undefined && Number(editForm.availableSlots) <= 0)
                      ? 'bg-destructive/15 text-destructive border-destructive/30'
                      : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {editForm.badge === 'OUT OF STOCK' || (editForm.availableSlots !== undefined && Number(editForm.availableSlots) <= 0)
                      ? '● OUT OF STOCK (CHECKOUT BLOCKED)'
                      : '● IN STOCK (AVAILABLE)'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const prevSlots = editForm.availableSlots && Number(editForm.availableSlots) > 0 ? Number(editForm.availableSlots) : 50;
                      setEditForm({
                        ...editForm,
                        badge: editForm.popular ? 'POPULAR' : 'ACTIVE',
                        availableSlots: prevSlots,
                      });
                    }}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      editForm.badge !== 'OUT OF STOCK' && (editForm.availableSlots === undefined || Number(editForm.availableSlots) > 0)
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-sm ring-1 ring-emerald-500/30'
                        : 'bg-card border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>In Stock (Available for Purchase)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditForm({
                        ...editForm,
                        badge: 'OUT OF STOCK',
                        availableSlots: 0,
                      });
                    }}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      editForm.badge === 'OUT OF STOCK' || (editForm.availableSlots !== undefined && Number(editForm.availableSlots) <= 0)
                        ? 'bg-destructive/15 border-destructive text-destructive shadow-sm ring-1 ring-destructive/30'
                        : 'bg-card border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span>Out of Stock (Sold Out / Block Checkout)</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Server Location</Label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                  value={editForm.serverLocation || 'SG SERVER'}
                  onChange={(e) => setEditForm({...editForm, serverLocation: e.target.value})}
                >
                  <option value="SG SERVER">SG SERVER (Singapore 35ms)</option>
                  <option value="IN SERVER">IN SERVER (India 45ms)</option>
                  <option value="DE SERVER">DE SERVER (Germany 140ms)</option>
                  <option value="US SERVER">US SERVER (United States 220ms)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>P2P / Torrent Status</Label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                  value={editForm.p2pTorrent || 'Restricted'}
                  onChange={(e) => setEditForm({...editForm, p2pTorrent: e.target.value as 'Allowed' | 'Restricted'})}
                >
                  <option value="Restricted">Restricted (Safe)</option>
                  <option value="Allowed">Allowed</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Speed Limit</Label>
                <Input 
                  value={editForm.speedLimit} 
                  onChange={(e) => setEditForm({...editForm, speedLimit: e.target.value})} 
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input 
                  type="checkbox" 
                  id={`edit-pop-${editForm.id}`} 
                  checked={editForm.popular} 
                  onChange={(e) => setEditForm({...editForm, popular: e.target.checked})} 
                  className="rounded border-gray-300 h-4 w-4 text-primary focus:ring-primary" 
                />
                <Label htmlFor={`edit-pop-${editForm.id}`} className="font-semibold cursor-pointer">
                  Mark as "Most Popular"
                </Label>
              </div>
            </div>

            {/* Dynamic Features Manager */}
            <div className="space-y-3 pt-2 border-t border-border/40">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold">Package Feature Bullets</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => addFeatureRow(false)} className="gap-1.5 h-8 text-xs">
                  <Plus className="h-3.5 w-3.5" /> Add Feature Bullet
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {editForm.features?.map((feat, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input 
                      value={feat} 
                      onChange={(e) => handleFeatureChange(idx, e.target.value, false)} 
                      className="text-xs"
                    />
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon" 
                      className="shrink-0 h-9 w-9" 
                      onClick={() => removeFeatureRow(idx, false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border/40">
              <Button onClick={handleSaveEdit} className="gap-2 bg-primary font-semibold">
                <Save className="h-4 w-4" /> Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PACKAGES CARD GRID */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPackages.map((pkg) => (
          <Card key={pkg.id} className={`relative flex flex-col justify-between transition-all hover:shadow-lg ${
            pkg.badge === 'OUT OF STOCK' || (pkg.availableSlots ?? 0) <= 0
              ? 'border-destructive/40 bg-destructive/[0.02]'
              : pkg.popular
              ? 'border-primary/60 ring-1 ring-primary/30'
              : 'border-border/60'
          }`}>
            {pkg.badge === 'OUT OF STOCK' || (pkg.availableSlots ?? 0) <= 0 ? (
              <div className="absolute top-0 right-0 bg-destructive text-destructive-foreground text-[10px] px-2.5 py-0.5 rounded-bl-lg font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                OUT OF STOCK
              </div>
            ) : pkg.popular ? (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] px-2.5 py-0.5 rounded-bl-lg font-bold uppercase tracking-wider">
                POPULAR
              </div>
            ) : null}

            <CardHeader className="pb-3 pt-5">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {getIspLogo(pkg.category, 22)}
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/40">
                    {pkg.category?.toUpperCase() || 'V2RAY'}
                  </span>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-primary" 
                    onClick={() => handleEditClick(pkg)}
                    title="Edit full package"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive" 
                    onClick={() => deletePackage(pkg.id)}
                    title="Delete package"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <CardTitle className="text-lg font-bold mt-2">{pkg.name}</CardTitle>
              <CardDescription className="text-2xl font-black text-foreground mt-1">
                Rs. {pkg.price}
                <span className="text-xs font-normal text-muted-foreground ml-1">/{pkg.duration} days</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 text-xs pt-1">
              <div className="bg-muted/30 p-2.5 rounded-lg border border-border/40 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Server Route:</span>
                  <span className="font-semibold text-foreground">{pkg.serverLocation || 'SG SERVER'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data Quota:</span>
                  <span className="font-semibold text-foreground">
                    {pkg.trafficLimit === 0 ? 'Unlimited' : `${pkg.trafficLimit} GB`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Device Limit:</span>
                  <span className="font-semibold text-foreground">
                    {pkg.deviceLimit || '1 Device'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Stock / Slots:</span>
                  <div className="flex items-center gap-1.5">
                    {pkg.badge === 'OUT OF STOCK' || (pkg.availableSlots ?? 0) <= 0 ? (
                      <Badge variant="destructive" className="text-[10px] font-bold px-2 py-0.5">
                        0 (OUT OF STOCK)
                      </Badge>
                    ) : (
                      <>
                        <span className="font-semibold text-foreground">{pkg.availableSlots}</span>
                        {getEffectiveSlots && (
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                            getEffectiveSlots(pkg) <= 0
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-bold'
                              : 'bg-primary/10 text-primary border-primary/20'
                          }`}>
                            Pool: {getEffectiveSlots(pkg)}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">P2P / Torrent:</span>
                  <span className={`font-semibold ${pkg.p2pTorrent === 'Allowed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {pkg.p2pTorrent || 'Restricted'}
                  </span>
                </div>
              </div>

              {/* Feature Preview */}
              <div className="space-y-1 text-muted-foreground text-[11px]">
                <span className="font-semibold text-foreground">Features ({pkg.features.length}):</span>
                {pkg.features.slice(0, 2).map((feat, i) => (
                  <p key={i} className="truncate">• {feat}</p>
                ))}
              </div>
            </CardContent>

            <div className="p-4 pt-0 grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs font-semibold gap-1.5"
                onClick={() => handleEditClick(pkg)}
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Edit Details</span>
              </Button>

              {(() => {
                const inStock = (pkg.availableSlots ?? 0) > 0 && pkg.badge !== 'OUT OF STOCK';
                return (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePackageStock(pkg)}
                    className={`w-full text-xs font-semibold gap-1.5 ${
                      inStock
                        ? 'border-destructive/30 text-destructive hover:bg-destructive/10'
                        : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                    title={inStock ? 'Click to make Out of Stock (Block checkout)' : 'Click to restore stock'}
                  >
                    {inStock ? (
                      <>
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Set Out of Stock</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Set In Stock</span>
                      </>
                    )}
                  </Button>
                );
              })()}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
