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
import { Edit, Plus, Trash2, Save, X, RotateCcw, Server, ShieldCheck, Zap, AlertTriangle, Wifi } from 'lucide-react';
import { getIspLogo } from '@/components/marketing/IspLogos';

export default function AdminPackagesPage() {
  const { packages, addPackage, updatePackage, deletePackage } = useApp();
  
  const [filterCategory, setFilterCategory] = useState<string>('all');

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
        availableSlots: Number(editForm.availableSlots) || 0,
        category: editForm.category || 'basic',
        serverLocation: editForm.serverLocation || 'SG SERVER',
        p2pTorrent: (editForm.p2pTorrent as 'Allowed' | 'Restricted') || 'Restricted',
        speedLimit: editForm.speedLimit || 'No Speed Limit',
        badge: editForm.popular ? 'POPULAR' : 'ACTIVE',
      };
      updatePackage(updated);
      setIsEditing(null);
    }
  };

  const handleSaveAdd = () => {
    if (addForm.name && addForm.price !== undefined) {
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
        availableSlots: Number(addForm.availableSlots) || 100,
        category: addForm.category || 'basic',
        serverLocation: addForm.serverLocation || 'SG SERVER',
        p2pTorrent: (addForm.p2pTorrent as 'Allowed' | 'Restricted') || 'Restricted',
        speedLimit: addForm.speedLimit || 'No Speed Limit',
        badge: addForm.popular ? 'POPULAR' : 'ACTIVE',
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
      });
    }
  };

  // Reset to default packages
  const handleResetDefaults = () => {
    if (confirm('Are you sure you want to restore all original VPN packages? Custom packages will be replaced.')) {
      localStorage.setItem('vpn_packages', JSON.stringify(defaultPackages));
      localStorage.setItem('vpn_packages_ver', 'v4');
      window.location.reload();
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
                <Label>Available Slots (Stock)</Label>
                <Input 
                  type="number" 
                  value={addForm.availableSlots} 
                  onChange={(e) => setAddForm({...addForm, availableSlots: parseInt(e.target.value)})} 
                />
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
                <Label>Available Slots (Stock)</Label>
                <Input 
                  type="number" 
                  value={editForm.availableSlots} 
                  onChange={(e) => setEditForm({...editForm, availableSlots: parseInt(e.target.value)})} 
                />
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
            pkg.popular ? 'border-primary/60 ring-1 ring-primary/30' : 'border-border/60'
          }`}>
            {pkg.popular && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] px-2.5 py-0.5 rounded-bl-lg font-bold uppercase tracking-wider">
                POPULAR
              </div>
            )}

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
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock / Slots:</span>
                  <span className="font-semibold text-foreground">{pkg.availableSlots}</span>
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

            <div className="p-4 pt-0">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs font-semibold gap-1.5"
                onClick={() => handleEditClick(pkg)}
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Edit All Details</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
